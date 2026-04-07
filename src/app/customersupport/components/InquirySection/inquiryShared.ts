/** 제품문의 게시판·작성 폼에서 공통으로 쓰는 상수·타입·헬퍼 */

export const INQUIRY_BOARD_TABLE = {
  ko: "cus_res",
  en: "cus_res_en",
} as const;

export type InquiryLanguage = keyof typeof INQUIRY_BOARD_TABLE;

export const INQUIRY_CATEGORY_PRESETS: Record<InquiryLanguage, string[]> = {
  ko: ["영업지원", "기술지원", "품질 및 AS"],
  en: ["Sales Support", "Technical Support", "Quality & A/S"],
};

/** 제품문의 UI·검증 문구 (한/영 탭과 동일하게 맞춤) */
export const INQUIRY_COPY: Record<
  InquiryLanguage,
  {
    writeButton: string;
    toolbarNoWrite: string;
    backToList: string;
    writeModal: {
      title: string;
      description: string;
      close: string;
      category: string;
      subject: string;
      subjectPh: string;
      writer: string;
      writerPh: string;
      secretRow: string;
      secretCheck: string;
      password: string;
      passwordPh: string;
      passwordConfirm: string;
      passwordConfirmPh: string;
      content: string;
      contentPh: string;
      attachment: string;
      chooseFile: string;
      attachmentHint: string;
      removeFile: string;
      privacyRow: string;
      privacyCheck: string;
      cancel: string;
      submit: string;
      submitting: string;
    };
    writeErrors: {
      checkingPermission: string;
      boardLoadFailed: string;
      noWritePermission: string;
      categoryRequired: string;
      subjectRequired: string;
      writerRequired: string;
      passwordRequired: string;
      passwordMismatch: string;
      contentRequired: string;
      privacyRequired: string;
      registerFailed: string;
    };
  }
> = {
  ko: {
    writeButton: "문의하기",
    toolbarNoWrite: "현재 설정에서는 제품문의 등록 권한이 없습니다.",
    backToList: "목록으로",
    writeModal: {
      title: "제품문의 작성",
      description:
        "비회원도 문의를 등록할 수 있으며, 입력한 비밀번호로 수정/삭제가 가능합니다.",
      close: "닫기",
      category: "구분",
      subject: "제목",
      subjectPh: "제목을 입력해 주세요",
      writer: "이름",
      writerPh: "이름을 입력해 주세요",
      secretRow: "비밀글 여부",
      secretCheck: "비밀글로 등록",
      password: "비밀번호",
      passwordPh: "수정/삭제에 사용할 비밀번호",
      passwordConfirm: "비밀번호 확인",
      passwordConfirmPh: "비밀번호를 다시 입력해 주세요",
      content: "내용",
      contentPh: "문의 내용을 입력해 주세요",
      attachment: "첨부파일",
      chooseFile: "파일 선택",
      attachmentHint:
        "필요한 경우 문의 관련 파일을 함께 첨부해 주세요.",
      removeFile: "제거",
      privacyRow: "개인정보 수집 동의",
      privacyCheck: "개인정보 수집 및 이용에 동의합니다.",
      cancel: "취소",
      submit: "등록",
      submitting: "등록 중...",
    },
    writeErrors: {
      checkingPermission: "권한 정보를 확인하는 중입니다.",
      boardLoadFailed: "제품문의 권한 정보를 불러오지 못했습니다.",
      noWritePermission: "제품문의를 등록할 권한이 없습니다.",
      categoryRequired: "구분을 선택해 주세요.",
      subjectRequired: "제목을 입력해 주세요.",
      writerRequired: "이름을 입력해 주세요.",
      passwordRequired: "비밀번호를 입력해 주세요.",
      passwordMismatch: "비밀번호 확인이 일치하지 않습니다.",
      contentRequired: "내용을 입력해 주세요.",
      privacyRequired: "개인정보 수집 및 이용에 동의해 주세요.",
      registerFailed: "제품문의를 등록하지 못했습니다.",
    },
  },
  en: {
    writeButton: "New inquiry",
    toolbarNoWrite:
      "You do not have permission to submit product inquiries with the current settings.",
    backToList: "Back to list",
    writeModal: {
      title: "Submit product inquiry",
      description:
        "Guests can submit inquiries. Use the password you set to edit or delete your post later.",
      close: "Close",
      category: "Category",
      subject: "Subject",
      subjectPh: "Enter a subject",
      writer: "Name",
      writerPh: "Enter your name",
      secretRow: "Private post",
      secretCheck: "Post as private",
      password: "Password",
      passwordPh: "Password for edit/delete",
      passwordConfirm: "Confirm password",
      passwordConfirmPh: "Re-enter your password",
      content: "Message",
      contentPh: "Enter your inquiry",
      attachment: "Attachments",
      chooseFile: "Choose files",
      attachmentHint: "Attach related files if needed.",
      removeFile: "Remove",
      privacyRow: "Privacy consent",
      privacyCheck: "I agree to the collection and use of my personal data.",
      cancel: "Cancel",
      submit: "Submit",
      submitting: "Submitting...",
    },
    writeErrors: {
      checkingPermission: "Checking permissions…",
      boardLoadFailed: "Could not load inquiry board settings.",
      noWritePermission: "You do not have permission to submit an inquiry.",
      categoryRequired: "Please select a category.",
      subjectRequired: "Please enter a subject.",
      writerRequired: "Please enter your name.",
      passwordRequired: "Please enter a password.",
      passwordMismatch: "Passwords do not match.",
      contentRequired: "Please enter your message.",
      privacyRequired: "Please agree to the privacy policy.",
      registerFailed: "Could not submit your inquiry.",
    },
  },
};

export interface InquiryWriteFormState {
  category: string;
  subject: string;
  writer: string;
  isSecret: boolean;
  password: string;
  passwordConfirm: string;
  content: string;
  agree: boolean;
}

export interface PendingAttachment {
  id: string;
  file: File;
}

export function resolveInquiryLanguage(value: string | null): InquiryLanguage {
  return value === "en" ? "en" : "ko";
}

export function getInquiryDetailPath(language: InquiryLanguage, id: number) {
  return `/customersupport/inquiry/${language}/${id}`;
}

export function getInquiryListPath(language: InquiryLanguage) {
  return `/customersupport?tab=inquiry&lang=${language}`;
}

export function createInitialInquiryWriteForm(
  language: InquiryLanguage,
  categories: string[]
): InquiryWriteFormState {
  const nextCategories =
    categories.length > 0 ? categories : INQUIRY_CATEGORY_PRESETS[language];

  return {
    category: nextCategories[0] ?? "",
    subject: "",
    writer: "",
    isSecret: false,
    password: "",
    passwordConfirm: "",
    content: "",
    agree: false,
  };
}
