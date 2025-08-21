'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import EmailTemplateManager from '@/app/components/Dashboard/EmailTemplateManager';
import EmailTemplateEditor from './emailTemplateEditor';
import Modal from './modal';

// --- Helper Components ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    <p className="ml-4 text-lg text-gray-600">Loading Email Settings...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-screen text-center text-red-500">
    <h2 className="text-2xl font-bold mb-2">Error</h2>
    <p>{message}</p>
  </div>
);

// --- Main Page Component ---
export default function EmailSettingsPage() {
  const [templates, setTemplates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // 1. State to store the user's data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // --- Data Fetching Logic ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // 2. Fetch both templates and user data in parallel for efficiency
      const [templatesResponse, userResponse] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/auth/me')
      ]);

      if (!templatesResponse.ok) throw new Error('Failed to fetch email templates.');
      if (!userResponse.ok) throw new Error('Failed to fetch user authentication data.');
      
      const templatesData = await templatesResponse.json();
      const userData = await userResponse.json();

      setTemplates(templatesData);
      setCurrentUser(userData); // Set the fetched user data into state

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTemplateCreated = () => {
    setIsEditorOpen(false);
    fetchData(); // Refetch all data to keep the page consistent
  };

  const handleSave = async (selections) => {
    console.log("Saving selections to the database:", selections);
    alert("Selections have been logged. See the console for details.");
  };

  // --- Conditional Rendering Logic ---
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 bg-transparent h-90">
      <div className="mx-auto">
        
        <EmailTemplateManager templates={templates} onSaveSelection={handleSave} />
      </div>
      
      {/* 4. Only render the modal if the editor is open AND we have a companyId */}
      {isEditorOpen && currentUser?.companyId && (
        <Modal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} title="Create New Template">
          <EmailTemplateEditor 
            companyId={currentUser.companyId} // Pass the dynamic companyId
            onTemplateCreated={handleTemplateCreated} 
          />
        </Modal>
      )}
    </main>
  );
}
