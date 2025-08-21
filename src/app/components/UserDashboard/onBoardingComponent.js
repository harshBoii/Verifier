'use client'

import React from 'react';
import Image from 'next/image';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';


// SVG Icon for the "Go Back" button
const GoBackIcon = () => (
    <svg className="w-3 h-3 mr-1.5" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 13L1 7L7 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// SVG Icon for the "Helpdesk" link
const HelpdeskIcon = () => (
    <svg className="w-2.5 h-2.5 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#12131A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16V12" stroke="#12131A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8H12.01" stroke="#12131A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


// Main Onboarding Component
const OnboardingComponent = () => {
  return (
    // Main container to center the component on the page
    <div className="flex items-center justify-center h-[100vh] w-[100vw]  font-sans">
      {/* Onboarding Page Container */}
      {/* Corresponds to .onboarding-page */}
      <div className="relative w-[100vw] h-[100vh]   rounded-xl shadow-lg overflow-hidden">
        
        {/* Go Back Button */}
        {/* Corresponds to .go-back-container */}
        <button className="absolute flex items-center justify-center px-3 py-1.5 top-7 left-8 bg-gray-100 rounded-md cursor-pointer  hover:bg-gray-200 transition-colors">
          <GoBackIcon />
          {/* Corresponds to .go-back-text */}
          <span className="text-lg font-normal text-black">Go Back</span>
        </button>

        {/* Helpdesk Link */}
        {/* Corresponds to .helpdesk-container */}
        <a href="#" className="absolute flex items-center top-[35px] right-[37px] cursor-pointer group">
          {/* Corresponds to .helpdesk-text */}
          <span className="text-lg font-normal text-gray-800 group-hover:underline">Helpdesk</span>
          <HelpdeskIcon />
        </a>

        {/* Main Content Section */}
        {/* Corresponds to .main-content */}
        <div className="absolute top-50 bottom-60 left-1/2 -translate-x-1/2 w-[70vw] text-center">
          {/* Main Heading */}
          <h1 className="text-[40px] mr-7 font-bold leading-9 text-gray-900 uppercase">
            DEMO CRM IS YOUR ONLINE VERIFICATION
          </h1>
          
          {/* Subheading */}
          <p className="mt-10 w-[40vw]  mx-auto text-[25.5px] leading-[21px] text-gray-500">
            You can manage and showcase all your courses from anywhere and everywhere in a single workspace.
          </p>

          {/* Illustration Image */}
          {/* Corresponds to .illustration */}
          <div className="relative mt-14 w-[30vw] h-[30vh] mx-auto">
            <DotLottieReact
            src="https://lottie.host/d8c1993e-d93a-491b-ab94-2bf0beb7ef9f/cLa3vve6q2.lottie"
            loop
            autoplay
            />
          </div>
        </div>

        {/* Get Started Button */}
        {/* Corresponds to .get-started-button */}
        <Link href="/login">
        <button className="absolute bottom-10 right-5 w-[125px] h-[35px] text-white text-[14.8px] font-medium rounded-md bg-gradient-to-b from-[#2B66F6] to-[#677AFF] hover:opacity-90 transition-opacity">
          Get Started
        </button>
        </Link>
      </div>
    </div>
  );
};

export default OnboardingComponent;