/** IR 탭 1 공고 목록 — `IRBoardList`에 `ir_notice` 바인딩. 사용처: `IRTabs.tsx`. */
import IRBoardList from "./IRBoardList";

export default function IRAnnouncement() {
  return (
    <IRBoardList
      title="IR공고"
      boardTable="ir_notice"
      detailBasePath="/Irinformation/announcement"
    />
  );
}

