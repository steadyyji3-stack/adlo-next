-- =====================================================================
-- R-01 Attraction Offer — Data Model
-- Migration: supabase/migrations/20260421_diagnostic_module.sql
-- Author:    Kael
-- Date:      2026-04-20 (drafted, not yet applied)
-- Target:    Supabase Postgres 15+
-- =====================================================================
--
-- 執行前置：
-- 1. Supabase 專案已建立，auth schema 已存在
-- 2. 已安裝 pgcrypto extension（用於 gen_random_uuid）
-- 3. 已確認 RLS 關閉於 service_role，開啟於 anon / authenticated
--
-- 回滾方案（反向 migration）：
--   DROP TABLE diagnostic_refund_requests CASCADE;
--   DROP TABLE diagnostic_reports        CASCADE;
--   DROP TABLE diagnostic_orders         CASCADE;
--   DROP TYPE  diagnostic_order_status;
--   DROP TYPE  diagnostic_report_status;
--   DROP TYPE  diagnostic_refund_status;
--
-- → 本檔案未來 apply 時可用 Haiku 執行（純 SQL 檢查）
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;  -- case-insensitive email

-- ---------------------------------------------------------------------
-- 1. Enum Types
-- ---------------------------------------------------------------------
CREATE TYPE diagnostic_order_status AS ENUM (
  'pending',     -- 建立 checkout session 但尚未完成付款
  'paid',        -- Stripe webhook 已確認付款
  'intake_done', -- 客戶已填 intake 問卷
  'report_sent', -- 報告已交付
  'upgraded',    -- 已用折抵升級訂閱
  'refunded',    -- 已退款
  'failed',      -- 付款失敗
  'expired'      -- 超過 24h 未付款（pending 自動回收）
);

CREATE TYPE diagnostic_report_status AS ENUM (
  'queued',      -- intake 收到，待分析
  'drafting',    -- 分析中（Lorenzo / AI 撰寫）
  'ready',       -- 可交付
  'delivered'    -- 已寄出 email
);

CREATE TYPE diagnostic_refund_status AS ENUM (
  'requested',   -- 客戶提出
  'approved',    -- 人工審核通過
  'rejected',    -- 人工拒絕
  'processed'    -- Stripe 退款 API 成功
);

