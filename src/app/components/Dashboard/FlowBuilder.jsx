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
import Swal from "sweetalert2";
import { FaWhatsapp , FaSms , FaPen , FaPencilAlt } from "react-icons/fa";
// --- TIPTAP IMPORTS ---
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FiMail } from "react-icons/fi";

// --- ENUMS ---
const EdgeLabel = {
  ALWAYS: "always",
  TRUE: "true",
  FALSE: "false",
};

// --- TIPTAP EDITOR COMPONENT ---
const TiptapEditor = ({ content, onChange, onFocus }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      onFocus();
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className="border rounded w-full p-2 text-sm mb-2 prose max-w-none h-24 overflow-y-auto">
        <EditorContent editor={editor} />
    </div>
  );
};

// --- ACTION NODE COMPONENT (with Tiptap & Icons) ---
function ActionNode({ id, data }) {
  const handleTemplateChange = (e) => {
    const selectedTemplateId = e.target.value ? Number(e.target.value) : null;
    const selectedTemplate = data.emailTemplates.find(
      (t) => t.id === selectedTemplateId
    );
    if (selectedTemplate) {
      data.onChange(id, {
        ...data.config,
        templateId: selectedTemplate.id,
        message: selectedTemplate.body,
      });
    } else {
      data.onChange(id, {
        ...data.config,
        templateId: null,
        message: "",
      });
    }
  };

  const handleContentChange = (newContent) => {
    data.onChange(id, {
      ...data.config,
      message: newContent,
      templateId: null,
    });
  };

  const handleEditorFocus = () => {
    if (data.config.templateId !== null) {
      data.onChange(id, { ...data.config, templateId: null });
    }
  };

  const isEmailChannel = data.config.channel === 'email';

  return (
    <div className="bg-white border shadow-md rounded-lg p-3 w-72">
      <h3 className="font-bold text-sm mb-2 text-blue-600 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
        Action
      </h3>
      <label className="block text-xs mb-1">Channel</label>
      <select
        value={data.config.channel || 'email'}
        onChange={(e) => data.onChange(id, { ...data.config, channel: e.target.value })}
        className="border rounded w-full p-1 mb-2 text-sm"
      >
        <option value="email">Email</option>
        <option value="sms">SMS</option>
        <option value="whatsapp">WhatsApp</option>
      </select>
      {isEmailChannel ? (
        <>
          <label className="flex felx-row text-xs mb-1"><FiMail className="align-middle mr-3 h-4"/>Email Template</label>
          <select
            value={data.config.templateId ?? ""}
            onChange={handleTemplateChange}
            className="border rounded w-full p-1 mb-2 text-sm"
          >
            <option value=""><FaPen/>-- Custom Message --</option>
            {data.emailTemplates?.map((template) => (
              <option key={template.id} value={template.id}>
                <FaPen/>{template.name}
              </option>
            ))}
          </select>
          
          <TiptapEditor 
            content={data.config.message || ''}
            onChange={handleContentChange}
            onFocus={handleEditorFocus}
          />
          
          <button
            onClick={() => data.onPreview(data.config.message)}
            disabled={!data.config.message}
            className="w-full text-xs bg-gray-200 hover:bg-gray-300 py-1 rounded flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm1.5 0a.5.5 0 00-.5.5v1.282l3.41 2.339a1 1 0 001.18 0l3.41-2.34V5.5a.5.5 0 00-.5-.5h-8.5zM4 8.564l3.41 2.34a3 3 0 003.58 0l3.41-2.34V14.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V8.564z" clipRule="evenodd" /></svg>
            Preview Email
          </button>
        </>
      ) : (
        <>
          <label className="text-xs mb-1"><FaPencilAlt className="align-middle mr-3 h-4"/>Message</label>
          <textarea
            value={data.config.message || ''}
            onChange={(e) => data.onChange(id, { ...data.config, message: e.target.value })}
            rows={3}
            className="border rounded w-full p-1 text-sm"
          />
        </>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// --- DELAY NODE COMPONENT (with Icon) ---
function DelayNode({ id, data }) {
    const updateDelay = (newDelay) => {
        data.onChange(id, { ...data.config, delay: parseInt(newDelay, 10) || 0 });
    };
    return (
        <div className="bg-white border shadow-md rounded-lg p-4 w-60 text-center">
            <h3 className="font-bold text-sm mb-2 text-yellow-600 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                Delay
            </h3>
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

// --- CONDITION NODE COMPONENT (with Icon) ---
function ConditionNode({ id, data }) {
    return (
        <div className="bg-white border-2 border-purple-500 shadow-xl rounded-full p-4 w-48 h-24 flex items-center justify-center text-center">
            <h3 className="font-bold text-sm text-purple-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                Condition
            </h3>
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
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [previewHtml, setPreviewHtml] = useState(null);

  const addStartNode = (prefix) => {
    setNodes([{ id: `${prefix}_node-1`, type: "input", data: { label: "Start" }, position: { x: 250, y: 0 } }]);
  };

  useEffect(() => {
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

  const deleteSelectedElements = () => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.some(n => n.type === 'input')) {
        Swal.fire("Info", "The 'Start' node cannot be deleted.", "info");
        return;
    }
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };

  const saveFlow = async () => {
     if (!companyId) {
    Swal.fire({
      title: 'Oops! 😕',
      text: 'Company ID is not available.',
      icon: 'error',
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#3085d6',
      background: '#fdfdfd',
      color: '#333',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        title: 'text-xl font-semibold',
        confirmButton: 'px-6 py-2 rounded-lg'
      }
    });
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
      Swal.fire({
        title: workflowId ? '✨ Workflow Updated!' : '🎉 Workflow Created!',
        text: `Your workflow has been ${workflowId ? 'successfully updated' : 'successfully created'}!`,
        icon: 'success',
        confirmButtonText: 'Great!',
        confirmButtonColor: '#10b981',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-2xl shadow-2xl p-6',
          title: 'text-2xl font-bold text-emerald-600',
          confirmButton: 'px-6 py-2 rounded-lg font-semibold'
        }
      });
    } catch (error) {
      console.error("Error saving workflow:", error);
      Swal.fire({
        title: 'Error ⚠️',
        text: `Error: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#e11d48',
        background: '#fff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-2xl shadow-2xl p-6',
          title: 'text-xl font-semibold text-red-600',
          confirmButton: 'px-6 py-2 rounded-lg font-semibold'
        }
      });
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh"  }}>
      {previewHtml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white p-4 rounded-lg shadow-2xl max-w-4xl w-full m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                Email Preview
              </h3>
              <button onClick={() => setPreviewHtml(null)} className="text-gray-500 hover:text-gray-800 font-bold text-2xl leading-none">&times;</button>
            </div>
            <div className="border rounded p-4 h-[70vh] overflow-y-auto bg-gray-50" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}

      {/* --- WORKFLOW DETAILS WITH ICONS IN INPUTS --- */}
      <div className="top-4  w-full left-4 z-10 bg-white p-4 rounded-lg shadow-md flex flex-col gap-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Workflow Details
        </h2>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.243 3.5a1 1 0 011.514 0l4.5 6a1 1 0 01-.757 1.5H5.486a1 1 0 01-.757-1.5l4.5-6zM9 13a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" /></svg>
          </span>
          <input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} placeholder="Workflow Name" className="border rounded p-2 pl-10 text-sm w-full"/>
        </div>
        <div className="relative">
           <span className="absolute top-2.5 left-0 flex items-center pl-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm2 1a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h1a1 1 0 100-2H7zm1 4a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" /></svg>
           </span>
          <textarea value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)} placeholder="Workflow Description" rows={2} className="border rounded p-2 pl-10 text-sm w-full"/>
        </div>
      </div>

      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        <button onClick={resetWorkflow} className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
          Reset
        </button>
        <button onClick={addActionStep} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
          Action
        </button>
        <button onClick={addDelayStep} className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-yellow-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
          Delay
        </button>
        <button onClick={addConditionStep} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            Condition
        </button>
        <button onClick={deleteSelectedElements} className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          Delete
        </button>
        <button onClick={saveFlow} className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" /></svg>
          Save
        </button>
                <button onClick={toggleNextEdgeType} className="bg-gray-400 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-gray-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  <span className="text-xs font-semibold">EDGE: {nextEdgeType.toUpperCase()}</span>
                </button>
                <button
          onClick={async () => {
            const res = await fetch("http://localhost:8000/generate-flow", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description: "7-day workflow with email, sms, and whatsapp" }),
            });
            const flowData = await res.json();

            if (flowData.nodes && flowData.edges) {
              const enhancedNodes = flowData.nodes.map(node => ({
                ...node,
                data: {
                  ...node.data,
                  onChange: onNodesDataChange,
                  emailTemplates,
                  onPreview: handlePreview,
                },
              }));
              setNodes(enhancedNodes);
              setEdges(flowData.edges);
            }
          }}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Load AI Workflow
        </button>

      </div>
    </div>
  );
}
