/**
 * 공통 fetch 래퍼(`apiRequest`)와 API 오류 타입(`ApiError`)입니다.
 * 도메인별 모듈은 이 파일의 `apiRequest`만 호출하는 것을 권장합니다.
 */
import { API_BASE_URL, toApiUrl } from "./config";

/** 상대 베이스(`/api/proxy`) = 브라우저→Next 동일 출처; 세션 쿠키를 확실히 실으려 `include` 권장 */
const defaultApiCredentials: RequestCredentials = API_BASE_URL.startsWith("/")
  ? "include"
  : "same-origin";
import { ApiResponse } from "./types";

// 공통 요청 에러 타입입니다.
// 화면에서는 status를 보고 메시지를 분기할 수 있습니다.
export class ApiError extends Error {
  status: number;
  isSecret?: boolean;

  constructor(message: string, status = 500, options?: { isSecret?: boolean }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isSecret = options?.isSecret;
  }
}

// 쿼리스트링으로 붙일 수 있는 기본 값 타입입니다.
type QueryValue = string | number | boolean | null | undefined;

// 모든 API 요청에서 공통으로 받는 옵션입니다.
interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Record<string, QueryValue>;
  body?: BodyInit | object | null;
}

// { page: 1, keyword: "abc" } 같은 객체를 ?page=1&keyword=abc 형태로 바꿉니다.
function buildQueryString(query?: Record<string, QueryValue>) {
  if (!query) return "";

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

// body가 일반 객체면 JSON으로 보내고,
// FormData 같은 특수 body는 원래 형태를 그대로 유지합니다.
function normalizeBody(body: RequestOptions["body"], headers: Headers) {
  if (!body) return undefined;

  const isPlainObject =
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer);

  if (isPlainObject) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return JSON.stringify(body);
  }

  return body as BodyInit;
}

/**
 * JSON 응답을 파싱하고 `{ ok, data }` 규약이면 `data`만 반환합니다.
 * param path `toApiUrl`에 넘길 상대 경로 (예: `/front/faq.php`)
 */
export async function apiRequest<T>(
  path: string,
  {
    query,
    body,
    headers,
    credentials = defaultApiCredentials,
    ...init
  }: RequestOptions = {}
): Promise<T> {
  // 헤더를 Headers 인스턴스로 맞춰두면 Content-Type 같은 값을 안전하게 추가할 수 있습니다.
  const nextHeaders = new Headers(headers);
  const requestBody = normalizeBody(body, nextHeaders);

  // path는 config.ts의 base URL과 결합됩니다.
  const response = await fetch(`${toApiUrl(path)}${buildQueryString(query)}`, {
    ...init,
    headers: nextHeaders,
    body: requestBody,
    credentials,
  });

  const rawText = await response.text();
  let json: unknown;
  try {
    json = rawText ? JSON.parse(rawText) : {};
  } catch {
    if (!response.ok) {
      const fallback404 =
        "요청한 API를 서버에서 찾을 수 없습니다(404). 백엔드에 해당 PHP 파일이 올라가 있는지, NEXT_PUBLIC_API_BASE_URL(개발 시에는 /api/proxy → 리라이트 대상)을 확인하세요. 프록시는 주소만 넘기므로 원격에 파일이 없으면 404가 납니다.";
      throw new ApiError(
        response.status === 404 ? fallback404 : "서버가 JSON이 아닌 응답을 돌려주었습니다.",
        response.status
      );
    }
    throw new ApiError("응답 본문을 JSON으로 읽을 수 없습니다.", response.status);
  }

  const jsonObj = json as ApiResponse<T> | (T & { ok?: boolean });

  // HTTP 자체가 실패한 경우입니다. (예: 400, 401, 500)
  if (!response.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof (json as { error?: unknown }).error === "string"
        ? String((json as { error: string }).error)
        : response.status === 404
          ? "요청한 API를 서버에서 찾을 수 없습니다(404). 백엔드 파일 배포·API 베이스 URL을 확인하세요."
          : "요청 처리 중 오류가 발생했습니다.";

    const isSecret =
      typeof json === "object" &&
      json !== null &&
      "is_secret" in json &&
      (json as { is_secret?: boolean }).is_secret === true;

    throw new ApiError(message, response.status, { isSecret });
  }

  // HTTP 200이어도 백엔드 규약상 ok: false로 내려오는 경우를 한 번 더 잡아줍니다.
  if (
    typeof json === "object" &&
    json !== null &&
    "ok" in json &&
    (json as { ok?: boolean }).ok === false &&
    "error" in json
  ) {
    const isSecret = "is_secret" in json && (json as { is_secret?: boolean }).is_secret === true;
    throw new ApiError(String((json as { error: string }).error), response.status, { isSecret });
  }

  // 백엔드가 { ok: true, data: ... } 형태를 쓰는 경우 data만 꺼내서 반환합니다.
  if (
    typeof json === "object" &&
    json !== null &&
    "ok" in json &&
    (json as { ok?: boolean }).ok === true &&
    "data" in json
  ) {
    return (json as { data: T }).data;
  }

  // 혹시 data 없이 바로 배열/객체를 주는 API가 생겨도 그대로 쓸 수 있게 열어둡니다.
  return jsonObj as T;
}
