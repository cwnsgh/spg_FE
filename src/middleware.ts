import { NextRequest, NextResponse } from "next/server";
import {
  isHopByHopHeader,
  isLocalDevRequestHost,
  resolveUpstreamBackendOrigin,
  rewriteSetCookieForLocalhostDev,
} from "@/lib/devAuthSessionProxy";

/**
 * `next dev` + 로컬/사설망 호스트에서만 동작합니다.
 * `/api/proxy/auth/*` 는 rewrite 보다 먼저 여기서 백엔드로 직접 fetch 하고,
 * `Set-Cookie` 의 Domain/Secure 를 고쳐 세션이 브라우저 호스트에 남도록 합니다.
 * (정적 `out/` 배포에는 미들웨어가 없어 영향 없음)
 *
 * 순수 rewrite 만 쓰고 싶으면: `.env.local` 에 `NEXT_PUBLIC_DISABLE_AUTH_COOKIE_MIDDLEWARE=1`
 */
export const config = {
  matcher: "/api/proxy/auth/:path*",
};

export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DISABLE_AUTH_COOKIE_MIDDLEWARE === "1") {
    return NextResponse.next();
  }

  if (!isLocalDevRequestHost(request.headers.get("host"))) {
    return NextResponse.next();
  }

  const upstreamOrigin = resolveUpstreamBackendOrigin();
  let upstreamHost: string;
  try {
    upstreamHost = new URL(upstreamOrigin).host;
  } catch {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/proxy/auth/")) {
    return NextResponse.next();
  }

  const rest = pathname.slice("/api/proxy".length);
  const upstreamUrl = `${upstreamOrigin}/api${rest}${request.nextUrl.search}`;

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (!isHopByHopHeader(key)) {
      forwardHeaders.append(key, value);
    }
  });
  forwardHeaders.set("host", upstreamHost);

  let upstreamProto: string;
  try {
    upstreamProto = new URL(upstreamOrigin).protocol === "https:" ? "https" : "http";
  } catch {
    upstreamProto = "https";
  }
  /** 백엔드가 리버스 프록시 뒤의 Host 와 맞추도록 실제 API 호스트와 동일하게 둡니다 */
  forwardHeaders.set("x-forwarded-host", upstreamHost);
  forwardHeaders.set("x-forwarded-proto", upstreamProto);

  const method = request.method;
  const init: RequestInit = {
    method,
    headers: forwardHeaders,
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, init);
  } catch {
    return NextResponse.json(
      { ok: false, error: "백엔드 인증 프록시에 연결하지 못했습니다." },
      { status: 502 }
    );
  }

  const outHeaders = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    if (isHopByHopHeader(key)) return;
    if (key.toLowerCase() === "set-cookie") return;
    outHeaders.append(key, value);
  });

  const rawSetCookies =
    typeof upstreamRes.headers.getSetCookie === "function"
      ? upstreamRes.headers.getSetCookie()
      : splitLegacySetCookie(upstreamRes.headers.get("set-cookie"));

  const out = new NextResponse(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: outHeaders,
  });

  for (const raw of rawSetCookies) {
    if (raw) out.headers.append("Set-Cookie", rewriteSetCookieForLocalhostDev(raw));
  }

  return out;
}

/** `getSetCookie` 가 없는 런타임용 (최선) */
function splitLegacySetCookie(header: string | null): string[] {
  if (!header) return [];
  return [header];
}
