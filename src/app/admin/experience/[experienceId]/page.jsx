// Import your components. Adjust the paths if they are different.
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Header from '@/app/components/Dashboard/Header';
import SubAlert from '@/app/components/Dashboard/SubAlert';
import ExperienceVerificationPage from '@/app/components/Dashboard/ExperienceVerification';



export default function ImportEmployee() {
  return (
    // Main container using flexbox
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FBFBFB' }}>
      <Sidebar />
      {/* Main content area that takes up the remaining space */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header is placed inside the main content area */}
        <div style={{ padding: '20px 30px 0 30px' }} >
          <Header user={{ name: 'Admin' }} />
        </div>
          <SubAlert/>

        {/* The import page component is also inside the main content area */}
        <div style={{ padding: '0 30px 30px 30px' }} >
          <ExperienceVerificationPage />
        </div>
      </div>
    </div>
  );
}
