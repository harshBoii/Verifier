'use client';

import { useState } from 'react';

// Import your existing components
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Header from '@/app/components/Dashboard/Header';
import SubAlert from '@/app/components/Dashboard/SubAlert';
import ExperienceVerificationPage from '@/app/components/Dashboard/ExperienceVerification';
import WorkflowList from '@/app/components/Dashboard/WorkflowList';
import WorkflowManagementPage from '@/app/components/Dashboard/workFlowManagement';

export default function VerificationDashboard({ params }) {
  const { experienceId } = params; 
  
  // State to manage which view is active: 'details', 'workflows', or 'setWorkflow'
  const [activeView, setActiveView] = useState('details'); 

  // Reusable NavLink component for clean code
  const NavLink = ({ viewName, label, icon: Icon, currentView, setView }) => {
    const isActive = viewName === currentView;
    return (
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setView(viewName);
        }}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-semibold'
            : 'text-slate-700 hover:bg-gray-100 hover:text-slate-900'
        }`}
      >
        <Icon className="h-5 w-5 mr-3" />
        {label}
      </a>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FBFBFB' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 30px 0 30px' }}>
          <Header user={{ name: 'Admin' }} />
        </div>
        <SubAlert />

        <div className='flex flex-row min-h-screen w-full bg-slate-50 font-sans px-7 py-4'>
          {/* Sidebar Navigation */}
          <aside className='h-fit w-64 sticky top-4 bg-white shadow-sm rounded-xl'>
            <div className='p-6'>
              <h2 className="text-lg font-bold text-slate-800 mb-6">
                Verification Menu
              </h2>
              <nav className="space-y-2">
                <NavLink
                  viewName="details"
                  label="Verification Details"
                  icon={(props) => (
                    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  currentView={activeView}
                  setView={setActiveView}
                />
                <NavLink
                  viewName="workflows"
                  label="Scheduled Workflows"
                  icon={(props) => (
                    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  currentView={activeView}
                  setView={setActiveView}
                />
                {/* --- THIS IS THE NEW LINK --- */}
                <NavLink
                  viewName="setWorkflow"
                  label="Set Workflow"
                  icon={(props) => (
                    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  currentView={activeView}
                  setView={setActiveView}
                />
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-8">
            {/* --- CONDITIONAL RENDERING LOGIC UPDATED --- */}
            {activeView === 'details' && (
              <ExperienceVerificationPage experienceId={experienceId} />
            )}

            {activeView === 'workflows' && (
              <WorkflowList experienceId={experienceId} />
            )}
            
            {activeView === 'setWorkflow' && (
              <WorkflowManagementPage experienceId={experienceId} /> 
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
