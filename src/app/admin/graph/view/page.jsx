"use client";
import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  Handle,
  Position,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import Swal from 'sweetalert2';
import LoadingGlass from '@/app/components/LoadingGlass';

// --- Custom Node Components (Unchanged) ---
const ActionNode = ({ data }) => (
    <div className="bg-white border shadow-md rounded-lg p-3 w-64">
        <h3 className="font-bold text-sm mb-2 text-blue-600">Action</h3>
        <p className="text-xs text-gray-500">Channel: {data.config.channel}</p>
        {data.config.channel === 'email' ? (
            <p className="text-xs text-gray-500">Template ID: {data.config.templateId || 'N/A'}</p>
        ) : (
            <p className="text-xs text-gray-500 truncate">Message: {data.config.message}</p>
        )}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
    </div>
);

const DelayNode = ({ data }) => (
    <div className="bg-white border shadow-md rounded-lg p-4 w-60 text-center">
        <h3 className="font-bold text-sm mb-2 text-yellow-600">Delay</h3>
        <p className="text-lg font-mono">{data.config.delay || 0}s</p>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
    </div>
);

const ConditionNode = ({ data }) => (
     <div className="bg-white border-2 border-purple-500 shadow-xl rounded-full p-4 w-48 h-24 flex items-center justify-center text-center">
      <h3 className="font-bold text-sm text-purple-600">Condition</h3>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} />
    </div>
);

// --- React Flow Viewer (Unchanged) ---
function FlowViewer({ workflow, onBack }) {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  useEffect(() => {
    if (!workflow) return;
    const initialNodes = workflow.nodes.map(node => ({
      id: node.id,
      type: `${node.type.toLowerCase()}Node`,
      position: { x: node.positionX, y: node.positionY },
      data: { config: node.config },
    }));
    setNodes(initialNodes);

    const initialEdges = workflow.edges.map(edge => ({
      id: edge.id, source: edge.sourceNodeId, target: edge.targetNodeId,
      label: edge.condition.toLowerCase(), type: 'smoothstep', markerEnd: { type: 'arrowclosed' }
    }));
    setEdges(initialEdges);
  }, [workflow, setNodes, setEdges]);
  
  const nodeTypes = { actionNode: ActionNode, delayNode: DelayNode, conditionNode: ConditionNode };

  return (
    <div className="relative w-full h-[80vh] border rounded-lg bg-gray-50">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md">
        <button onClick={onBack} className="bg-gray-200 text-gray-800 px-4 py-2 rounded mb-4 hover:bg-gray-300 transition-colors">
          &larr; Back to List
        </button>
        <h2 className="text-lg font-bold">{workflow.name}</h2>
        <p className="text-sm text-gray-600">{workflow.description}</p>
      </div>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView nodesDraggable={false} nodesConnectable={false}>
        <MiniMap /> <Controls showInteractive={false} /> <Background />
      </ReactFlow>
    </div>
  );
}

