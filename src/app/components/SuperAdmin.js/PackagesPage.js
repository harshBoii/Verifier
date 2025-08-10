'use client';
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEdit, FiSave, FiPlus } from 'react-icons/fi';
import AddPlanModal from './AddPlanModal';
import LoadingGlass from '../LoadingGlass';
import Swal from 'sweetalert2'; // 1. Import SweetAlert2

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const FeatureItem = ({ feature, editMode, onToggle, isPrimary, isActive }) => {
    const included = feature.included;
    const iconColor = isPrimary || isActive ? 'text-zinc-200 hover:text-red-400' : 'text-black';
    const textColor = isPrimary || isActive ? 'text-white hover:text-red-400' : 'text-black';
    const excludedColor = 'text-[#BAB8CE]';

    return (
        <li className="flex items-center justify-between gap-2.5 mb-4 text-base">
            <div className="flex items-center gap-2.5">
                {included ? <FiCheck className={`flex-shrink-0 ${iconColor}`} /> : <FiX className={`flex-shrink-0 ${excludedColor}`} />}
                <span className={included ? textColor : excludedColor}>{feature.text}</span>
            </div>
            {editMode && (
                <button onClick={onToggle} className="text-xs font-semibold border rounded px-2 py-0.5 text-white hover:bg-gray-100">
                    {included ? 'Exclude' : 'Include'}
                </button>
            )}
        </li>
    );
};

const PricingCard = ({ plan, editMode, onUpdate, isActive, onClick, onSubscribe }) => {
    const cardClasses = `
        border-[1.5px] rounded-[28px] p-8 ml-15 mt-10 w-full max-w-xs text-center transition-all duration-300 ease-in-out cursor-pointer  hover:text-black
        ${isActive ? 'scale-120 !border-[#8645FF] shadow-2xl bg-[#181059] text-white hover:bg-black' : 'bg-zinc-100 hover:bg-zinc-400' }
        hover:-translate-y-2.5 hover:shadow-lg 
    `;
    
    return (
        <div 
            className={cardClasses}
            onClick={!editMode ? onClick : undefined}
        >
            <div className="mb-8 min-h-[60px]">
                {editMode ? (
                    <input 
                        type="text" 
                        value={plan.name} 
                        onChange={(e) => onUpdate('name', e.target.value)}
                        className="bg-transparent border-b-2 border-dashed w-full text-center text-white text-2xl font-bold"
                    />
                ) : (
                    <h3 className={`text-3xl font-bold ${plan.isPrimary || isActive ? 'text-white' : 'text-[#181059]'}`}>{plan.name}</h3>
                )}
                {plan.saveAmount && <span className="inline-block mt-2 bg-white text-[#8645FF] font-bold px-3 py-1 rounded-md text-sm">Save ${plan.saveAmount}</span>}
            </div>
            <ul className="text-left mb-8">
                {plan.features.map((feature, index) => (
                    <FeatureItem 
                        key={index} 
                        feature={feature} 
                        editMode={editMode}
                        isPrimary={plan.isPrimary}
                        isActive={isActive}
                        onToggle={() => {
                            const updatedFeatures = [...plan.features];
                            updatedFeatures[index].included = !updatedFeatures[index].included;
                            onUpdate('features', updatedFeatures);
                        }}
                    />
                ))}
            </ul>
            <div className="mb-8">
                <span className={`text-5xl font-medium ${plan.isPrimary || isActive ? 'text-white' : 'text-[#181059]'}`}>
                    ₹
                    {editMode ? (
                        <input 
                            type="number" 
                            value={plan.price} 
                            onChange={(e) => onUpdate('price', parseInt(e.target.value, 10) || 0)}
                            className="bg-transparent border-b-2 border-dashed w-24 text-white text-center"
                        />
                    ) : (
                        plan.price
                    )}
                </span>
                <span className={`text-lg opacity-70 ${plan.isPrimary || isActive ? 'text-white' : 'text-[#181059]'}`}>/mon</span>
            </div>
            <button 
                className={`w-full p-4 rounded-xl border-none font-bold text-lg cursor-pointer transition
                    ${plan.isPrimary ? 'bg-[#8645FF] text-white hover:bg-[#7a6df5]' : 'bg-[#F8F4FF] text-[#8645FF] hover:bg-[#E5E1FF]'}
                    ${isActive && !plan.isPrimary ? '!bg-[#8645FF] !text-white hover:!bg-[#7a6df5]' : ''}
                `}
                onClick={!editMode ? onSubscribe : undefined}
            >
                {plan.isPrimary ? 'Try 1 month' : 'Choose'}
            </button>
        </div>
    );
};

