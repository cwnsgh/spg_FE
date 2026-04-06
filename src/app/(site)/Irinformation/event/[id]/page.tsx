import IREventDetail from "@/app/Irinformation/components/sections/IREventDetail";

interface IREventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IREventDetailPage({
  params,
}: IREventDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  return <IREventDetail postId={postId} />;
}
