/** Next.js 페이지: 공시 상세. URL `/Irinformation/announcement/[id]` */
import IRAnnouncementDetail from "@/app/Irinformation/components/sections/IRAnnouncementDetail";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";
import { notFound } from "next/navigation";

/**
 * `output: "export"` 빌드에서 API 실패·목록 없음 시 빈 `generateStaticParams`가
 * 오류로 이어질 수 있어, 플레이스홀더 1개를 보내고 런타임에서는 404 처리합니다.
 * (customersupport/inquiry 동일 패턴)
 */
const STATIC_PLACEHOLDER_ID = "__build_placeholder__";

interface IRAnnouncementDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const fallback = [{ id: STATIC_PLACEHOLDER_ID }];

  try {
    const ids = await fetchAllPostIdsForBoard("ir_notice");
    const paramsList = ids.map((id) => ({ id }));
    return paramsList.length > 0 ? paramsList : fallback;
  } catch {
    return fallback;
  }
}

export default async function IRAnnouncementDetailPage({
  params,
}: IRAnnouncementDetailPageProps) {
  const { id } = await params;
  if (id === STATIC_PLACEHOLDER_ID) {
    notFound();
  }

  const postId = Number(id);

  return <IRAnnouncementDetail postId={postId} />;
}
