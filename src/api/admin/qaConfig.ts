/**
 * 1:1 문의(QA) 게시판 전역 설정 조회·수정입니다.
 * 백엔드: `admin/qa_config.php`
 */
import { apiRequest } from "../client";

export interface AdminQaConfig {
  qa_title: string;
  qa_category: string;
  qa_skin: string;
  qa_mobile_skin: string;
  qa_use_email: string;
  qa_req_email: string;
  qa_use_hp: string;
  qa_req_hp: string;
  qa_use_sms?: string;
  qa_send_number?: string;
  qa_admin_hp?: string;
  qa_admin_email?: string;
  qa_use_editor: string;
  qa_subject_len: string;
  qa_mobile_subject_len: string;
  qa_page_rows: string;
  qa_mobile_page_rows: string;
  qa_image_width: string;
  qa_upload_size: string;
  qa_insert_content: string;
  qa_include_head?: string;
  qa_include_tail?: string;
  qa_content_head?: string;
  qa_content_tail?: string;
  qa_mobile_content_head?: string;
  qa_mobile_content_tail?: string;
  qa_1_subj?: string;
  qa_2_subj?: string;
  qa_3_subj?: string;
  qa_4_subj?: string;
  qa_5_subj?: string;
  qa_1?: string;
  qa_2?: string;
  qa_3?: string;
  qa_4?: string;
  qa_5?: string;
}

export async function getAdminQaConfig() {
  return apiRequest<AdminQaConfig>("/admin/qa_config.php", {
    credentials: "include",
  });
}

export async function updateAdminQaConfig(payload: Partial<AdminQaConfig>) {
  return apiRequest<{ message: string }>("/admin/qa_config.php", {
    method: "PUT",
    body: payload,
    credentials: "include",
  });
}
