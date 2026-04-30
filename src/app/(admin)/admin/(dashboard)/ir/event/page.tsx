/** Next.js 페이지: IR 이벤트 게시글 관리. URL `/admin/ir/event` */
"use client";

import BoardPostManager from "../components/BoardPostManager";

export default function AdminIrEventPage() {
  return (
    <BoardPostManager
      title="IR행사 관리"
      description="공개 IR행사 게시판의 글을 등록, 수정, 삭제합니다."
      boardTable="ir_event"
      publicListPath="/Irinformation?tab=3"
      publicDetailBasePath="/Irinformation/event"
    />
  );
}
