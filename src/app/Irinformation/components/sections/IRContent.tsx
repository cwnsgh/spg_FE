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

