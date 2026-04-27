import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

type Scenario = 'high' | 'mid' | 'low';
type Size = 'square' | 'story';

interface Params {
  name: string;
  score: number;
  scenario: Scenario;
  size: Size;
  weak: string;
  loc: string;
  rank: number;
}

function parseParams(req: NextRequest): Params {
  const sp = req.nextUrl.searchParams;
  const scoreNum = Math.max(0, Math.min(100, parseInt(sp.get('score') ?? '0', 10) || 0));
  const scenarioRaw = (sp.get('scenario') ?? 'mid') as Scenario;
  const scenario: Scenario = ['high', 'mid', 'low'].includes(scenarioRaw) ? scenarioRaw : 'mid';
  const sizeRaw = (sp.get('size') ?? 'square') as Size;
  const size: Size = sizeRaw === 'story' ? 'story' : 'square';
  return {
    name: (sp.get('name') ?? '你的店家').slice(0, 24),
    score: scoreNum,
    scenario,
    size,
    weak: (sp.get('weak') ?? '商家檔案').slice(0, 12),
    loc: (sp.get('loc') ?? '你的地區').slice(0, 16),
    rank: Math.max(1, Math.min(99, parseInt(sp.get('rank') ?? '50', 10) || 50)),
  };
}

const ADLO_GREEN = '#1D9E75';
const ADLO_GREEN_DARK = '#0F6E56';
const BG_CREAM = '#F5FBF8';

export async function GET(req: NextRequest) {
  const p = parseParams(req);
  const dimensions = p.size === 'square' ? { w: 1080, h: 1080 } : { w: 1080, h: 1920 };

  const scoreColor = p.score >= 80 ? ADLO_GREEN : p.score >= 40 ? '#D97706' : '#E11D48';

  const scenarioCopy =
    p.scenario === 'high'
      ? {
          headline: `${p.name}`,
          sub: `拿到 ${p.score} 分 🌿`,
          line1: `在 ${p.loc} 屬於前 ${p.rank}%`,
          line2: '你家幾分？',
        }
      : p.scenario === 'mid'
      ? {
          headline: `剛測了自己店家`,
          sub: `${p.score} 分`,
          line1: `${p.weak} 被點名`,
          line2: '來測一下',
        }
      : {
          headline: `原來我是 ${p.score} 分⋯`,
          sub: `${p.weak} 要補`,
          line1: `${p.loc} 同業正在領先`,
          line2: '你的店呢？',
        };

  const isSquare = p.size === 'square';
  const headlineSize = isSquare ? 84 : 96;
  const subSize = isSquare ? 72 : 88;
  const lineSize = isSquare ? 40 : 48;
  const scoreSize = isSquare ? 280 : 360;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(180deg, ${BG_CREAM} 0%, #FFFFFF 60%, #E1F5EE 100%)`,
          padding: isSquare ? 72 : 96,
          position: 'relative',
          fontFamily: 'system-ui, "PingFang TC", "Noto Sans TC", sans-serif',
        }}
      >
        {/* 頂部 brand 列 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 28,
            color: ADLO_GREEN_DARK,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: ADLO_GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            a
          </div>
          adlo 商家健檢
        </div>

        {/* 主訊息 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            marginTop: isSquare ? 40 : 80,
          }}
        >
          <div
            style={{
              fontSize: headlineSize,
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.1,
              letterSpacing: -2,
              marginBottom: 24,
            }}
          >
            {scenarioCopy.headline}
          </div>

          {/* 分數大字 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              marginBottom: isSquare ? 32 : 56,
            }}
          >
            <span
              style={{
                fontSize: scoreSize,
                fontWeight: 900,
                color: scoreColor,
                lineHeight: 0.9,
                letterSpacing: -6,
              }}
            >
              {p.scenario === 'mid' ? p.score : ''}
            </span>
            <span
              style={{
                fontSize: subSize,
                fontWeight: 700,
                color: p.scenario === 'mid' ? '#475569' : scoreColor,
                lineHeight: 1,
              }}
            >
              {p.scenario === 'mid' ? '／ 100 分' : scenarioCopy.sub}
            </span>
          </div>

          <div
            style={{
              fontSize: lineSize,
              color: '#334155',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {scenarioCopy.line1}
          </div>
          <div
            style={{
              fontSize: lineSize,
              color: '#64748B',
              lineHeight: 1.5,
              marginTop: 8,
            }}
          >
            {scenarioCopy.line2}
          </div>
        </div>

        {/* 底部 CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            paddingTop: isSquare ? 28 : 48,
            borderTop: '2px solid #E1F5EE',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: isSquare ? 36 : 44,
                fontWeight: 700,
                color: ADLO_GREEN_DARK,
                letterSpacing: -0.5,
              }}
            >
              免費測你的店家分數
            </div>
            <div
              style={{
                fontSize: isSquare ? 28 : 36,
                color: '#64748B',
              }}
            >
              adlo.tw/check
            </div>
          </div>

          {/* QR Code placeholder 方塊 */}
          <div
            style={{
              width: isSquare ? 110 : 140,
              height: isSquare ? 110 : 140,
              borderRadius: 16,
              background: '#fff',
              border: `3px solid ${ADLO_GREEN}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isSquare ? 18 : 22,
              fontWeight: 700,
              color: ADLO_GREEN_DARK,
              letterSpacing: 1,
            }}
          >
            QR
          </div>
        </div>
      </div>
    ),
    {
      width: dimensions.w,
      height: dimensions.h,
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    }
  );
}
