'use client';
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiStar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingGlass from '../LoadingGlass';

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

const PricingCard = ({ plan, onSubscribe }) => (
<div 
  className={`
    group border-[1.5px] rounded-[28px] p-8 w-full max-w-xs text-center 
    transition-all duration-300 ease-in-out cursor-pointer 
    hover:-translate-y-2.5 hover:shadow-xl hover:scale-110
    ${plan.isPrimary 
      ? 'bg-[#181059] text-white scale-105 shadow-xl' 
      : 'bg-white border-[#E5E1FF] text-[#181059] hover:bg-[#181059] hover:text-white'
    }
  `}
>
    <div className="mb-8 min-h-[60px]">
      <h3 className="text-3xl font-bold">{plan.name}</h3>
      {plan.saveAmount && <span className="inline-block mt-2 bg-white text-[#8645FF] font-bold px-3 py-1 rounded-md text-sm">Save ${plan.saveAmount}</span>}
    </div>
    <ul className="text-left mb-8">
      {plan.features.map((feature) => (
        <FeatureItem key={feature.text} feature={feature} isPrimary={plan.isPrimary} />
      ))}
    </ul>
    <div className="mb-8">
      <span className="text-5xl font-medium">₹{plan.price}</span>
      <span className="text-lg opacity-70">/mon</span>
    </div>
    <button 
        className={`w-full p-4 rounded-xl border-none font-bold text-lg cursor-pointer transition ${plan.isPrimary ? 'bg-[#8645FF] text-white hover:bg-[#7a6df5]' : 'bg-[#F8F4FF] text-[#8645FF] hover:bg-[#7a6df5] hover:text-white'}`}
        onClick={onSubscribe}
    >
      {plan.isPrimary ? 'Try 1 month' : 'Choose'}
    </button>
  </div>
);

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
                    <p className="text-gray-700"><strong className="font-semibold">Renews on:</strong> {endDate}</p>
                </div>
            </div>
        </div>
    );
};

const PackagesPage = () => {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currentUser, setCurrentUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const [plansRes, userRes, subRes] = await Promise.all([
        fetch('/api/packages'),
        fetch('/api/auth/me'),
        fetch('/api/subscribe')
      ]);

      if (!plansRes.ok) throw new Error('Failed to fetch packages.');
      if (!userRes.ok) throw new Error('Failed to fetch user data.');
      // subRes can be 404 or return null, which is okay

      const plansData = await plansRes.json();
      const userData = await userRes.json();
      const subData = subRes.ok ? await subRes.json() : null;
      
      setPlans(plansData);
      setCurrentUser(userData);
      setSubscription(subData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!currentUser || !currentUser.companyId) {
        Swal.fire('Error!', 'Could not identify your company. Please log in again.', 'error');
        return;
    }

    const result = await Swal.fire({
        title: `Confirm Subscription`,
        html: `Are you sure you want to subscribe your company to the <strong>${plan.name}</strong> plan?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2B66F6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, subscribe!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: currentUser.companyId,
                    planId: plan.id,
                    billingCycle: billingCycle,
                }),
            });
            if (!response.ok) throw new Error('Subscription failed.');
            Swal.fire('Subscribed!', 'Your company has been successfully subscribed.', 'success');
            fetchPageData(); // Refetch all data to update the subscription card
        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        }
    }
  };

  if (loading) return <LoadingGlass/>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
      <div className="p-5 md:p-10 bg-[#F8F4FF] min-h-screen">
        <SubscriptionCard subscription={subscription} companyName={currentUser?.company?.name || ''} />
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
        </div>
        <div className="flex justify-center items-center gap-8 flex-wrap">
          {plans && plans[billingCycle].map(plan => (
              <PricingCard 
                key={plan.id} 
                plan={plan} 
                onSubscribe={() => handleSubscribe(plan)}
              />
            ))}
        </div>
      </div>
  );
};

export default PackagesPage;
