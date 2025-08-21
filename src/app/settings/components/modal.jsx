'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react'; // Using an icon for the close button

/**
 * A generic, reusable modal component.
 *
 * @param {boolean} isOpen - Controls the visibility of the modal.
 * @param {function} onClose - Function to call when the modal should be closed.
 * @param {React.ReactNode} children - The content to be displayed inside the modal.
 * @param {string} [title] - Optional title to display in the modal header.
 */
export default function Modal({ isOpen, onClose, children, title }) {
  // Effect to handle closing the modal with the 'Escape' key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    // Add event listener when the modal is open
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    // Clean up the event listener when the component unmounts or modal closes
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // If the modal is not open, render nothing.
  if (!isOpen) {
    return null;
  }

  return (
    // The modal backdrop: a semi-transparent overlay covering the entire screen.
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 transition-opacity"
      onClick={onClose} // Clicking the backdrop closes the modal.
    >
      {/* The modal panel: the main content area. */}
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it.
      >
        {/* Modal Header with optional title and a close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          {title ? (
            <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
              {title}
            </h2>
          ) : (
            <div /> // Empty div to keep the close button to the right
          )}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body: where the child content is rendered */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
