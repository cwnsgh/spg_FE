/**
 * 입사지원서 미리보기에서만 `globals.css`의 인쇄 규칙이 적용되도록 한 뒤 `print()` 호출.
 * (헤더·나머지 페이지는 숨기고 `#recruit-apply-print-root` 안만 PDF/인쇄에 나가게 함)
 */
export function requestRecruitApplyPreviewPrint(): void {
  document.body.classList.add("recruit-apply-preview-printing");

  let failSafe: ReturnType<typeof window.setTimeout> | undefined;

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
