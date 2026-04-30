/**
 * `output: "export"` 빌드 시 동적 상세 경로용 글 ID 수집(공개 게시판 API).
 * 사용처: `customersupport/inquiry/[language]/[id]/page.tsx`, `Irinformation` 하위 상세 page의 generateStaticParams.
 * 네트워크 실패 시 빈 배열 가능 → 해당 경로 HTML 미생성.
 */
import { getBoardPosts } from "@/api/board";

export async function fetchAllPostIdsForBoard(boTable: string): Promise<string[]> {
  const ids: string[] = [];
  const seen = new Set<string>();
  let page = 1;
  const maxPages = 200;

  while (page <= maxPages) {
    const data = await getBoardPosts({ bo_table: boTable, page });
    for (const item of data.list) {
      const id = String(item.id);
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
    if (page >= data.pagination.total_pages) {
      break;
    }
    page += 1;
  }

  return ids;
}
