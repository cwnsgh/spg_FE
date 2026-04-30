/** Next.js 페이지: 메인 팝업 관리. URL `/admin/popups` */
"use client";

import {
  ApiError,
  createAdminPopup,
  deleteAdminPopup,
  getAdminPopupApiUrl,
  getAdminPopupList,
  updateAdminPopup,
  type AdminPopupRow,
  type AdminPopupSavePayload,
} from "@/api";
import { API_BASE_URL, toBackendAssetUrl } from "@/api/config";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

type Slide = { id: string; src: string };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatPhpDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function defaultFormState(): AdminPopupSavePayload {
  const begin = new Date();
  begin.setHours(0, 0, 0, 0);
  const end = new Date(begin);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 0);
  return {
    nw_subject: "",
    nw_device: "both",
    nw_begin_time: formatPhpDateTime(begin),
    nw_end_time: formatPhpDateTime(end),
    nw_disable_hours: 24,
    nw_left: 40,
    nw_top: 80,
    nw_width: 420,
    nw_height: 400,
    nw_content: "",
    nw_content_html: 2,
  };
}

function rowToPayload(row: AdminPopupRow): AdminPopupSavePayload {
  const dev = row.nw_device;
  const device: AdminPopupSavePayload["nw_device"] =
    dev === "pc" || dev === "mobile" || dev === "both" ? dev : "both";
  return {
    nw_subject: String(row.nw_subject ?? ""),
    nw_device: device,
    nw_begin_time: String(row.nw_begin_time ?? "").trim(),
    nw_end_time: String(row.nw_end_time ?? "").trim(),
    nw_disable_hours: Number(row.nw_disable_hours) || 24,
    nw_left: Number(row.nw_left) || 0,
    nw_top: Number(row.nw_top) || 0,
    nw_width: Number(row.nw_width) || 450,
    nw_height: Number(row.nw_height) || 500,
    nw_content: String(row.nw_content ?? ""),
    nw_content_html: 2,
  };
}

function phpToDatetimeLocal(php: string): string {
  const s = (php || "").trim().replace(" ", "T");
  if (s.length >= 16) return s.slice(0, 16);
  return s;
}

function datetimeLocalToPhp(v: string): string {
  if (!v) return "";
  if (!v.includes("T")) return v;
  const [d, t] = v.split("T");
  const time = t.length === 5 ? `${t}:00` : t.slice(0, 8);
  return `${d} ${time}`;
}

function newSlideId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 기존 HTML에서 img src 순서대로 추출 (이미지 전용 편집) */
function parseSlidesFromHtml(html: string): Slide[] {
  if (!html.trim()) return [];
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const out: Slide[] = [];
    doc.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src")?.trim();
      if (src) out.push({ id: newSlideId(), src });
    });
    return out;
  } catch {
    return [];
  }
}

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** 본문 일반 텍스트 → 안전한 최소 HTML (`<p>`, 줄바꿈은 `<br />`) */
function escapeHtmlBody(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToSimpleHtml(plain: string): string {
  const t = plain.replace(/\r\n/g, "\n").trimEnd();
  if (!t) return "";
  return t
    .split(/\n{2,}/)
    .map((block) => {
      const inner = block
        .split("\n")
        .map((line) => escapeHtmlBody(line.trimEnd()))
        .filter((line) => line.length > 0)
        .join("<br />");
      return inner ? `<p>${inner}</p>` : "";
    })
    .filter(Boolean)
    .join("");
}

/** `plainTextToSimpleHtml` 결과만 있는 경우 역으로 편집용 텍스트 복원 */
function simpleGeneratedHtmlToPlain(html: string): string {
  if (!html.trim()) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const blocks: string[] = [];
    doc.body.querySelectorAll("p").forEach((p) => {
      const lines = p.innerHTML
        .split(/<br\s*\/?>/i)
        .map((chunk) => {
          const d = new DOMParser().parseFromString(
            `<div>${chunk}</div>`,
            "text/html"
          );
          return (d.body.textContent ?? "").replace(/\u00a0/g, " ").trimEnd();
        })
        .filter((line) => line.length > 0);
      if (lines.length) blocks.push(lines.join("\n"));
    });
    return blocks.join("\n\n");
  } catch {
    return "";
  }
}

