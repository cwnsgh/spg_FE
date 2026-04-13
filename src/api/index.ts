/**
 * 공개 API 모듈 진입점입니다.
 * 화면에서는 `@/api` 한 곳에서 import 하면 admin / front / auth / 공통 타입을 같이 쓸 수 있습니다.
 */
// 관리자(세션 필요, credentials: include)
export * from "./admin/boards";
export * from "./admin/category";
export * from "./admin/faqs";
export * from "./admin/faqMaster";
export * from "./admin/franchise";
export * from "./admin/groups";
export * from "./admin/ir";
export * from "./admin/qaConfig";
export * from "./admin/recruitApplications";
export * from "./admin/recruitPosts";
export * from "./admin/spgProduct";
export * from "./admin/visitAnalytics";
// 회원 세션 (쿠키 포함 요청)
export * from "./auth";
// 사용자용 게시판·FAQ 등
export * from "./board";
export * from "./faq";
export * from "./franchise";
export * from "./ir";
export * from "./product";
export * from "./recruit";
export * from "./recruitSession";
// 공통
export * from "./client";
export * from "./config";
export * from "./types";
