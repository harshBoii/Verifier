'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Loader2, Search } from 'lucide-react';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingGlass from '@/app/components/LoadingGlass';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Header from '@/app/components/Dashboard/Header';

// --- STATUS BADGE ---
const StatusBadge = ({ label, isVerified }) => {
  let icon, color, bg;
  if (isVerified) {
    icon = <FiCheckCircle className="text-green-600" />;
    color = "text-green-700";
    bg = "bg-green-100";
  } else if (isVerified === false) {
    icon = <FiXCircle className="text-red-600" />;
    color = "text-red-700";
    bg = "bg-red-100";
  } else {
    icon = <FiClock className="text-yellow-600" />;
    color = "text-yellow-700";
    bg = "bg-yellow-100";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
      {icon} {label}
    </span>
  );
};

export default function EmployeesVerificationPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/company-employees');
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data || []);
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Search filter
  const filteredEmployees = useMemo(() => {
    if (!search) return employees;
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <Header user={{ name: 'Admin' }} />

        {/* Title + Search */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Employees Verification</h1>
            <p className="text-sm text-gray-500">Manage and track verification status of all employees.</p>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-72 rounded-md border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <LoadingGlass className="py-20" />
          ) : filteredEmployees.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Employee</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Role</th>
                  <th className="px-6 py-3 text-left font-medium">Company</th>
                  <th className="px-6 py-3 text-center font-medium">Verifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Image
                        src={emp.profilePicture || `https://ui-avatars.com/api/?name=${emp.name?.replace(' ', '+')}`}
                        alt={emp.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                      />
                      <span className="font-medium text-gray-900">{emp.name}</span>
                    </td>
                    <td className="px-6 py-4">{emp.email}</td>
                    <td className="px-6 py-4">{emp.role || '-'}</td>
                    <td className="px-6 py-4">{emp.companyName}</td>
                    <td className="px-6 py-4 text-center">
                    <div className="flex flex-wrap justify-center gap-4">
                        <StatusBadge label="Profile" isVerified={emp.status === 'verified'} />
                        <StatusBadge label="Address" isVerified={emp.addressVerification?.isVerified} />
                        <StatusBadge label="Bank" isVerified={emp.bankVerification?.isVerified} />
                        <StatusBadge label="PF" isVerified={emp.pfVerification?.isVerified} />
                    </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-8 text-center text-gray-500">No employees found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
