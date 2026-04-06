import IRContentDetail from "@/app/Irinformation/components/sections/IRContentDetail";

interface IRContentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IRContentDetailPage({
  params,
}: IRContentDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  return <IRContentDetail postId={postId} />;
}
