'use client'
import { useState, Fragment } from 'react';
import {
  CheckCircle,
  User,
  Settings,
  LogOut,
  Search,
  Download,
  ChevronDown,
  FileText
} from 'lucide-react';

// --- Helper Components & Constants ---

const BRAND_NAME = "Vettify";

const PALETTE = {
  primary: {
    DEFAULT: '#1A73E8',
    dark: '#0D47A1',
  },
  neutral: {
    light: '#F8FAFC',
    DEFAULT: '#FFFFFF',
    dark: '#374151'
  },
  status: {
    verified: { bg: '#D1FAE5', text: '#065F46' }, // Green
    pending: { bg: '#FEF3C7', text: '#92400E' },  // Yellow
    failed: { bg: '#FEE2E2', text: '#991B1B' },   // Red
  }
};

// --- Mock Data (replace with API data in a real app) ---

const initialEmployees = [
  { id: 'emp_001', name: 'Alia Bhatt', employeeId: 'VTY-8821', department: 'Marketing', status: 'Verified' },
  { id: 'emp_002', name: 'Ranbir Kapoor', employeeId: 'VTY-8822', department: 'Engineering', status: 'Pending' },
  { id: 'emp_003', name: 'Deepika Padukone', employeeId: 'VTY-8823', department: 'Product', status: 'Failed' },
  { id: 'emp_004', name: 'Shah Rukh Khan', employeeId: 'VTY-8824', department: 'Executive', status: 'Verified' },
  { id: 'emp_005', name: 'Priyanka Chopra', employeeId: 'VTY-8825', department: 'Sales', status: 'Pending' },
  { id: 'emp_006', name: 'Hrithik Roshan', employeeId: 'VTY-8826', department: 'Finance', status: 'Verified' },
  { id: 'emp_007', name: 'Kareena Kapoor', employeeId: 'VTY-8827', department: 'Human Resources', status: 'Failed' },
  { id: 'emp_008', name: 'Varun Dhawan', employeeId: 'VTY-8828', department: 'Engineering', status: 'Pending' },
  { id: 'emp_009', name: 'Katrina Kaif', employeeId: 'VTY-8829', department: 'Marketing', status: 'Verified' },
  { id: 'emp_010', name: 'Ayushmann Khurrana', employeeId: 'VTY-8830', department: 'Design', status: 'Pending' },
  { id: 'emp_011', name: 'Anushka Sharma', employeeId: 'VTY-8831', department: 'Product', status: 'Verified' },
  { id: 'emp_012', name: 'Vicky Kaushal', employeeId: 'VTY-8832', department: 'Engineering', status: 'Failed' },
  { id: 'emp_013', name: 'Rajkummar Rao', employeeId: 'VTY-8833', department: 'Legal', status: 'Verified' },
  { id: 'emp_014', name: 'Sonam Kapoor', employeeId: 'VTY-8834', department: 'Public Relations', status: 'Pending' },
  { id: 'emp_015', name: 'Sidharth Malhotra', employeeId: 'VTY-8835', department: 'Operations', status: 'Verified' },
  { id: 'emp_016', name: 'Taapsee Pannu', employeeId: 'VTY-8836', department: 'Sales', status: 'Failed' },
  { id: 'emp_017', name: 'Nawazuddin Siddiqui', employeeId: 'VTY-8837', department: 'Research', status: 'Verified' },
  { id: 'emp_018', name: 'Yami Gautam', employeeId: 'VTY-8838', department: 'Finance', status: 'Pending' },
  { id: 'emp_019', name: 'Arjun Kapoor', employeeId: 'VTY-8839', department: 'Engineering', status: 'Verified' },
  { id: 'emp_020', name: 'Madhuri Dixit', employeeId: 'VTY-8840', department: 'Executive', status: 'Verified' },
];

// --- Main Dashboard Component ---

export default function EmployeeVerificationDashboard() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredEmployees = employees.filter(emp => {
    const searchMatch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'All' || emp.status === statusFilter;
    return searchMatch && statusMatch;
  });
  
  const startNewVerification = () => {
    // In a real app, this would open a modal or navigate to a new page
    alert("Starting a new verification flow...");
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: PALETTE.neutral.light }}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitleActions
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        <div className="mt-8">
          {filteredEmployees.length > 0 ? (
            <EmployeeTable employees={filteredEmployees} />
          ) : (
            <EmptyState onStartVerification={startNewVerification} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- Section Sub-Components ---

const Header = () => (
  <nav className="sticky top-0 z-40 w-full bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <span className="text-xl font-bold flex items-center" style={{ color: PALETTE.primary.DEFAULT }}>
            <CheckCircle className="h-6 w-6 mr-2" />
            {BRAND_NAME}
          </span>
        </div>
        <div className="flex items-center">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 ml-2">
            <LogOut className="h-5 w-5" />
          </button>
          <div className="ml-4 flex items-center">
            <img className="h-8 w-8 rounded-full" src="https://i.pravatar.cc/40" alt="User" />
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const PageTitleActions = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => (
  <div className='sticky -top-5 bg-blur '>
    <h1 className="text-3xl font-bold text-gray-900">Employee Verification Dashboard</h1>
    <p className="mt-1 text-gray-600">Track, manage, and download verification reports with ease.</p>
    <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-100">
      <div className="relative flex-1 ">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full md:w-auto bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shadow-sm transition-colors" style={{ backgroundColor: PALETTE.primary.DEFAULT }}>
          <Download className="h-4 w-4" />
          <span>Download All</span>
        </button>
      </div>
    </div>
  </div>
);

const EmployeeTable = ({ employees }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[80vh]">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee, index) => (
            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{employee.employeeId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <StatusBadge status={employee.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <ActionButton status={employee.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const EmptyState = ({ onStartVerification }) => (
    <div className="text-center bg-white rounded-lg shadow-md py-20 px-6">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No verifications triggered yet.</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by initiating a new employee verification.</p>
        <div className="mt-6">
            <button
                onClick={onStartVerification}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white"
                style={{ backgroundColor: PALETTE.primary.DEFAULT }}
            >
                Start New Verification
            </button>
        </div>
    </div>
);

const Footer = () => (
    <footer style={{ backgroundColor: PALETTE.primary.dark, color: PALETTE.neutral.DEFAULT }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 ">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <span className="font-semibold">{BRAND_NAME} — Secure, Simple, Seamless.</span>
                <nav className="flex gap-6 text-sm">
                    <a href="#" className="opacity-80 hover:opacity-100">Privacy Policy</a>
                    <a href="#" className="opacity-80 hover:opacity-100">Terms of Service</a>
                </nav>
            </div>
            <div className="mt-6 pt-6 border-t border-blue-900 text-center text-sm opacity-70">
                &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </div>
        </div>
    </footer>
);

// --- Reusable UI Elements ---

const StatusBadge = ({ status }) => {
  const style = PALETTE.status[status.toLowerCase()] || {};
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
};

const ActionButton = ({ status }) => {
  const isPending = status === 'Pending';
  return (
    <button
      disabled={isPending}
      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
        isPending
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'text-white hover:bg-opacity-90'
      }`}
      style={!isPending ? { backgroundColor: PALETTE.primary.DEFAULT } : {}}
    >
      Download Report
    </button>
  );
};
