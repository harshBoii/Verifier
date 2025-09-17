'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, UserCheck, UserX, Loader2, ServerCrash, ChevronLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Link from 'next/link';
// --- Reusable Sub-components (No changes needed) ---
const COLORS = { verified: '#16A34A', pending: '#FBBF24' };
const LoadingState = () => (
  <div className="flex flex-col justify-center items-center h-80">
    <Loader2 className="h-10 w-10 animate-spin text-blue-600" /><p className="mt-4 text-gray-600">Loading Insights...</p>
  </div>
);
const ErrorState = ({ message }) => (
  <div className="flex flex-col justify-center items-center h-80 bg-red-50 rounded-lg p-4">
    <ServerCrash className="h-10 w-10 text-red-500" /><p className="mt-4 text-red-700 font-semibold">Could not load data</p><p className="text-red-600 text-sm">{message}</p>
  </div>
);
// Reusable stat card - now with an onClick handler
const StatCard = ({ icon, label, value, colorClass, onClick }) => (
  <div onClick={onClick} className={`flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 ${onClick ? 'cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all' : ''}`}>
    <div className={`p-2 rounded-full ${colorClass}`}>{icon}</div>
    <div className="ml-4"><p className="text-sm font-medium text-gray-600">{label}</p><p className="text-2xl font-semibold text-gray-900">{value}</p></div>
  </div>
);

// --- NEW: Component to Display the Member List ---
const MemberList = ({ campaignId, status, onBack }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/campaigns/${campaignId}/members?status=${status}`);
                if (!response.ok) throw new Error('Failed to load members.');
                const data = await response.json();
                setMembers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [campaignId, status]);

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm text-blue-600 hover:underline mb-4">
                <ChevronLeft size={16} className="mr-1" /> Back to Overview
            </button>
            <h3 className="text-lg font-bold capitalize mb-4">{status} Members</h3>
            {loading && <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {members.length > 0 ? members.map(member => (
                      <li key={member.id} className="p-3 bg-white rounded-md border text-sm">
                        <Link href={`/admin/verify-experience/${member.id}`}>
                          <p className="font-semibold text-gray-800">{member.fullName}</p>
                          <p className="text-gray-500">{member.email}</p>
                        </Link>
                      </li>
                    )) : <p className="text-gray-500">No {status} members found.</p>}
                </ul>
            )}
        </div>
    );
};


export default function CampaignInsightsModal({ campaignId, onClose }) {
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // NEW state to control which member list to show ('verified', 'pending', or null)
  const [viewingMembers, setViewingMembers] = useState(null);

  useEffect(() => {
    if (!campaignId) return;
    const fetchCampaignDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) { const d = await response.json(); throw new Error(d.error); }
        const data = await response.json();
        setCampaignDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaignDetails();
  }, [campaignId]);

  const chartData = campaignDetails ? [
    { name: 'Verified', value: campaignDetails.totalVerified },
    { name: 'Pending', value: campaignDetails.notVerified },
  ] : [];

  const handleClose = () => {
    setViewingMembers(null); // Reset member view on close
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{campaignDetails?.name || "Campaign Insights"}</h2>
            <p className="text-sm text-gray-500">A detailed overview of the campaign's performance.</p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800 transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? ( <LoadingState /> ) : 
           error ? ( <ErrorState message={error} /> ) : 
           viewingMembers ? ( // If we are viewing a member list, render the list component
             <MemberList
                campaignId={campaignId}
                status={viewingMembers}
                onBack={() => setViewingMembers(null)} // The back button sets the view back to null
             />
           ) : campaignDetails && ( // Otherwise, show the main overview
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <StatCard icon={<Users size={24} className="text-white"/>} label="Total Members" value={campaignDetails.totalMembers} colorClass="bg-blue-500" />
                <StatCard icon={<UserCheck size={24} className="text-white"/>} label="Verified Members" value={campaignDetails.totalVerified} colorClass="bg-green-500" onClick={() => setViewingMembers('verified')} />
                <StatCard icon={<UserX size={24} className="text-white"/>} label="Pending Verification" value={campaignDetails.notVerified} colorClass="bg-amber-500" onClick={() => setViewingMembers('pending')} />
              </div>
              <div className="flex flex-col items-center justify-center min-h-[300px] p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Verification Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} fill="#8884d8" paddingAngle={5} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>);
                    }}>
                      <Cell fill={COLORS.verified} /><Cell fill={COLORS.pending} />
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
