import IRContentDetail from "@/app/Irinformation/components/sections/IRContentDetail";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";
import { notFound } from "next/navigation";

const STATIC_PLACEHOLDER_ID = "__build_placeholder__";

interface IRContentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const fallback = [{ id: STATIC_PLACEHOLDER_ID }];

  try {
    const ids = await fetchAllPostIdsForBoard("ir_content");
    const paramsList = ids.map((id) => ({ id }));
    return paramsList.length > 0 ? paramsList : fallback;
  } catch {
    return fallback;
  }
}

export default async function IRContentDetailPage({
  params,
}: IRContentDetailPageProps) {
  const { id } = await params;
  if (id === STATIC_PLACEHOLDER_ID) {
    notFound();
  }

  const postId = Number(id);

  return <IRContentDetail postId={postId} />;
}
