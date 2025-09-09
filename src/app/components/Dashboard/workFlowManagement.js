"use client";
import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import Swal from 'sweetalert2';
import LoadingGlass from '@/app/components/LoadingGlass';

// --- Custom Node Components ---
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

// --- React Flow Viewer Component ---
function FlowViewer({ workflow, onBack }) {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    if (!workflow) return;
    const initialNodes = workflow.nodes.map(node => ({
      id: node.id, type: `${node.type.toLowerCase()}Node`,
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

// --- Updated Workflow List Item Component ---
const WorkflowListItem = ({ workflow, experienceId, onView, onAssignSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Reusable function to call API endpoints
  const callApi = async (endpoint) => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workExperienceId: parseInt(experienceId), workflowId: workflow.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'API call failed.');
      }
      Swal.fire('Success!', result.message, 'success');
      onAssignSuccess(result);
    } catch (error) {
      console.error('API call error:', error);
      Swal.fire('Error!', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for the "Assign" button
  const handleAssign = () => {
    Swal.fire({
      title: 'Assign Workflow?',
      text: `This will start the "${workflow.name}" workflow from the beginning for this experience.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, assign it!'
    }).then((result) => {
      if (result.isConfirmed) {
        callApi('/api/worker/workflow/retrigger');
      }
    });
  };

  // Handler for the "Retry" button
  const handleRetry = () => {
    Swal.fire({
      title: 'Retry Workflow?',
      text: `This will trigger the workflow "${workflow.name}" from its last known step.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, retry!'
    }).then((result) => {
      if (result.isConfirmed) {
        callApi('/api/worker/workflow/trigger');
      }
    });
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <div className="p-4 border-b flex-grow">
        <h2 className="text-lg font-semibold text-blue-800">{workflow.name}</h2>
        <p className="text-sm text-gray-500 mt-1">{workflow.description || "No description."}</p>
      </div>
      <div className="p-4 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center space-x-2">
           <button onClick={() => onView(workflow)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-300">
            View
          </button>
          <button onClick={handleAssign} disabled={isLoading} className={`bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isLoading ? '...' : 'Assign'}
          </button>
          <button onClick={handleRetry} disabled={isLoading} className={`bg-indigo-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-indigo-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isLoading ? '...' : 'Retry'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function WorkflowManagementPage({ experienceId }) {
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
    if (companyId) fetchWorkflows();
  }, [companyId]);
  
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

  const handleAssignSuccess = (newProgressRecord) => {
    console.log("API call successful:", newProgressRecord);
    fetchWorkflows(); // Refresh the list to show updated active run counts
  };
  
  if (loading) return <LoadingGlass />;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {!selectedWorkflow && (
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Assign or Retry Workflow</h1>
      )}

      {selectedWorkflow ? (
        <FlowViewer workflow={selectedWorkflow} onBack={() => setSelectedWorkflow(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.length > 0 ? (
            workflows.map(workflow => (
              <WorkflowListItem 
                key={workflow.id} 
                workflow={workflow} 
                experienceId={experienceId}
                onView={setSelectedWorkflow}
                onAssignSuccess={handleAssignSuccess}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No workflows found for your company.</p>
          )}
        </div>
      )}
    </div>
  );
}
