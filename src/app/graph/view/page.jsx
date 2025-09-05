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


// You would typically move these node components to a separate file (e.g., /components/workflow/nodes.jsx)
// --- START NODE COMPONENTS ---
const EdgeLabel = { ALWAYS: "always", TRUE: "true", FALSE: "false" };

function ActionNode({ id, data }) {
  const isEmailChannel = data.config.channel === 'email';
  return (
    <div className="bg-white border shadow-md rounded-lg p-3 w-64">
      <h3 className="font-bold text-sm mb-2 text-blue-600">Action</h3>
      <p className="text-xs text-gray-500 mb-2">Channel: {data.config.channel}</p>
      {isEmailChannel ? (
         <p className="text-xs text-gray-500">Template ID: {data.config.templateId || 'N/A'}</p>
      ) : (
         <p className="text-xs text-gray-500 truncate">Message: {data.config.message}</p>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function DelayNode({ id, data }) {
  return (
    <div className="bg-white border shadow-md rounded-lg p-4 w-60 text-center">
      <h3 className="font-bold text-sm mb-2 text-yellow-600">Delay</h3>
      <p className="text-lg font-mono">{data.config.delay || 0}s</p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function ConditionNode({ id, data }) {
  return (
    <div className="bg-white border-2 border-purple-500 shadow-xl rounded-full p-4 w-48 h-24 flex items-center justify-center text-center">
      <h3 className="font-bold text-sm text-purple-600">Condition</h3>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} />
    </div>
  );
}
// --- END NODE COMPONENTS ---


// Main component to render a single workflow in React Flow
function FlowViewer({ workflow, onBack }) {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    if (workflow) {
      // Transform the database nodes into the format React Flow expects
      const initialNodes = workflow.nodes.map(node => ({
        id: node.id,
        type: node.type === 'START' ? 'input' : `${node.type.toLowerCase()}Node`,
        position: { x: node.positionX, y: node.positionY },
        data: { label: node.type === 'START' ? 'Start' : undefined, config: node.config },
      }));
      setNodes(initialNodes);

      // Transform the database edges
      const initialEdges = workflow.edges.map(edge => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.condition.toLowerCase(),
        type: 'smoothstep',
        markerEnd: { type: 'arrowclosed' }
      }));
      setEdges(initialEdges);
    }
  }, [workflow, setNodes, setEdges]);
  
  const nodeTypes = { actionNode: ActionNode, delayNode: DelayNode, conditionNode: ConditionNode };

  return (
    <div className="relative w-full h-[80vh] border rounded-lg">
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md">
        <button onClick={onBack} className="bg-gray-500 text-white px-4 py-2 rounded mb-4">
          &larr; Back to List
        </button>
        <h2 className="text-lg font-bold">{workflow.name}</h2>
        <p className="text-sm text-gray-600">{workflow.description}</p>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <MiniMap />
        <Controls showInteractive={false} />
        <Background />
      </ReactFlow>
    </div>
  );
}


// A component for a single item in the workflow list
const WorkflowListItem = ({ workflow, onView }) => (
  <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="p-4 border-b">
      <h2 className="text-lg font-semibold">{workflow.name}</h2>
      <p className="text-sm text-gray-500">{workflow.description}</p>
    </div>
    <div className="p-4 flex justify-between items-center">
      <span className="text-xs text-gray-500">
        {workflow.workExperienceProgress.length} active experience(s)
      </span>
      <button
        onClick={() => onView(workflow)}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        View Flow
      </button>
    </div>
  </div>
);


// The main page that manages the view
export default function WorkflowManagementPage() {
  const [workflows, setWorkflows] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State to manage which view is active
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Fetch company ID on mount
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch('/api/auth/company');
        if (!response.ok) throw new Error('Failed to fetch company info');
        const data = await response.json();
        setCompanyId(data.company.id);
      } catch (error) {
        setError("Could not load company information.");
      }
    };
    fetchCompany();
  }, []);

  // Fetch workflows when company ID is available
  useEffect(() => {
    if (!companyId) return;
    const fetchWorkflows = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the same efficient endpoint from before
        const response = await fetch(`/api/workflow?companyId=${companyId}`);
        if (!response.ok) throw new Error('Failed to fetch workflows.');
        const data = await response.json();
        setWorkflows(data.workflows);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, [companyId]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Workflow Management</h1>

      {selectedWorkflow ? (
        // If a workflow is selected, show the FlowViewer
        <FlowViewer 
          workflow={selectedWorkflow} 
          onBack={() => setSelectedWorkflow(null)} 
        />
      ) : (
        // Otherwise, show the list of workflows
        <div className="space-y-6">
          {workflows.length === 0 ? (
            <p>No workflows have been created yet.</p>
          ) : (
            workflows.map(workflow => (
              <WorkflowListItem 
                key={workflow.id} 
                workflow={workflow} 
                onView={setSelectedWorkflow}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
