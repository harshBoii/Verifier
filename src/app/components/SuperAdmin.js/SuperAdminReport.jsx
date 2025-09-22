'use client';
import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Pie, Line } from 'react-chartjs-2';
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
} from 'chart.js';
import LoadingGlass from '../LoadingGlass';

// Register chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { color: '#4A5568', font: { size: 12, family: "'Inter', sans-serif" } },
    },
    title: {
      display: true,
      text: 'Default Title',
      font: { size: 18, weight: '600', family: "'Inter', sans-serif" },
      color: '#1A202C',
      padding: { top: 10, bottom: 20 },
    },
  },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#718096' }, grid: { color: '#E2E8F0' } },
    x: { ticks: { color: '#718096' }, grid: { display: false } },
  },
};

const ChartCard = ({ children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md h-full flex flex-col">
    <div className="relative flex-grow">{children}</div>
  </div>
);

const SuperadminDashboard = () => {
  const [datasets, setDatasets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/superadmin/charts');
        if (!res.ok) throw new Error('Failed to load dashboard data.');
        const data = await res.json();
        setDatasets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingGlass />;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!datasets) return null;

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Superadmin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Total Active Companies */}
        <div className="lg:col-span-1 h-[30vh]">
          <ChartCard>
            <h2 className="text-lg font-semibold text-gray-700">Active Companies</h2>
            <p className="text-4xl font-bold text-blue-600 mt-4">{datasets.activeCompanies}</p>
          </ChartCard>
        </div>

        {/* 2. Verification Volume by Type */}
        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard>
            <Line
              data={{
                labels: datasets.verificationsOverTime.map(v => v.verificationType),
                datasets: [{
                  label: 'Verification Volume',
                  data: datasets.verificationsOverTime.map(v => v._count._all),
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  fill: true,
                  tension: 0.3,
                }]
              }}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Verification Volume by Type' } },
              }}
            />
          </ChartCard>
        </div>

        {/* 3. Verification Success Rate */}
        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard>
            <Doughnut
              data={{
                labels: datasets.verificationSuccess.map(v => v.outcome),
                datasets: [{
                  data: datasets.verificationSuccess.map(v => v._count._all),
                  backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6B7280'],
                }]
              }}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Verification Success Rate' } },
              }}
            />
          </ChartCard>
        </div>

        {/* 4. Top Skills by Endorsements */}
        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard>
            <Bar
              data={{
                labels: datasets.topSkills.map(s => s.name),
                datasets: [{
                  label: 'Endorsements',
                  data: datasets.topSkills.map(s => s.endorsements),
                  backgroundColor: '#60A5FA',
                }]
              }}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Top 10 Skills Across All Companies' } },
              }}
            />
          </ChartCard>
        </div>

        {/* 5. Campaigns by Status */}
        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard>
            <Pie
              data={{
                labels: datasets.campaignsByStatus.map(c => c.status),
                datasets: [{
                  data: datasets.campaignsByStatus.map(c => c._count._all),
                  backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD'],
                }]
              }}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Campaigns by Status' } },
              }}
            />
          </ChartCard>
        </div>

        {/* 6. Notifications by Type */}
        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard>
            <Bar
              data={{
                labels: datasets.notificationsByType.map(n => n.type),
                datasets: [{
                  label: 'Notifications',
                  data: datasets.notificationsByType.map(n => n._count._all),
                  backgroundColor: '#93C5FD',
                }]
              }}
              options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'System-wide Notifications by Type' } },
              }}
            />
          </ChartCard>
        </div>

      </div>
    </div>
  );
};

export default SuperadminDashboard;
