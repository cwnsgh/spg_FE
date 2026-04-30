/** Next.js 페이지: IR 콘텐츠 게시글 관리. URL `/admin/ir/content` */
"use client";

import BoardPostManager from "../components/BoardPostManager";

export default function AdminIrContentPage() {
  return (
    <BoardPostManager
      title="IR콘텐츠 관리"
      description="공개 IR콘텐츠 게시판의 글을 등록, 수정, 삭제합니다."
      boardTable="ir_content"
      publicListPath="/Irinformation?tab=2"
      publicDetailBasePath="/Irinformation/content"
    />
  );
}
