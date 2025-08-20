'use client';
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiStar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingGlass from '../LoadingGlass';
import CustomPlan from './CreateCustomPlan';
import { FiPlus } from 'react-icons/fi';

const FeatureItem = ({ feature, isPrimary }) => {
    const included = feature.included;
    const iconColor = isPrimary ? 'text-white' : 'text-[#8645FF]';
    const textColor = isPrimary ? 'text-green' : 'text-red';
    const excludedColor = 'text-[#BAB8CE]';

    return (
        <li className={`flex items-center gap-2.5 mb-4 text-base ${!included ? excludedColor : textColor}`}>
            {included ? <FiCheck className={`flex-shrink-0 ${iconColor}`} /> : <FiX className="flex-shrink-0" />}
            <span>{feature.text}</span>
        </li>
    );
};

const PricingCard = ({ plan, onSubscribe, billingCycle }) => {
    // Determine which price to show based on the toggle
    const displayPrice = billingCycle === 'annually' ? plan.priceAnnually : plan.priceMonthly;
    const isPrimary = plan.name.toLowerCase().includes('top');

    return (
        <div 
          className={`
            group border-[1.5px] rounded-[28px] p-8 w-full max-w-xs text-center 
            transition-all duration-300 ease-in-out cursor-pointer 
            hover:-translate-y-2.5 hover:shadow-xl hover:scale-105
            ${isPrimary 
              ? 'bg-[#181059] text-white scale-105 shadow-xl' 
              : 'bg-white border-[#E5E1FF] text-[#181059] hover:bg-[#181059] hover:text-white'
            }
          `}
        >
            <div className="mb-8 min-h-[60px]">
                <h3 className="text-3xl font-bold">{plan.name}</h3>
            </div>

            <ul className="text-left mb-8 min-h-[150px]">
                <li className="flex items-center gap-2 mb-3">
                  <FiCheck className="text-green-500 flex-shrink-0" />
                  <span>Verifications({plan.verificationLimit})</span>
                </li>
              
                {plan.planFeatures?.map(({ feature }) => (
                    <FeatureItem 
                        key={feature.id} 
                        // The FeatureItem expects a `text` property, so we map it here
                        feature={{ text: feature.name, included: true }} 
                        isPrimary={isPrimary} 
                    />
                ))}
            </ul>

            <div className="mb-8">
                <span className="text-5xl font-medium">₹{displayPrice}</span>
                <span className="text-lg opacity-70">/{billingCycle === 'annually' ? 'year' : 'mon'}</span>
            </div>

            <button 
                className={`w-full p-4 rounded-xl border-none font-bold text-lg cursor-pointer transition ${isPrimary ? 'bg-[#8645FF] text-white hover:bg-[#7a6df5]' : 'bg-[#F8F4FF] text-[#8645FF] hover:bg-[#7a6df5] hover:text-white'}`}
                onClick={onSubscribe}
            >
                {isPrimary ? 'Get Started' : 'Choose Plan'}
            </button>
        </div>
    );
};

const SubscriptionCard = ({ subscription, companyName }) => {
    if (!subscription) {
        return (
            <div className="mb-10 text-center">
                <p className="text-gray-600">Your company<strong>{companyName}</strong>, does not have an active subscription.</p>
            </div>
        );
    }

    const endDate = new Date(subscription.currentPeriodEnds).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="mb-12 max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <FiStar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xl font-bold text-gray-800">Current Subscription</div>
                        <p className="text-gray-600">{companyName}</p>
                    </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-gray-700"><strong className="font-semibold">Plan:</strong> {subscription.plan.name}</p>
                    <p className="text-gray-700"><strong className="font-semibold">Status:</strong> <span className="text-green-600 font-medium">{subscription.isActive ? 'Active' : 'Inactive'}</span></p>
                    <p className="text-gray-700"><strong className="font-semibold">Verifications left:</strong> {subscription.verifications_left}</p>
                    <p className="text-gray-700"><strong className="font-semibold">Renews on:</strong> {endDate}</p>
                </div>
            </div>
        </div>
    );
};

