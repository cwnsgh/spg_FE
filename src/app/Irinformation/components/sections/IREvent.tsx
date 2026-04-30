/** IR 탭 3 행사 목록 — `ir_event`. 사용처: `IRTabs.tsx`. */
import IRBoardList from "./IRBoardList";

export default function IREvent() {
  return (
    <IRBoardList
      title="IR행사"
      boardTable="ir_event"
      detailBasePath="/Irinformation/event"
    />
  );
}
