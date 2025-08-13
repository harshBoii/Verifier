'use client';
import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement, RadialLinearScale
);

// Common styling options for all charts with a blue and white theme
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#4A5568', // Gray text for labels
        font: {
          family: "'Inter', sans-serif",
          size: 12,
        },
      },
    },
    title: {
      display: true,
      text: 'Default Title', // Will be overridden
      font: {
        size: 18,
        weight: '600',
        family: "'Inter', sans-serif",
      },
      color: '#1A202C', // Darker text for titles
      padding: {
        top: 10,
        bottom: 20,
      }
    },
  },
  scales: {
    y: {
        beginAtZero: true,
        grid: {
            color: '#E2E8F0', // Light gray grid lines
        },
        ticks: {
            color: '#718096',
        }
    },
    x: {
        grid: {
            display: false,
        },
        ticks: {
            color: '#718096',
        }
    }
  }
};

const ChartCard = ({ children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md h-full flex flex-col">
        <div className="relative flex-grow">
            {children}
        </div>
    </div>
);

const ComprehensiveDashboard = () => {
  const [datasets, setDatasets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the chart data from the single admin reports endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/reports');
        if (!response.ok) throw new Error('Failed to load dashboard data.');
        const data = await response.json();
        setDatasets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array ensures this runs only once

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!datasets) return null;

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Reports Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard>
            <Pie 
              data={{
                labels: datasets.orgRolePyramid.map(r => r.role),
                datasets: [{ data: datasets.orgRolePyramid.map(r => r.count), backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'] }]
              }} 
              options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Organization Role Pyramid'}}}}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard>
            <Line 
                data={{
                    labels: datasets.workforceGrowth.labels,
                    datasets: [{ label: 'New Hires', data: datasets.workforceGrowth.data, borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3 }]
                }} 
                options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Workforce Growth'}}}}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard>
            <Bar 
                data={{
                    labels: datasets.skillsFootprint.map(s => s.name),
                    datasets: [{ label: 'Endorsements', data: datasets.skillsFootprint.map(s => s.endorsements), backgroundColor: '#60A5FA' }]
                }} 
                options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Top 5 Skills by Endorsements'}}}}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard>
             <Doughnut 
                data={{
                    labels: ['Verified', 'Unverified'],
                    datasets: [{ data: [datasets.verificationHealth.verified, datasets.verificationHealth.unverified], backgroundColor: ['#3B82F6', '#BFDBFE'] }]
                }} 
                options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Skill Verification Health'}}}}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-3 h-[40vh]">
            <ChartCard>
                <Bar
                    data={{
                        labels: datasets.campaignFunnel.map(c => c.name),
                        datasets: [{ label: 'Members', data: datasets.campaignFunnel.map(c => c.members), backgroundColor: '#3B82F6' }]
                    }}
                    options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Top 5 Campaigns by Member Count'}}}}
                />
            </ChartCard>
        </div>

        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard>
            <Pie 
              data={{
                labels: datasets.staffByWorkType.map(r => r.type),
                datasets: [{ data: datasets.staffByWorkType.map(r => r.count), backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'] }]
              }} 
              options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Staff by Work Type'}}}}
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard>
            <Bar 
                data={{
                    labels: ['Upcoming', 'Active', 'Completed'],
                    datasets: [{ label: 'Campaigns', data: [datasets.campaignLifecycle.upcoming, datasets.campaignLifecycle.active, datasets.campaignLifecycle.completed], backgroundColor: ['#93C5FD', '#3B82F6', '#60A5FA'] }]
                }} 
                options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Campaign Lifecycle'}}}}
            />
          </ChartCard>
        </div>

      </div>
    </div>
  );
};

export default ComprehensiveDashboard;
