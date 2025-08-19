'use client'

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';
import DarkVeil from '@/Backgrounds/DarkVeil/DarkVeil'; // Your component path
import LightRays from '@/Backgrounds/LightRays/LightRays';
import Orb from '@/Backgrounds/Orb/Orb';

// Your SVG Icons (GoBackIcon, HelpdeskIcon) remain the same...
const GoBackIcon = () => (
    <svg className="w-3 h-3 mr-1.5" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 13L1 7L7 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
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
    // 1. The main container establishes the stacking context.
    <div className="relative h-screen w-screen overflow-hidden font-sans">
      
      {/* 2. BACKGROUND CONTAINER */}
      {/* This div is positioned absolutely to fill the parent and sent to the back with z-0. */}
      <div className="absolute inset-0 z-1 bg-[radial-gradient(circle_at_bottom,_#ffffff_0%,_#cccccc_40%,_#000000_90%)]">
        {/* DarkVeil is placed inside. It will automatically fill this container. */}
        {/* Notice we are NOT passing any className here anymore. */}
      <LightRays/>
      </div>

      {/* 3. FOREGROUND CONTAINER */}
      {/* This div is positioned with a higher z-index to ensure it's on top of the background. */}
      {/* 'relative' is used so its children can be positioned absolutely within it. */}
      <div className="relative z-10 h-full w-full">
        
          {/* Go Back Button */}
          <button className="absolute flex items-center justify-center px-3 py-1.5 top-7 left-8 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors">
            <GoBackIcon />
            <span className="text-lg font-normal text-black">Go Back</span>
          </button>

          {/* Helpdesk Link */}
          <a href="#" className="absolute flex items-center top-[35px] right-[37px] cursor-pointer group">
            <span className="text-lg font-normal text-gray-800 group-hover:underline">Helpdesk</span>
            <HelpdeskIcon />
          </a>

          {/* Main Content (using flex for robust centering) */}
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-full max-w-4xl">
                  <h1
                    className="relative text-[40px] font-extrabold leading-tight uppercase 
                              bg-gradient-to-b from-white via-gray-200 to-gray-400 
                              text-transparent bg-clip-text drop-shadow-[0_4px_10px_rgba(255,255,255,0.6)] 
                              tracking-wide"
                  >
                    VETTIFY IS YOUR ONLINE VERIFIER
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 w-[200px] h-[120px] 
                                    bg-gradient-to-b from-white/70 to-transparent blur-3xl rounded-full pointer-events-none">
                    </span>
                  </h1>

                  <p
                    className="mt-10 w-full max-w-xl mx-auto text-[25.5px] leading-snug 
                              text-gray-300 drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)]"
                  >
                    You can manage and showcase all your courses from anywhere and everywhere in a single workspace.
                  </p>
              <div className="mt-14 w-[30vw] max-w-xs h-[30vh] mx-auto">
                <DotLottieReact
                  src="https://lottie.host/d8c1993e-d93a-491b-ab94-2bf0beb7ef9f/cLa3vve6q2.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>
          </div>

          {/* Get Started Button */}
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