-- ---------------------------------------------------------------------
-- 2. Triggers：updated_at 自動更新
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 3. Table: diagnostic_orders
-- ---------------------------------------------------------------------
-- 核心訂單表。每一筆 /diagnostic 付款對應一列。
CREATE TABLE diagnostic_orders (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no                TEXT NOT NULL UNIQUE,  -- 對外單號 e.g. "DX-20260421-000123"

  -- 客戶資訊
  customer_email          CITEXT NOT NULL,
  customer_email_hash     TEXT NOT NULL,         -- sha256(email + SERVER_SALT)，URL 驗證用
  customer_name           TEXT,
  customer_phone          TEXT,

  -- Stripe 金流
  stripe_session_id       TEXT UNIQUE,           -- checkout.session.id
  stripe_payment_intent   TEXT UNIQUE,           -- payment_intent.id
  amount_twd              INTEGER NOT NULL DEFAULT 1990,
  paid_at                 TIMESTAMPTZ,

  -- 狀態
  status                  diagnostic_order_status NOT NULL DEFAULT 'pending',

  -- UTM / 歸因（first-touch 為主）
  source_utm              JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- 結構：{ source, medium, campaign, term, content, referrer, landing_path, gclid, fbclid, first_touch_at }

  -- 升級折抵
  upgrade_coupon_code     TEXT,                  -- 自動發放的 Stripe promotion code
  upgrade_coupon_expires  TIMESTAMPTZ,
  upgraded_subscription   TEXT,                  -- 升級後的 Stripe subscription id

  -- 內部備註（admin 可見）
  internal_notes          TEXT,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  diagnostic_orders IS 'R-01 Attraction Offer 訂單主表';
COMMENT ON COLUMN diagnostic_orders.customer_email_hash IS 'sha256(email + REPORT_SIGNING_SECRET)，報告 URL 驗證使用，避免 email 外洩';
COMMENT ON COLUMN diagnostic_orders.source_utm IS '首次 touch 的 UTM + referrer + gclid/fbclid，見 06-utm-tracking.md';

-- 索引
CREATE INDEX idx_orders_email         ON diagnostic_orders (customer_email);
CREATE INDEX idx_orders_status        ON diagnostic_orders (status);
CREATE INDEX idx_orders_created       ON diagnostic_orders (created_at DESC);
CREATE INDEX idx_orders_stripe_session ON diagnostic_orders (stripe_session_id);
CREATE INDEX idx_orders_paid_at       ON diagnostic_orders (paid_at DESC) WHERE paid_at IS NOT NULL;

-- 複合索引：admin 列表常用（狀態 + 日期）
CREATE INDEX idx_orders_status_created ON diagnostic_orders (status, created_at DESC);

CREATE TRIGGER tg_orders_updated_at
BEFORE UPDATE ON diagnostic_orders
FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();

-- ---------------------------------------------------------------------
-- 4. Table: diagnostic_reports
-- ---------------------------------------------------------------------
-- 每筆訂單對應 0 或 1 份報告（一對一，但允許未生成）
CREATE TABLE diagnostic_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,

  -- Intake（客戶填寫的問卷內容）
  intake_submitted_at TIMESTAMPTZ,
  intake_data         JSONB,
  -- 預計欄位：{ business_name, gbp_url, website, main_services, target_area, competitors[], current_ads_monthly, pain_points[] }

  -- 報告內容
  report_status       diagnostic_report_status NOT NULL DEFAULT 'queued',
  report_url          TEXT,                     -- R2 / Supabase Storage 簽章 URL
  report_pdf_key      TEXT,                     -- 儲存桶物件 key
  report_score        JSONB,                    -- 各面向分數 { seo: 60, gbp: 40, ... }
  report_summary      TEXT,                     -- 摘要（可放入 email 模板）

  -- SLA 時間軸
  expected_ready_by   TIMESTAMPTZ,              -- 付款時 +3 天
  ready_at            TIMESTAMPTZ,              -- 實際完成時間
  delivered_at        TIMESTAMPTZ,              -- email 送出時間

  -- 內部協作
  assigned_to         TEXT,                     -- 分析師 email（Phase 1 填 Lorenzo）
  internal_notes      TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 每筆訂單最多一份報告
  CONSTRAINT uniq_report_per_order UNIQUE (order_id)
);

COMMENT ON TABLE  diagnostic_reports IS 'R-01 診斷報告（1:1 對應 order）';
COMMENT ON COLUMN diagnostic_reports.expected_ready_by IS 'paid_at + 72h，admin 列表用以標紅逾期件';

CREATE INDEX idx_reports_order    ON diagnostic_reports (order_id);
CREATE INDEX idx_reports_status   ON diagnostic_reports (report_status);
CREATE INDEX idx_reports_expected ON diagnostic_reports (expected_ready_by) WHERE report_status IN ('queued','drafting');

CREATE TRIGGER tg_reports_updated_at
BEFORE UPDATE ON diagnostic_reports
FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();

-- ---------------------------------------------------------------------
-- 5. Table: diagnostic_refund_requests
-- ---------------------------------------------------------------------
CREATE TABLE diagnostic_refund_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,

  reason              TEXT NOT NULL,            -- 客戶填的理由
  reason_category     TEXT,                     -- 後端分類：not_satisfied / wrong_target / tech_issue / other

  status              diagnostic_refund_status NOT NULL DEFAULT 'requested',
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at          TIMESTAMPTZ,
  decided_by          TEXT,                     -- admin email / identifier
  decision_notes      TEXT,

  -- Stripe 退款追蹤
  stripe_refund_id    TEXT,
  refund_amount_twd   INTEGER,                  -- 可能部分退（若已用 coupon，見 01 Q3）
  processed_at        TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 一筆訂單同時只允許一筆「未處理」的退款申請
  CONSTRAINT uniq_open_refund UNIQUE (order_id, status) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE diagnostic_refund_requests IS 'R-01 退款申請，人工審核後以 Stripe API 退款';

