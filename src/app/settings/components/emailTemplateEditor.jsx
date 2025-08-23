'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Swal from 'sweetalert2';
import { Loader2, Zap } from 'lucide-react'; // Using Zap icon for a better feel
import {
  FiBold,
  FiItalic,
  FiMinus,
  FiCode,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
} from 'react-icons/fi';

// --- Tiptap Toolbar Component ---
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, isActive, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-gray-200 ${isActive ? 'bg-gray-300 text-black' : 'text-gray-600'}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
      <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><FiBold /></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><FiItalic /></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><FiMinus /></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code"><FiCode /></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><FiList /></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><FiAlignLeft /></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><FiAlignCenter /></MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><FiAlignRight /></MenuButton>
    </div>
  );
};

export default function EmailTemplateEditor({ companyId, onTemplateCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Verification_Request');
  const [subject, setSubject] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // State for AI generation loading

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none p-4 focus:outline-none min-h-[150px]',
      },
    },
  });

  // --- NEW: Function to handle AI-powered generation ---
  const handleGenerateEmail = async () => {
    if (!aiPrompt.trim()) {
      Swal.fire('Input Required', 'Please enter a prompt for the AI to generate content.', 'warning');
      return;
    }
    setIsGenerating(true);
    try {

      const authResponse = await fetch('/api/auth/company');

      const authData = await authResponse.json();

      const company = authData.company
      
      const response = await fetch('http://127.0.0.1:8000/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name:company.name,
          company_type:company.type, // Example: You can make this dynamic
          email_type: type, // Uses the currently selected email type
          prompt: aiPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }

      const generatedText = await response.text();

      // The API returns the subject and body, so we need to parse it
      const subjectMatch = generatedText.match(/\*\*Subject:\*\*\s*(.*)/);
      const bodyMatch = generatedText.split(/\*\*Subject:\*\*\s*.*\n\n/);

      const generatedSubject = subjectMatch ? subjectMatch[1].trim() : '';
      const generatedBody = bodyMatch.length > 1 ? bodyMatch : generatedText;

      setSubject(generatedSubject); // Update the subject field
      if (editor) {
        editor.commands.setContent(generatedBody); // Update the editor content
      }

      Swal.fire({
        icon: 'success',
        title: 'Content Generated!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

    } catch (error) {
      console.error("AI Generation Error:", error);
      Swal.fire('Error', `Failed to generate email: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const html = editor ? editor.getHTML() : '';

    if (!name || !subject || !html || (editor && editor.isEmpty)) {
      Swal.fire('Incomplete Form', 'Please fill out the Name, Subject, and Body fields.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/templates/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, name, type, subject, body: html }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template.');
      }

      Swal.fire('Success!', 'New email template created successfully.', 'success');
      setName('');
      setType('Verification_Request');
      setSubject('');
      setAiPrompt('');
      if (editor) editor.commands.clearContent();
      if (onTemplateCreated) onTemplateCreated();

    } catch (error) {
      Swal.fire('Error!', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Email Template</h2>
        
        <div>
          <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
          <input id="templateName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 'Friendly Welcome for New Users'" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="templateType" className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
            <select id="templateType" value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="Verification_Request">Verification Request</option>
              <option value="Verification_Result">Verification Result</option>
              <option value="Request_Hr_Mail">Request HR Email</option>
              <option value="WELCOME_EMAIL">Welcome Email</option>
              <option value="PASSWORD_RESET">Password Reset</option>
              <option value="SUBSCRIPTION_CONFIRMATION">Subscription Confirmation</option>
              <option value="GENERAL_NOTIFICATION">General Notification</option>
            </select>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
            <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line of the email" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
          </div>
        </div>

        {/* --- AI Generation Section --- */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-800 mb-1">
                AI Generation Prompt
            </label>
            <p className="text-xs text-gray-500 mb-2">Describe the email you want. For example: "A friendly welcome email for new user John Doe."</p>
            <div className="flex items-center gap-2">
                <input
                    id="aiPrompt"
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., A warm welcome to our platform"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isGenerating}
                />
                <button
                    type="button"
                    onClick={handleGenerateEmail}
                    disabled={isGenerating || !aiPrompt}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                    {isGenerating ? (
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    ) : (
                        <Zap className="-ml-1 mr-2 h-5 w-5" />
                    )}
                    {isGenerating ? 'Generating...' : "Generate with AI"}
                </button>
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
          <div className="border border-gray-300 rounded-md">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="mt-8 text-right">
          <button type="submit" disabled={isSubmitting || isGenerating} className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
            {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />}
            {isSubmitting ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </form>
    </div>
  );
}
