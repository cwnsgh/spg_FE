import IREventDetail from "@/app/Irinformation/components/sections/IREventDetail";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";

interface IREventDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const ids = await fetchAllPostIdsForBoard("ir_event");
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export default async function IREventDetailPage({
  params,
}: IREventDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  return <IREventDetail postId={postId} />;
}
