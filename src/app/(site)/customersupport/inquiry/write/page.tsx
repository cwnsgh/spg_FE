import { Suspense } from "react";
import InquiryWrite from "@/app/customersupport/components/InquirySection/InquiryWrite";

export default function InquiryWritePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InquiryWrite />
    </Suspense>
  );
}
