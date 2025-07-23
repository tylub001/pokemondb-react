

export const handleBackgroundClick = (event, onClose) => {
  if (event.target.classList.contains("modal_opened")) {
    onClose();
  }
};

import { useEffect } from "react";

export const useEscapeKey = (isOpen, onClose) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);
};