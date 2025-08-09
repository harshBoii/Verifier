import React, { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import WrapButton from '@/components/ui/wrap-button'; // Assuming this path is correct

const SocialMediaModal = ({ isOpen, onClose, profileData, onSave }) => {
  // Internal state to manage the modal's form fields
  const [socials, setSocials] = useState(profileData);

  // Effect to update internal state if the profileData from props changes
  useEffect(() => {
    setSocials(profileData);
  }, [profileData]);

  if (!isOpen) return null;

  // Handler for input changes within the modal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocials(prev => ({ ...prev, [name]: value }));
  };

  // Handler for the save button click
  const handleSave = () => {
    // Call the onSave prop passed from the parent, sending the updated data up
    onSave(socials);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-6 text-xl font-semibold text-gray-800">Edit Social Media Links</h3>
        
        <div className="flex flex-col space-y-4">
          
          {/* LinkedIn Input */}
          <div>
            <label htmlFor="linkedin" className="mb-1 block text-sm font-medium text-gray-700">LinkedIn</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiEdit className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="linkedin"
                type="url"
                name="linkedin"
                value={socials.linkedin || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="block w-full rounded-md border border-black p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* GitHub Input */}
          <div>
            <label htmlFor="github" className="mb-1 block text-sm font-medium text-gray-700">GitHub</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiEdit className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="github"
                type="url"
                name="github"
                value={socials.github || ''}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="block w-full rounded-md border border-black p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Website Input */}
          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium text-gray-700">Website</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiEdit className="h-5 w-5 text-gray-400" />
              </span>
              <input
                id="website"
                type="url"
                name="website"
                value={socials.website || ''}
                onChange={handleChange}
                placeholder="https://your-website.com"
                className="block w-full rounded-md border border-black p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <WrapButton onClick={onClose}>Close</WrapButton>
          {/* This button now correctly calls handleSave */}
          <WrapButton primary onClick={handleSave}>Save Links</WrapButton>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaModal;
