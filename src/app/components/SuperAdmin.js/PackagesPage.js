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


const PricingCard = ({ plan, isActive, onClick, billingCycle }) => {
  const displayPrice = billingCycle === "annually" ? plan.priceAnnually : plan.priceMonthly;
  const cardClasses = `
    border-[1.5px] rounded-[28px] p-8 mt-10 w-full max-w-xs text-center transition-all duration-300 ease-in-out cursor-pointer
    ${isActive ? 'scale-110 border-[#8645FF] shadow-2xl bg-[#181059] text-white' : 'bg-zinc-100 hover:bg-zinc-200 hover:-translate-y-2'}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <h3 className={`text-3xl font-bold mb-4 ${isActive ? 'text-white' : 'text-[#181059]'}`}>{plan.name}</h3>
      <div className="mb-8">
        <span className={`text-5xl font-medium ${isActive ? 'text-white' : 'text-[#181059]'}`}>
          ${displayPrice}
        </span>
        <span className={`text-lg opacity-70 ${isActive ? 'text-white' : 'text-[#181059]'}`}>
          /{billingCycle === "annually" ? "year" : "mon"}
        </span>
      </div>
       <ul className="text-left mb-8 min-h-[150px]">
        <li className="flex items-center gap-2 mb-3">
          <FiCheck className="text-green-500 flex-shrink-0" />
          <span>Verifications({plan.verificationLimit})</span>
        </li>

        {plan.planFeatures?.map(({ feature }) => (
          <li key={feature.id} className="flex items-center gap-2 mb-3">
            <FiCheck className="text-green-500 flex-shrink-0" />
            <span>{feature.name}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full p-4 rounded-xl font-bold text-lg ${isActive ? 'bg-[#8645FF] text-white' : 'bg-[#F8F4FF] text-[#8645FF]'}`}>
        {isActive ? "Current Plan" : "Choose Plan"}
      </button>
    </div>
  );
};

// --- Main Page Component ---

export default function PackagesPage() {
  // Use the server-fetched data to initialize state

// You can then use this data to set the state in your component
// For example:
// setPlans(initialPlans);
// setFeatures(initialFeatures);

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true); // Only true if initial fetch fails
  const [error, setError] = useState('');

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activePlanId, setActivePlanId] = useState(plans.length > 0 ? plans[0].id : null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feature,setFeatures]= useState([])


  useEffect(() => {
    // Create an async function inside useEffect to fetch all data
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Use Promise.all to fetch both plans and features in parallel
        const [plansResponse, featuresResponse] = await Promise.all([
          fetch('/api/packages'),
          fetch('/api/features')
        ]);

        if (!plansResponse.ok) throw new Error('Failed to fetch plans');
        if (!featuresResponse.ok) throw new Error('Failed to fetch features');

        const plansData = await plansResponse.json();
        const featuresData = await featuresResponse.json();
        console.log(featuresData)
        // 3. Update the state with the fetched data
        setPlans(plansData);
        setFeatures(featuresData);
        
        // Set the default active plan after data has loaded
        if (plansData.length > 0) {
          setActivePlanId(plansData[0].id);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading, whether successful or not
      }
    };

    loadInitialData();
  }, []); // The empty dependency array [] ensures this runs only once.

  // This function is passed to the modal to update the UI after a new plan is created
  const handlePlanCreated = (newPlan) => {
    setPlans(prevPlans => [...prevPlans, newPlan]);
    Swal.fire({
      title: 'Success!',
      text: `Plan "${newPlan.name}" has been created successfully.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // This function is passed to the modal to update the UI after a new plan is creat
  return (
    <>
      <div className="p-5 md:p-10 bg-[#F8F4FF] min-h-screen">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#181059] mb-4">The Right Plan for Your Business</h1>
          <p className="text-base text-[#181059] opacity-70 leading-relaxed">Choose a plan that fits your needs. All plans can be customized.</p>
        </div>

        {/* Controls: Billing Cycle Toggle and Create Button */}
        <div className="flex justify-center items-center mb-10 relative">
            <div className="flex items-center gap-4 font-medium text-[#181059]">
                <span>Monthly</span>
                <label className="relative inline-block w-[50px] h-[24px]">
                    <input type="checkbox" className="opacity-0 w-0 h-0" onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')} checked={billingCycle === 'annually'} />
                    <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#181059] transition rounded-full">
                        <span className={`absolute content-[''] h-4 w-4 left-1 bottom-1 bg-white transition rounded-full ${billingCycle === 'annually' ? 'transform translate-x-[26px]' : ''}`}></span>
                    </span>
                </label>
                <span>Annually</span>
            </div>
            <div className="absolute right-0 md:right-5">
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700" 
                  onClick={() => setIsModalOpen(true)}>
                    <FiPlus /> Create New Plan
                </button>
            </div>
        </div>

        {/* Pricing Cards Display */}
        <div className="flex justify-center items-start gap-8 flex-wrap">
          {loading && <p>Loading plans...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && plans.map(plan => (
            <PricingCard 
              key={plan.id} 
              plan={plan} 
              isActive={activePlanId === plan.id}
              onClick={() => setActivePlanId(plan.id)}
              billingCycle={billingCycle}
            />
          ))}
        </div>
      </div>

      {/* The Modal for Creating a New Plan */}
      <AddPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlanCreated={handlePlanCreated}
        allFeatures={feature} // Pass the fetched features to the modal
      />
    </>
  );
}

// --- Data Fetching with getStaticProps ---
export async function getStaticProps() {
  const prisma = new PrismaClient();
  try {
    // Fetch all plans and their related features
    const plans = await prisma.plan.findMany({
      include: {
        planFeatures: {
          include: {
            feature: true, // Include the full feature details
          },
        },
      },
    });

    // Fetch all available features for the modal's Kanban board
    const features = await prisma.feature.findMany();
    
    // Format features for the Kanban board in the modal
    const formattedFeatures = features.map(feature => ({
      id: feature.id,
      title: feature.name,
      description: feature.description || 'No description available.',
    }));

    return {
      props: {
        initialPlans: JSON.parse(JSON.stringify(plans)), // Serialize data
        initialFeatures: formattedFeatures,
      },
      // revalidate: 60, // Regenerate the page every 60 seconds to fetch new data
    };
  } catch (error) {
    console.error("Failed to fetch data for PackagesPage:", error);
    return {
      props: {
        initialPlans: [],
        initialFeatures: [],
      },
    };
  }
}