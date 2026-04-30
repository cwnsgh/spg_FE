/** Next.js 페이지: IR 공시 게시글 관리. URL `/admin/ir/announcement` */
"use client";

import BoardPostManager from "../components/BoardPostManager";

export default function AdminIrAnnouncementPage() {
  return (
    <BoardPostManager
      title="IR공고 관리"
      description="공개 IR공고 게시판의 글을 등록, 수정, 삭제합니다."
      boardTable="ir_notice"
      publicListPath="/Irinformation?tab=1"
      publicDetailBasePath="/Irinformation/announcement"
    />
  );
}
