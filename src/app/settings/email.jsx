'use client'; // This directive marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import EmailTemplateManager from '../components/Dashboard/EmailTemplateManager';
import { Loader2 } from 'lucide-react'; // Using lucide-react for a loading spinner

// A simple loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
  </div>
);

// The main page component, now a client component
export default function EmailSettingsPage() {
  // State to hold the templates, loading status, and any potential errors
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    // Define an async function inside the effect to fetch the data
    const fetchTemplates = async () => {
      try {
        // Call your new API endpoint
        const response = await fetch('/api/templates');
        
        if (!response.ok) {
          // If the response is not successful, throw an error to be caught by the catch block
          throw new Error('Failed to fetch email templates.');
        }

        const data = await response.json();
        setTemplates(data); // Set the fetched templates into state

      } catch (err) {
        setError(err.message); // Set the error state if fetching fails
      } finally {
        setLoading(false); // Set loading to false once the fetch is complete (either success or fail)
      }
    };

    fetchTemplates();
  }, []); // The empty dependency array [] ensures this effect runs only once

  // Function to handle saving the user's template selections
  const handleSave = async (selections) => {
    console.log("Saving selections to the database:", selections);
    // In a real application, you would make another API call here
    // to a POST/PUT endpoint to save the `selections` object.
    // For example:
    // await fetch('/api/settings/email-preferences', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(selections),
    // });
    alert("Selections have been logged. See the console for details.");
  };

  // Conditional rendering based on the loading and error states
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  return (
    <main>
      <EmailTemplateManager templates={templates} onSaveSelection={handleSave} />
    </main>
  );
}
