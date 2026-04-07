import IRAnnouncementDetail from "@/app/Irinformation/components/sections/IRAnnouncementDetail";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";

interface IRAnnouncementDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const ids = await fetchAllPostIdsForBoard("ir_notice");
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export default async function IRAnnouncementDetailPage({
  params,
}: IRAnnouncementDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  return <IRAnnouncementDetail postId={postId} />;
}
