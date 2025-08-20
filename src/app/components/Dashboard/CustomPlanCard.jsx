// components/CustomPlanCard.js

import React from "react";
import { useState } from "react";

const CustomPlanCard = ({
  plan,
  allFeatures,
  onNameChange,
  onFeatureToggle,
  onCustomLimitChange,
  onSubscribe,
}) => {
  const isFeatureIncluded = (featureText) => {
    return plan.features.some((f) => f.text === featureText);
  };

  const getFeatureLimit = (featureText) => {
    return plan.features.find((f) => f.text === featureText)?.limit ?? "";
  };

  const [limit, setLimit] = useState("");

  const handleChange = (e) => {
    setLimit(e.target.value); // updates state whenever user types
  };

  return (
    <div className="bg-gradient-to-br from-[#F4F8FF] via-white to-[#EAF3FF] border border-gray-200 rounded-3xl p-8 w-full max-w-md text-[#181059] shadow-xl hover:shadow-2xl transition">
      {/* Plan Name */}
      <div className="mb-8 text-center">
        <input
          type="text"
          value={plan.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-3xl font-extrabold text-center w-full bg-transparent border-b-2 border-[#8645FF] focus:outline-none focus:border-[#181059] pb-2 transition"
          placeholder="Your Custom Plan Name"
        />
      </div>

      {/* Features */}
      <div className="text-left mb-8 border-t border-b border-gray-200 py-6">
        <h4 className="font-semibold text-lg mb-4 text-[#333]">Select Features:</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {allFeatures.map((feature) => {
            const isVerificationLimit = /verification limit/i.test(feature.text);

            if (isVerificationLimit) {
              // Render Verification Limit as a full-width row
              return (
                <li
                  key={feature.text}
                  className="col-span-2 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <label
                    htmlFor={`limit-${feature.text}`}
                    className="text-base font-medium text-gray-700"
                  >
                    {feature.text.slice(0,18)}
                  </label>
                  <input
                    type="number"
                    id={`limit-${feature.text}`}
                    value={limit}   // controlled by React state
                    onChange={handleChange}
                    className="w-28 rounded-lg border border-gray-300 text-[#8645FF] font-semibold focus:ring-2 focus:ring-[#8645FF] focus:border-[#8645FF] text-right p-2 transition"
                  />
                </li>
              );
            }

            // Render normal checkbox features
            return (
              <li
                key={feature.text}
                className="flex items-center bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <input
                  type="checkbox"
                  id={`feature-${feature.text}`}
                  checked={isFeatureIncluded(feature.text)}
                  onChange={() => onFeatureToggle(feature)}
                  className="h-5 w-5 rounded-lg border-gray-300 text-[#8645FF] focus:ring-2 focus:ring-[#8645FF] transition"
                />
                <label
                  htmlFor={`feature-${feature.text}`}
                  className="ml-3 text-sm font-medium text-gray-700 flex-grow"
                >
                  {feature.text}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price */}
      <div className="text-center mb-10">
        <span className="text-5xl font-extrabold text-[#181059]">
          ₹{plan.price}
        </span>
        <span className="text-lg text-gray-500">/mon</span>
      </div>

      {/* Button */}
      <button
        className="w-full py-4 rounded-2xl font-bold text-lg transition bg-gradient-to-r from-[#8645FF] to-[#6A4DFF] text-white hover:opacity-90 shadow-lg hover:shadow-xl"
        onClick={() => onSubscribe(plan)}
      >
        Subscribe to Custom Plan
      </button>
    </div>
  );
};

export default CustomPlanCard;
