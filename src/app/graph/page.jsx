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

function ActionNode({ id, data }) {
  const updateField = (field, value) => {
  const newConfig = { ...data.config, [field]: value };
  console.log("Updating field", field, "to", value, newConfig);
  data.onChange(id, { ...data.config, [field]: value });
  };

  const handleTemplateChange = (e) => {
    const selectedTemplateId = e.target.value;
    const selectedTemplate = data.emailTemplates.find(t => t.id === parseInt(selectedTemplateId, 10));

    if (selectedTemplate) {
      // When a template is selected, update both the message and the templateId
      console.log("selectedTemplate is" , selectedTemplate)
      updateField("templateId", selectedTemplate.id);
      updateField("message", selectedTemplate.body);

    } else {
      // If "-- Custom Message --" is selected, clear the message and templateId
      updateField("message", "");
      updateField("templateId", null);
    }
  };

  const isEmailChannel = data.config.channel === 'email';
  console.log("data is" , data.config)

  return (
    <div className="bg-white border shadow-md rounded-lg p-3 w-64">
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

      {/* --- Conditional UI for Email Channel --- */}
      {isEmailChannel ? (
        <>
          <label className="block text-xs mb-1">Email Template</label>
          <select
            value={data.config.templateId || ''}
            onChange={handleTemplateChange}
            className="border rounded w-full p-1 mb-2 text-sm"
          >
            <option value="">-- Type a Custom Message --</option>
            {data.emailTemplates?.map(template => (
              // The option value is the template's unique ID
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Select a template or type a custom message..."
            value={data.config.message || ''}
            onChange={(e) => {
              // When the user types, clear the templateId selection
              updateField("message", e.target.value);
              updateField("templateId", null);
            }}
            rows={3}
            className="border rounded w-full p-1 text-sm mb-2"
          />
          <button
            onClick={() => data.onPreview(data.config.message)}
            disabled={!data.config.message}
            className="w-full text-xs bg-gray-200 hover:bg-gray-300 py-1 rounded"
          >
            Preview Email
          </button>
        </>
      ) : (
        <>
          <label className="block text-xs mb-1">Message</label>
          <textarea
            value={data.config.message || ''}
            onChange={(e) => updateField("message", e.target.value)}
            rows={3}
            className="border rounded w-full p-1 text-sm"
          />
        </>
      )}
      {/* --- End Conditional UI --- */}

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

// --- Condition Node Component ---
function ConditionNode({ id, data }) {
    return (
        <div className="bg-white border-2 border-purple-500 shadow-xl rounded-full p-4 w-48 h-24 flex items-center justify-center text-center">
            <h3 className="font-bold text-sm text-purple-600">Condition</h3>
            <Handle type="target" position={Position.Top} style={{ borderRadius: 0 }} />
            <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} />
            <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} />
        </div>
    );
}

const nodeTypes = {
  actionNode: ActionNode,
  delayNode: DelayNode,
  conditionNode: ConditionNode,
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

  // --- New state for email templates and preview modal ---
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [previewHtml, setPreviewHtml] = useState(null);

  // --- Handlers and Effects ---
  const addStartNode = (prefix) => {
    setNodes([{ id: `${prefix}_node-1`, type: "input", data: { label: "Start" }, position: { x: 250, y: 0 } }]);
  };
  
  useEffect(() => {
    // --- Updated to fetch company and templates ---
    const fetchInitialData = async () => {
      try {
        const companyResponse = await fetch('/api/auth/company');
        if (!companyResponse.ok) throw new Error('Failed to fetch company info');
        const companyData = await companyResponse.json();
        const cid = companyData.company.id;
        setCompanyId(cid);

        if (cid) {
          const templateResponse = await fetch(`/api/templates?companyId=${cid}`);
          if (templateResponse.ok) {
            const templateData = await templateResponse.json();
            setEmailTemplates(templateData.templates);
          } else {
            console.error("Failed to fetch email templates");
          }
        }
      } catch (error) { 
        console.error("Error fetching initial data:", error); 
      }
    };
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (companyId && nodes.length === 0) addStartNode(sessionPrefix);
  }, [companyId, nodes.length, sessionPrefix]);

  const onNodesDataChange = useCallback((nodeId, newConfig) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, config: newConfig } } : n));
  }, [setNodes]);

  const handlePreview = (html) => {
    setPreviewHtml(html);
  };

  const onConnect = useCallback((params) =>
    setEdges((eds) => addEdge({ ...params, id: `${sessionPrefix}_edge-${Date.now()}`, label: nextEdgeType, type: 'smoothstep', markerEnd: { type: 'arrowclosed' } }, eds)),
    [setEdges, nextEdgeType, sessionPrefix]
  );
  
  const toggleNextEdgeType = () => {
    const edgeTypes = Object.values(EdgeLabel);
    setNextEdgeType(edgeTypes[(edgeTypes.indexOf(nextEdgeType) + 1) % edgeTypes.length]);
  };

  // --- Updated to pass templates and preview handler to ActionNode ---
  const addActionStep = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: `${sessionPrefix}_node-${nds.length + 1}`,
        type: "actionNode",
        position: { x: 250, y: nds.length * 220 },
        data: { 
          config: { channel: "email", message: "" }, 
          onChange: onNodesDataChange,
          emailTemplates: emailTemplates,
          onPreview: handlePreview,
        },
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
            case 'conditionNode': return 'CONDITION';
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

  // --- RENDER ---
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* --- Preview Modal --- */}
      {previewHtml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white p-4 rounded-lg shadow-2xl max-w-4xl w-full m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">Email Preview</h3>
              <button 
                onClick={() => setPreviewHtml(null)}
                className="text-gray-500 hover:text-gray-800 font-bold text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="border rounded p-4 h-[70vh] overflow-y-auto bg-gray-50"
                 dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}

      {/* --- Main UI --- */}
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
