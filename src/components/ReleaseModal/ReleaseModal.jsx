import "./ReleaseModal.css";
import { handleBackgroundClick, useEscapeKey } from "../../utils/modalUtils";
export default function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  useEscapeKey(isOpen, onClose);
  
  if (!isOpen) return null;

  return (
    <div
      className="modal__overlay modal_opened"
      onClick={(e) => handleBackgroundClick(e, onClose)}
    >
      <div className="modal__content modal__content_type_release">
        <button
          onClick={onClose}
          type="button"
          className="modal__close"
        ></button>
        <p className="release__message">{message}</p>
        <div className="modal__actions">
          <button onClick={onConfirm} className="modal__confirm">
            Yes
          </button>
          <button onClick={onClose} className="modal__cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
