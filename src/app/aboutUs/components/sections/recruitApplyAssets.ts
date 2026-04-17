import { toBackendAssetUrl } from "@/api/config";

function trimStr(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

/** `re_img` 저장값(파일명 또는 경로) → 브라우저에서 열 수 있는 이미지 URL */
export function recruitProfileImageUrl(re_img: string): string {
  const s = re_img.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return toBackendAssetUrl(s);
  if (s.startsWith("/")) return toBackendAssetUrl(s);
  return toBackendAssetUrl(`/data/image_file/${s}`);
}

/** 업로드 목록 행(`url` 또는 `pf_file`) → 브라우저에서 열 URL */
export function recruitUploadFilePublicUrl(file: {
  url?: unknown;
  pf_file?: unknown;
}): string {
  const u = trimStr(file.url);
  if (u) {
    if (/^https?:\/\//i.test(u)) return toBackendAssetUrl(u);
    if (u.startsWith("/")) return toBackendAssetUrl(u);
  }
  const f = trimStr(file.pf_file);
  if (!f) return "";
  if (/^https?:\/\//i.test(f)) return toBackendAssetUrl(f);
  if (f.startsWith("/")) return toBackendAssetUrl(f);
  return toBackendAssetUrl(`/data/image_file/${f}`);
}

/** 파일명 기준 미리보기 방식 */
export function recruitUploadPreviewKind(
  fileName: string
): "image" | "pdf" | "other" {
  const lower = fileName.trim().toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(lower)) return "image";
  if (/\.pdf$/i.test(lower)) return "pdf";
  return "other";
}
