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
import LoadingGlass from '../LoadingGlass';
// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend, ArcElement, RadialLinearScale
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, font: { size: 16, weight: 'bold' } },
  },
};

const ChartCard = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">{title}</h3>
        <div className="relative flex-grow">
            {children}
        </div>
    </div>
);

const Report = () => {
  const [datasets, setDatasets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  if (loading) return <LoadingGlass/>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!datasets) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Comprehensive Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard title="Organization Role Pyramid">
            <Pie 
              data={{
                labels: datasets.orgRolePyramid.map(r => r.role),
                datasets: [{ data: datasets.orgRolePyramid.map(r => r.count), backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'] }]
              }} 
              options={chartOptions} 
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard title="Workforce Growth (Hires per Month)">
            <Line 
                data={{
                    labels: datasets.workforceGrowth.labels,
                    datasets: [{ label: 'New Hires', data: datasets.workforceGrowth.data, borderColor: '#4BC0C0', tension: 0.1 }]
                }} 
                options={chartOptions} 
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard title="Top 5 Skills by Endorsements">
            <Bar 
                data={{
                    labels: datasets.skillsFootprint.map(s => s.name),
                    datasets: [{ label: 'Endorsements', data: datasets.skillsFootprint.map(s => s.endorsements), backgroundColor: '#FF6384' }]
                }} 
                options={chartOptions} 
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard title="Skill Verification Health">
             <Doughnut 
                data={{
                    labels: ['Verified', 'Unverified'],
                    datasets: [{ data: [datasets.verificationHealth.verified, datasets.verificationHealth.unverified], backgroundColor: ['#36A2EB', '#FFCE56'] }]
                }} 
                options={chartOptions} 
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-3 h-[40vh]">
            <ChartCard title="Top 5 Campaigns by Member Count">
                <Bar
                    data={{
                        labels: datasets.campaignFunnel.map(c => c.name),
                        datasets: [{ label: 'Members', data: datasets.campaignFunnel.map(c => c.members), backgroundColor: '#FF9F40' }]
                    }}
                    options={chartOptions}
                />
            </ChartCard>
        </div>

        <div className="lg:col-span-1 h-[40vh]">
          <ChartCard title="Staff by Work Type">
            <Pie 
              data={{
                labels: datasets.staffByWorkType.map(r => r.type),
                datasets: [{ data: datasets.staffByWorkType.map(r => r.count), backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'] }]
              }} 
              options={chartOptions} 
            />
          </ChartCard>
        </div>

        <div className="lg:col-span-2 h-[40vh]">
          <ChartCard title="Campaign Lifecycle">
            <Bar 
                data={{
                    labels: ['Upcoming', 'Active', 'Completed'],
                    datasets: [{ label: 'Campaigns', data: [datasets.campaignLifecycle.upcoming, datasets.campaignLifecycle.active, datasets.campaignLifecycle.completed], backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'] }]
                }} 
                options={chartOptions} 
            />
          </ChartCard>
        </div>

      </div>
    </div>
  );
};

export default Report;
