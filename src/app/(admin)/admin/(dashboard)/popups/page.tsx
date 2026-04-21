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

function buildNwContentFromSlides(slides: Slide[]): string {
  if (!slides.length) return "";
  return slides
    .map(
      (s) =>
        `<p><img src="${escapeHtmlAttr(s.src)}" alt="" style="max-width:100%;height:auto;display:block;" /></p>`
    )
    .join("\n");
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
    setPendingImageUrl("");
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (row: AdminPopupRow) => {
    setMode("edit");
    setEditingId(row.nw_id);
    setForm(rowToPayload(row));
    setSlides(parseSlidesFromHtml(String(row.nw_content ?? "")));
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
    const payload: AdminPopupSavePayload = {
      ...form,
      nw_content: buildNwContentFromSlides(slides),
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
      <div className={styles.heroCard}>
        <div>
          <p className={styles.eyebrow}>메인 · 공지</p>
          <h1 className={styles.title}>팝업 관리</h1>
          <p className={styles.description}>
            본문은 <strong>이미지 URL 슬라이드</strong>만 넣습니다(저장 시 HTML로 합쳐짐). 아래 주소로
            요청합니다. 404면 카페24(또는 API 호스트)의 <code>www/api/admin/popup.php</code>에
            올렸는지 확인하세요. SFTP로 <code>spg-hasy-j/www/api/admin/popup.php</code>와 동일
            경로에 업로드하면 됩니다.
          </p>
          <div className={styles.apiHint}>
            <p className={styles.apiHintTitle}>현재 팝업 API (목록·저장 공통)</p>
            <code className={styles.apiHintUrl}>{getAdminPopupApiUrl()}</code>
            <p className={styles.apiHintMeta}>
              API 베이스: <code>{API_BASE_URL}</code>
              <br />
              경로만 다르면: <code>.env.local</code>에{" "}
              <code>NEXT_PUBLIC_API_ADMIN_POPUP_PATH=/실제경로.php</code> 후 개발 서버 재시작.
            </p>
          </div>
        </div>
        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryButton} onClick={openCreate}>
            새 팝업
          </button>
        </div>
      </div>

      {toast ? <p className={styles.successMessage}>{toast}</p> : null}
      {listError ? <p className={styles.errorMessage}>{listError}</p> : null}

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>목록</h2>
          <button type="button" className={styles.ghostButton} onClick={() => void fetchList()}>
            새로고침
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>불러오는 중…</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>제목</th>
                  <th>기기</th>
                  <th>시작</th>
                  <th>종료</th>
                  <th>크기(W×H)</th>
                  <th style={{ width: "14rem" }}>관리</th>
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
                  rows.map((row) => (
                    <tr key={row.nw_id}>
                      <td>{row.nw_id}</td>
                      <td>{row.nw_subject}</td>
                      <td>{row.nw_device}</td>
                      <td>{String(row.nw_begin_time).slice(0, 16)}</td>
                      <td>{String(row.nw_end_time).slice(0, 16)}</td>
                      <td>
                        {row.nw_width}×{row.nw_height}
                      </td>
                      <td>
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
              {formError ? <p className={styles.formError}>{formError}</p> : null}
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
                        nw_device: e.target.value as AdminPopupSavePayload["nw_device"],
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
                      setForm((f) => ({ ...f, nw_left: Number(e.target.value) || 0 }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>top (px)</span>
                  <input
                    type="number"
                    value={form.nw_top}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nw_top: Number(e.target.value) || 0 }))
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
                  <span>이미지 URL 추가 (https://... 또는 /data/...)</span>
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
                    <button type="button" className={styles.inlineButton} onClick={addImageByUrl}>
                      추가
                    </button>
                  </div>
                  <p className={styles.dropZoneSub}>
                    DB 용량 초과 방지를 위해 base64 업로드는 비활성화했습니다.
                  </p>
                </div>

                <div className={`${styles.fullField} ${styles.imageStripWrap}`}>
                  {slides.length === 0 ? (
                    <p className={styles.previewEmpty}>등록된 이미지가 없습니다.</p>
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
              <button type="button" className={styles.ghostButton} onClick={closeModal}>
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
            if (e.target === e.currentTarget && !deleteLoading) setDeleteTarget(null);
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
              「{deleteTarget.nw_subject}」을(를) 삭제할까요? 이 작업은 되돌릴 수
              없습니다.
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
