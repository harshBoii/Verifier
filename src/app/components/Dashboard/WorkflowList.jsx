'use client';

import { useState, useEffect } from 'react';
import { FaSyncAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Component for the status badge
const StatusBadge = ({ status }) => {
    let bgColor, textColor, Icon;

    switch (status.toLowerCase()) {
        case 'in-progress':
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            Icon = FaSyncAlt;
            break;
        case 'completed':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            Icon = FaCheckCircle;
            break;
        default:
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            Icon = FaExclamationCircle;
            break;
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
            <Icon className={`mr-2 ${status.toLowerCase() === 'in-progress' ? 'animate-spin' : ''}`} />
            {status.replace(/_/g, ' ')}
        </span>
    );
};

// Main Component
export default function WorkflowList({ experienceId }) {
    const [workflows, setWorkflows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!experienceId) {
            setIsLoading(false);
            setError('No experience ID provided.');
            return;
        }

        async function fetchWorkflows() {
            try {
                const response = await fetch(`/api/experience/${experienceId}/workflows`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data.');
                }
                const data = await response.json();
                setWorkflows(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchWorkflows();
    }, [experienceId]);

    if (isLoading) {
        return <div className="text-center p-10 text-gray-500">Loading workflows...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    if (workflows.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">No Workflows Found</h3>
                <p className="mt-2 text-sm text-gray-500">There are no active or completed workflows for this work experience.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Active Workflows</h2>
                <p className="text-sm text-gray-600 mt-1">A log of all automated processes related to this work experience.</p>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
                {workflows.map((progress) => (
                    <li key={progress.id} className="p-6 hover:bg-blue-50 transition-colors duration-150">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-semibold text-blue-700 truncate">{progress.workflow.name}</p>
                                <p className="mt-1 text-sm text-gray-500 truncate">{progress.workflow.description || 'No description available.'}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <StatusBadge status={progress.status} />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium text-gray-900">Company:</span> {progress.workflow.company.name}
                            </div>
                            <div>
                                <span className="font-medium text-gray-900">Started On:</span> {formatDate(progress.startedAt)}
                            </div>
                            <div>
                                <span className="font-medium text-gray-900">Last Update:</span> {formatDate(progress.completedAt || progress.workflow.updatedAt)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

