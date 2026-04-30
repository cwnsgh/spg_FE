/**
 * 입사지원서 미리보기 인쇄 트리거. 사용처: `RecruitApplyPreview.tsx`.
 * `globals.css` 인쇄 규칙 적용 후 `print()` 호출.
 * (헤더·나머지 페이지는 숨기고 `#recruit-apply-print-root` 안만 PDF/인쇄에 나가게 함)
 */
export function requestRecruitApplyPreviewPrint(): void {
  document.body.classList.add("recruit-apply-preview-printing");

  /** 브라우저는 `number`, Node 타입 병합 시 `Timeout` — 빌드 호환을 위해 브라우저 타이머 id만 사용 */
  let failSafe: number | undefined;

  const cleanup = () => {
    if (failSafe != null) {
      window.clearTimeout(failSafe);
      failSafe = undefined;
    }
    window.removeEventListener("afterprint", cleanup);
    document.body.classList.remove("recruit-apply-preview-printing");
  };

  window.addEventListener("afterprint", cleanup);
  failSafe = window.setTimeout(cleanup, 60_000);

  window.requestAnimationFrame(() => {
    window.print();
  });
}
