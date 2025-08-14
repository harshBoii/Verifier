'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const SubAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscribe');
        if (!response.ok) {
          // If the API returns a 404 or other error, assume no active subscription
          setIsVisible(true);
          return;
        }
        
        const subscription = await response.json();

        // Show the banner if there is no subscription, it's inactive, or it has expired
        if (!subscription || !subscription.isActive || new Date() > new Date(subscription.currentPeriodEnds)) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error("Failed to fetch subscription status:", error);
        // Optionally show the banner on API failure
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  // Don't render anything while loading or if the subscription is active
  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-red-600 text-white p-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="h-6 w-6" />
            <p className="font-semibold">
              <span className="hidden md:inline">Your company's subscription has expired.</span> Please update your plan to continue accessing all features.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/packages" className="bg-white text-red-600 font-bold py-1.5 px-4 rounded-md text-sm hover:bg-red-100 transition-colors">
              Renew Plan
            </Link>
            <button onClick={() => setIsVisible(false)} className="hover:bg-red-700 p-1 rounded-full">
              <FiX size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAlert;
