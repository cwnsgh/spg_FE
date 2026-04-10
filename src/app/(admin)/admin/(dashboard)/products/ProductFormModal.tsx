"use client";

import {
  ApiError,
  createAdminSpgProduct,
  getAdminSpgProduct,
  updateAdminSpgProduct,
  type AdminSpgCategoryRow,
} from "@/api";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import styles from "./page.module.css";
import {
  buildCategoryTree,
  getCategoryFullPath,
  depthShortLabel,
  type CategoryTreeNode,
} from "./categoryTreeUtils";

function depthBadgeClass(depth: number): string {
  if (depth === 1) return styles.d1;
  if (depth === 2) return styles.d2;
  if (depth === 3) return styles.d3;
  return styles.dN;
}

function CategoryTreeCheckboxes({
  nodes,
  caIds,
  toggleCa,
  rows,
}: {
  nodes: CategoryTreeNode[];
  caIds: number[];
  toggleCa: (id: number) => void;
  rows: AdminSpgCategoryRow[];
}) {
  return (
    <>
      {nodes.map((n) => (
        <div key={n.ca_id} className={styles.treeNode}>
          <label
            className={`${styles.checkboxRow} ${styles.checkboxRowTree}`}
            style={{
              paddingLeft: `${Math.max(0, n.depth - 1) * 1.4}rem`,
            }}
          >
            <input
              type="checkbox"
              checked={caIds.includes(n.ca_id)}
              onChange={() => toggleCa(n.ca_id)}
            />
            <span
              className={`${styles.miniDepth} ${depthBadgeClass(n.depth)}`}
            >
              {depthShortLabel(n.depth)}
            </span>
            <span>{n.name_ko}</span>
            <span className={styles.pathInRow}>
              {getCategoryFullPath(rows, n.ca_id)}
            </span>
          </label>
          {n.children.length > 0 && (
            <CategoryTreeCheckboxes
              nodes={n.children}
              caIds={caIds}
              toggleCa={toggleCa}
              rows={rows}
            />
          )}
        </div>
      ))}
    </>
  );
}