// --- Enhanced WorkExperienceTrigger Component ---
const WorkExperienceTrigger = ({ companyId, workflowId, workflowName }) => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExperiences = async () => {
            if (!companyId) return;
            setLoading(true);
            try {
                const response = await fetch(`/api/experience?companyId=${companyId}`);
                if (!response.ok) throw new Error('Failed to fetch work experiences.');
                const data = await response.json();
                setExperiences(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchExperiences();
    }, [companyId]);
    
    // Memoized filtering for performance
    const filteredExperiences = useMemo(() => {
        if (!searchTerm) return experiences;
        const lowercasedFilter = searchTerm.toLowerCase();
        return experiences.filter(exp => 
            exp.user?.fullName?.toLowerCase().includes(lowercasedFilter) ||
            exp.role.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, experiences]);

    const handleTrigger = async (experienceId) => {
        Swal.fire({
            title: 'Trigger Workflow?',
            text: `This will start the "${workflowName}" workflow for this experience.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, trigger it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('/api/worker/workflow/trigger-by-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ companyId, workExperienceId: experienceId, workflowId }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || "API call failed.");
                    Swal.fire('Success!', data.message, 'success');
                } catch (err) {
                    Swal.fire('Error!', err.message, 'error');
                }
            }
        });
    };
    
    const handleTriggerAll = async () => {
        const experienceCount = filteredExperiences.length;
        if (experienceCount === 0) {
            Swal.fire('No Experiences', 'There are no experiences to trigger.', 'info');
            return;
        }

        Swal.fire({
            title: `Trigger for ${experienceCount} experience(s)?`,
            text: `This will start the "${workflowName}" workflow for all currently visible experiences.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, trigger all!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                const allIds = filteredExperiences.map(exp => exp.id);
                // Here you would typically call a bulk API endpoint.
                // For now, we'll loop, but a single API call is better for production.
                Swal.fire({
                    title: 'Processing...',
                    text: 'Triggering workflows. Please wait.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const promises = allIds.map(id => 
                    fetch('/api/worker/workflow/trigger-by-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ companyId, workExperienceId: id, workflowId }),
                    })
                );

                const results = await Promise.all(promises);
                const failed = results.filter(res => !res.ok);

                if (failed.length > 0) {
                    Swal.fire('Partial Success', `${results.length - failed.length} workflows triggered, but ${failed.length} failed.`, 'warning');
                } else {
                    Swal.fire('Success!', `Successfully triggered workflows for all ${results.length} experiences.`, 'success');
                }
            }
        });
    };

    if (loading) return <div className="p-4 text-center">Loading experiences...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="mt-6 p-4 border-t">
            <h3 className="text-xl font-semibold mb-4">Trigger for Company Experiences</h3>
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <input
                    type="search"
                    placeholder="Search by employee name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleTriggerAll}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                >
                    Trigger for All ({filteredExperiences.length})
                </button>
            </div>
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredExperiences.length > 0 ? filteredExperiences.map(exp => (
                    <li key={exp.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-800">{exp.role} at {exp.companyName}</p>
                            <p className="text-sm text-gray-500">Employee: {exp.user?.fullName || 'N/A'}</p>
                        </div>
                        <button 
                            onClick={() => handleTrigger(exp.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors"
                        >
                            Trigger
                        </button>
                    </li>
                )) : <p className="text-gray-500 text-center py-4">No matching work experiences found.</p>}
            </ul>
        </div>
    );
};


// --- Main Page Component (Updated Logic) ---
export default function WorkflowManagementPage() {
  const [workflows, setWorkflows] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch('/api/auth/company');
        if (!response.ok) throw new Error('Failed to fetch company info');
        const data = await response.json();
        setCompanyId(data.company.id);
      } catch (error) { setError("Could not load company information."); }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    if (!companyId) return;
    const fetchWorkflows = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/workflow?companyId=${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch workflows.');
        const data = await response.json();
        setWorkflows(data.workflows);
      } catch (e) { setError(e.message); } 
      finally { setLoading(false); }
    };
    fetchWorkflows();
  }, [companyId]);
  
  if (loading) return <LoadingGlass />;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Workflow Management</h1>
      {selectedWorkflow ? (
        <>
            <FlowViewer 
                workflow={selectedWorkflow} 
                onBack={() => setSelectedWorkflow(null)} 
            />
            <WorkExperienceTrigger 
                companyId={companyId} 
                workflowId={selectedWorkflow.id}
                workflowName={selectedWorkflow.name}
            />
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.length > 0 ? (
            workflows.map(workflow => (
              <div 
                key={workflow.id} 
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                  <h2 className="text-lg font-semibold text-blue-700 truncate">{workflow.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 truncate">{workflow.description || "No description"}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No workflows found for your company.</p>
          )}
        </div>
      )}
    </div>
  );
}
