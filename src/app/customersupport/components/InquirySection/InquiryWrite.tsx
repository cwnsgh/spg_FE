"use client";

import {
  ApiError,
  BoardInfo,
  createBoardPost,
  getBoardInfo,
  getBoardPosts,
} from "@/api";
import Breadcrumb, { BreadcrumbItem } from "@/app/components/Breadcrumb";
import HeroBanner, { TabItem } from "@/app/components/HeroBanner";
import { useAuth } from "@/contexts/AuthContext";
import customerSupportBanner from "@/assets/customersupport_banner.png";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  INQUIRY_BOARD_TABLE,
  INQUIRY_CATEGORY_PRESETS,
  INQUIRY_COPY,
  type InquiryLanguage,
  type InquiryWriteFormState,
  type PendingAttachment,
  createInitialInquiryWriteForm,
  getInquiryDetailPath,
  getInquiryListPath,
  resolveInquiryLanguage,
} from "./inquiryShared";
import formStyles from "./InquirySection.module.css";
import pageStyles from "./InquiryWrite.module.css";

const SUPPORT_TABS: TabItem[] = [
  { label: "제품문의", value: "inquiry" },
  { label: "FAQ", value: "faq" },
  { label: "다운로드", value: "download" },
];

export default function InquiryWrite() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();

  const queryLanguage = useMemo(
    () => resolveInquiryLanguage(searchParams.get("lang")),
    [searchParams]
  );
  const [activeLanguage, setActiveLanguage] =
    useState<InquiryLanguage>(queryLanguage);

  const listPath = getInquiryListPath(activeLanguage);
  const currentBoardTable = INQUIRY_BOARD_TABLE[activeLanguage];
  const currentUserLevel = user?.mb_level ?? 1;

  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [isBoardInfoLoading, setIsBoardInfoLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<string[]>(
    INQUIRY_CATEGORY_PRESETS[queryLanguage]
  );
  const [writeForm, setWriteForm] = useState<InquiryWriteFormState>(() =>
    createInitialInquiryWriteForm(
      queryLanguage,
      INQUIRY_CATEGORY_PRESETS[queryLanguage]
    )
  );
  const [writeAttachments, setWriteAttachments] = useState<PendingAttachment[]>(
    []
  );
  const [writeFormErrorMessage, setWriteFormErrorMessage] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const writeCategories = useMemo(
    () =>
      availableCategories.length > 0
        ? availableCategories
        : INQUIRY_CATEGORY_PRESETS[activeLanguage],
    [activeLanguage, availableCategories]
  );

  const canWriteInquiry = useMemo(() => {
    if (!boardInfo) {
      return false;
    }
    return isAdmin || currentUserLevel >= boardInfo.permissions.write;
  }, [boardInfo, currentUserLevel, isAdmin]);

  const inquiryCopy = INQUIRY_COPY[activeLanguage];
  const w = inquiryCopy.writeModal;

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [
      { label: "홈", href: "/" },
      { label: "고객지원", href: "/customersupport" },
      {
        label: activeLanguage === "en" ? "Product inquiry" : "제품문의",
        href: listPath,
      },
      { label: w.title },
    ],
    [activeLanguage, listPath, w.title]
  );

  useEffect(() => {
    setActiveLanguage(queryLanguage);
  }, [queryLanguage]);

  useEffect(() => {
    setAvailableCategories(INQUIRY_CATEGORY_PRESETS[activeLanguage]);
    setWriteForm(
      createInitialInquiryWriteForm(
        activeLanguage,
        INQUIRY_CATEGORY_PRESETS[activeLanguage]
      )
    );
    setWriteAttachments([]);
    setWriteFormErrorMessage("");
  }, [activeLanguage]);

  useEffect(() => {
    let isMounted = true;

    async function loadBoardMetadata() {
      setIsBoardInfoLoading(true);
      try {
        const data = await getBoardInfo(currentBoardTable);
        if (!isMounted) return;
        setBoardInfo(data);
      } catch {
        if (!isMounted) return;
        setBoardInfo(null);
      } finally {
        if (isMounted) {
          setIsBoardInfoLoading(false);
        }
      }
    }

    void loadBoardMetadata();
    return () => {
      isMounted = false;
    };
  }, [currentBoardTable]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategoryBootstrap() {
      try {
        const data = await getBoardPosts({
          bo_table: currentBoardTable,
          page: 1,
        });
        if (!isMounted) return;
        const nextCategories = Array.from(
          new Set([
            ...INQUIRY_CATEGORY_PRESETS[activeLanguage],
            ...data.list.map((item) => item.category).filter(Boolean),
          ])
        ) as string[];
        setAvailableCategories(nextCategories);
      } catch {
        if (isMounted) {
          setAvailableCategories(INQUIRY_CATEGORY_PRESETS[activeLanguage]);
        }
      }
    }

    void loadCategoryBootstrap();
    return () => {
      isMounted = false;
    };
  }, [activeLanguage, currentBoardTable]);

  useEffect(() => {
    setWriteForm((prev) => {
      if (writeCategories.includes(prev.category)) {
        return prev;
      }
      return {
        ...prev,
        category: writeCategories[0] ?? "",
      };
    });
  }, [writeCategories]);

  const ensureWritePermission = useCallback(() => {
    const err = INQUIRY_COPY[activeLanguage].writeErrors;

    if (isAuthLoading || isBoardInfoLoading) {
      setWriteFormErrorMessage(err.checkingPermission);
      return false;
    }

    if (!boardInfo) {
      setWriteFormErrorMessage(err.boardLoadFailed);
      return false;
    }

    if (!(isAdmin || currentUserLevel >= boardInfo.permissions.write)) {
      setWriteFormErrorMessage(err.noWritePermission);
      return false;
    }

    return true;
  }, [
    activeLanguage,
    boardInfo,
    currentUserLevel,
    isAdmin,
    isAuthLoading,
    isBoardInfoLoading,
  ]);

  const handleWriteFieldChange = useCallback(
    (key: keyof InquiryWriteFormState, value: string | boolean) => {
      setWriteForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleWriteAttachmentChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFiles = Array.from(event.target.files ?? []);
      if (nextFiles.length === 0) {
        return;
      }

      setWriteAttachments((prev) => [
        ...prev,
        ...nextFiles.map((file, index) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${prev.length + index}`,
          file,
        })),
      ]);

      event.target.value = "";
    },
    []
  );

  const handleRemoveWriteAttachment = useCallback((targetId: string) => {
    setWriteAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== targetId)
    );
  }, []);

  const handleCancel = useCallback(() => {
    router.push(listPath);
  }, [listPath, router]);

  const handleWriteSubmit = useCallback(async () => {
    if (!ensureWritePermission()) {
      return;
    }

    const err = INQUIRY_COPY[activeLanguage].writeErrors;
    const trimmedCategory = writeForm.category.trim();
    const trimmedSubject = writeForm.subject.trim();
    const trimmedWriter = writeForm.writer.trim();
    const trimmedPassword = writeForm.password.trim();
    const trimmedContent = writeForm.content.trim();

    if (!trimmedCategory) {
      setWriteFormErrorMessage(err.categoryRequired);
      return;
    }

    if (!trimmedSubject) {
      setWriteFormErrorMessage(err.subjectRequired);
      return;
    }

    if (!trimmedWriter) {
      setWriteFormErrorMessage(err.writerRequired);
      return;
    }

    if (!trimmedPassword) {
      setWriteFormErrorMessage(err.passwordRequired);
      return;
    }

    if (trimmedPassword !== writeForm.passwordConfirm.trim()) {
      setWriteFormErrorMessage(err.passwordMismatch);
      return;
    }

    if (!trimmedContent) {
      setWriteFormErrorMessage(err.contentRequired);
      return;
    }

    if (!writeForm.agree) {
      setWriteFormErrorMessage(err.privacyRequired);
      return;
    }

    setIsWriting(true);
    setWriteFormErrorMessage("");

    try {
      const formData = new FormData();
      formData.set("bo_table", currentBoardTable);
      formData.set("ca_name", trimmedCategory);
      formData.set("wr_subject", trimmedSubject);
      formData.set("wr_content", trimmedContent);
      formData.set("wr_name", trimmedWriter);
      formData.set("wr_password", trimmedPassword);
      formData.set("agree", "1");

      if (writeForm.isSecret) {
        formData.set("secret", "secret");
      }

      writeAttachments.forEach((attachment) => {
        formData.append("bf_file[]", attachment.file);
      });

      const response = await createBoardPost(formData);
      const nextPostId = Number(response.wr_id ?? response.id ?? 0);

      if (nextPostId > 0) {
        router.push(getInquiryDetailPath(activeLanguage, nextPostId));
        return;
      }

      router.push(listPath);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : INQUIRY_COPY[activeLanguage].writeErrors.registerFailed;
      setWriteFormErrorMessage(message);
    } finally {
      setIsWriting(false);
    }
  }, [
    activeLanguage,
    currentBoardTable,
    ensureWritePermission,
    listPath,
    router,
    writeAttachments,
    writeForm,
  ]);

  const showPermissionBlock =
    !isBoardInfoLoading && !isAuthLoading && boardInfo && !canWriteInquiry;

  const showLoadingBlock = isBoardInfoLoading || isAuthLoading;

  return (
    <main className={pageStyles.main}>
      <HeroBanner
        title="고객지원"
        backgroundImage={customerSupportBanner.src}
        tabs={SUPPORT_TABS}
        activeTab="inquiry"
        onTabChange={(tab) => {
          if (tab === "inquiry") {
            router.push(listPath);
            return;
          }
          router.push(`/customersupport?tab=${tab}`);
        }}
      />

      <div className={pageStyles.content}>
        <div className={pageStyles.breadcrumbArea}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <section className={pageStyles.writeSection}>
          {showLoadingBlock ? (
            <div className={pageStyles.stateBox}>
              {inquiryCopy.writeErrors.checkingPermission}
            </div>
          ) : !boardInfo ? (
            <div
              className={`${pageStyles.stateBox} ${pageStyles.stateBoxError}`}
            >
              {inquiryCopy.writeErrors.boardLoadFailed}
              <div style={{ marginTop: "2rem" }}>
                <Link href={listPath} className={pageStyles.backLink}>
                  {inquiryCopy.backToList}
                </Link>
              </div>
            </div>
          ) : showPermissionBlock ? (
            <div
              className={`${pageStyles.stateBox} ${pageStyles.stateBoxError}`}
            >
              {inquiryCopy.toolbarNoWrite}
              <div style={{ marginTop: "2rem" }}>
                <Link href={listPath} className={pageStyles.backLink}>
                  {inquiryCopy.backToList}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={pageStyles.pageHeader}>
                <div className={pageStyles.pageTitleBlock}>
                  <h1 className={pageStyles.pageTitle}>{w.title}</h1>
                  <p className={pageStyles.pageDescription}>{w.description}</p>
                </div>
                <Link href={listPath} className={pageStyles.backLink}>
                  {inquiryCopy.backToList}
                </Link>
              </div>

              <div className={formStyles.writeFormGrid}>
                <label className={formStyles.writeField}>
                  <span>{w.category}</span>
                  <select
                    value={writeForm.category}
                    onChange={(event) =>
                      handleWriteFieldChange("category", event.target.value)
                    }
                  >
                    {writeCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label
                  className={`${formStyles.writeField} ${formStyles.fullField}`}
                >
                  <span>{w.subject}</span>
                  <input
                    type="text"
                    value={writeForm.subject}
                    onChange={(event) =>
                      handleWriteFieldChange("subject", event.target.value)
                    }
                    placeholder={w.subjectPh}
                  />
                </label>

                <label className={formStyles.writeField}>
                  <span>{w.writer}</span>
                  <input
                    type="text"
                    value={writeForm.writer}
                    onChange={(event) =>
                      handleWriteFieldChange("writer", event.target.value)
                    }
                    placeholder={w.writerPh}
                  />
                </label>

                <div
                  className={`${formStyles.writeField} ${formStyles.checkField}`}
                >
                  <span>{w.secretRow}</span>
                  <label className={formStyles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={writeForm.isSecret}
                      onChange={(event) =>
                        handleWriteFieldChange("isSecret", event.target.checked)
                      }
                    />
                    <span>{w.secretCheck}</span>
                  </label>
                </div>

                <label className={formStyles.writeField}>
                  <span>{w.password}</span>
                  <input
                    type="password"
                    value={writeForm.password}
                    onChange={(event) =>
                      handleWriteFieldChange("password", event.target.value)
                    }
                    placeholder={w.passwordPh}
                  />
                </label>

                <label className={formStyles.writeField}>
                  <span>{w.passwordConfirm}</span>
                  <input
                    type="password"
                    value={writeForm.passwordConfirm}
                    onChange={(event) =>
                      handleWriteFieldChange(
                        "passwordConfirm",
                        event.target.value
                      )
                    }
                    placeholder={w.passwordConfirmPh}
                  />
                </label>

                <label
                  className={`${formStyles.writeField} ${formStyles.fullField}`}
                >
                  <span>{w.content}</span>
                  <textarea
                    value={writeForm.content}
                    onChange={(event) =>
                      handleWriteFieldChange("content", event.target.value)
                    }
                    placeholder={w.contentPh}
                  />
                </label>

                <div
                  className={`${formStyles.writeField} ${formStyles.fullField}`}
                >
                  <span>{w.attachment}</span>
                  <div className={formStyles.fileField}>
                    <label className={formStyles.fileSelectButton}>
                      {w.chooseFile}
                      <input
                        type="file"
                        multiple
                        className={formStyles.hiddenFileInput}
                        onChange={handleWriteAttachmentChange}
                      />
                    </label>
                    <p className={formStyles.fileFieldHint}>
                      {w.attachmentHint}
                    </p>
                  </div>
                  {writeAttachments.length > 0 && (
                    <ul className={formStyles.pendingFileList}>
                      {writeAttachments.map((attachment) => (
                        <li key={attachment.id}>
                          <span>{attachment.file.name}</span>
                          <button
                            type="button"
                            className={formStyles.fileRemoveButton}
                            onClick={() =>
                              handleRemoveWriteAttachment(attachment.id)
                            }
                          >
                            {w.removeFile}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div
                  className={`${formStyles.writeField} ${formStyles.fullField} ${formStyles.checkField}`}
                >
                  <span>{w.privacyRow}</span>
                  <label className={formStyles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={writeForm.agree}
                      onChange={(event) =>
                        handleWriteFieldChange("agree", event.target.checked)
                      }
                    />
                    <span>{w.privacyCheck}</span>
                  </label>
                </div>
              </div>

              {writeFormErrorMessage && (
                <p className={formStyles.modalError}>{writeFormErrorMessage}</p>
              )}

              <div className={formStyles.modalActions}>
                <button
                  type="button"
                  className={formStyles.modalSecondaryButton}
                  onClick={handleCancel}
                  disabled={isWriting}
                >
                  {w.cancel}
                </button>
                <button
                  type="button"
                  className={formStyles.modalPrimaryButton}
                  onClick={() => void handleWriteSubmit()}
                  disabled={isWriting}
                >
                  {isWriting ? w.submitting : w.submit}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