function htmlToPlainPreview(html: string): string {
  if (!html.trim()) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent ?? "").replace(/\u00a0/g, " ").trim();
  } catch {
    return html;
  }
}

function normPlainComparableHtml(h: string): string {
  return h
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "<br />")
    .replace(/\n+/g, "")
    .replace(/>\s+</g, "><")
    .trim();
}

/** 저장된 HTML이 “일반 문장 → 자동 변환” 결과와 같으면 편집 시 일반 모드로 연다 */
function isPlainGeneratedEquivalent(textPart: string): boolean {
  const t = textPart.trim();
  if (!t) return true;
  const plain = simpleGeneratedHtmlToPlain(t);
  const regen = plainTextToSimpleHtml(plain);
  return normPlainComparableHtml(t) === normPlainComparableHtml(regen);
}

/** HTML 모드 끌 때 본문 textarea 초기값 */
function popupHtmlToPlainBodyField(html: string): string {
  if (!html.trim()) return "";
  if (isPlainGeneratedEquivalent(html)) return simpleGeneratedHtmlToPlain(html);
  return htmlToPlainPreview(html);
}

function parseTextHtmlFromContent(html: string): string {
  if (!html.trim()) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("img").forEach((img) => img.remove());
    const cleaned = doc.body.innerHTML.trim();
    return cleaned;
  } catch {
    return "";
  }
}

function buildNwContent(contentHtml: string, slides: Slide[]): string {
  const normalizedText = contentHtml.trim();
  const imageHtml = slides
    .map(
      (s) =>
        `<p><img src="${escapeHtmlAttr(s.src)}" alt="" style="max-width:100%;height:auto;display:block;" /></p>`
    )
    .join("\n");
  if (normalizedText && imageHtml) return `${normalizedText}\n${imageHtml}`;
  return normalizedText || imageHtml;
}

function thumbSrc(src: string): string {
  if (/^https?:/i.test(src) || /^data:/i.test(src)) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return toBackendAssetUrl(path);
}

