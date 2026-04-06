"use client";

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
