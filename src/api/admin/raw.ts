import { ApiError } from "../client";
import { toApiUrl } from "../config";

type QueryValue = string | number | boolean | null | undefined;

interface AdminRequestOptions extends Omit<RequestInit, "body"> {
  query?: Record<string, QueryValue>;
  body?: BodyInit | object | null;
}

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

function normalizeBody(body: AdminRequestOptions["body"], headers: Headers) {
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

export async function adminRawRequest<T>(
  path: string,
  { query, body, headers, credentials = "include", ...init }: AdminRequestOptions = {}
): Promise<T> {
  const nextHeaders = new Headers(headers);
  const requestBody = normalizeBody(body, nextHeaders);

  const response = await fetch(`${toApiUrl(path)}${buildQueryString(query)}`, {
    ...init,
    headers: nextHeaders,
    body: requestBody,
    credentials,
  });

  const json = (await response.json()) as
    | { ok?: boolean; error?: string; data?: unknown; pagination?: unknown }
    | T;

  if (!response.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : "요청 처리 중 오류가 발생했습니다.";

    throw new ApiError(message, response.status);
  }

  if (
    typeof json === "object" &&
    json !== null &&
    "ok" in json &&
    json.ok === false &&
    "error" in json
  ) {
    throw new ApiError(String(json.error), response.status);
  }

  return json as T;
}
