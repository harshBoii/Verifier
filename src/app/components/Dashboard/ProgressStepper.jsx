'use client'; // For Next.js App Router

import React from 'react';
import PropTypes from 'prop-types';
import { FiCheck } from 'react-icons/fi'; // Using a cleaner check icon

// We use a plain object for the enum-like structure in JavaScript
export const Progress = {
  Beginning: 'Beginning',
  Email_added: 'Email_added',
  Mail_sent: 'Mail_sent',
  Summary_added: 'Summary_added',
  Verified: 'Verified',
};

// Define the order of the stages
const progressStages = Object.values(Progress);

// Define more readable labels for each stage
const progressLabels = {
  [Progress.Beginning]: 'Started',
  [Progress.Email_added]: 'Email Added',
  [Progress.Mail_sent]: 'Mail Sent',
  [Progress.Summary_added]: 'Summary Added',
  [Progress.Verified]: 'Verified',
};

const ProgressStepper = ({ currentProgress }) => {
  const currentIndex = progressStages.indexOf(currentProgress);

  return (
    <div className="w-full px-4 py-5 font-sans">
      <div className="relative flex items-center">
        {/* Gradient Progress Bar */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200" style={{ transform: 'translateY(-50%)' }}>
          <div
            className="h-full bg-gradient-to-r from-blue-200 to-blue-600 transition-all duration-700 ease-out rounded-2xl"
            // Calculate the width of the gradient bar based on the current step
            style={{ width: `${(currentIndex / (progressStages.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="relative flex justify-between w-full">
          {progressStages.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center text-center">
                {/* Step Circle */}
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 
                    transition-all duration-500 ease-in-out
                    ${isCompleted ? 'bg-green-500 border-blue-600' : ''}
                    ${isCurrent ? 'bg-blue-500  border-zinc-600 ring-4 ring-zinc-300 text-white' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-white border-gray-300' : ''}
                  `}
                >
                  {isCompleted ? (
                    <FiCheck className="w-6 h-6 text-white" />
                  ) : (
                    <span className={`font-bold transition-colors ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <p
                  className={`
                    mt-2 text-xs font-semibold w-20 transition-colors
                    ${isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-500'}
                  `}
                >
                  {progressLabels[stage]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// PropTypes for runtime type-checking
ProgressStepper.propTypes = {
  currentProgress: PropTypes.oneOf(progressStages).isRequired,
};

export default ProgressStepper;
