'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getElementAtEvent } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import CampaignInsightsModal from './CampaignMembersModal'; // Ensure this path is correct

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Common chart styling options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          family: "'DM Sans', sans-serif",
        },
      },
    },
    title: {
      display: true,
      font: {
        size: 16,
        weight: 'bold',
        family: "'DM Sans', sans-serif",
      },
      padding: {
        top: 10,
        bottom: 20,
      }
    },
  },
};

const DashboardChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW: State for controlling the campaign insights modal ---
  const [viewingCampaign, setViewingCampaign] = useState(null);

  // Hooks for navigation and chart references
  const router = useRouter();
  const verificationChartRef = useRef();
  const campaignChartRef = useRef();
  const topEmployeesChartRef = useRef();

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/charts');
        if (!response.ok) throw new Error('Failed to load chart data.');
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  // Conditional rendering for loading/error states
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[30vh]">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  if (error) return <div className="h-[30vh] flex items-center justify-center"><p className="text-red-500">Error: {error}</p></div>;
  if (!chartData) return null;

  // Prepare data for each chart
  const verificationChartData = {
    labels: ['Verified Employees', 'Pending Employees'],
    datasets: [{
      data: [chartData.verificationStats.verified, chartData.verificationStats.unverified],
      backgroundColor: ['#3b82f6', '#93c5fd'], 
      borderColor: ['black', 'white'],
      borderWidth: 1,
    }],
  };

  const campaignChartData = {
    // The API response now needs to include campaign IDs
    // Example: { id: 1, name: 'Q1 Onboarding', members: 50 }
    labels: chartData.campaignMembers.map(c => c.name),
    datasets: [{
      label: 'Members',
      data: chartData.campaignMembers.map(c => c.members),
      backgroundColor: '#60a5fa',
      borderColor: '#2563eb',
      borderWidth: 1,
    }],
  };

  const topEmployeesChartData = {
    labels: chartData.topEmployeesBySkills.map(s => s.name),
    datasets: [{
      label: 'Number of Skills',
      data: chartData.topEmployeesBySkills.map(s => s.skillCount),
      backgroundColor: '#3b82f6',
      borderColor: '#93cfd',
      borderWidth: 2,
    }],
  };
  
  // Click handlers for each chart
  const handleVerificationClick = (event) => {
    if (!verificationChartRef.current) return;
    const elements = getElementAtEvent(verificationChartRef.current, event);
    if (!elements.length) return;
    
    router.push(`/admin/verification`);
  };

  // --- REWRITTEN CAMPAIGN CLICK HANDLER ---
  const handleCampaignClick = (event) => {
    if (!campaignChartRef.current) return;
    const elements = getElementAtEvent(campaignChartRef.current, event);
    if (!elements.length) return;

    const { index } = elements[0]; // Get the index of the clicked bar
    
    // Use the index to find the corresponding campaign data from the original API response
    const clickedCampaign = chartData.campaignMembers[index];
    console.log(clickedCampaign)

    // Check if the campaign data (and especially the ID) exists
    if (clickedCampaign && clickedCampaign.id) {
      setViewingCampaign(clickedCampaign); // Set the campaign object to open the modal
    } else {
      // Fallback or error handling if needed
      console.error("Could not find campaign ID for the clicked bar.");
    }
  };

  const handleTopEmployeeClick = (event) => {
    if (!topEmployeesChartRef.current) return;
    const elements = getElementAtEvent(topEmployeesChartRef.current, event);
    if (!elements.length) return;
    
    const { index } = elements[0];
    console.log(topEmployeesChartData.labels)

    const employeeName = topEmployeesChartData.labels[index];
    const employeeId = chartData.topEmployeesBySkills[index].id
    console.log("Emp Id is " , chartData.topEmployeesBySkills[index].id)
    router.push(`/admin/verify-experience/${encodeURIComponent(employeeId)}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[30vh]">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Doughnut 
            ref={verificationChartRef}
            onClick={handleVerificationClick}
            options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Overall Verification Status'}}}} 
            data={verificationChartData} 
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Bar 
            ref={campaignChartRef}
            onClick={handleCampaignClick}
            options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Top Campaigns by Members'}}}} 
            data={campaignChartData} 
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Bar 
            ref={topEmployeesChartRef}
            onClick={handleTopEmployeeClick}
            options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Top Employees by Skill Count'}}}} 
            data={topEmployeesChartData} 
          />
        </div>
      </div>

      {/* --- MODAL RENDERING LOGIC --- */}
      {/* The modal is now rendered conditionally based on the `viewingCampaign` state */}
      {viewingCampaign && (
        <CampaignInsightsModal
          campaignId={viewingCampaign.id}
          onClose={() => setViewingCampaign(null)}
        />
      )}
    </>
  );
};

export default DashboardChart;
