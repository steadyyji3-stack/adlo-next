/**
 * @deprecated 已遷移至 `@/lib/gbp-post-writer`。
 * 此檔僅作為 backward-compat 的 re-export shim，保持既有 component 的 import 路徑不變。
 * 下個 iteration 會把所有 component 改成直接 import from '@/lib/gbp-post-writer'，然後刪除此檔。
 */
export {
  generatePosts,
  generatePosts as mockGeneratePosts,
  type GeneratedPost,
  type PostCategory,
  type PostWriterInput,
  type Industry,
} from '@/lib/gbp-post-writer';
