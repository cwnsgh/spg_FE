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

