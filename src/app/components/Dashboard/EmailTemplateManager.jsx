'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, Eye, X, Loader2, Plus } from 'lucide-react';
import EmailTemplateEditor from '@/app/settings/components/emailTemplateEditor';
import Modal from '@/app/settings/components/modal';


// --- Helper Components ---
const SaveLoadingOverlay = () => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-3 text-lg font-semibold text-gray-700">Saving...</span>
  </div>
);

// --- Main Component ---
export default function EmailTemplateManager({ templates, onSaveSelection, onTemplatesUpdate }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 2. State to control the editor modal's visibility
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) throw new Error('Could not fetch user data.');
        const user = await response.json();
        setCurrentUser(user);
      } catch (error) {
        console.error("Authentication Error:", error);
        alert("Could not load user session. Please try logging in again.");
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const categories = useMemo(() => {
    const uniqueTypes = [...new Set(templates.map(t => t.type))];
    return uniqueTypes.map(type => ({
      key: type,
      name: type.replace(/_/g, ' '),
    }));
  }, [templates]);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.key);
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const filteredTemplates = templates.filter(t => t.type === activeCategory);

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates(prev => ({ ...prev, [activeCategory]: templateId }));
  };

  const handleSaveChanges = async () => {
    if (!currentUser || !currentUser.companyId) {
      alert("Error: Could not identify your company.");
      return;
    }
    if (Object.keys(selectedTemplates).length === 0) {
      alert("No changes to save.");
      return;
    }
    setIsSaving(true);
    try {
      // Pass selections to the parent page to handle the save logic
      await onSaveSelection(selectedTemplates);
      alert("Template preferences saved successfully!");
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 3. Callback function to handle successful template creation
  const handleTemplateCreated = () => {
    setIsEditorOpen(false); // Close the modal
    if (onTemplatesUpdate) {
      onTemplatesUpdate(); // Signal to the parent page to refetch the templates
    }
  };

  if (isLoadingUser) {
    return <div className="flex items-center justify-center "><Loader2 className="h-10 w-10 animate-spin text-blue-500"/></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 relative mt-13 " >
      {isSaving && <SaveLoadingOverlay />}
      <div className="max-w-7xl mx-auto">
        {/* Header with Save and Create New buttons */}
        <div className="md:flex md:items-center md:justify-between h-50 ">
          <div className="flex-1 min-w-0 ">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Email Template Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Choose the default email design for each type of communication.</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            {/* 4. The "Create New Template" button */}
            <button
              onClick={() => setIsEditorOpen(true)}
              disabled={!currentUser?.companyId}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Create New
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
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
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeCategory === category.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
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
              <div key={template.id} onClick={() => handleSelectTemplate(template.id)} className={`group relative rounded-lg border bg-white shadow-sm cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:border-blue-400'}`}>
                {isSelected && <span className="absolute top-2 right-2 z-10 p-1.5 bg-blue-600 text-white rounded-full"><CheckCircle size={20} /></span>}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">{template.name}</h3>
                  <p className="text-xs text-gray-500 uppercase">{template.subject}</p>
                </div>
                <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-b-lg border-t border-gray-200">
                  <iframe srcDoc={template.body} className="w-[400%] h-[400%] transform scale-[0.25] origin-top-left" scrolling="no" title={`Preview of ${template.name}`} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }} className="py-2 px-4 bg-zinc-700 text-white font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="inline mr-2" size={16} /> Preview
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full-size Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4  backdrop-blur-md bg-opacity-10">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b ">
                <h3 className="text-lg font-bold text-gray-900">{previewTemplate.name}</h3>
                <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
              </div>
              <div className="flex-grow overflow-hidden">
                <iframe srcDoc={previewTemplate.body} className="w-full h-full border-0" title={`Full preview of ${previewTemplate.name}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. The Modal containing the EmailTemplateEditor */}
      {isEditorOpen && currentUser?.companyId && (
        <Modal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title="Create New Email Template">
          <EmailTemplateEditor
            companyId={currentUser.companyId}
            onTemplateCreated={handleTemplateCreated}
          />
        </Modal>
      )}
    </div>
  );
}