const PlaceholderCard = () => (
    <div className="bg-white border-[1.5px] border-[#E5E1FF] rounded-[28px] p-8 w-full max-w-xs text-center animate-pulse">
        <div className="mb-8 min-h-[60px]">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
        <ul className="text-left mb-8 space-y-4">
            {[...Array(5)].map((_, i) => <li key={i}><div className="h-4 bg-gray-200 rounded w-full"></div></li>)}
        </ul>
        <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="h-14 bg-gray-200 rounded-xl w-full"></div>
    </div>
);

const PackagesPage = () => {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activePlan, setActivePlan] = useState('Primary');
  const [editMode, setEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // 2. State for loading animation


  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/packages');
      if (!response.ok) throw new Error('Failed to fetch package data.');
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handlePlanUpdate = (planId, field, value) => {
    const updatedPlans = { ...plans };
    const planIndex = updatedPlans[billingCycle].findIndex(p => p.id === planId);
    if (planIndex > -1) {
      updatedPlans[billingCycle][planIndex][field] = value;
      setPlans(updatedPlans);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true); // Start loading animation
    try {
      const response = await fetch('/api/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plans),
      });
      if (!response.ok) throw new Error('Failed to save changes.');
      
      // Use SweetAlert2 for success
      Swal.fire({
        title: 'Saved!',
        text: 'Your changes have been saved successfully.',
        icon: 'success',
        confirmButtonColor: '#2979FF',
      });

      setEditMode(false);
    } catch (err) {
      // Use SweetAlert2 for error
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsSaving(false); // Stop loading animation
    }
  };

return (
    <>
      <div className="p-5 md:p-10 bg-[#F8F4FF] font-['Inter'] min-h-screen">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#181059] mb-4">The Right Plan for Your Business</h1>
          <p className="text-base text-[#181059] opacity-70 leading-relaxed">We have several powerful plans to showcase your business and get discovered as a creative entrepreneur. Everything you need.</p>
        </div>
        <div className="flex justify-center items-center mb-10 relative">
            <div className="flex items-center gap-4 font-medium text-[#181059]">
                <span className={billingCycle === 'monthly' ? 'font-bold' : ''}>Bill Monthly</span>
                <label className="relative inline-block w-[50px] h-[24px]">
                    <input type="checkbox" className="opacity-0 w-0 h-0" onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')} />
                    <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#181059] transition rounded-full">
                        <span className={`absolute content-[''] h-4 w-4 left-1 bottom-1 bg-[#EDBB01] transition rounded-full ${billingCycle === 'annually' ? 'transform translate-x-[26px]' : ''}`}></span>
                    </span>
                </label>
                <span className={billingCycle === 'annually' ? 'font-bold' : ''}>Bill Annually</span>
            </div>
            <div className="absolute right-0 md:right-5 flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#181059] rounded-md font-semibold border hover:bg-gray-50" onClick={() => setIsAddModalOpen(true)}>
                    <FiPlus /> Create New Plan
                </button>
                {editMode ? (
                  <button 
                    className="flex items-center justify-center gap-2 px-4 py-2 w-[160px] bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 disabled:opacity-70 disabled:cursor-not-allowed" 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? <Spinner /> : <><FiSave /> Save Changes</>}
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md font-semibold border hover:bg-gray-50" onClick={() => setEditMode(true)}>
                    <FiEdit /> Edit Packages
                  </button>
                )}
            </div>
        </div>
        <div className={`flex justify-center items-center gap-8 flex-wrap ${activePlan && !editMode ? 'has-active' : ''}`}>
          {loading ? (
            [...Array(3)].map((_, index) => <PlaceholderCard key={index} />)
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : (
            plans && plans[billingCycle].map(plan => (
              <PricingCard 
                key={plan.id} 
                plan={plan} 
                isActive={activePlan === plan.name}
                onClick={() => setActivePlan(plan.name)}
                editMode={editMode}
                onUpdate={(field, value) => handlePlanUpdate(plan.id, field, value)}
                onSubscribe={() => alert(`Subscribing to ${plan.name}`)}
              />
            ))
          )}
        </div>
      </div>
      <AddPlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPlans}
      />
    </>
  );
};

export default PackagesPage;
