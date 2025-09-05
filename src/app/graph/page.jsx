// "use client";
// import React, { useCallback, useState, useEffect } from "react";
// import ReactFlow, {
//   addEdge,
//   Background,
//   Controls,
//   MiniMap,
//   useEdgesState,
//   useNodesState,
//   Handle,
//   Position,
// } from "reactflow";
// import "reactflow/dist/style.css";

// // --- ENUMS AND NODE COMPONENTS ---

// const EdgeLabel = {
//   ALWAYS: "always",
//   TRUE: "true",
//   FALSE: "false",
// };

// // --- Action Node Component (No longer has a delay input) ---
// function ActionNode({ id, data }) {
//   const updateField = (field, value) => {
//     data.onChange(id, { ...data.config, [field]: value });
//   };

//   return (
//     <div className="bg-white border shadow-md rounded-lg p-3 w-60">
//       <h3 className="font-bold text-sm mb-2">Action Node</h3>
//       <label className="block text-xs mb-1">Channel</label>
//       <select
//         value={data.config.channel || 'email'}
//         onChange={(e) => updateField("channel", e.target.value)}
//         className="border rounded w-full p-1 mb-2 text-sm"
//       >
//         <option value="email">Email</option>
//         <option value="sms">SMS</option>
//         <option value="whatsapp">WhatsApp</option>
//         <option value="slack">Slack</option>
//       </select>
//       <label className="block text-xs mb-1">Message</label>
//       <textarea
//         value={data.config.message || ''}
//         onChange={(e) => updateField("message", e.target.value)}
//         rows={3}
//         className="border rounded w-full p-1 text-sm"
//       />
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} />
//     </div>
//   );
// }

// // --- NEW: Dedicated Delay Node Component ---
// function DelayNode({ id, data }) {
//     const updateDelay = (newDelay) => {
//         data.onChange(id, { ...data.config, delay: parseInt(newDelay, 10) || 0 });
//     };

//     return (
//         <div className="bg-yellow-100 border border-yellow-400 shadow-md rounded-lg p-4 w-60 text-center">
//             <h3 className="font-bold text-sm mb-2">Delay</h3>
//             <label className="block text-xs mb-1">Wait for (seconds)</label>
//             <input
//                 type="number"
//                 value={data.config.delay || 0}
//                 onChange={(e) => updateDelay(e.target.value)}
//                 className="border rounded w-full p-1 text-sm text-center"
//             />
//             <Handle type="target" position={Position.Top} />
//             <Handle type="source" position={Position.Bottom} />
//         </div>
//     );
// }

// const nodeTypes = {
//   actionNode: ActionNode,
//   delayNode: DelayNode, // <-- Register the new node type
// };


// // --- MAIN COMPONENT ---
// export default function FlowBuilder() {
//   const [nodes, setNodes, onNodesChange] = useNodesState([]);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
//   const [sessionPrefix, setSessionPrefix] = useState(() => `flow_${Date.now()}`);
//   const [workflowId, setWorkflowId] = useState(null);
//   const [workflowName, setWorkflowName] = useState("New Verification Workflow");
//   const [workflowDescription, setWorkflowDescription] = useState("A workflow for verifying user work experience.");
//   const [companyId, setCompanyId] = useState(null);
//   const [nextEdgeType, setNextEdgeType] = useState(EdgeLabel.ALWAYS);

//   // --- Handlers and Effects (mostly unchanged) ---
//   const addStartNode = (prefix) => {
//     setNodes([{ id: `${prefix}_node-1`, type: "input", data: { label: "Start" }, position: { x: 250, y: 0 } }]);
//   };
  
//   useEffect(() => {
//     const fetchCompany = async () => {
//       try {
//         const response = await fetch('/api/auth/company');
//         if (!response.ok) throw new Error('Failed to fetch company info');
//         const data = await response.json();
//         setCompanyId(data.company.id);
//       } catch (error) { console.error("Error fetching company:", error); }
//     };
//     fetchCompany();
//   }, []);
  
//   useEffect(() => {
//     if (companyId && nodes.length === 0) addStartNode(sessionPrefix);
//   }, [companyId, nodes.length, sessionPrefix]);

