// File: components/CreateCustomPlan.js
import { useState, useEffect } from 'react';
import { X, AlertCircle, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sub-components (These can be kept as they are) ---
const SortableFeatureCard = ({ feature }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: feature.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.85 : 1,
        boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : 'none',
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} className="p-3 mb-3 rounded-lg border border-gray-200 bg-white flex items-center">
            <div {...listeners} className="cursor-grab touch-none p-2 text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
            </div>
            <div className="ml-2">
                <h5 className="font-bold text-gray-800">{feature.title}</h5>
                <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
        </div>
    );
};
const FeatureColumn = ({ id, title, features }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    const columnBg = isOver ? 'bg-blue-50' : 'bg-gray-100';
    return (
        <div ref={setNodeRef} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
            <h4 className="font-semibold text-center text-gray-700 mb-4">{title}</h4>
            <div className={`min-h-[250px] flex-grow p-2 rounded-md overflow-y-auto transition-colors ${columnBg}`}>
                <SortableContext items={features.map(f => f.id)}>
                    {features.map(feature => <SortableFeatureCard key={feature.id} feature={feature} />)}
                </SortableContext>
            </div>
        </div>
    );
};

// --- Main Component with Corrected Logic ---
export default function CreateCustomPlan({ isOpen, onClose, onPlanCreated, allFeatures }) {
    const [planName, setPlanName] = useState('');
    const [verificationLimit, setVerificationLimit] = useState(50);
    const [error, setError] = useState(null);
    const [containers, setContainers] = useState({ available: [], selected: [] });

    useEffect(() => {
        if (isOpen) {
            const formattedFeatures = (allFeatures || []).map(feature => ({
                id: feature.id,
                title: feature.name,
                description: feature.description || 'No description provided.',
            }));
            setContainers({ available: formattedFeatures, selected: [] });
            setPlanName('');
            setVerificationLimit(50);
            setError(null);
        }
    }, [isOpen, allFeatures]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findContainer = (id) => {
        if (id in containers) {
            return id;
        }
        return Object.keys(containers).find((key) => containers[key].some((item) => item.id === id));
    };

    // --- REWRITTEN handleDragEnd FOR PROPER STATE MANAGEMENT ---
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeContainerId = findContainer(active.id);
        const overContainerId = findContainer(over.id);

        if (!activeContainerId || !overContainerId) return;

        if (activeContainerId === overContainerId) {
            // Logic for reordering within the same container
            setContainers(prev => ({
                ...prev,
                [activeContainerId]: arrayMove(prev[activeContainerId], 
                    prev[activeContainerId].findIndex(item => item.id === active.id),
                    prev[activeContainerId].findIndex(item => item.id === over.id)
                ),
            }));
        } else {
            // Logic for moving between containers
            setContainers(prev => {
                const activeItems = prev[activeContainerId];
                const overItems = prev[overContainerId];
                const activeIndex = activeItems.findIndex(item => item.id === active.id);
                const [movedItem] = activeItems.splice(activeIndex, 1);
                
                return {
                    ...prev,
                    [activeContainerId]: [...activeItems],
                    [overContainerId]: [...overItems, movedItem],
                };
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (containers.selected.length === 0) {
            setError("Please select at least one feature for your plan.");
            return;
        }
        const customPlanData = {
            name: planName || 'My Custom Plan',
            verificationLimit: parseInt(verificationLimit, 10),
            featureIds: containers.selected.map(f => f.id),
        };
        onPlanCreated(customPlanData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-800">Build Your Custom Plan</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {/* Simplified form fields for the user */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Give your plan a name (optional)</label>
                        <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Marketing Team Plan" />
                    </div>
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Set Your Verification Limit</label>
                        <div className="flex items-center gap-4">
                            <input type="range" min="0" max="1000" step="5" value={verificationLimit} onChange={(e) => setVerificationLimit(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full min-w-[60px] text-center">{verificationLimit}</span>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Select Your Features</h3>
                        <p className="text-sm text-gray-500 mb-4">Drag features from "Available" to "Selected" to include them in your plan.</p>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <div className="grid grid-cols-2 gap-5">
                                <FeatureColumn id="available" title="Available Features" features={containers.available} />
                                <FeatureColumn id="selected" title="Selected Features" features={containers.selected} />
                            </div>
                        </DndContext>
                    </div>
                </div>
                <div className="flex justify-between items-center p-6 border-t border-gray-200 mt-auto flex-shrink-0 bg-gray-50 rounded-b-xl">
                    {error && <div className="flex items-center gap-2 text-red-600"><AlertCircle size={20} /><p>{error}</p></div>}
                    <div className="ml-auto flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={handleSubmit} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Calculate Price</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