export default function AdminPopupsPage() {
  const [rows, setRows] = useState<AdminPopupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [toast, setToast] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AdminPopupSavePayload>(defaultFormState);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [contentHtml, setContentHtml] = useState("");
  /** 일반 문장 모드용 (HTML 태그를 직접 쓰지 않음) */
  const [plainBody, setPlainBody] = useState("");
  /** true면 `contentHtml` 그대로 저장, false면 `plainBody`를 자동 `<p>` 변환 */
  const [bodyIsHtml, setBodyIsHtml] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminPopupRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await getAdminPopupList();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e instanceof ApiError) setListError(e.message);
      else setListError("팝업 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(defaultFormState());
    setSlides([]);
    setContentHtml("");
    setPlainBody("");
    setBodyIsHtml(false);
    setPendingImageUrl("");
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (row: AdminPopupRow) => {
    setMode("edit");
    setEditingId(row.nw_id);
    setForm(rowToPayload(row));
    setSlides(parseSlidesFromHtml(String(row.nw_content ?? "")));
    const textPart = parseTextHtmlFromContent(String(row.nw_content ?? ""));
    setContentHtml(textPart);
    const usePlainEditor = isPlainGeneratedEquivalent(textPart);
    setBodyIsHtml(!usePlainEditor);
    setPlainBody(usePlainEditor ? htmlToPlainPreview(textPart) : "");
    setPendingImageUrl("");
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);
    const textPart = bodyIsHtml
      ? contentHtml.trim()
      : plainTextToSimpleHtml(plainBody);
    const payload: AdminPopupSavePayload = {
      ...form,
      nw_content: buildNwContent(textPart, slides),
      nw_content_html: 2,
    };
    try {
      if (mode === "create") {
        await createAdminPopup(payload);
        setToast("등록되었습니다.");
      } else if (editingId != null) {
        await updateAdminPopup(editingId, payload);
        setToast("수정되었습니다.");
      }
      closeModal();
      await fetchList();
      window.setTimeout(() => setToast(""), 4000);
    } catch (e) {
      if (e instanceof ApiError) setFormError(e.message);
      else setFormError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const addImageByUrl = useCallback(() => {
    const src = pendingImageUrl.trim();
    if (!src) return;
    if (!/^https?:\/\//i.test(src) && !src.startsWith("/")) {
      setFormError("이미지 URL은 https:// 또는 /data/... 형태로 입력해주세요.");
      return;
    }
    setSlides((s) => [...s, { id: newSlideId(), src }]);
    setPendingImageUrl("");
    setFormError("");
  }, [pendingImageUrl]);

  const removeSlide = (id: string) => {
    setSlides((s) => s.filter((x) => x.id !== id));
  };

  const runDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setListError("");
    try {
      await deleteAdminPopup(deleteTarget.nw_id);
      setToast("삭제되었습니다.");
      setDeleteTarget(null);
      await fetchList();
      window.setTimeout(() => setToast(""), 4000);
    } catch (e) {
      if (e instanceof ApiError) setListError(e.message);
      else setListError("삭제에 실패했습니다.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      {toast ? <p className={styles.successMessage}>{toast}</p> : null}
      {listError ? <p className={styles.errorMessage}>{listError}</p> : null}

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>목록</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => void fetchList()}
            >
              새로고침
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={openCreate}
            >
              새 팝업
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>불러오는 중…</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>순번</th>
                  <th>제목</th>
                  <th>기기</th>
                  <th>시작</th>
                  <th>종료</th>
                  <th>크기(W×H)</th>
                  <th className={styles.colActions}>관리</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      등록된 팝업이 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.nw_id}>
                      <td>{index + 1}</td>
                      <td className={styles.subjectTd}>
                        <span
                          className={styles.subjectEllipsis}
                          title={String(row.nw_subject ?? "")}
                        >
                          {row.nw_subject}
                        </span>
                      </td>
                      <td>{row.nw_device}</td>
                      <td>{String(row.nw_begin_time).slice(0, 16)}</td>
                      <td>{String(row.nw_end_time).slice(0, 16)}</td>
                      <td>
                        {row.nw_width}×{row.nw_height}
                      </td>
                      <td className={styles.actionsTd}>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.inlineButton}
                            onClick={() => openEdit(row)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className={styles.inlineDangerButton}
                            onClick={() => setDeleteTarget(row)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen ? (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.modalCard}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>
                {mode === "create" ? "팝업 등록" : `팝업 수정 (#${editingId})`}
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="닫기"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError ? (
                <p className={styles.formError}>{formError}</p>
              ) : null}
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>제목</span>
                  <input
                    value={form.nw_subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nw_subject: e.target.value }))
                    }
                    maxLength={255}
                  />
                </label>
                <label className={styles.field}>
                  <span>노출 기기</span>
                  <select
                    value={form.nw_device}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_device: e.target
                          .value as AdminPopupSavePayload["nw_device"],
                      }))
                    }
                  >
                    <option value="both">PC + 모바일</option>
                    <option value="pc">PC만</option>
                    <option value="mobile">모바일만</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>시작 일시</span>
                  <input
                    type="datetime-local"
                    value={phpToDatetimeLocal(form.nw_begin_time)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_begin_time: datetimeLocalToPhp(e.target.value),
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>종료 일시</span>
                  <input
                    type="datetime-local"
                    value={phpToDatetimeLocal(form.nw_end_time)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_end_time: datetimeLocalToPhp(e.target.value),
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>「안 보기」시간(시간)</span>
                  <input
                    type="number"
                    min={1}
                    max={720}
                    value={form.nw_disable_hours}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_disable_hours: Number(e.target.value) || 24,
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>left (px)</span>
                  <input
                    type="number"
                    value={form.nw_left}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_left: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>top (px)</span>
                  <input
                    type="number"
                    value={form.nw_top}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_top: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>너비 (px)</span>
                  <input
                    type="number"
                    min={200}
                    value={form.nw_width}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_width: Number(e.target.value) || 400,
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>높이 (px)</span>
                  <input
                    type="number"
                    min={120}
                    value={form.nw_height}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nw_height: Number(e.target.value) || 300,
                      }))
                    }
                  />
                </label>

                <div className={`${styles.field} ${styles.fullField}`}>
                  <div className={styles.bodyFieldHead}>
                    <span>팝업 문구</span>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={bodyIsHtml}
                        onChange={(e) => {
                          const next = e.target.checked;
                          if (next) {
                            setContentHtml(plainTextToSimpleHtml(plainBody));
                          } else {
                            setPlainBody(
                              popupHtmlToPlainBodyField(contentHtml) ||
                                plainBody
                            );
                          }
                          setBodyIsHtml(next);
                        }}
                      />
                      HTML 직접 입력 (표·링크·굵게 등)
                    </label>
                  </div>
                  <textarea
                    className={styles.bodyTextarea}
                    value={bodyIsHtml ? contentHtml : plainBody}
                    placeholder={
                      bodyIsHtml
                        ? "예) <p><strong>제목</strong></p><p>본문</p>"
                        : "예)\n안녕하세요\n이벤트는 4월 30일까지입니다."
                    }
                    onChange={(e) =>
                      bodyIsHtml
                        ? setContentHtml(e.target.value)
                        : setPlainBody(e.target.value)
                    }
                  />
                  <p className={styles.dropZoneSub}>
                    {bodyIsHtml
                      ? "태그를 직접 쓰는 모드입니다. 잘못된 HTML은 화면이 깨질 수 있습니다."
                      : "저장할 때 자동으로 안전한 HTML로 바꿉니다. 비우면 아래 이미지만 표시됩니다."}
                  </p>
                </div>

                <div className={`${styles.field} ${styles.fullField}`}>
                  <span>이미지 URL 추가</span>
                  <div className={styles.urlRow}>
                    <input
                      value={pendingImageUrl}
                      placeholder="https://... 또는 /data/editor/....jpg"
                      onChange={(e) => setPendingImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addImageByUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.inlineButton}
                      onClick={addImageByUrl}
                    >
                      추가
                    </button>
                  </div>
                </div>

                <div className={`${styles.fullField} ${styles.imageStripWrap}`}>
                  {slides.length === 0 ? (
                    <p className={styles.previewEmpty}>
                      등록된 이미지가 없습니다.
                    </p>
                  ) : (
                    <ul className={styles.imageStrip}>
                      {slides.map((slide, index) => (
                        <li key={slide.id} className={styles.imageThumbCard}>
                          <span className={styles.imageOrder}>{index + 1}</span>
                          <img
                            className={styles.imageThumbImg}
                            src={thumbSrc(slide.src)}
                            alt=""
                          />
                          <button
                            type="button"
                            className={styles.imageRemove}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              removeSlide(slide.id);
                            }}
                          >
                            제거
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={closeModal}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className={styles.confirmOverlay}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteLoading)
              setDeleteTarget(null);
          }}
        >
          <div
            className={styles.confirmCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-delete-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="popup-delete-title" className={styles.modalTitle}>
              팝업 삭제
            </h2>
            <p className={styles.confirmText}>
              다음 제목의 팝업을 삭제할까요? 이 작업은 되돌릴 수 없습니다.
            </p>
            <p
              className={styles.confirmSubject}
              title={deleteTarget.nw_subject}
            >
              {deleteTarget.nw_subject}
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.ghostButton}
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.confirmDangerButton}
                disabled={deleteLoading}
                onClick={() => void runDelete()}
              >
                {deleteLoading ? "삭제 중…" : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
