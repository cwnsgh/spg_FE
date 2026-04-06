import { apiRequest } from "./client";
import {
  BoardAuthPayload,
  BoardInfo,
  BoardPostCreatePayload,
  BoardPostDeletePayload,
  BoardPostDetail,
  BoardPostListData,
} from "./types";

// 게시판 목록 조회에 공통으로 쓰는 검색 조건입니다.
export interface BoardListParams {
  bo_table: string;
  page?: number;
  sca?: string;
  stx?: string;
}

// 게시판 리스트 조회입니다.
// bo_table만 바꾸면 공지/문의/자료실 등 여러 게시판을 같은 함수로 호출할 수 있습니다.
export async function getBoardPosts(params: BoardListParams) {
  return apiRequest<BoardPostListData>("/front/board/posts.php", {
    query: {
      bo_table: params.bo_table,
      page: params.page ?? 1,
      sca: params.sca,
      stx: params.stx,
    },
  });
}

// 게시글 상세 조회입니다.
// 비밀글이면 백엔드에서 403 + is_secret 응답을 줄 수 있습니다.
export async function getBoardPostDetail(boTable: string, wrId: number) {
  return apiRequest<BoardPostDetail>("/front/board/posts.php", {
    query: {
      bo_table: boTable,
      wr_id: wrId,
    },
  });
}

// 게시판 기본 정보와 권한 레벨 조회입니다.
export async function getBoardInfo(boTable: string) {
  return apiRequest<BoardInfo>("/front/board/info.php", {
    query: {
      bo_table: boTable,
    },
  });
}

// 게시글 등록입니다.
// 현재 백엔드는 form-data와 json을 모두 어느 정도 받도록 되어 있어, 여기서는 공통 객체로 보냅니다.
export async function createBoardPost(payload: BoardPostCreatePayload | FormData) {
  return apiRequest<{ id?: number; wr_id?: number; message?: string }>(
    "/front/board/posts.php",
    {
    method: "POST",
    body: payload,
    }
  );
}

// 게시글 수정입니다.
// 파일 업로드를 포함할 수 있어 FormData를 그대로 전달합니다.
export async function updateBoardPost(formData: FormData) {
  return apiRequest<{ message?: string }>("/front/board/posts.php", {
    method: "POST",
    body: formData,
  });
}

// 게시글 삭제입니다.
// 관리자면 wr_password 없이 단건/다건 삭제가 가능합니다.
export async function deleteBoardPost(payload: BoardPostDeletePayload) {
  return apiRequest<{ deleted_count?: number; message?: string }>(
    "/front/board/posts.php",
    {
      method: "DELETE",
      body: payload,
    }
  );
}

// 비밀글 비밀번호 인증입니다.
// 인증에 성공하면 세션이 생기고, 이후 상세 조회가 가능해지는 구조를 염두에 둔 함수입니다.
export async function authenticateBoardPost(payload: BoardAuthPayload) {
  return apiRequest<{ message?: string }>("/front/board/auth.php", {
    method: "POST",
    body: payload,
  });
}

// 관리자/답변형 게시판에서 답변 등록할 때 사용할 함수입니다.
export async function createBoardAnswer(
  boTable: string,
  wrId: number,
  gcContent: string
) {
  return apiRequest<{ message?: string }>("/front/board/answers.php", {
    method: "POST",
    body: {
      bo_table: boTable,
      wr_id: wrId,
      gc_content: gcContent,
    },
  });
}

// 관리자/답변형 게시판에서 답변 수정할 때 사용할 함수입니다.
export async function updateBoardAnswer(
  boTable: string,
  wrId: number,
  gcContent: string
) {
  return apiRequest<{ message?: string }>("/front/board/answers.php", {
    method: "PUT",
    body: {
      bo_table: boTable,
      wr_id: wrId,
      gc_content: gcContent,
    },
  });
}

// 관리자/답변형 게시판에서 답변 삭제할 때 사용할 함수입니다.
export async function deleteBoardAnswer(boTable: string, wrId: number) {
  return apiRequest<{ message?: string }>("/front/board/answers.php", {
    method: "DELETE",
    body: {
      bo_table: boTable,
      wr_id: wrId,
    },
  });
}