//   const onNodesDataChange = useCallback((nodeId, newConfig) => {
//     setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config: newConfig } } : n));
//   }, [setNodes]);

//   const onConnect = useCallback((params) =>
//     setEdges((eds) => addEdge({ ...params, id: `${sessionPrefix}_edge-${Date.now()}`, label: nextEdgeType }, eds)),
//     [setEdges, nextEdgeType, sessionPrefix]
//   );
  
//   const toggleNextEdgeType = () => {
//     const edgeTypes = Object.values(EdgeLabel);
//     setNextEdgeType(edgeTypes[(edgeTypes.indexOf(nextEdgeType) + 1) % edgeTypes.length]);
//   };

//   const addActionStep = () => {
//     const newNodeId = `${sessionPrefix}_node-${nodes.length + 1}`;
//     setNodes((nds) => [
//       ...nds,
//       {
//         id: newNodeId,
//         type: "actionNode",
//         position: { x: 250, y: nds.length * 200 },
//         data: { config: { channel: "email", message: "" }, onChange: onNodesDataChange },
//       },
//     ]);
//   };

//   // --- NEW: Function to add a Delay node ---
//   const addDelayStep = () => {
//     const newNodeId = `${sessionPrefix}_node-${nodes.length + 1}`;
//     setNodes((nds) => [
//         ...nds,
//         {
//             id: newNodeId,
//             type: "delayNode",
//             position: { x: 250, y: nds.length * 150 },
//             data: { config: { delay: 300 }, onChange: onNodesDataChange },
//         },
//     ]);
//   };

//   const resetWorkflow = () => {
//     const newPrefix = `flow_${Date.now()}`;
//     setSessionPrefix(newPrefix);
//     setWorkflowId(null);
//     setEdges([]);
//     addStartNode(newPrefix);
//   };

//   // --- UPDATED: saveFlow to handle the new node type ---
//   const saveFlow = async () => {
//     if (!companyId) {
//       alert("Company ID is not available.");
//       return;
//     }

//     const getNodeTypeForPrisma = (node) => {
//         switch (node.type) {
//             case 'input': return 'START';
//             case 'actionNode': return 'ACTION';
//             case 'delayNode': return 'DELAY';
//             default: return 'ACTION'; // Fallback
//         }
//     };

//     const flowData = {
//       id: workflowId,
//       name: workflowName,
//       description: workflowDescription,
//       companyId: companyId,
//       nodes: nodes.map(node => ({
//         id: node.id,
//         type: getNodeTypeForPrisma(node),
//         positionX: Math.round(node.position.x),
//         positionY: Math.round(node.position.y),
//         config: node.data.config || {},
//       })),
//       edges: edges.map(edge => ({
//         id: edge.id,
//         sourceNodeId: edge.source,
//         targetNodeId: edge.target,
//         condition: edge.label.toUpperCase(),
//       })),
//     };

//     try {
//       const response = await fetch('/api/workflow', {
//         method: workflowId ? 'PUT' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(flowData),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to save');
//       }
//       const result = await response.json();
//       setWorkflowId(result.id);
//       alert(`Workflow ${workflowId ? 'updated' : 'created'}!`);
//     } catch (error) {
//       console.error("Error saving workflow:", error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   // --- RENDER (with the new "Add Delay" button) ---
//   return (
//     <div style={{ width: "100%", height: "100vh" }}>
//       <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md flex flex-col gap-2">
//         <h2 className="text-lg font-bold">Workflow Details</h2>
//         <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Workflow Name" className="border rounded p-2 text-sm"/>
//         <textarea value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)} placeholder="Workflow Description" rows={2} className="border rounded p-2 text-sm"/>
//       </div>
//       <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
//         <MiniMap />
//         <Controls />
//         <Background />
//       </ReactFlow>
//       <div className="absolute bottom-4 left-4 flex gap-4 z-10">
//         <button onClick={resetWorkflow} className="bg-gray-500 text-white px-4 py-2 rounded">
//           Reset / New
//         </button>
//         <button onClick={addActionStep} className="bg-blue-500 text-white px-4 py-2 rounded">
//           Add Action
//         </button>
//         <button onClick={addDelayStep} className="bg-yellow-500 text-white px-4 py-2 rounded">
//           Add Delay
//         </button>
//         <button onClick={saveFlow} className="bg-green-500 text-white px-4 py-2 rounded">
//           Save Flow
//         </button>
//         <button onClick={toggleNextEdgeType} className="bg-purple-500 text-white px-4 py-2 rounded">
//           Next Edge: {nextEdgeType.toUpperCase()}
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useCallback, useState, useEffect } from "react";
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