const PackagesPage = () => {
    // State for data fetched from APIs
    const [plans, setPlans] = useState([]);
    const [allFeatures, setAllFeatures] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [subscription, setSubscription] = useState(null);
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // This useEffect hook is responsible for all initial data fetching.
    useEffect(() => {
        const fetchPageData = async () => {
            try {
                setLoading(true);
                const [plansRes, featuresRes, userRes, subRes] = await Promise.all([
                    fetch('/api/packages'), // Corrected API endpoint
                    fetch('/api/features'),
                    fetch('/api/auth/me'),
                    fetch('/api/subscribe')
                ]);

                if (!plansRes.ok) throw new Error('Failed to fetch plans.');
                if (!featuresRes.ok) throw new Error('Failed to fetch features.');
                if (!userRes.ok) throw new Error('Failed to fetch user data.');

                const plansData = await plansRes.json();
                const featuresData = await featuresRes.json();
                const userData = await userRes.json();
                const subData = subRes.ok ? await subRes.json() : null;

                setPlans(plansData);
                setAllFeatures(featuresData);
                setCurrentUser(userData);
                setSubscription(subData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []); // Empty dependency array ensures this runs once on mount.

    const handleCustomPlanSubmit = async (customPlanData) => {
        setIsModalOpen(false);
        try {
        const priceResponse = await fetch('/api/plans/calculate-price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            featureIds: customPlanData.featureIds,
            verificationLimit: customPlanData.verificationLimit,
          }),
        });

        // Parse JSON response
        const { totalPrice } = await priceResponse.json();

            const result = await Swal.fire({
                title: 'Your Custom Plan',
                html: `
                    <p class="mb-2">You have selected ${customPlanData.featureIds.length} features and a ${customPlanData.verificationLimit} verification limit.</p>
                    <p class="font-bold text-2xl">Total Monthly Cost: ₹${totalPrice}</p>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#2B66F6',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, Subscribe!',
                cancelButtonText: 'Cancel',
            });

            if (result.isConfirmed) {
                await handleSubscribe({
                    id: 'custom',
                    name: customPlanData.name || 'Custom Plan',
                    priceMonthly: totalPrice,
                    featureIds: customPlanData.featureIds,
                    verificationLimit: customPlanData.verificationLimit,
                });
            }
        } catch (err) {
            Swal.fire('Error!', 'Could not calculate the price for your custom plan.');
            console.log(err)
        }
    };

    const handleSubscribe = async (plan) => {
        if (!currentUser || !currentUser.companyId) {
            Swal.fire('Error!', 'Could not identify your company. Please log in again.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: currentUser.companyId,
                    planId: plan.id,
                    billingCycle: billingCycle,
                    customPlanDetails: plan.id === 'custom' ? plan : undefined,
                }),
            });

            if (!response.ok) throw new Error('Subscription failed. Please try again.');
            Swal.fire('Subscribed!', 'Your company has been successfully subscribed.', 'success');
            
            // Re-fetch subscription status to update the UI
            const subRes = await fetch('/api/subscribe');
            setSubscription(subRes.ok ? await subRes.json() : null);
        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        }
    };

    if (loading) return <LoadingGlass />;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="p-5 md:p-10 bg-[#F8F4FF] min-h-screen">
            <SubscriptionCard subscription={subscription} companyName={currentUser?.company?.name || 'Your Company'} />
            
            <div className="text-center max-w-2xl mx-auto mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-[#181059] mb-4">The Right Plan for Your Business</h1>
                <p className="text-base text-[#181059] opacity-70 leading-relaxed">
                    We have several powerful plans. Or, build your own to fit your exact needs.
                </p>
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
                <div className="absolute right-0 md:right-5">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="font-bold py-2 px-6 rounded-lg transition-colors duration-300 bg-white text-[#8645FF] border-2 border-[#8645FF] hover:bg-[#8645FF] hover:text-white flex items-center gap-2"
                    >
                        <FiPlus /> Build Your Own Plan
                    </button>
                </div>
            </div>
            
            <div className="flex justify-center items-start gap-8 flex-wrap">
                {plans.map(plan => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        billingCycle={billingCycle}
                        onSubscribe={() => handleSubscribe(plan)}
                    />
                ))}
            </div>

            <CustomPlan
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPlanCreated={handleCustomPlanSubmit}
                allFeatures={allFeatures}
                isCustomUserPlan={true}
            />
        </div>
    );
};

export default PackagesPage;