function newPairId(): string {
  return `fp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type FeaturePair = { id: string; ko: string; en: string };

function toStringArray(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    if (raw.length && typeof raw[0] === "object" && raw[0] !== null) {
      return raw.map((x) =>
        typeof x === "object" && x !== null && "korean" in x
          ? String((x as { korean?: string }).korean ?? "")
          : String(x)
      );
    }
    return raw.map((x) => String(x));
  }
  return [String(raw)];
}

function pairsFromDetail(koRaw: unknown, enRaw: unknown): FeaturePair[] {
  const ko = toStringArray(koRaw);
  const en = toStringArray(enRaw);
  const n = Math.max(ko.length, en.length, 0);
  if (n === 0) return [];
  return Array.from({ length: n }, (_, i) => ({
    id: newPairId(),
    ko: ko[i] ?? "",
    en: en[i] ?? "",
  }));
}

function hasLineageConflict(
  selected: number[],
  byId: Map<number, { parent_id: number | null }>
): boolean {
  const set = new Set(selected);
  for (const id of selected) {
    let p = byId.get(id)?.parent_id ?? null;
    while (p != null) {
      if (set.has(p)) return true;
      p = byId.get(p)?.parent_id ?? null;
    }
  }
  return false;
}

export type ProductFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  editPrId: number | null;
  /** create 모드에서 미리 선택할 분류 ID 목록 */
  createPresetCaIds: number[];
  categories: AdminSpgCategoryRow[];
  onSaved: () => void;
};

export function ProductFormModal({
  open,
  onClose,
  mode,
  editPrId,
  createPresetCaIds,
  categories,
  onSaved,
}: ProductFormModalProps) {
  const formIds = useId();

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const [nameKo, setNameKo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [summaryKo, setSummaryKo] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [featurePairs, setFeaturePairs] = useState<FeaturePair[]>([]);
  const [caIds, setCaIds] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [file0, setFile0] = useState<File | null>(null);
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [deleteTypes, setDeleteTypes] = useState<number[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    null
  );
  const [existingFilesByType, setExistingFilesByType] = useState<
    Record<number, string>
  >({});

  const resetForm = useCallback((opts?: { presetCaIds?: number[] }) => {
    setFormError("");
    setLoadError("");
    setNameKo("");
    setNameEn("");
    setSummaryKo("");
    setSummaryEn("");
    setFeaturePairs([]);
    setCaIds(opts?.presetCaIds ?? []);
    setSortOrder(0);
    setIsActive(1);
    setImageFile(null);
    setFile0(null);
    setFile1(null);
    setFile2(null);
    setDeleteImage(false);
    setDeleteTypes([]);
    setExistingImageUrl(null);
    setExistingFilesByType({});
  }, []);

  const categoryById = useMemo(() => {
    const m = new Map<number, { parent_id: number | null }>();
    categories.forEach((c) =>
      m.set(c.ca_id, { parent_id: c.parent_id })
    );
    return m;
  }, [categories]);

  const categoryTreeRoots = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  useEffect(() => {
    if (!open) {
      setDetailLoading(false);
      setLoadError("");
      return;
    }

    let cancelled = false;

    if (mode === "create") {
      setDetailLoading(false);
      setLoadError("");
      resetForm({ presetCaIds: [...createPresetCaIds] });
      return;
    }

    if (editPrId == null) return;

    if (mode === "edit") {
      setLoadError("");
      resetForm();
      setDetailLoading(true);
      void getAdminSpgProduct(editPrId)
        .then((d) => {
          if (cancelled) return;
          setNameKo(d.name_ko ?? "");
          setNameEn(d.name_en ?? "");
          setSummaryKo(d.summary_ko ?? "");
          setSummaryEn(d.summary_en ?? "");
          setFeaturePairs(pairsFromDetail(d.features_ko, d.features_en));
          setCaIds(d.ca_ids ?? []);
          setSortOrder(Number(d.sort_order ?? 0));
          setIsActive(Number(d.is_active ?? 1));
          setExistingImageUrl(d.image_url ?? null);
          const byT: Record<number, string> = {};
          (d.files ?? []).forEach((f) => {
            byT[Number(f.file_type)] = f.origin_name;
          });
          setExistingFilesByType(byT);
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
    }

    return () => {
      cancelled = true;
    };
  }, [open, mode, editPrId, createPresetCaIds, resetForm]);

  const close = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const toggleCa = (id: number) => {
    setCaIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (hasLineageConflict(next, categoryById)) {
        setFormError(
          "같은 계층에서 상위 카테고리와 하위 카테고리를 동시에 선택할 수 없습니다."
        );
        return prev;
      }
      setFormError("");
      return next;
    });
  };

  const addFeaturePair = () => {
    setFeaturePairs((prev) => [...prev, { id: newPairId(), ko: "", en: "" }]);
  };

  const removeFeaturePair = (id: string) => {
    setFeaturePairs((prev) => prev.filter((p) => p.id !== id));
  };

  const updateFeaturePair = (
    id: string,
    field: "ko" | "en",
    value: string
  ) => {
    setFeaturePairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const toggleDeleteType = (t: number) => {
    setDeleteTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKo.trim()) {
      setFormError("상품명(한글)은 필수입니다.");
      return;
    }
    if (caIds.length === 0) {
      setFormError("카테고리를 하나 이상 선택해 주세요.");
      return;
    }
    if (hasLineageConflict(caIds, categoryById)) {
      setFormError("카테고리 상·하위 중복 선택을 해제해 주세요.");
      return;
    }

    const activePairs = featurePairs.filter(
      (p) => p.ko.trim() || p.en.trim()
    );
    const fk = activePairs.map((p) => p.ko.trim());
    const fe = activePairs.map((p) => p.en.trim());

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        name_ko: nameKo.trim(),
        name_en: nameEn.trim(),
        summary_ko: summaryKo,
        summary_en: summaryEn,
        features_ko: fk,
        features_en: fe,
        ca_ids: caIds,
        sort_order: sortOrder,
        is_active: isActive,
        image: imageFile,
        file_0: file0,
        file_1: file1,
        file_2: file2,
        delete_image: mode === "edit" ? deleteImage : false,
        delete_types: mode === "edit" ? deleteTypes : undefined,
      };
      if (mode === "create") {
        await createAdminSpgProduct(payload);
      } else if (editPrId != null) {
        await updateAdminSpgProduct(editPrId, payload);
      }
      onSaved();
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

  const formReady =
    mode === "create" || (mode === "edit" && !detailLoading && !loadError);

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
          {mode === "create" ? "제품 등록" : "제품 수정"}
        </h2>

        {loadError && mode === "edit" && !detailLoading && (
          <div className={styles.errorBox}>{loadError}</div>
        )}
        {detailLoading && mode === "edit" && (
          <p className={styles.panelSub}>불러오는 중…</p>
        )}

        {formReady && (
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>이미지 · 기술자료</h3>
              <p className={styles.formSectionHint}>
                목록 썸네일은 첫 번째 칸에서 선택합니다. PDF / 2D(DWG 등) /
                3D(STP 등)는 타입별로 하나씩 저장됩니다.
              </p>
              <div className={styles.mediaGrid}>
                <div className={styles.mediaCard}>
                  <span className={styles.mediaCardLabel}>썸네일</span>
                  {existingImageUrl && mode === "edit" && !deleteImage && (
                    <p className={styles.existingFileHint}>
                      현재 파일: {existingImageUrl.split("/").pop()}
                    </p>
                  )}
                  <input
                    id={`${formIds}-thumb`}
                    type="file"
                    className={styles.srOnly}
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] ?? null)
                    }
                  />
                  <label
                    htmlFor={`${formIds}-thumb`}
                    className={styles.filePickButton}
                  >
                    이미지 선택
                  </label>
                  {imageFile && (
                    <span className={styles.pickedName}>{imageFile.name}</span>
                  )}
                  {mode === "edit" && (
                    <label className={styles.inlineDelete}>
                      <input
                        type="checkbox"
                        checked={deleteImage}
                        onChange={(e) => setDeleteImage(e.target.checked)}
                      />
                      기존 이미지 삭제
                    </label>
                  )}
                </div>

                <div className={styles.mediaCard}>
                  <span className={styles.mediaCardLabel}>
                    PDF (타입 0)
                  </span>
                  {existingFilesByType[0] && (
                    <p className={styles.existingFileHint}>
                      등록됨: {existingFilesByType[0]}
                    </p>
                  )}
                  <input
                    id={`${formIds}-f0`}
                    type="file"
                    className={styles.srOnly}
                    accept=".pdf,application/pdf"
                    onChange={(e) =>
                      setFile0(e.target.files?.[0] ?? null)
                    }
                  />
                  <label
                    htmlFor={`${formIds}-f0`}
                    className={styles.filePickButton}
                  >
                    PDF 선택
                  </label>
                  {file0 && (
                    <span className={styles.pickedName}>{file0.name}</span>
                  )}
                </div>

                <div className={styles.mediaCard}>
                  <span className={styles.mediaCardLabel}>
                    2D 도면 (타입 1)
                  </span>
                  {existingFilesByType[1] && (
                    <p className={styles.existingFileHint}>
                      등록됨: {existingFilesByType[1]}
                    </p>
                  )}
                  <input
                    id={`${formIds}-f1`}
                    type="file"
                    className={styles.srOnly}
                    accept=".dwg,.dxf,application/acad,image/*"
                    onChange={(e) =>
                      setFile1(e.target.files?.[0] ?? null)
                    }
                  />
                  <label
                    htmlFor={`${formIds}-f1`}
                    className={styles.filePickButton}
                  >
                    2D 파일 선택
                  </label>
                  {file1 && (
                    <span className={styles.pickedName}>{file1.name}</span>
                  )}
                </div>

                <div className={styles.mediaCard}>
                  <span className={styles.mediaCardLabel}>
                    3D 모델 (타입 2)
                  </span>
                  {existingFilesByType[2] && (
                    <p className={styles.existingFileHint}>
                      등록됨: {existingFilesByType[2]}
                    </p>
                  )}
                  <input
                    id={`${formIds}-f2`}
                    type="file"
                    className={styles.srOnly}
                    accept=".stp,.step,.zip"
                    onChange={(e) =>
                      setFile2(e.target.files?.[0] ?? null)
                    }
                  />
                  <label
                    htmlFor={`${formIds}-f2`}
                    className={styles.filePickButton}
                  >
                    3D 파일 선택
                  </label>
                  {file2 && (
                    <span className={styles.pickedName}>{file2.name}</span>
                  )}
                </div>
              </div>

              {mode === "edit" && (
                <div className={styles.deleteTypesRow}>
                  <span className={styles.deleteTypesLabel}>
                    저장 시 타입별 기존 파일 삭제
                  </span>
                  {[0, 1, 2].map((t) => (
                    <label key={t} className={styles.inlineDelete}>
                      <input
                        type="checkbox"
                        checked={deleteTypes.includes(t)}
                        onChange={() => toggleDeleteType(t)}
                      />
                      타입 {t}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>상품명 · 요약</h3>
              <label className={styles.label}>
                상품명 (한글) *
                <input
                  className={styles.input}
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  required
                />
              </label>
              <label className={styles.label}>
                상품명 (영문)
                <input
                  className={styles.input}
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </label>
              <label className={styles.label}>
                요약 (한글)
                <textarea
                  className={styles.textarea}
                  value={summaryKo}
                  onChange={(e) => setSummaryKo(e.target.value)}
                  rows={3}
                />
              </label>
              <label className={styles.label}>
                요약 (영문)
                <textarea
                  className={styles.textarea}
                  value={summaryEn}
                  onChange={(e) => setSummaryEn(e.target.value)}
                  rows={3}
                />
              </label>
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionHeadRow}>
                <h3 className={styles.formSectionTitle}>특징 (한·영 쌍)</h3>
                <button
                  type="button"
                  className={styles.addPairButton}
                  onClick={addFeaturePair}
                >
                  + 항목 추가
                </button>
              </div>
              <p className={styles.formSectionHint}>
                한 줄이 한 세트입니다. 비운 칸은 빈 문자열로 저장됩니다.
              </p>
              {featurePairs.length === 0 ? (
                <p className={styles.formSectionHint}>
                  아직 없습니다. 「+ 항목 추가」로 입력 칸을 늘리세요.
                </p>
              ) : (
                <div className={styles.pairList}>
                  {featurePairs.map((p, idx) => (
                    <div key={p.id} className={styles.pairRow}>
                      <span className={styles.pairIndex}>{idx + 1}</span>
                      <input
                        className={styles.input}
                        placeholder="특징 (한글)"
                        value={p.ko}
                        onChange={(e) =>
                          updateFeaturePair(p.id, "ko", e.target.value)
                        }
                      />
                      <input
                        className={styles.input}
                        placeholder="특징 (영문)"
                        value={p.en}
                        onChange={(e) =>
                          updateFeaturePair(p.id, "en", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className={styles.removePairButton}
                        onClick={() => removeFeaturePair(p.id)}
                        title="이 세트 삭제"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>노출 · 정렬</h3>
              <div className={styles.twoCol}>
                <label className={styles.label}>
                  정렬 순서
                  <input
                    type="number"
                    className={styles.input}
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(Number(e.target.value))
                    }
                  />
                </label>
                <label className={styles.label}>
                  노출
                  <select
                    className={styles.select}
                    value={isActive}
                    onChange={(e) =>
                      setIsActive(Number(e.target.value))
                    }
                  >
                    <option value={1}>사용</option>
                    <option value={0}>숨김</option>
                  </select>
                </label>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.formSectionTitle}>
                카테고리 매핑 (복수) *
              </h3>
              <p className={styles.formSectionHint}>
                같은 줄의 상위·하위는 동시에 고를 수 없습니다.
              </p>
              <div className={styles.checkboxList}>
                {categoryTreeRoots.length === 0 ? (
                  <span className={styles.hint}>
                    카테고리를 불러오지 못했습니다.
                  </span>
                ) : (
                  <CategoryTreeCheckboxes
                    nodes={categoryTreeRoots}
                    caIds={caIds}
                    toggleCa={toggleCa}
                    rows={categories}
                  />
                )}
              </div>
            </div>

            {formError && (
              <p className={styles.inlineError}>{formError}</p>
            )}
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
                disabled={saving}
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
