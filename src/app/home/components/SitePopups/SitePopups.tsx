"use client";

/**
 * 메인 레이어 팝업(그누 new_win). 사용처: `(site)/page.tsx` 최상단, `fetchSitePopups` API.
 */
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchSitePopups, type SitePopup } from "@/api/popups";
import styles from "./SitePopups.module.css";

const LS_HIDE_UNTIL = "spg_nw_popup_hide_until";

function loadHideUntilMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_HIDE_UNTIL);
    if (!raw) return {};
    const map = JSON.parse(raw) as Record<string, number>;
    const now = Date.now();
    const pruned: Record<string, number> = {};
    for (const [k, v] of Object.entries(map)) {
      if (typeof v === "number" && v > now) pruned[k] = v;
    }
    if (Object.keys(pruned).length !== Object.keys(map).length) {
      localStorage.setItem(LS_HIDE_UNTIL, JSON.stringify(pruned));
    }
    return pruned;
  } catch {
    return {};
  }
}

function isHiddenByStorage(nwId: number, map: Record<string, number>): boolean {
  return (map[String(nwId)] ?? 0) > Date.now();
}

function setHideForHours(nwId: number, hours: number): void {
  const h = Number.isFinite(hours) && hours > 0 ? hours : 24;
  const maxAgeSec = Math.floor(h * 3600);
  const until = Date.now() + maxAgeSec * 1000;
  const map = loadHideUntilMap();
  map[String(nwId)] = until;
  localStorage.setItem(LS_HIDE_UNTIL, JSON.stringify(map));
  document.cookie = `nw_hide_${nwId}=1; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

/** PHP `strip_tags` 이후 2차로 스크립트·이벤트 속성 제거 (클라이언트 전용) */
function sanitizePopupHtml(html: string): string {
  if (typeof window === "undefined") return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc
      .querySelectorAll("script, style, iframe, object, embed, link")
      .forEach((el) => {
        el.remove();
      });
    doc.querySelectorAll("*").forEach((el) => {
      for (const attr of [...el.attributes]) {
        const n = attr.name.toLowerCase();
        if (n.startsWith("on") || n === "srcdoc") el.removeAttribute(attr.name);
        if (n === "href" && /^\s*javascript:/i.test(attr.value)) {
          el.removeAttribute("href");
        }
      }
    });
    return doc.body.innerHTML;
  } catch {
    return "";
  }
}

function PopupCard({
  popup,
  onCloseSession,
  onHideHours,
}: {
  popup: SitePopup;
  onCloseSession: () => void;
  onHideHours: () => void;
}) {
  const hours = popup.nw_disable_hours > 0 ? popup.nw_disable_hours : 24;
  const safeHtml = sanitizePopupHtml(popup.nw_content ?? "");

  const w = Math.max(200, popup.nw_width || 400);
  const h = Math.max(120, popup.nw_height || 360);

  return (
    <article
      className={styles.window}
      style={
        {
          left: popup.nw_left,
          top: popup.nw_top,
          width: w,
          height: h,
          "--nw-w": `${w}px`,
          "--nw-h": `${h}px`,
        } as React.CSSProperties
      }
      role="dialog"
      aria-modal="false"
      aria-labelledby={`nw-title-${popup.nw_id}`}
    >
      <div className={styles.header}>
        <h2 id={`nw-title-${popup.nw_id}`} className={styles.title}>
          {popup.nw_subject}
        </h2>
        <button
          type="button"
          className={styles.closeIcon}
          aria-label="팝업 닫기"
          onClick={onCloseSession}
        >
          ×
        </button>
      </div>
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <footer className={styles.footer}>
        <button type="button" className={styles.btn} onClick={onCloseSession}>
          닫기
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onHideHours}
        >
          {hours}시간 동안 안 보기
        </button>
      </footer>
    </article>
  );
}

/**
 * 메인(홈) 전용: PHP `popups.php`에서 노출 팝업을 받아 레이어로 표시합니다.
 */
export default function SitePopups() {
  const [mounted, setMounted] = useState(false);
  const [popups, setPopups] = useState<SitePopup[]>([]);
  const [sessionClosed, setSessionClosed] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const device = window.matchMedia("(max-width: 768px)").matches
      ? "mobile"
      : "pc";
    const hideMap = loadHideUntilMap();
    let cancelled = false;

    fetchSitePopups(device)
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return;
        const filtered = list.filter(
          (p) => !isHiddenByStorage(p.nw_id, hideMap)
        );
        setPopups(filtered);
      })
      .catch(() => {
        if (!cancelled) setPopups([]);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const closeSession = useCallback((nwId: number) => {
    setSessionClosed((prev) => new Set(prev).add(nwId));
  }, []);

  const hideHours = useCallback((popup: SitePopup) => {
    const hours = popup.nw_disable_hours > 0 ? popup.nw_disable_hours : 24;
    setHideForHours(popup.nw_id, hours);
    setPopups((prev) => prev.filter((p) => p.nw_id !== popup.nw_id));
  }, []);

  const visible = popups.filter((p) => !sessionClosed.has(p.nw_id));

  if (!mounted || typeof document === "undefined" || visible.length === 0) {
    return null;
  }

  return createPortal(
    <div className={styles.layer} aria-live="polite">
      {visible.map((p) => (
        <PopupCard
          key={p.nw_id}
          popup={p}
          onCloseSession={() => closeSession(p.nw_id)}
          onHideHours={() => hideHours(p)}
        />
      ))}
    </div>,
    document.body
  );
}
