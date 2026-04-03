// 백엔드가 공통으로 쓰는 성공 응답 형태입니다.
export interface ApiSuccess<T> {
  ok: true;
  data: T;
  message?: string;
}

// 백엔드가 공통으로 쓰는 실패 응답 형태입니다.
export interface ApiFailure {
  ok: false;
  error: string;
  is_secret?: boolean;
}

// API 응답 기본 규약입니다.
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// 게시판/FAQ 등 여러 목록형 화면에서 같이 쓰는 페이징 타입입니다.
export interface Pagination {
  total_count: number;
  total_pages: number;
  current_page?: number;
}

// franchise 관련 단건 데이터입니다.
// g1_franchise 테이블 컬럼 기준으로 맞춘 타입입니다.
export interface FranchiseItem {
  gf_id: number;
  gf_type: number;
  gf_continent: string;
  gf_subject: string;
  gf_nation: string;
  gf_area: string;
  gf_addr: string;
  gf_contact: string;
  gf_tel: string;
  gf_fax: string;
  gf_email: string;
  gf_url: string;
  gf_map_url: string;
  gf_datetime: string;
  gf_certi: string;
  gf_certi_url?: string;
}

// franchise 리스트 응답의 data 구조입니다.
export interface FranchiseListData {
  items: FranchiseItem[];
  total_count: number;
  total_pages: number;
}

// 게시판 목록 한 줄에 필요한 최소 필드입니다.
export interface BoardPostItem {
  id: number;
  num?: number;
  category?: string;
  subject: string;
  writer: string;
  datetime: string;
  hit: number;
  is_secret: boolean;
  status?: string | null;
}

// 게시판 목록 조회 응답 구조입니다.
export interface BoardPostListData {
  list: BoardPostItem[];
  pagination: Pagination;
}

// 문의 답변 같은 1:1 답변 데이터입니다.
export interface BoardAnswer {
  content: string;
  datetime: string;
}

// 게시판 첨부파일 정보입니다.
export interface BoardFile {
  bf_source: string;
  bf_file: string;
  bf_filesize: number;
  bf_download: number;
  bf_datetime: string;
}

// 게시판 상세 화면에서 쓰는 데이터 구조입니다.
export interface BoardPostDetail {
  id: number;
  category: string;
  subject: string;
  content: string;
  writer: string;
  datetime: string;
  is_secret: boolean;
  hit: number;
  files: BoardFile[];
  answer: BoardAnswer | null;
}

// 게시글 등록할 때 프론트에서 보내는 payload입니다.
export interface BoardPostCreatePayload {
  bo_table: string;
  ca_name?: string;
  wr_subject: string;
  wr_content: string;
  wr_name: string;
  wr_password?: string;
  wr_email?: string;
  wr_1?: string;
  agree: "1";
  secret?: "secret";
}

// 비밀글 인증용 payload입니다.
export interface BoardAuthPayload {
  bo_table: string;
  wr_id: number;
  password: string;
}

// FAQ 탭(카테고리) 데이터입니다.
export interface FaqMaster {
  fm_id: number;
  subject: string;
}

// FAQ 한 건 데이터입니다.
export interface FaqItem {
  fa_id: number;
  subject: string;
  content: string;
}

// FAQ 페이지에서 한 번에 필요한 전체 응답 구조입니다.
export interface FaqData {
  master_list: FaqMaster[];
  current_master: {
    fm_id: number;
    subject: string;
    head_html: string;
    tail_html: string;
  };
  faq_list: FaqItem[];
  pagination: Pagination;
}
