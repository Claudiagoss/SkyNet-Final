// src/components/Modal.jsx
export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="btn btn--xs btn--ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
