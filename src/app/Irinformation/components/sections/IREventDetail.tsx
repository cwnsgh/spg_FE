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