CREATE INDEX idx_refund_order    ON diagnostic_refund_requests (order_id);
CREATE INDEX idx_refund_status   ON diagnostic_refund_requests (status);
CREATE INDEX idx_refund_pending  ON diagnostic_refund_requests (requested_at) WHERE status = 'requested';

CREATE TRIGGER tg_refund_updated_at
BEFORE UPDATE ON diagnostic_refund_requests
FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();

-- ---------------------------------------------------------------------
-- 6. Row Level Security (RLS)
-- ---------------------------------------------------------------------
-- 原則：
-- - anon（未登入）→ 完全不能存取任何表
-- - service_role（後端 API）→ 全開，走應用層授權（email_hash 驗證）
-- - authenticated（若未來引入登入）→ 只能看自己的 order
--
-- Phase 1 所有讀寫都走 /api/* route（用 SERVICE_ROLE_KEY），
-- 所以 RLS 主要是「防禦性」，避免 anon key 誤用外流。

ALTER TABLE diagnostic_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_refund_requests ENABLE ROW LEVEL SECURITY;

-- 預設 deny：不寫任何 policy = 完全拒絕（service_role bypass 不受限）

-- Phase 2 若引入 Supabase Auth，可解鎖以下 policy：
-- CREATE POLICY "own_orders_read" ON diagnostic_orders
--   FOR SELECT TO authenticated
--   USING (customer_email = (auth.jwt() ->> 'email')::citext);

-- ---------------------------------------------------------------------
-- 7. Helper Functions
-- ---------------------------------------------------------------------

-- 生成 order_no：DX-YYYYMMDD-NNNNNN（每日遞增）
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS TEXT AS $$
DECLARE
  today_str TEXT := to_char(now() AT TIME ZONE 'Asia/Taipei', 'YYYYMMDD');
  seq       INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    (regexp_match(order_no, 'DX-\d{8}-(\d+)'))[1]::INTEGER
  ), 0) + 1
  INTO seq
  FROM diagnostic_orders
  WHERE order_no LIKE 'DX-' || today_str || '-%';

  RETURN 'DX-' || today_str || '-' || lpad(seq::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 8. 驗收查詢（開發完成後應可跑通）
-- ---------------------------------------------------------------------
-- 今日新訂單
-- SELECT order_no, customer_email, status, amount_twd, source_utm->>'source' AS utm_source
-- FROM diagnostic_orders
-- WHERE created_at >= CURRENT_DATE
-- ORDER BY created_at DESC;

-- SLA 逾期件（報告已該交付但未 ready）
-- SELECT o.order_no, o.customer_email, r.expected_ready_by, r.report_status
-- FROM diagnostic_orders o
-- JOIN diagnostic_reports r ON r.order_id = o.id
-- WHERE r.expected_ready_by < now() AND r.report_status NOT IN ('ready', 'delivered');

-- 待審退款
-- SELECT r.id, o.order_no, o.customer_email, r.reason, r.requested_at
-- FROM diagnostic_refund_requests r
-- JOIN diagnostic_orders o ON o.id = r.order_id
-- WHERE r.status = 'requested'
-- ORDER BY r.requested_at ASC;

-- =====================================================================
-- 開發人天估算：
--   - 寫 migration            0.25 天
--   - Supabase 建置 + apply    0.25 天
--   - seed 測試資料腳本        0.25 天
--   - 小計：                  ~0.75 天
--
-- 前置依賴：
--   - Supabase 專案建立（Go/No-Go）
--   - REPORT_SIGNING_SECRET 產生（32 byte random）
-- =====================================================================
