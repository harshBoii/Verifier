import React from 'react';
import SettingsPage from '../components/Dashboard/SettingsPage';

const MySettingsPage = () => {
  return (
    // The Settings page component is wrapped in the main layout
    // that we created in previous steps.
    <div style={{ display: 'flex' }}>
      {/* If you want the main sidebar to appear next to the settings page,
          you can import and include it here. For a standalone page,
          this setup is sufficient. */}
      <SettingsPage />
    </div>
  );
};

export default MySettingsPage;