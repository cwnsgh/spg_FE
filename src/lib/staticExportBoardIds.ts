/**
 * `output: "export"` 빌드 시 동적 상세 경로를 만들기 위해,
 * 빌드 타임에 공개 게시판 목록 API로 글 ID를 수집합니다.
 * 네트워크 실패 시 빈 배열을 반환할 수 있으며, 그 경우 해당 상세 HTML은 생성되지 않습니다.
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
