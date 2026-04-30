/** Next.js 페이지: 문의 상세. URL `/customersupport/inquiry/[language]/[id]` */
import InquiryDetail from "@/app/customersupport/components/InquirySection/InquiryDetail";
import { INQUIRY_BOARD_TABLE } from "@/app/customersupport/components/InquirySection/inquiryShared";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";
import { notFound } from "next/navigation";

/**
 * `output: "export"` + 빈 `generateStaticParams()` 반환 시 Next가
 * "missing generateStaticParams"로 오인하는 경우가 있어(특히 빌드 환경에서 API 실패),
 * 글이 하나도 없을 때는 플레이스홀더 경로만보냅니다. 해당 URL은 404로 처리합니다.
 */
const INQUIRY_STATIC_PLACEHOLDER_ID = "__build_placeholder__";

interface InquiryDetailPageProps {
  params: Promise<{
    language: string;
    id: string;
  }>;
}

export async function generateStaticParams() {
  const fallback = [
    { language: "ko" as const, id: INQUIRY_STATIC_PLACEHOLDER_ID },
    { language: "en" as const, id: INQUIRY_STATIC_PLACEHOLDER_ID },
  ];

  try {
    const [koIds, enIds] = await Promise.all([
      fetchAllPostIdsForBoard(INQUIRY_BOARD_TABLE.ko),
      fetchAllPostIdsForBoard(INQUIRY_BOARD_TABLE.en),
    ]);

    const paramsList = [
      ...koIds.map((id) => ({ language: "ko" as const, id })),
      ...enIds.map((id) => ({ language: "en" as const, id })),
    ];

    return paramsList.length > 0 ? paramsList : fallback;
  } catch {
    return fallback;
  }
}

export default async function InquiryDetailPage({
  params,
}: InquiryDetailPageProps) {
  const { language, id } = await params;
  if (id === INQUIRY_STATIC_PLACEHOLDER_ID) {
    notFound();
  }

  const resolvedLanguage = language === "en" ? "en" : "ko";
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId < 1) {
    notFound();
  }

  return <InquiryDetail language={resolvedLanguage} postId={postId} />;
}
