import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShow(true);
    else setTimeout(() => setShow(false), 300); // Wait for animation
  }, [isOpen]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="absolute inset-0 bg-garden-text/20 backdrop-blur-sm" onClick={onClose}></div>
      <div 
        className={`relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-6 border border-white/50 transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        {title && <h2 className="text-2xl font-serif text-garden-text mb-4 text-center">{title}</h2>}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-garden-text/50 hover:text-garden-text transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;