/**
 * 채용 지원 세션 API (`credentials: include`, PHP `ses_re_id` 연동)
 * - `auth.php` : 지원자 인증 (관리자 로그인과 무관)
 * - `apply.php` : 지원서 조회/단계 저장
 * - `upload.php` : 첨부 업로드 (multipart)
 */
import { toApiUrl } from "./config";
import { ApiError } from "./client";

export class RecruitApplyValidationError extends ApiError {
  errors: string[];

  constructor(errors: string[]) {
    super(errors.length ? errors.join(", ") : "제출에 필요한 항목이 누락되었습니다.", 422);
    this.name = "RecruitApplyValidationError";
    this.errors = errors;
  }
}

type QueryRecord = Record<string, string | number | boolean | undefined | null>;

function buildQuery(query?: QueryRecord): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

function validationErrors(json: Record<string, unknown>): string[] | null {
  const data = json.data;
  if (typeof data === "object" && data !== null && "errors" in data) {
    const raw = (data as { errors?: unknown }).errors;
    if (Array.isArray(raw)) {
      return raw.filter((item): item is string => typeof item === "string");
    }
  }
  return null;
}

async function failIfNotOk(res: Response, json: Record<string, unknown>) {
  const errs = validationErrors(json);
  if (!res.ok) {
    if (res.status === 422 && errs?.length) {
      throw new RecruitApplyValidationError(errs);
    }
    throw new ApiError(
      typeof json.error === "string" ? json.error : "요청 처리 중 오류가 발생했습니다.",
      res.status
    );
  }
  if (json.ok === false) {
    if (res.status === 422 && errs?.length) {
      throw new RecruitApplyValidationError(errs);
    }
    throw new ApiError(
      typeof json.error === "string" ? json.error : "요청 처리 중 오류가 발생했습니다.",
      res.status
    );
  }
}

/** 백엔드 JSON 전체를 그대로 반환합니다 (auth 응답은 data 언랩을 하면 안 됨). */
export async function recruitPostJson(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`${toApiUrl(path)}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as Record<string, unknown>;
  await failIfNotOk(res, json);
  return json;
}

export async function recruitGetJson(path: string, query?: QueryRecord): Promise<Record<string, unknown>> {
  const res = await fetch(`${toApiUrl(path)}${buildQuery(query)}`, {
    method: "GET",
    credentials: "include",
  });
  const json = (await res.json()) as Record<string, unknown>;
  await failIfNotOk(res, json);
  return json;
}

/** 신규 지원 시작 (행 생성 + 세션). */
export function recruitAuthApplyAgree(payload: {
  wr_id: number;
  re_name: string;
  re_hp: string;
  re_email: string;
  re_birth: string;
  re_pwd: string;
  re_pwd_confirm: string;
}) {
  return recruitPostJson("/front/recurit/auth.php", { mode: "apply_agree", ...payload });
}

/** 작성 중 지원서 이어쓰기 (미제출). */
export function recruitAuthSearchDoc(payload: {
  wr_id: number;
  re_name: string;
  re_hp: string;
  re_pwd: string;
}) {
  return recruitPostJson("/front/recurit/auth.php", { mode: "searchDoc", ...payload });
}

/** 나의 지원현황 (제출 완료 re_status >= 2 만). */
export function recruitAuthSearchApply(payload: {
  wr_id: number;
  re_name: string;
  re_hp: string;
  re_pwd: string;
}) {
  return recruitPostJson("/front/recurit/auth.php", { mode: "searchApply", ...payload });
}

/** 지원서 본문 조회 (세션 또는 re_id). */
export async function recruitGetApply(reId?: number): Promise<Record<string, unknown>> {
  const json = await recruitGetJson(
    "/front/recurit/apply.php",
    reId && reId > 0 ? { re_id: reId } : undefined
  );
  const data = json.data;
  if (typeof data === "object" && data !== null) {
    return data as Record<string, unknown>;
  }
  throw new ApiError("지원서 데이터 형식이 올바르지 않습니다.", 500);
}

export async function recruitSaveApplyStep(
  step: 1 | 2 | 3 | 4 | 5,
  body: Record<string, unknown>,
  options?: { save_mode?: "save" | "autosave"; re_id?: number }
) {
  const payload = {
    step,
    save_mode: options?.save_mode ?? "save",
    ...body,
    ...(options?.re_id ? { re_id: options.re_id } : {}),
  };
  return recruitPostJson("/front/recurit/apply.php", payload);
}

const RECRUIT_UPLOAD_TYPES = ["recurit", "fgrade", "fscore", "fcerti", "fcareer"] as const;
export type RecruitUploadType = (typeof RECRUIT_UPLOAD_TYPES)[number];

export async function recruitUploadFile(type: RecruitUploadType, file: File) {
  const fd = new FormData();
  fd.append("type", type);
  fd.append("file", file);

  const res = await fetch(`${toApiUrl("/front/recurit/upload.php")}`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const json = (await res.json()) as Record<string, unknown>;
  await failIfNotOk(res, json);
  return json;
}

export async function recruitListUploads(type: RecruitUploadType) {
  const json = await recruitGetJson("/front/recurit/upload.php", { type });
  const data = json.data;
  if (typeof data === "object" && data !== null && "list" in data) {
    return data as { type?: string; count?: number; list: unknown[] };
  }
  return { list: [] as unknown[] };
}

export async function recruitDeleteUpload(pf_id: number) {
  const fd = new FormData();
  fd.append("action", "delete");
  fd.append("pf_id", String(pf_id));

  const res = await fetch(`${toApiUrl("/front/recurit/upload.php")}`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const json = (await res.json()) as Record<string, unknown>;
  await failIfNotOk(res, json);
  return json;
}

/** 백엔드 `RE_STATUS_ARRAY` 와 동일 순서 (표시용). */
export const RECRUIT_STATUS_LABELS = [
  "준비",
  "저장",
  "제출",
  "확인",
  "서류 대기",
  "서류 탈락",
  "서류 통과",
  "합격",
  "삭제대기",
] as const;

/** `ajax.application_delete.php` 가 영구삭제하는 상태값 (삭제대기). */
export const RECRUIT_STATUS_DELETE_PENDING = RECRUIT_STATUS_LABELS.indexOf("삭제대기");

export function recruitStatusLabel(code: number): string {
  if (code >= 0 && code < RECRUIT_STATUS_LABELS.length) {
    return RECRUIT_STATUS_LABELS[code] ?? `상태(${code})`;
  }
  return `상태(${code})`;
}
