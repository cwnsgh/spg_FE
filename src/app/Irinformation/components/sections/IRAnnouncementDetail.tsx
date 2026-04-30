/** IR 공고 상세 page용 래퍼. 사용처: `Irinformation/announcement/[id]/page.tsx`. */
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
