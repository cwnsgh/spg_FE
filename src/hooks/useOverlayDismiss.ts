"use client";

/**
 * 모달 배경(오버레이) 클릭 시에만 닫히도록 mousedown·click 순서 추적.
 * 사용처: 관리자 IR·FAQ·게시판·가맹점, 문의·채용 UI 등 오버레이 모달.
 */
import { useCallback, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

export function useOverlayDismiss(onDismiss: () => void) {
  const startedOnOverlayRef = useRef(false);

  const handleOverlayMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      startedOnOverlayRef.current = event.target === event.currentTarget;
    },
    []
  );

  const handleOverlayClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const shouldDismiss =
        startedOnOverlayRef.current && event.target === event.currentTarget;

      startedOnOverlayRef.current = false;

      if (shouldDismiss) {
        onDismiss();
      }
    },
    [onDismiss]
  );

  return {
    handleOverlayMouseDown,
    handleOverlayClick,
  };
}
