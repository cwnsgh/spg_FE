/**
 * 관리자 FAQ 항목(질문/답변) CRUD입니다.
 * 백엔드: `admin/faqs.php`
 */
import { apiRequest } from "../client";

export interface AdminFaqItem {
  fa_id: number;
  fm_id: number;
  fa_subject: string;
  fa_content: string;
  fa_order: number;
}

export interface AdminFaqSavePayload {
  fa_id?: number;
  fm_id?: number;
  fa_subject: string;
  fa_content: string;
  fa_order?: number;
}

/** 빈 값은 제외하고 FormData로 직렬화합니다. */
function toFaqFormData(payload: AdminFaqSavePayload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, String(value));
  });

  return formData;
}

export async function getAdminFaqList(fmId: number) {
  return apiRequest<AdminFaqItem[]>("/admin/faqs.php", {
    query: { fm_id: fmId },
    credentials: "include",
  });
}

export async function getAdminFaqDetail(faId: number) {
  return apiRequest<AdminFaqItem>("/admin/faqs.php", {
    query: { fa_id: faId },
    credentials: "include",
  });
}

export async function saveAdminFaq(payload: AdminFaqSavePayload) {
  return apiRequest<{ fa_id: number; message: string }>("/admin/faqs.php", {
    method: "POST",
    body: toFaqFormData(payload),
    credentials: "include",
  });
}

export async function deleteAdminFaq(faId: number) {
  return apiRequest<{ message: string }>("/admin/faqs.php", {
    method: "DELETE",
    query: { fa_id: faId },
    credentials: "include",
  });
}
