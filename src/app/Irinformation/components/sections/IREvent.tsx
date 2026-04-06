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