// --- ENUMS AND NODE COMPONENTS ---

const EdgeLabel = {
  ALWAYS: "always",
  TRUE: "true",
  FALSE: "false",
};

// --- Action Node Component ---
function ActionNode({ id, data }) {
  const updateField = (field, value) => {
    data.onChange(id, { ...data.config, [field]: value });
  };

  return (
    <div className="bg-white border shadow-md rounded-lg p-3 w-60">
      <h3 className="font-bold text-sm mb-2 text-blue-600">Action</h3>
      <label className="block text-xs mb-1">Channel</label>
      <select
        value={data.config.channel || 'email'}
        onChange={(e) => updateField("channel", e.target.value)}
        className="border rounded w-full p-1 mb-2 text-sm"
      >
        <option value="email">Email</option>
        <option value="sms">SMS</option>
        <option value="whatsapp">WhatsApp</option>
      </select>
      <label className="block text-xs mb-1">Message</label>
      <textarea
        value={data.config.message || ''}
        onChange={(e) => updateField("message", e.target.value)}
        rows={3}
        className="border rounded w-full p-1 text-sm"
      />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// --- Delay Node Component ---
function DelayNode({ id, data }) {
    const updateDelay = (newDelay) => {
        data.onChange(id, { ...data.config, delay: parseInt(newDelay, 10) || 0 });
    };

    return (
        <div className="bg-white border shadow-md rounded-lg p-4 w-60 text-center">
            <h3 className="font-bold text-sm mb-2 text-yellow-600">Delay</h3>
            <label className="block text-xs mb-1">Wait for (seconds)</label>
            <input
                type="number"
                value={data.config.delay || 0}
                onChange={(e) => updateDelay(e.target.value)}
                className="border rounded w-full p-1 text-sm text-center"
            />
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

// --- NEW: Condition Node Component ---
function ConditionNode({ id, data }) {
    // This node is purely for branching logic, so it has no editable config.
    // The logic is handled by the edge labels ('TRUE'/'FALSE').
    return (
        <div className="bg-white border-2 border-purple-500 shadow-xl rounded-full p-4 w-48 h-24 flex items-center justify-center text-center">
            <h3 className="font-bold text-sm text-purple-600">Condition</h3>
            <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
            {/* We add custom handles for TRUE and FALSE paths */}
            <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} />
            <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} />
        </div>
    );
}


const nodeTypes = {
  actionNode: ActionNode,
  delayNode: DelayNode,
  conditionNode: ConditionNode, // <-- Register the new node type
};



// --- MAIN COMPONENT ---
export default function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [sessionPrefix, setSessionPrefix] = useState(() => `flow_${Date.now()}`);
  const [workflowId, setWorkflowId] = useState(null);
  const [workflowName, setWorkflowName] = useState("New Verification Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("A workflow for verifying user work experience.");
  const [companyId, setCompanyId] = useState(null);
  const [nextEdgeType, setNextEdgeType] = useState(EdgeLabel.ALWAYS);

  // --- Handlers and Effects ---
  const addStartNode = (prefix) => {
    setNodes([{ id: `${prefix}_node-1`, type: "input", data: { label: "Start" }, position: { x: 250, y: 0 } }]);
  };
  
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch('/api/auth/company');
        if (!response.ok) throw new Error('Failed to fetch company info');
        const data = await response.json();
        setCompanyId(data.company.id);
      } catch (error) { console.error("Error fetching company:", error); }
    };
    fetchCompany();
  }, []);
  
  useEffect(() => {
    if (companyId && nodes.length === 0) addStartNode(sessionPrefix);
  }, [companyId, nodes.length, sessionPrefix]);

  const onNodesDataChange = useCallback((nodeId, newConfig) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config: newConfig } } : n));
  }, [setNodes]);

  const onConnect = useCallback((params) =>
    setEdges((eds) => addEdge({ ...params, id: `${sessionPrefix}_edge-${Date.now()}`, label: nextEdgeType, type: 'smoothstep', markerEnd: { type: 'arrowclosed' } }, eds)),
    [setEdges, nextEdgeType, sessionPrefix]
  );
  
  const toggleNextEdgeType = () => {
    const edgeTypes = Object.values(EdgeLabel);
    setNextEdgeType(edgeTypes[(edgeTypes.indexOf(nextEdgeType) + 1) % edgeTypes.length]);
  };

  // --- Functions to add nodes ---
  const addActionStep = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: `${sessionPrefix}_node-${nds.length + 1}`,
        type: "actionNode",
        position: { x: 250, y: nds.length * 200 },
        data: { config: { channel: "email", message: "" }, onChange: onNodesDataChange },
      },
    ]);
  };

  const addDelayStep = () => {
    setNodes((nds) => [
        ...nds,
        {
            id: `${sessionPrefix}_node-${nds.length + 1}`,
            type: "delayNode",
            position: { x: 250, y: nds.length * 150 },
            data: { config: { delay: 300 }, onChange: onNodesDataChange },
        },
    ]);
  };
  
  // --- NEW: Function to add a Condition node ---
  const addConditionStep = () => {
    setNodes((nds) => [
        ...nds,
        {
            id: `${sessionPrefix}_node-${nds.length + 1}`,
            type: "conditionNode",
            position: { x: 250, y: nds.length * 150 },
            data: { config: {}, onChange: onNodesDataChange },
        },
    ]);
  };


  const resetWorkflow = () => {
    const newPrefix = `flow_${Date.now()}`;
    setSessionPrefix(newPrefix);
    setWorkflowId(null);
    setEdges([]);
    addStartNode(newPrefix);
  };

  // --- UPDATED: saveFlow to handle all node types ---
  const saveFlow = async () => {
    if (!companyId) {
      alert("Company ID is not available.");
      return;
    }

    const getNodeTypeForPrisma = (node) => {
        switch (node.type) {
            case 'input': return 'START';
            case 'actionNode': return 'ACTION';
            case 'delayNode': return 'DELAY';
            case 'conditionNode': return 'CONDITION'; // <-- Handle the new type
            default: return 'ACTION';
        }
    };

    const flowData = {
      id: workflowId,
      name: workflowName,
      description: workflowDescription,
      companyId: companyId,
      nodes: nodes.map(node => ({
        id: node.id,
        type: getNodeTypeForPrisma(node),
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
        config: node.data.config || {},
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        condition: edge.label.toUpperCase(),
      })),
    };

    try {
      const response = await fetch('/api/workflow', {
        method: workflowId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }
      const result = await response.json();
      setWorkflowId(result.id);
      alert(`Workflow ${workflowId ? 'updated' : 'created'}!`);
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // --- RENDER (with the new "Add Condition" button) ---
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md flex flex-col gap-2">
        <h2 className="text-lg font-bold">Workflow Details</h2>
        <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Workflow Name" className="border rounded p-2 text-sm"/>
        <textarea value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)} placeholder="Workflow Description" rows={2} className="border rounded p-2 text-sm"/>
      </div>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <div className="absolute bottom-4 left-4 flex gap-4 z-10">
        <button onClick={resetWorkflow} className="bg-gray-500 text-white px-4 py-2 rounded">
          Reset / New
        </button>
        <button onClick={addActionStep} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Action
        </button>
        <button onClick={addDelayStep} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Add Delay
        </button>
        <button onClick={addConditionStep} className="bg-purple-600 text-white px-4 py-2 rounded">
            Add Condition
        </button>
        <button onClick={saveFlow} className="bg-green-500 text-white px-4 py-2 rounded">
          Save Flow
        </button>
        <button onClick={toggleNextEdgeType} className="bg-purple-500 text-white px-4 py-2 rounded">
          Next Edge: {nextEdgeType.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
