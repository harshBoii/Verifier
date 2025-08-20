// File: components/CreatePlanModal.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader, AlertCircle, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Draggable Item Component ---
const SortableFeatureCard = ({ feature }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.85 : 1,
    boxShadow: isDragging ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-3 mb-3 rounded-lg border border-gray-200 bg-white flex items-center"
    >
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

// --- Droppable Column Component ---
const FeatureColumn = ({ id, title, features }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const columnBg = isOver ? 'bg-blue-50' : 'bg-gray-100';

  return (
    <div ref={setNodeRef} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
      <h4 className="font-semibold text-center text-gray-700 mb-4">{title}</h4>
      <div className={`min-h-[250px] flex-grow p-2 rounded-md overflow-y-auto transition-colors ${columnBg}`}>
        <SortableContext items={features.map(f => f.id)}>
          {features.map(feature => (
            <SortableFeatureCard key={feature.id} feature={feature} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

// --- Main Modal Component ---
export default function CreatePlanModal({ isOpen, onClose, onPlanCreated, allFeatures }) {
  const [features, setFeatures] = useState({ available: [], selected: [] });
  const [planName, setPlanName] = useState('');
  const [priceMonthly, setPriceMonthly] = useState('');
  const [priceAnnually, setPriceAnnually] = useState('');
  const [verificationLimit, setVerificationLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const formattedFeatures = (allFeatures || []).map(feature => ({
        id: feature.id,
        title: feature.name,
        description: feature.description || 'No description provided.',
      }));
      setFeatures({ available: formattedFeatures, selected: [] });
      setPlanName('');
      setPriceMonthly('');
      setPriceAnnually('');
      setVerificationLimit(50);
      setError(null);
    }
  }, [isOpen, allFeatures]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id) => {
    if (features.selected.some(f => f.id === id)) return 'selected';
    return 'available';
  };

  function handleDragEnd(event) {
    const { active, over } = event;
    
    // If dropped outside a valid container, do nothing
    if (!over) {
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    // If the item is dropped over another item in a different container,
    // or over the container itself.
    if (activeContainer !== overContainer) {
      setFeatures((prev) => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer];

        // Find the index of the active item
        const activeIndex = activeItems.findIndex((item) => item.id === active.id);
        
        // Move the item
        return {
          ...prev,
          [activeContainer]: [
            ...activeItems.slice(0, activeIndex),
            ...activeItems.slice(activeIndex + 1),
          ],
          [overContainer]: [...overItems, activeItems[activeIndex]],
        };
      });
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planName.trim()) {
      setError("Plan name is required.");
      return;
    }
    setIsLoading(true);

    const planData = {
      name: planName,
      priceMonthly: parseFloat(priceMonthly),
      priceAnnually: parseFloat(priceAnnually),
      verificationLimit: parseInt(verificationLimit, 10),
      featureIds: features.selected.map(f => f.id),
    };

    try {
      const response = await axios.post('/api/plans', planData);
      if (response.status === 201) {
        onPlanCreated(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Create a New Subscription Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={24} /></button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          {/* Plan Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Plan Name</label>
              <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Professional Tier" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Monthly Price ($)</label>
                <input type="number" value={priceMonthly} onChange={(e) => setPriceMonthly(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Annual Price ($)</label>
                <input type="number" value={priceAnnually} onChange={(e) => setPriceAnnually(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-600 mb-2">Verification Limit</label>
            <div className="flex items-center gap-4">
              <input type="range" min="0" max="1000" step="5" value={verificationLimit} onChange={(e) => setVerificationLimit(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full min-w-[60px] text-center">{verificationLimit}</span>
            </div>
          </div>

          {/* Drag and Drop Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Add Features to Plan</h3>
            <p className="text-sm text-gray-500 mb-4">Drag features from "Available" to "Selected" to include them in this plan.</p>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-2 gap-5">
                <FeatureColumn id="available" title="Available Features" features={features.available} />
                <FeatureColumn id="selected" title="Selected for this Plan" features={features.selected} />
              </div>
            </DndContext>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 mt-auto flex-shrink-0 bg-gray-50 rounded-b-xl">
          {error && <div className="flex items-center gap-2 text-red-600"><AlertCircle size={20} /><p>{error}</p></div>}
          <div className="ml-auto flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2">
              {isLoading && <Loader className="animate-spin" size={20} />}
              {isLoading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
