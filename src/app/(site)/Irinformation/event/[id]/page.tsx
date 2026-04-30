/** Next.js 페이지: IR 이벤트 상세. URL `/Irinformation/event/[id]` */
import IREventDetail from "@/app/Irinformation/components/sections/IREventDetail";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";
import { notFound } from "next/navigation";

const STATIC_PLACEHOLDER_ID = "__build_placeholder__";

interface IREventDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const fallback = [{ id: STATIC_PLACEHOLDER_ID }];

  try {
    const ids = await fetchAllPostIdsForBoard("ir_event");
    const paramsList = ids.map((id) => ({ id }));
    return paramsList.length > 0 ? paramsList : fallback;
  } catch {
    return fallback;
  }
}

export default async function IREventDetailPage({
  params,
}: IREventDetailPageProps) {
  const { id } = await params;
  if (id === STATIC_PLACEHOLDER_ID) {
    notFound();
  }

  const postId = Number(id);

  return <IREventDetail postId={postId} />;
}
