// ✅ tickets-frontend/src/components/ui/ModalClientes.jsx
import ModalPortal from "../ModalPortal";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalClientes({ isOpen, onClose, title = "Modal", children }) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          className="modern-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modern-modal"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-avatar">👤</div>
            <h2 className="modal-title">{title}</h2>

            <div className="modal-content">
              {children}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancelar</button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
}
