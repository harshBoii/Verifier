'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle, Eye } from 'lucide-react';
import LoadingGlass from '../LoadingGlass';

export default function EmailTemplateManager({ templates, onSaveSelection }) {
  // Memoize categories to prevent re-calculation on every render
  const categories = useMemo(() => {
    const uniqueTypes = [...new Set(templates.map(t => t.type))];
    // A more readable mapping for the UI
    return uniqueTypes.map(type => ({
      key: type,
      name: type.replace(/_/g, ' '), // e.g., 'Verification_Request' -> 'Verification Request'
    }));
  }, [templates]);

  // State management
  const [activeCategory, setActiveCategory] = useState(categories[0]?.key);
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Filter templates based on the active category
  const filteredTemplates = templates.filter(t => t.type === activeCategory);

  // Handler to select a template for the active category
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates(prev => ({
      ...prev,
      [activeCategory]: templateId,
    }));
  };

  // Handler to save all selections
  const handleSaveChanges = () => {
    // This function would call an API to persist the user's choices
    // onSaveSelection(selectedTemplates);
    alert("Saved selections: " + JSON.stringify(selectedTemplates, null, 2));
  };

  return (
    <div className="bg-gray-50 h-30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Email Template Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Choose the default email design for each type of communication.</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleSaveChanges}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  transition-colors
                  ${activeCategory === category.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => {
            const isSelected = selectedTemplates[activeCategory] === template.id;
            return (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className={`
                  group relative rounded-lg border bg-white shadow-sm cursor-pointer
                  transition-all duration-200
                  ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:border-blue-400'}
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 z-10 p-1.5 bg-blue-600 text-white rounded-full">
                    <CheckCircle size={20} />
                  </span>
                )}
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">{template.name}</h3>
                  <p className="text-xs text-gray-500 uppercase">{template.subject}</p>
                </div>
                
                {/* Miniature preview */}
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-b-lg border-t border-gray-200">
                  <iframe
                    srcDoc={template.body}
                    className="w-full h-full transform scale-[0.25] -translate-x-[37.5%] -translate-y-[37.5%]"
                    scrolling="no"
                    title={`Preview of ${template.name}`}
                  />
                </div>
                
                {/* Overlay for preview button */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                    className="py-2 px-4 bg-white text-gray-800 font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="inline mr-2" size={16} /> Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-size Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">{previewTemplate.name}</h3>
              <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-gray-700">&times;</button>
            </div>
            <div className="flex-grow overflow-hidden">
              <iframe
                srcDoc={previewTemplate.body}
                className="w-full h-full border-0"
                title={`Full preview of ${previewTemplate.name}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
