/**
 * 공개 팝업 API (`/api/front/popups.php`, PHP `g5_new_win`).
 */
import { apiRequest } from "./client";

/** `popups.php` 한 건 (그누 `g5_new_win` 컬럼과 동일) */
export interface SitePopup {
  nw_id: number;
  nw_device: string;
  nw_disable_hours: number;
  nw_left: number;
  nw_top: number;
  nw_width: number;
  nw_height: number;
  nw_subject: string;
  nw_content: string;
  nw_content_html: number;
}

export async function fetchSitePopups(
  device: "pc" | "mobile"
): Promise<SitePopup[]> {
  return apiRequest<SitePopup[]>("/front/popups.php", {
    query: { device },
    credentials: "include",
  });
}
