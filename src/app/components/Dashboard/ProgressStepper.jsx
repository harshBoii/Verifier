'use client'; // For Next.js App Router

import React from 'react';
import PropTypes from 'prop-types';
import { FiCheck, FiX, FiMinus } from 'react-icons/fi';

// Enum-like object for primary progress stages
export const Progress = {
  Beginning: 'Beginning',
  Email_added: 'Email_added',
  Mail_sent: 'Mail_sent',
  Summary_added: 'Summary_added',
  Verified: 'Verified',
};

// The order of the primary stages
const progressStages = Object.values(Progress);

// Readable labels for the primary stages
const progressLabels = {
  [Progress.Beginning]: 'Process Started',
  [Progress.Email_added]: 'Email Added',
  [Progress.Mail_sent]: 'Mail Sent',
  [Progress.Summary_added]: 'Summary Added',
  [Progress.Verified]: 'Verified & Complete',
};

const ProgressStepper = ({
  currentProgress,
  apollo_used = false,
  chat_started = false,
  chat_finished = false,
}) => {
  const mainProgressIndex = progressStages.indexOf(currentProgress);

  // --- Step 1: Build a dynamic list of all steps and milestones ---
  const allSteps = [];
  progressStages.forEach((stage, index) => {
    const isCompleted = index < mainProgressIndex;
    const isCurrent = index === mainProgressIndex;

    // Add the primary progress step
    allSteps.push({
      key: stage,
      label: progressLabels[stage],
      isCompleted,
      isCurrent,
      isMilestone: false,
    });

    // --- Conditionally add milestones if their parent step is visible ---
    const parentIsVisible = isCompleted || isCurrent;

    // Apollo usage milestone
    if (stage === Progress.Email_added && parentIsVisible) {
      allSteps.push({
        key: 'apollo_milestone',
        label: apollo_used ? 'Apollo Used' : 'Apollo Not Used',
        isCompleted: isCompleted,
        isMilestone: true,
        success: apollo_used,
      });
    }

    // Chat started milestone
    if (stage === Progress.Mail_sent && parentIsVisible) {
      allSteps.push({
        key: 'chat_milestone',
        label: chat_started ? 'Chat Started' : 'Chat Not Started',
        isCompleted: isCompleted,
        isMilestone: true,
        success: chat_started,
      });
    }

    // Chat finished milestone
    if (stage === Progress.Summary_added && parentIsVisible) {
      allSteps.push({
        key: 'chat_finished_milestone',
        label: chat_finished ? 'Chat Finished' : 'Chat Not Finished',
        isCompleted: isCompleted,
        isMilestone: true,
        success: chat_finished,
      });
    }
  });

  return (
    <div className="w-full  p-4 font-sans bg-white ">
      <div className="flex flex-col">
        {allSteps.map((step, index) => {
          const isLastItem = index === allSteps.length - 1;

          if (step.isMilestone) {
            // --- Render a Milestone ---
            return (
              <div key={step.key} className="flex items-start pl-6">
                {/* Vertical line for milestone */}
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-px h-6 ${!isLastItem ? 'bg-gray-300' : 'bg-transparent'}`}></div>
                </div>
                {/* Milestone Icon and Label */}
                <div className={`flex items-center pb-6 ${step.isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                  <div
                    className={`
                      flex items-center justify-center w-5 h-5 rounded-full mr-3
                      ${step.success ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}
                    `}
                  >
                    {step.success ? (
                      <FiCheck className="w-3 h-3" />
                    ) : (
                      <FiX className="w-3 h-3" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-600">{step.label}</p>
                </div>
              </div>
            );
          } else {
            // --- Render a Primary Progress Step ---
            return (
              <div key={step.key} className="flex items-start">
                {/* Step Circle and Connecting Line */}
                <div className="flex flex-col items-center mr-4">
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2
                      transition-all duration-300
                      ${step.isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${step.isCurrent ? 'bg-white border-blue-500 ring-4 ring-blue-100' : ''}
                      ${!step.isCompleted && !step.isCurrent ? 'bg-white border-gray-300' : ''}
                    `}
                  >
                    {step.isCompleted ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${step.isCurrent ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                  {/* Vertical Line */}
                  {!isLastItem && (
                    <div className={`w-px h-full ${step.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  )}
                </div>
                {/* Step Label */}
                <div className="pt-1 pb-8">
                  <p
                    className={`
                      font-semibold
                      ${step.isCurrent ? 'text-blue-600' : 'text-gray-800'}
                      ${!step.isCompleted && !step.isCurrent ? 'text-gray-400' : ''}
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

// PropTypes for runtime type-checking
ProgressStepper.propTypes = {
  currentProgress: PropTypes.oneOf(progressStages).isRequired,
  apollo_used: PropTypes.bool,
  chat_started: PropTypes.bool,
  chat_finished: PropTypes.bool,
};

export default ProgressStepper;
