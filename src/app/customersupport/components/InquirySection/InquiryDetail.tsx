"use client";

import {
  ApiError,
  BoardInfo,
  BoardPostDetail,
  authenticateBoardPost,
  createBoardAnswer,
  deleteBoardPost,
  deleteBoardAnswer,
  getBoardInfo,
  getBoardPostDetail,
  toBackendAssetUrl,
  updateBoardPost,
  updateBoardAnswer,
} from "@/api";
import Breadcrumb, { BreadcrumbItem } from "@/app/components/Breadcrumb";
import HeroBanner, { TabItem } from "@/app/components/HeroBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import customerSupportBanner from "@/assets/customersupport_banner.png";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./InquiryDetail.module.css";

const DETAIL_DEDUPE_WINDOW_MS = 2000;
const detailCache = new Map<string, { data: BoardPostDetail; fetchedAt: number }>();
const pendingDetailRequests = new Map<string, Promise<BoardPostDetail>>();

const SUPPORT_TABS: TabItem[] = [
  { label: "제품문의", value: "inquiry" },
  { label: "FAQ", value: "faq" },
  { label: "다운로드", value: "download" },
];

const BOARD_TABLE_BY_LANGUAGE = {
  ko: "cus_res",
  en: "cus_res_en",
} as const;

const INQUIRY_CATEGORY_OPTIONS = {
  ko: ["영업지원", "기술지원", "품질 및 AS"],
  en: ["Sales Support", "Technical Support", "Quality & A/S"],
} as const;

type InquiryLanguage = keyof typeof BOARD_TABLE_BY_LANGUAGE;

interface InquiryDetailProps {
  postId: number;
  language: InquiryLanguage;
}

interface InquiryPostEditFormState {
  category: string;
  subject: string;
  content: string;
  isSecret: boolean;
  password: string;
}

interface ExistingInquiryAttachment {
  id: string;
  slotIndex: number;
  name: string;
  markedForDeletion: boolean;
}

interface PendingInquiryAttachment {
  id: string;
  file: File;
}

