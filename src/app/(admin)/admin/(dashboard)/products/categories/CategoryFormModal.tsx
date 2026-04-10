"use client";

import {
  ApiError,
  createAdminSpgCategory,
  getAdminSpgCategory,
  updateAdminSpgCategory,
  type AdminSpgCategoryFileRow,
  type AdminSpgCategoryRow,
} from "@/api";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { getCategoryFullPath } from "../categoryTreeUtils";
import styles from "./page.module.css";

function parseLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type PendingFile = {
  id: string;
  file: File;
  titleKo: string;
  titleEn: string;
};

export type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  /** create: 부모 ca_id 문자열, 루트면 "" */
  createParentId: string;
  editCaId: number | null;
  allRows: AdminSpgCategoryRow[];
  onSaved: (payload: { savedEditId: number | null }) => void;
};

export function CategoryFormModal({
  open,
  onClose,
  mode,
  createParentId,
  editCaId,
  allRows,
  onSaved,
}: CategoryFormModalProps) {
  const categoryFilesInputId = useId();
  const categoryImageInputId = useId();

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const [nameKo, setNameKo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descKo, setDescKo] = useState("");
  const [descEn, setDescEn] = useState("");
  const [keywordsKo, setKeywordsKo] = useState("");
  const [keywordsEn, setKeywordsEn] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [existingCategoryImageUrl, setExistingCategoryImageUrl] = useState<
    string | null
  >(null);

  const [existingFiles, setExistingFiles] = useState<AdminSpgCategoryFileRow[]>(
    []
  );
  const [deleteFileIds, setDeleteFileIds] = useState<number[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [fileTitleDrafts, setFileTitleDrafts] = useState<
    Record<number, { title_ko: string; title_en: string }>
  >({});

  const resetForm = useCallback(() => {
    setFormError("");
    setLoadError("");
    setNameKo("");
    setNameEn("");
    setDescKo("");
    setDescEn("");
    setKeywordsKo("");
    setKeywordsEn("");
    setSortOrder(0);
    setIsActive(1);
    setImageFile(null);
    setDeleteImage(false);
    setExistingCategoryImageUrl(null);
    setExistingFiles([]);
    setDeleteFileIds([]);
    setPendingFiles([]);
    setFileTitleDrafts({});
  }, []);

  const formDepth = useMemo(() => {
    if (!open) return 1;
    if (mode === "create") {
      if (!createParentId) return 1;
      const p = allRows.find((r) => r.ca_id === Number(createParentId));
      return p ? p.depth + 1 : 1;
    }
    if (editCaId != null) {
      return allRows.find((r) => r.ca_id === editCaId)?.depth ?? 1;
    }
    return 1;
  }, [open, mode, createParentId, editCaId, allRows]);

  /** 1뎁스만 탭·공통 PDF 등 메인 제품 UI에 직접 쓰임 */
  const isMainDepth = formDepth === 1;

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setDetailLoading(false);
      setLoadError("");
      resetForm();
      return;
    }

    if (mode !== "edit" || editCaId == null) {
      setDetailLoading(false);
      resetForm();
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setLoadError("");
    resetForm();
    const editDepth =
      allRows.find((r) => r.ca_id === editCaId)?.depth ?? 1;
    void getAdminSpgCategory(editCaId)
      .then((d) => {
        if (cancelled) return;
        setNameKo(d.name_ko ?? "");
        setNameEn(d.name_en ?? "");
        setSortOrder(Number(d.sort_order ?? 0));
        setIsActive(Number(d.is_active ?? 1));
        if (editDepth <= 1) {
          setDescKo(d.desc_ko ?? "");
          setDescEn(d.desc_en ?? "");
          setKeywordsKo((d.keywords_ko ?? []).join("\n"));
          setKeywordsEn((d.keywords_en ?? []).join("\n"));
          const img = (d.image_url ?? "").trim();
          setExistingCategoryImageUrl(img || null);
          setExistingFiles(d.files ?? []);
          const drafts: Record<number, { title_ko: string; title_en: string }> =
            {};
          (d.files ?? []).forEach((f) => {
            drafts[f.file_id] = {
              title_ko: f.title_ko ?? "",
              title_en: f.title_en ?? "",
            };
          });
          setFileTitleDrafts(drafts);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(
            e instanceof ApiError ? e.message : "상세를 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, mode, editCaId, resetForm, allRows]);

  const close = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const onPickCategoryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;
    const added = Array.from(list).map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
      file,
      titleKo: file.name.replace(/\.[^.]+$/, "") || "첨부파일",
      titleEn: "",
    }));
    setPendingFiles((prev) => [...prev, ...added]);
    setFormError("");
    e.target.value = "";
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleDeleteExistingFile = (fileId: number) => {
    setDeleteFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((x) => x !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKo.trim() && !nameEn.trim()) {
      setFormError("카테고리명은 한글 또는 영문 중 하나 이상 입력해 주세요.");
      return;
    }
    setSaving(true);
    setFormError("");
    const new_category_files = isMainDepth
      ? pendingFiles.map((p) => ({
          file: p.file,
          title_ko: p.titleKo.trim() || "첨부파일",
          title_en: p.titleEn.trim() || undefined,
        }))
      : [];
    try {
      const kwKo = parseLines(keywordsKo);
      const kwEn = parseLines(keywordsEn);
      if (mode === "create") {
        await createAdminSpgCategory({
          parent_id: createParentId ? Number(createParentId) : null,
          name_ko: nameKo.trim(),
          name_en: nameEn.trim(),
          sort_order: sortOrder,
          is_active: isActive,
          ...(isMainDepth
            ? {
                desc_ko: descKo,
                desc_en: descEn,
                keywords_ko: kwKo,
                keywords_en: kwEn,
                image: imageFile ?? undefined,
                new_category_files:
                  new_category_files.length > 0
                    ? new_category_files
                    : undefined,
              }
            : {
                desc_ko: "",
                desc_en: "",
                keywords_ko: [],
                keywords_en: [],
              }),
        });
        onSaved({ savedEditId: null });
      } else if (editCaId != null) {
        if (isMainDepth) {
          const kept = existingFiles.filter(
            (f) => !deleteFileIds.includes(f.file_id)
          );
          const file_title_updates =
            kept.length > 0
              ? kept.map((f) => {
                  const d = fileTitleDrafts[f.file_id] ?? {
                    title_ko: f.title_ko ?? "",
                    title_en: f.title_en ?? "",
                  };
                  return {
                    file_id: f.file_id,
                    title_ko: d.title_ko.trim(),
                    title_en: d.title_en.trim(),
                  };
                })
              : undefined;
          await updateAdminSpgCategory(editCaId, {
            name_ko: nameKo.trim(),
            name_en: nameEn.trim(),
            desc_ko: descKo,
            desc_en: descEn,
            keywords_ko: kwKo,
            keywords_en: kwEn,
            sort_order: sortOrder,
            is_active: isActive,
            image: imageFile,
            delete_image: deleteImage,
            delete_file_ids:
              deleteFileIds.length > 0 ? deleteFileIds : undefined,
            new_category_files:
              new_category_files.length > 0 ? new_category_files : undefined,
            file_title_updates,
          });
        } else {
          await updateAdminSpgCategory(editCaId, {
            name_ko: nameKo.trim(),
            name_en: nameEn.trim(),
            sort_order: sortOrder,
            is_active: isActive,
          });
        }
        onSaved({ savedEditId: editCaId });
      }
      close();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "저장에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className={styles.modalCard}>
        <h2 className={styles.modalTitle}>
          {mode === "create"
            ? createParentId
              ? formDepth === 2
                ? "2차(중분류) 등록"
                : formDepth === 3
                  ? "3차(소분류) 등록"
                  : "카테고리 등록"
              : "1차 대분류 등록 (공통 PDF 가능)"
            : formDepth === 1
              ? "1차 분류 수정 · 메인 노출"
              : "중·소분류 수정"}
        </h2>
        {mode === "create" && (
          <p className={styles.modalContext}>
            {createParentId ? (
              <>
                상위:{" "}
                <strong>
                  {getCategoryFullPath(allRows, Number(createParentId))}
                </strong>
                — 여기 <strong>바로 아래</strong>에 새 항목이 붙습니다.
              </>
            ) : (
              <>
                상위 없음 — <strong>1뎁스 대분류</strong>로 생성됩니다.
              </>
            )}
          </p>
        )}
        {mode === "edit" && editCaId != null && (
          <p className={styles.modalContext}>
            ID {editCaId} · {getCategoryFullPath(allRows, editCaId)}
          </p>
        )}

        {loadError && mode === "edit" && !detailLoading && (
          <div className={styles.errorBox}>{loadError}</div>
        )}
        {detailLoading && mode === "edit" && (
          <p className={styles.pathLine}>불러오는 중…</p>
        )}

        {(mode === "create" ||
          (mode === "edit" && !detailLoading && !loadError)) && (
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <p className={styles.modalFormLead} role="note">
              {isMainDepth
                ? "1차는 메인(제품소개) 탭·공통 PDF 링크를 설정합니다. ①→④ 순서로 보면 됩니다."
                : "2·3차는 제품 페이지에서 메뉴·분기용 이름·정렬·노출만 씁니다. 아래 ①만 입력하면 됩니다."}
            </p>

            <section
              className={styles.modalSection}
              aria-labelledby="cat-step-1"
            >
              <div className={styles.modalSectionHead}>
                <span className={styles.stepBadge} aria-hidden>
                  1
                </span>
                <div className={styles.modalSectionHeadText}>
                  <h3 id="cat-step-1" className={styles.modalSectionTitle}>
                    이름·노출
                  </h3>
                  <p className={styles.modalSectionHint}>
                    {isMainDepth ? (
                      <>
                        메인(제품소개) 탭에 보이는 이름입니다.{" "}
                        <strong>한글 또는 영문 중 하나 이상</strong> 입력하세요.
                      </>
                    ) : (
                      <>
                        제품 목록에서 이 단계에 보이는 이름입니다.{" "}
                        <strong>한글 또는 영문 중 하나 이상</strong> 입력하세요.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className={styles.modalSectionBody}>
                <div className={styles.modalNamePair}>
                  <label className={styles.label}>
                    이름 (한글)
                    <input
                      className={styles.input}
                      value={nameKo}
                      onChange={(e) => setNameKo(e.target.value)}
                      autoComplete="off"
                    />
                  </label>
                  <label className={styles.label}>
                    이름 (영문)
                    <input
                      className={styles.input}
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      autoComplete="off"
                    />
                  </label>
                </div>
                <div className={styles.modalFieldRow}>
                  <label className={styles.label}>
                    정렬 순서
                    <input
                      type="number"
                      className={styles.input}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                    />
                  </label>
                  <label className={styles.label}>
                    노출
                    <select
                      className={styles.select}
                      value={isActive}
                      onChange={(e) => setIsActive(Number(e.target.value))}
                    >
                      <option value={1}>사용</option>
                      <option value={0}>숨김</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            {isMainDepth && (
              <>
                <section
                  className={styles.modalSection}
                  aria-labelledby="cat-step-2"
                >
                  <div className={styles.modalSectionHead}>
                    <span className={styles.stepBadge} aria-hidden>
                      2
                    </span>
                    <div className={styles.modalSectionHeadText}>
                      <h3 id="cat-step-2" className={styles.modalSectionTitle}>
                        공통 PDF·자료
                      </h3>
                      <p className={styles.modalSectionHint}>
                        메인에서 내려받기·링크로 쓰입니다. PDF를 여러 개 둘 수
                        있고, 표시 제목은 링크 문구입니다.
                      </p>
                    </div>
                  </div>
                  <div className={styles.modalSectionBody}>
                {mode === "edit" && existingFiles.length > 0 && (
                  <div className={styles.existingFiles}>
                    <p className={styles.fileBlockTitle}>
                      등록된 첨부 — 표시 제목은 사이트 버튼 문구로 쓰입니다
                      (원본 파일명과 별개)
                    </p>
                    <ul>
                      {existingFiles.map((f) => {
                        const draft = fileTitleDrafts[f.file_id] ?? {
                          title_ko: f.title_ko ?? "",
                          title_en: f.title_en ?? "",
                        };
                        const marked = deleteFileIds.includes(f.file_id);
                        return (
                          <li
                            key={f.file_id}
                            className={styles.existingFileRow}
                          >
                            <div className={styles.existingFileTop}>
                              <label className={styles.inlineCheck}>
                                <input
                                  type="checkbox"
                                  checked={marked}
                                  onChange={() =>
                                    toggleDeleteExistingFile(f.file_id)
                                  }
                                />
                                삭제
                              </label>
                              {!marked ? (
                                <div
                                  className={styles.existingFileTitleInputs}
                                >
                                  <input
                                    className={styles.input}
                                    placeholder="표시 제목 (한)"
                                    value={draft.title_ko}
                                    onChange={(e) =>
                                      setFileTitleDrafts((prev) => ({
                                        ...prev,
                                        [f.file_id]: {
                                          ...draft,
                                          title_ko: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                  <input
                                    className={styles.input}
                                    placeholder="표시 제목 (영)"
                                    value={draft.title_en}
                                    onChange={(e) =>
                                      setFileTitleDrafts((prev) => ({
                                        ...prev,
                                        [f.file_id]: {
                                          ...draft,
                                          title_en: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </div>
                              ) : (
                                <span className={styles.fileTitleStrike}>
                                  삭제 예정
                                </span>
                              )}
                            </div>
                            <span className={styles.fileOriginName}>
                              원본: {f.origin_name}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <div className={styles.filePickWrap}>
                  <div className={styles.filePickSurface}>
                    <p className={styles.filePickLabelText}>
                      새 파일 추가 (여러 개 한 번에)
                    </p>
                    <div className={styles.filePickRow}>
                      <input
                        id={categoryFilesInputId}
                        className={styles.srOnly}
                        type="file"
                        multiple
                        accept=".pdf,application/pdf,application/x-pdf"
                        onChange={onPickCategoryFiles}
                      />
                      <label
                        htmlFor={categoryFilesInputId}
                        className={styles.filePickBtn}
                      >
                        PDF 불러오기
                      </label>
                      <span
                        className={styles.filePickStatus}
                        aria-live="polite"
                      >
                        {pendingFiles.length === 0
                          ? "아직 없음 · 버튼을 눌러 추가"
                          : `${pendingFiles.length}개 준비됨 · 아래에서 제목 확인`}
                      </span>
                    </div>
                    {pendingFiles.length > 0 && (
                      <ul className={styles.pickedNameList}>
                        {pendingFiles.map((p) => (
                          <li key={p.id}>{p.file.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {pendingFiles.length > 0 && (
                  <div className={styles.pendingFiles}>
                    <p className={styles.fileBlockTitle}>이번에 함께 저장</p>
                    {pendingFiles.map((p) => (
                      <div key={p.id} className={styles.pendingRow}>
                        <span className={styles.pendingName}>
                          {p.file.name}
                        </span>
                        <input
                          className={styles.input}
                          placeholder="표시 제목 (한)"
                          value={p.titleKo}
                          onChange={(e) =>
                            setPendingFiles((prev) =>
                              prev.map((x) =>
                                x.id === p.id
                                  ? { ...x, titleKo: e.target.value }
                                  : x
                              )
                            )
                          }
                        />
                        <input
                          className={styles.input}
                          placeholder="표시 제목 (영)"
                          value={p.titleEn}
                          onChange={(e) =>
                            setPendingFiles((prev) =>
                              prev.map((x) =>
                                x.id === p.id
                                  ? { ...x, titleEn: e.target.value }
                                  : x
                              )
                            )
                          }
                        />
                        <button
                          type="button"
                          className={styles.ghostButton}
                          onClick={() => removePendingFile(p.id)}
                        >
                          제외
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                  </div>
                </section>

                <section
                  className={styles.modalSection}
                  aria-labelledby="cat-step-3"
                >
                  <div className={styles.modalSectionHead}>
                    <span className={styles.stepBadge} aria-hidden>
                      3
                    </span>
                    <div className={styles.modalSectionHeadText}>
                      <h3 id="cat-step-3" className={styles.modalSectionTitle}>
                        대표 이미지
                      </h3>
                      <p className={styles.modalSectionHint}>
                        메인 목록·카드에 쓰는 썸네일입니다. 비워 두어도 됩니다.
                      </p>
                    </div>
                  </div>
                  <div className={styles.modalSectionBody}>
                    <div className={styles.filePickWrap}>
                      <div className={styles.filePickSurface}>
                        <p className={styles.filePickLabelText}>
                          이미지 한 장 (JPG·PNG 등)
                        </p>
                        <div className={styles.filePickRow}>
                          <input
                            id={categoryImageInputId}
                            className={styles.srOnly}
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setImageFile(e.target.files?.[0] ?? null)
                            }
                          />
                          <label
                            htmlFor={categoryImageInputId}
                            className={styles.filePickBtn}
                          >
                            이미지 불러오기
                          </label>
                          <span
                            className={styles.filePickStatus}
                            aria-live="polite"
                          >
                            {imageFile
                              ? imageFile.name
                              : deleteImage && existingCategoryImageUrl
                                ? "기존 이미지 삭제 예정"
                                : existingCategoryImageUrl && mode === "edit"
                                  ? "메인에 올라가 있는 이미지 있음 · 불러오기로 교체"
                                  : "아직 없음 · 버튼을 눌러 추가"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {mode === "edit" && (
                      <label className={styles.inlineCheckMuted}>
                        <input
                          type="checkbox"
                          checked={deleteImage}
                          onChange={(e) => setDeleteImage(e.target.checked)}
                        />
                        기존 대표 이미지 삭제
                      </label>
                    )}
                  </div>
                </section>

                <section
                  className={styles.modalSection}
                  aria-labelledby="cat-step-4"
                >
                  <div className={styles.modalSectionHead}>
                    <span className={styles.stepBadge} aria-hidden>
                      4
                    </span>
                    <div className={styles.modalSectionHeadText}>
                      <h3 id="cat-step-4" className={styles.modalSectionTitle}>
                        설명·키워드
                      </h3>
                      <p className={styles.modalSectionHint}>
                        메인(제품소개) 화면에 노출·검색에 쓰이는 문구입니다.
                      </p>
                    </div>
                  </div>
                  <div className={styles.modalSectionBody}>
                    <div className={styles.modalNamePair}>
                      <label className={styles.label}>
                        설명 (한글)
                        <textarea
                          className={styles.textarea}
                          value={descKo}
                          onChange={(e) => setDescKo(e.target.value)}
                        />
                      </label>
                      <label className={styles.label}>
                        설명 (영문)
                        <textarea
                          className={styles.textarea}
                          value={descEn}
                          onChange={(e) => setDescEn(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className={styles.modalNamePair}>
                      <label className={styles.label}>
                        키워드 (한글) — 한 줄에 하나
                        <textarea
                          className={styles.textarea}
                          value={keywordsKo}
                          onChange={(e) => setKeywordsKo(e.target.value)}
                        />
                      </label>
                      <label className={styles.label}>
                        키워드 (영문) — 한 줄에 하나
                        <textarea
                          className={styles.textarea}
                          value={keywordsEn}
                          onChange={(e) => setKeywordsEn(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                </section>
              </>
            )}

            {formError && <p className={styles.inlineError}>{formError}</p>}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={close}
              >
                취소
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={
                  saving ||
                  (mode === "edit" && (detailLoading || Boolean(loadError)))
                }
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
