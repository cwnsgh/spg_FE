import IRAnnouncementDetail from "@/app/Irinformation/components/sections/IRAnnouncementDetail";

interface IRAnnouncementDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IRAnnouncementDetailPage({
  params,
}: IRAnnouncementDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  return <IRAnnouncementDetail postId={postId} />;
}
