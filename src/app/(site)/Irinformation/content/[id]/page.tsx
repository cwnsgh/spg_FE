import IRContentDetail from "@/app/Irinformation/components/sections/IRContentDetail";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";

interface IRContentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const ids = await fetchAllPostIdsForBoard("ir_content");
    return ids.map((id) => ({ id }));
  } catch {
    return [];
  }
}

export default async function IRContentDetailPage({
  params,
}: IRContentDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  return <IRContentDetail postId={postId} />;
}
