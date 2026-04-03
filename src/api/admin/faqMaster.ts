import { apiRequest } from "../client";

export interface AdminFaqMasterItem {
  fm_id: number;
  fm_subject: string;
  fm_head_html: string;
  fm_tail_html: string;
  fm_mobile_head_html: string;
  fm_mobile_tail_html: string;
  fm_order: number;
  fm_himg_url?: string;
  fm_timg_url?: string;
  faq_count?: number;
}

export interface AdminFaqMasterSavePayload {
  fm_id?: number;
  fm_subject: string;
  fm_head_html?: string;
  fm_tail_html?: string;
  fm_mobile_head_html?: string;
  fm_mobile_tail_html?: string;
  fm_order?: number;
  fm_himg?: File | null;
  fm_timg?: File | null;
}

function toFaqMasterFormData(payload: AdminFaqMasterSavePayload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if ((key === "fm_himg" || key === "fm_timg") && value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export async function getAdminFaqMasterList() {
  return apiRequest<AdminFaqMasterItem[]>("/admin/faq_master.php", {
    credentials: "include",
  });
}

export async function getAdminFaqMasterDetail(fmId: number) {
  return apiRequest<AdminFaqMasterItem>("/admin/faq_master.php", {
    query: { fm_id: fmId },
    credentials: "include",
  });
}

export async function saveAdminFaqMaster(payload: AdminFaqMasterSavePayload) {
  return apiRequest<{ fm_id: number; message: string }>("/admin/faq_master.php", {
    method: "POST",
    body: toFaqMasterFormData(payload),
    credentials: "include",
  });
}

export async function deleteAdminFaqMaster(fmId: number) {
  return apiRequest<{ message: string }>("/admin/faq_master.php", {
    method: "DELETE",
    query: { fm_id: fmId },
    credentials: "include",
  });
}
