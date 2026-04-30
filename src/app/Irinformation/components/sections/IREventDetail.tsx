/** IR 행사 상세 page용 래퍼. 사용처: `Irinformation/event/[id]/page.tsx`. */
import IRBoardDetail from "./IRBoardDetail";

interface IREventDetailProps {
  postId: number;
}

export default function IREventDetail({ postId }: IREventDetailProps) {
  return (
    <IRBoardDetail
      postId={postId}
      boardTable="ir_event"
      listPath="/Irinformation?tab=3"
      sectionLabel="IR행사"
      activeTab={3}
    />
  );
}
