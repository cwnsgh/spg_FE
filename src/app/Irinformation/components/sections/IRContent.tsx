/** IR 탭 2 콘텐츠 목록 — `ir_content`. 사용처: `IRTabs.tsx`. */
import IRBoardList from "./IRBoardList";

export default function IRContent() {
  return (
    <IRBoardList
      title="IR콘텐츠"
      boardTable="ir_content"
      detailBasePath="/Irinformation/content"
    />
  );
}