function convertAnswerHtmlToText(html: string) {
  if (typeof window === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  document.querySelectorAll("br").forEach((element) => {
    element.replaceWith("\n");
  });

  return document.body.textContent?.trim() ?? "";
}

function convertPostHtmlToText(html: string) {
  if (typeof window === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  document.querySelectorAll("br").forEach((element) => {
    element.replaceWith("\n");
  });

  return document.body.textContent?.trim() ?? "";
}

export default function InquiryDetail({ postId, language }: InquiryDetailProps) {
  const router = useRouter();
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const [post, setPost] = useState<BoardPostDetail | null>(null);
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [isBoardInfoLoading, setIsBoardInfoLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAnswerEditorOpen, setIsAnswerEditorOpen] = useState(false);
  const [answerDraft, setAnswerDraft] = useState("");
  const [answerErrorMessage, setAnswerErrorMessage] = useState("");
  const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [postEditForm, setPostEditForm] = useState<InquiryPostEditFormState>({
    category: "",
    subject: "",
    content: "",
    isSecret: false,
    password: "",
  });
  const [existingAttachments, setExistingAttachments] = useState<
    ExistingInquiryAttachment[]
  >([]);
  const [newAttachments, setNewAttachments] = useState<PendingInquiryAttachment[]>([]);
  const [postActionErrorMessage, setPostActionErrorMessage] = useState("");
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);
  const [ownerActionMode, setOwnerActionMode] = useState<"edit" | "delete" | null>(
    null
  );
  const [ownerActionPassword, setOwnerActionPassword] = useState("");
  const [isOwnerAuthenticating, setIsOwnerAuthenticating] = useState(false);

  const boardTable = BOARD_TABLE_BY_LANGUAGE[language];
  const listPath = `/customersupport?tab=inquiry&lang=${language}`;
  const detailCacheKey = `${boardTable}:${postId}`;
  const categoryOptions = INQUIRY_CATEGORY_OPTIONS[language];
  const canManageAnswer = useMemo(() => {
    if (!user || !boardInfo) {
      return false;
    }

    return isAdmin || user.mb_level >= boardInfo.permissions.reply;
  }, [boardInfo, isAdmin, user]);
  const canManageOwnPost = useMemo(
    () => !isAuthLoading && !isAdmin,
    [isAdmin, isAuthLoading]
  );

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [
      { label: "홈", href: "/" },
      { label: "고객지원", href: "/customersupport" },
      { label: "제품문의", href: listPath },
      { label: post?.subject || "상세보기" },
    ],
    [listPath, post?.subject]
  );

  const closePasswordModal = useCallback(() => {
    router.push(listPath);
  }, [listPath, router]);

  const closeOwnerActionModal = useCallback(() => {
    setOwnerActionMode(null);
    setOwnerActionPassword("");
    setPostActionErrorMessage("");
    setIsOwnerAuthenticating(false);
  }, []);

  const invalidateDetailCache = useCallback(() => {
    detailCache.delete(detailCacheKey);
    pendingDetailRequests.delete(detailCacheKey);
  }, [detailCacheKey]);

  const { handleOverlayMouseDown, handleOverlayClick } =
    useOverlayDismiss(closePasswordModal);
  const {
    handleOverlayMouseDown: handleOwnerActionOverlayMouseDown,
    handleOverlayClick: handleOwnerActionOverlayClick,
  } = useOverlayDismiss(closeOwnerActionModal);

  useEffect(() => {
    let isMounted = true;

    async function loadBoardMetadata() {
      setIsBoardInfoLoading(true);

      try {
        const data = await getBoardInfo(boardTable);

        if (!isMounted) {
          return;
        }

        setBoardInfo(data);
      } catch {
        if (!isMounted) {
          return;
        }

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
  }, [boardTable]);

  const loadDetail = useCallback(async () => {
    if (!Number.isInteger(postId) || postId <= 0) {
      setPost(null);
      setErrorMessage("올바른 게시글 정보가 아닙니다.");
      setIsLoading(false);
      return;
    }

    const now = Date.now();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const cached = detailCache.get(detailCacheKey);

      if (cached && now - cached.fetchedAt < DETAIL_DEDUPE_WINDOW_MS) {
        setPost(cached.data);
        setRequiresPassword(false);
        return;
      }

      let request = pendingDetailRequests.get(detailCacheKey);

      if (!request) {
        request = getBoardPostDetail(boardTable, postId);
        pendingDetailRequests.set(detailCacheKey, request);
      }

      const data = await request;
      detailCache.set(detailCacheKey, { data, fetchedAt: now });
      pendingDetailRequests.delete(detailCacheKey);
      setPost(data);
      setRequiresPassword(false);
    } catch (error) {
      pendingDetailRequests.delete(detailCacheKey);
      setPost(null);

      if (error instanceof ApiError && error.isSecret && !isAdmin) {
        setRequiresPassword(true);
        setPasswordErrorMessage("");
        return;
      }

      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("제품문의 상세 정보를 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [boardTable, detailCacheKey, isAdmin, postId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (post?.answer && !isAnswerEditorOpen) {
      setAnswerDraft(convertAnswerHtmlToText(post.answer.content));
    }

    if (!post?.answer && !isAnswerEditorOpen) {
      setAnswerDraft("");
    }
  }, [isAnswerEditorOpen, post?.answer]);

  useEffect(() => {
    if (!post || isPostEditorOpen) {
      return;
    }

    setPostEditForm({
      category: post.category ?? "",
      subject: post.subject,
      content: convertPostHtmlToText(post.content),
      isSecret: post.is_secret,
      password: "",
    });
    setExistingAttachments(
      post.files.map((file, index) => ({
        id: `${file.bf_file}-${index}`,
        slotIndex: index,
        name: file.bf_source,
        markedForDeletion: false,
      }))
    );
    setNewAttachments([]);
  }, [isPostEditorOpen, post]);

  const handlePasswordSubmit = useCallback(async () => {
    if (!password.trim()) {
      setPasswordErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }

    setIsAuthenticating(true);
    setPasswordErrorMessage("");

    try {
      await authenticateBoardPost({
        bo_table: boardTable,
        wr_id: postId,
        password,
      });

      await loadDetail();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "비밀번호를 확인하지 못했습니다.";
      setPasswordErrorMessage(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [boardTable, loadDetail, password, postId]);

  const ensureAnswerPermission = useCallback(() => {
    if (isAuthLoading || isBoardInfoLoading) {
      setAnswerErrorMessage("권한 정보를 확인하는 중입니다.");
      return false;
    }

    if (!user || !boardInfo) {
      setAnswerErrorMessage("답변 권한이 없습니다.");
      return false;
    }

    if (!(isAdmin || user.mb_level >= boardInfo.permissions.reply)) {
      setAnswerErrorMessage("답변 권한이 없습니다.");
      return false;
    }

    return true;
  }, [boardInfo, isAdmin, isAuthLoading, isBoardInfoLoading, user]);

  const openPostEditor = useCallback(() => {
    if (!post) {
      return;
    }

    setPostEditForm({
      category: post.category ?? "",
      subject: post.subject,
      content: convertPostHtmlToText(post.content),
      isSecret: post.is_secret,
      password: "",
    });
    setExistingAttachments(
      post.files.map((file, index) => ({
        id: `${file.bf_file}-${index}`,
        slotIndex: index,
        name: file.bf_source,
        markedForDeletion: false,
      }))
    );
    setNewAttachments([]);
    setPostActionErrorMessage("");
    setIsPostEditorOpen(true);
  }, [post]);

  const requestPostAction = useCallback((mode: "edit" | "delete") => {
    setOwnerActionMode(mode);
    setOwnerActionPassword("");
    setPostActionErrorMessage("");
  }, []);

  const closePostEditor = useCallback(() => {
    if (!post) {
      setIsPostEditorOpen(false);
      return;
    }

    setPostEditForm({
      category: post.category ?? "",
      subject: post.subject,
      content: convertPostHtmlToText(post.content),
      isSecret: post.is_secret,
      password: "",
    });
    setExistingAttachments(
      post.files.map((file, index) => ({
        id: `${file.bf_file}-${index}`,
        slotIndex: index,
        name: file.bf_source,
        markedForDeletion: false,
      }))
    );
    setNewAttachments([]);
    setPostActionErrorMessage("");
    setIsPostEditorOpen(false);
  }, [post]);

  const handleEditAttachmentToggle = useCallback((targetId: string) => {
    setExistingAttachments((prev) =>
      prev.map((attachment) =>
        attachment.id === targetId
          ? { ...attachment, markedForDeletion: !attachment.markedForDeletion }
          : attachment
      )
    );
  }, []);

  const handleNewAttachmentChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);

      if (files.length === 0) {
        return;
      }

      setNewAttachments((prev) => [
        ...prev,
        ...files.map((file, index) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${prev.length + index}`,
          file,
        })),
      ]);

      event.target.value = "";
    },
    []
  );

  const handleRemoveNewAttachment = useCallback((targetId: string) => {
    setNewAttachments((prev) => prev.filter((attachment) => attachment.id !== targetId));
  }, []);

  const openAnswerEditor = useCallback(() => {
    if (!ensureAnswerPermission()) {
      return;
    }

    setAnswerDraft(post?.answer ? convertAnswerHtmlToText(post.answer.content) : "");
    setAnswerErrorMessage("");
    setIsAnswerEditorOpen(true);
  }, [ensureAnswerPermission, post?.answer]);

  const closeAnswerEditor = useCallback(() => {
    setIsAnswerEditorOpen(false);
    setAnswerErrorMessage("");
    setAnswerDraft(post?.answer ? convertAnswerHtmlToText(post.answer.content) : "");
  }, [post?.answer]);

  const handleAnswerSave = useCallback(async () => {
    if (!ensureAnswerPermission()) {
      return;
    }

    const nextContent = answerDraft.trim();

    if (!nextContent) {
      setAnswerErrorMessage("답변 내용을 입력해 주세요.");
      return;
    }

    setIsAnswerSubmitting(true);
    setAnswerErrorMessage("");

    try {
      if (post?.answer) {
        await updateBoardAnswer(boardTable, postId, nextContent);
      } else {
        await createBoardAnswer(boardTable, postId, nextContent);
      }

      invalidateDetailCache();
      setIsAnswerEditorOpen(false);
      await loadDetail();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "답변을 저장하지 못했습니다.";
      setAnswerErrorMessage(message);
    } finally {
      setIsAnswerSubmitting(false);
    }
  }, [answerDraft, boardTable, ensureAnswerPermission, invalidateDetailCache, loadDetail, post?.answer, postId]);

  const handleAnswerDelete = useCallback(async () => {
    if (!ensureAnswerPermission()) {
      return;
    }

    if (!post?.answer) {
      return;
    }

    const confirmed = window.confirm("등록된 답변을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    setIsAnswerSubmitting(true);
    setAnswerErrorMessage("");

    try {
      await deleteBoardAnswer(boardTable, postId);
      invalidateDetailCache();
      setIsAnswerEditorOpen(false);
      setAnswerDraft("");
      await loadDetail();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "답변을 삭제하지 못했습니다.";
      setAnswerErrorMessage(message);
    } finally {
      setIsAnswerSubmitting(false);
    }
  }, [boardTable, ensureAnswerPermission, invalidateDetailCache, loadDetail, post?.answer, postId]);

  const handlePostUpdate = useCallback(async () => {
    if (!post) {
      return;
    }

    const trimmedCategory = postEditForm.category.trim();
    const trimmedSubject = postEditForm.subject.trim();
    const trimmedContent = postEditForm.content.trim();
    const trimmedPassword = postEditForm.password.trim();

    if (!trimmedCategory) {
      setPostActionErrorMessage("구분을 선택해 주세요.");
      return;
    }

    if (!trimmedSubject) {
      setPostActionErrorMessage("제목을 입력해 주세요.");
      return;
    }

    if (!trimmedPassword) {
      setPostActionErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }

    if (!trimmedContent) {
      setPostActionErrorMessage("내용을 입력해 주세요.");
      return;
    }

    setIsPostSubmitting(true);
    setPostActionErrorMessage("");

    try {
      const formData = new FormData();
      formData.set("_method", "PUT");
      formData.set("bo_table", boardTable);
      formData.set("wr_id", String(postId));
      formData.set("ca_name", trimmedCategory);
      formData.set("wr_subject", trimmedSubject);
      formData.set("wr_content", trimmedContent);
      formData.set("wr_password", trimmedPassword);
      formData.set("wr_1", post.wr_1 ?? "");
      formData.set("wr_2", post.wr_2 ?? "");

      if (postEditForm.isSecret) {
        formData.set("secret", "secret");
      }

      existingAttachments.forEach((attachment) => {
        if (attachment.markedForDeletion) {
          formData.set(`bf_file_del[${attachment.slotIndex}]`, "1");
        }
      });

      const nextSlotStart = existingAttachments.length;
      newAttachments.forEach((attachment, index) => {
        formData.append(`bf_file[${nextSlotStart + index}]`, attachment.file);
      });

      await updateBoardPost(formData);
      invalidateDetailCache();
      setIsPostEditorOpen(false);
      await loadDetail();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "게시글을 수정하지 못했습니다.";
      setPostActionErrorMessage(message);
    } finally {
      setIsPostSubmitting(false);
    }
  }, [
    boardTable,
    existingAttachments,
    invalidateDetailCache,
    loadDetail,
    newAttachments,
    post,
    postEditForm,
    postId,
  ]);

  const executePostDelete = useCallback(async (password: string) => {
    setIsPostSubmitting(true);
    setPostActionErrorMessage("");

    try {
      await deleteBoardPost({
        bo_table: boardTable,
        wr_id: postId,
        wr_password: password,
      });

      invalidateDetailCache();
      router.push(listPath);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "게시글을 삭제하지 못했습니다.";
      setPostActionErrorMessage(message);
    } finally {
      setIsPostSubmitting(false);
    }
  }, [boardTable, invalidateDetailCache, listPath, postId, router]);

  const handleOwnerActionAuth = useCallback(async () => {
    if (!ownerActionMode) {
      return;
    }

    const trimmedPassword = ownerActionPassword.trim();

    if (!trimmedPassword) {
      setPostActionErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }

    setIsOwnerAuthenticating(true);
    setPostActionErrorMessage("");

    try {
      await authenticateBoardPost({
        bo_table: boardTable,
        wr_id: postId,
        password: trimmedPassword,
      });

      const nextMode = ownerActionMode;
      closeOwnerActionModal();

      if (nextMode === "edit") {
        openPostEditor();
        setPostEditForm((prev) => ({
          ...prev,
          password: trimmedPassword,
        }));
        return;
      }

      const confirmed = window.confirm("게시글을 삭제할까요?");

      if (!confirmed) {
        return;
      }

      await executePostDelete(trimmedPassword);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "비밀번호를 확인하지 못했습니다.";
      setPostActionErrorMessage(message);
    } finally {
      setIsOwnerAuthenticating(false);
    }
  }, [
    boardTable,
    closeOwnerActionModal,
    executePostDelete,
    openPostEditor,
    ownerActionMode,
    ownerActionPassword,
    postId,
  ]);

  return (
    <main className={styles.main}>
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

      <div className={styles.content}>
        <div className={styles.breadcrumbArea}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <section className={styles.detailSection}>
          {isLoading ? (
            <div className={styles.stateBox}>상세 정보를 불러오는 중입니다.</div>
          ) : errorMessage ? (
            <div className={styles.stateBox}>{errorMessage}</div>
          ) : !post ? (
            <div className={styles.stateBox}>게시글을 찾을 수 없습니다.</div>
          ) : (
            <>
              <div className={styles.header}>
                <div className={styles.headerBadges}>
                  {post.is_secret && (
                    <span className={styles.secretBadge}>비밀글</span>
                  )}
                  {post.is_notice && (
                    <span className={styles.noticeBadge}>공지</span>
                  )}
                  {post.category && (
                    <span className={styles.categoryBadge}>{post.category}</span>
                  )}
                </div>
                <h1 className={styles.title}>{post.subject}</h1>
                <div className={styles.metaRow}>
                  <span>
                    <strong>작성자</strong>
                    {post.writer}
                  </span>
                  {canManageAnswer && (
                    <span className={styles.staffOnlyMeta}>
                      <strong>
                        {language === "en" ? "Contact" : "연락처"}
                      </strong>
                      {post.wr_1?.trim() ? post.wr_1 : "—"}
                    </span>
                  )}
                  <span>
                    <strong>작성일</strong>
                    {post.datetime}
                  </span>
                  <span>
                    <strong>조회수</strong>
                    {post.hit}
                  </span>
                </div>
              </div>

              {post.files.length > 0 && (
                <div className={styles.attachmentBox}>
                  <div className={styles.attachmentHeader}>
                    <h2 className={styles.attachmentTitle}>첨부파일</h2>
                    <span className={styles.attachmentCount}>
                      {post.files.length}개
                    </span>
                  </div>
                  <ul className={styles.attachmentList}>
                    {post.files.map((file, index) => (
                      <li key={`${file.bf_file}-${index}`}>
                        <a
                          href={toBackendAssetUrl(
                            `/data/file/${boardTable}/${file.bf_file}`
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className={styles.attachmentName}>
                            {file.bf_source}
                          </span>
                          <span className={styles.attachmentMeta}>다운로드</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <article
                className={styles.contentBody}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {canManageOwnPost && (
                <section className={styles.postActionSection}>
                  <div className={styles.postActionHeader}>
                    <h2 className={styles.postActionTitle}>문의 관리</h2>
                    {!isPostEditorOpen && (
                      <div className={styles.postActionButtons}>
                        <button
                          type="button"
                          className={styles.postSecondaryButton}
                          onClick={() => requestPostAction("edit")}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className={styles.postDangerButton}
                          onClick={() => requestPostAction("delete")}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  {isPostEditorOpen ? (
                    <div className={styles.postEditor}>
                      <p className={styles.postEditorNotice}>
                        비밀번호 인증이 완료되었습니다. 이름과 비밀번호 자체는 유지되고,
                        문의 내용만 수정할 수 있습니다.
                      </p>
                      <div className={styles.postEditorGrid}>
                        <label className={styles.postField}>
                          <span>구분</span>
                          <select
                            value={postEditForm.category}
                            onChange={(event) =>
                              setPostEditForm((prev) => ({
                                ...prev,
                                category: event.target.value,
                              }))
                            }
                          >
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className={`${styles.postField} ${styles.postCheckField}`}>
                          <span>비밀글 여부</span>
                          <label className={styles.postCheckboxLabel}>
                            <input
                              type="checkbox"
                              checked={postEditForm.isSecret}
                              onChange={(event) =>
                                setPostEditForm((prev) => ({
                                  ...prev,
                                  isSecret: event.target.checked,
                                }))
                              }
                            />
                            <span>비밀글 유지</span>
                          </label>
                        </div>
                        <label className={`${styles.postField} ${styles.postFullField}`}>
                          <span>제목</span>
                          <input
                            type="text"
                            value={postEditForm.subject}
                            onChange={(event) =>
                              setPostEditForm((prev) => ({
                                ...prev,
                                subject: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className={`${styles.postField} ${styles.postFullField}`}>
                          <span>내용</span>
                          <textarea
                            value={postEditForm.content}
                            onChange={(event) =>
                              setPostEditForm((prev) => ({
                                ...prev,
                                content: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <div className={`${styles.postField} ${styles.postFullField}`}>
                          <span>첨부파일</span>
                          {existingAttachments.length > 0 && (
                            <ul className={styles.editAttachmentList}>
                              {existingAttachments.map((attachment) => (
                                <li key={attachment.id}>
                                  <label className={styles.editAttachmentLabel}>
                                    <input
                                      type="checkbox"
                                      checked={attachment.markedForDeletion}
                                      onChange={() =>
                                        handleEditAttachmentToggle(attachment.id)
                                      }
                                    />
                                    <span>
                                      {attachment.name}
                                      {attachment.markedForDeletion && " (삭제 예정)"}
                                    </span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className={styles.postFileField}>
                            <label className={styles.postFileSelectButton}>
                              파일 추가
                              <input
                                type="file"
                                multiple
                                className={styles.hiddenFileInput}
                                onChange={handleNewAttachmentChange}
                              />
                            </label>
                            <p className={styles.postFileHint}>
                              추가할 파일을 선택하면 저장 시 함께 업로드됩니다.
                            </p>
                          </div>
                          {newAttachments.length > 0 && (
                            <ul className={styles.pendingEditFileList}>
                              {newAttachments.map((attachment) => (
                                <li key={attachment.id}>
                                  <span>{attachment.file.name}</span>
                                  <button
                                    type="button"
                                    className={styles.fileRemoveButton}
                                    onClick={() =>
                                      handleRemoveNewAttachment(attachment.id)
                                    }
                                  >
                                    제거
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      {postActionErrorMessage && (
                        <p className={styles.postActionError}>{postActionErrorMessage}</p>
                      )}
                      <div className={styles.postEditorActions}>
                        <button
                          type="button"
                          className={styles.postSecondaryButton}
                          onClick={closePostEditor}
                          disabled={isPostSubmitting}
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          className={styles.postPrimaryButton}
                          onClick={() => void handlePostUpdate()}
                          disabled={isPostSubmitting}
                        >
                          {isPostSubmitting ? "저장 중..." : "수정 저장"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.postActionHelp}>
                      비회원 문의글은 작성 시 입력한 비밀번호로 수정하거나 삭제할 수 있습니다.
                    </p>
                  )}
                </section>
              )}

              {(post.answer || canManageAnswer) && (
                <section className={styles.answerSection}>
                  <div className={styles.answerHeader}>
                    <div className={styles.answerHeading}>
                      <h2 className={styles.answerTitle}>답변</h2>
                      {post.answer && (
                        <span className={styles.answerDate}>{post.answer.datetime}</span>
                      )}
                    </div>
                    {canManageAnswer && (
                      <div className={styles.answerActions}>
                        {!post.answer && !isAnswerEditorOpen && (
                          <button
                            type="button"
                            className={styles.answerPrimaryButton}
                            onClick={openAnswerEditor}
                          >
                            답변 달기
                          </button>
                        )}
                        {post.answer && !isAnswerEditorOpen && (
                          <>
                            <button
                              type="button"
                              className={styles.answerSecondaryButton}
                              onClick={openAnswerEditor}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              className={styles.answerDangerButton}
                              onClick={() => void handleAnswerDelete()}
                              disabled={isAnswerSubmitting}
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {isAnswerEditorOpen ? (
                    <div className={styles.answerEditor}>
                      <textarea
                        className={styles.answerTextarea}
                        value={answerDraft}
                        onChange={(event) => setAnswerDraft(event.target.value)}
                        placeholder="답변 내용을 입력해 주세요"
                      />
                      {answerErrorMessage && (
                        <p className={styles.answerError}>{answerErrorMessage}</p>
                      )}
                      <div className={styles.answerEditorActions}>
                        <button
                          type="button"
                          className={styles.answerSecondaryButton}
                          onClick={closeAnswerEditor}
                          disabled={isAnswerSubmitting}
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          className={styles.answerPrimaryButton}
                          onClick={() => void handleAnswerSave()}
                          disabled={isAnswerSubmitting}
                        >
                          {isAnswerSubmitting ? "저장 중..." : post.answer ? "수정 저장" : "답변 저장"}
                        </button>
                      </div>
                    </div>
                  ) : post.answer ? (
                    <div
                      className={styles.answerBody}
                      dangerouslySetInnerHTML={{ __html: post.answer.content }}
                    />
                  ) : (
                    <p className={styles.answerEmpty}>
                      아직 등록된 답변이 없습니다.
                    </p>
                  )}
                  {!isAnswerEditorOpen && answerErrorMessage && (
                    <p className={styles.answerError}>{answerErrorMessage}</p>
                  )}
                </section>
              )}

              <div className={styles.actionRow}>
                <Link href={listPath} className={styles.listButton}>
                  목록
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      {requiresPassword && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleOverlayMouseDown}
          onClick={handleOverlayClick}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>비밀글 확인</h3>
            <p className={styles.modalDescription}>
              이 게시글은 비밀글입니다. 비밀번호를 입력하면 상세 내용을 볼 수 있습니다.
            </p>
            <input
              type="password"
              className={styles.passwordInput}
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handlePasswordSubmit();
                }
              }}
              autoFocus
            />
            {passwordErrorMessage && (
              <p className={styles.modalError}>{passwordErrorMessage}</p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalSecondaryButton}
                onClick={() => router.push(listPath)}
                disabled={isAuthenticating}
              >
                목록으로
              </button>
              <button
                type="button"
                className={styles.modalPrimaryButton}
                onClick={() => void handlePasswordSubmit()}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? "확인 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      {ownerActionMode && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleOwnerActionOverlayMouseDown}
          onClick={handleOwnerActionOverlayClick}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>
              {ownerActionMode === "edit" ? "문의 수정 확인" : "문의 삭제 확인"}
            </h3>
            <p className={styles.modalDescription}>
              작성 시 입력한 비밀번호를 확인하면
              {ownerActionMode === "edit" ? " 수정 화면이 열립니다." : " 삭제를 진행할 수 있습니다."}
            </p>
            <input
              type="password"
              className={styles.passwordInput}
              placeholder="비밀번호를 입력해 주세요"
              value={ownerActionPassword}
              onChange={(event) => setOwnerActionPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleOwnerActionAuth();
                }
              }}
              autoFocus
            />
            {postActionErrorMessage && (
              <p className={styles.modalError}>{postActionErrorMessage}</p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalSecondaryButton}
                onClick={closeOwnerActionModal}
                disabled={isOwnerAuthenticating}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.modalPrimaryButton}
                onClick={() => void handleOwnerActionAuth()}
                disabled={isOwnerAuthenticating}
              >
                {isOwnerAuthenticating ? "확인 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
