import InquiryDetail from "@/app/customersupport/components/InquirySection/InquiryDetail";
import { INQUIRY_BOARD_TABLE } from "@/app/customersupport/components/InquirySection/inquiryShared";
import { fetchAllPostIdsForBoard } from "@/lib/staticExportBoardIds";

interface InquiryDetailPageProps {
  params: Promise<{
    language: string;
    id: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const [koIds, enIds] = await Promise.all([
      fetchAllPostIdsForBoard(INQUIRY_BOARD_TABLE.ko),
      fetchAllPostIdsForBoard(INQUIRY_BOARD_TABLE.en),
    ]);

    return [
      ...koIds.map((id) => ({ language: "ko" as const, id })),
      ...enIds.map((id) => ({ language: "en" as const, id })),
    ];
  } catch {
    return [];
  }
}

export default async function InquiryDetailPage({
  params,
}: InquiryDetailPageProps) {
  const { language, id } = await params;
  const resolvedLanguage = language === "en" ? "en" : "ko";
  const postId = Number(id);

  return <InquiryDetail language={resolvedLanguage} postId={postId} />;
}
