'use client';

import React from 'react';

// This component receives a function `onSelect` to pass the chosen value back up.
export default function PredefinedActions({ onSelect, disabled }) {
  
  // --- NEW: Define actions with associated color styles ---
  // We use an array of objects to keep the action text and its styles together.
  const actions = [
    { 
      text: 'Excellent', 
      styles: 'text-green-800 bg-green-100 hover:bg-green-200 hover:h-8' 
    },
    { 
      text: 'Above Avg', 
      styles: 'text-sky-800 bg-sky-100 hover:bg-sky-200 hover:h-8' 
    },
    { 
      text: 'Avg', 
      styles: 'text-blue-800 bg-blue-100 hover:bg-blue-200 hover:h-8' 
    },
    { 
      text: 'Below Avg', 
      styles: 'text-orange-800 bg-orange-100 hover:bg-orange-200 hover:h-8' 
    },
    { 
      text: 'Poor', 
      styles: 'text-red-800 bg-red-100 hover:bg-red-200 hover:h-8' 
    }
  ];

  const handleActionClick = (actionText) => {
    // Call the onSelect function passed from the parent with the button's text
    onSelect(actionText);
  };

  return (
    // This div will be placed above the main input form
    <div className="flex flex-wrap items-center justify-center gap-2 mb-3 -ml-5">
      {actions.map((action) => (
        <button
          key={action.text}
          onClick={() => handleActionClick(action.text)}
          disabled={disabled} // Disable the buttons when a response is loading
          // --- DYNAMIC CLASSES ---
          // The base styles are applied first, followed by the specific color styles
          // for the current action.
          className={`
            px-7 py-1.5 text-md font-semibold rounded-full transition-colors 
            disabled:opacity-50 disabled:cursor-not-allowed 
            ${action.styles} 
          `}
        >
          {action.text}
        </button>
      ))}
    </div>
  );
}
