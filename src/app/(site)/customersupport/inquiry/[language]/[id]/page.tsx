import InquiryDetail from "@/app/customersupport/components/InquirySection/InquiryDetail";

interface InquiryDetailPageProps {
  params: Promise<{
    language: string;
    id: string;
  }>;
}

export default async function InquiryDetailPage({
  params,
}: InquiryDetailPageProps) {
  const { language, id } = await params;
  const resolvedLanguage = language === "en" ? "en" : "ko";
  const postId = Number(id);

  return <InquiryDetail language={resolvedLanguage} postId={postId} />;
}
