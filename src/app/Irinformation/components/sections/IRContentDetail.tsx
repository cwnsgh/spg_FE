/** IR 콘텐츠 상세 page용 래퍼. 사용처: `Irinformation/content/[id]/page.tsx`. */
import IRBoardDetail from "./IRBoardDetail";

interface IRContentDetailProps {
  postId: number;
}

export default function IRContentDetail({ postId }: IRContentDetailProps) {
  return (
    <IRBoardDetail
      postId={postId}
      boardTable="ir_content"
      listPath="/Irinformation?tab=2"
      sectionLabel="IR콘텐츠"
      activeTab={2}
    />
  );
}
