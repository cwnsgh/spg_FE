import IRBoardDetail from "./IRBoardDetail";

interface IRAnnouncementDetailProps {
  postId: number;
}

export default function IRAnnouncementDetail({
  postId,
}: IRAnnouncementDetailProps) {
  return (
    <IRBoardDetail
      postId={postId}
      boardTable="ir_notice"
      listPath="/Irinformation?tab=1"
      sectionLabel="IR공고"
      activeTab={1}
    />
  );
}
