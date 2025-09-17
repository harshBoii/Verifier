"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, Zap, Globe, Shield } from "lucide-react";
import { FiCheckCircle } from "react-icons/fi"; 
import gsap from "gsap";

const BRAND_NAME = "Vettify";

const PALETTE = {
  primary: {
    DEFAULT: "#1A73E8",
    dark: "#0D47A1",
    light: "#E3F2FD",
  },
  neutral: {
    light: "#F8FAFC",
    DEFAULT: "#FFFFFF",
    dark: "#374151",
  },
};

const BRAND_FEATURES = [
  { icon: Shield, title: "Enterprise-Grade Security", description: "Your data is protected with end-to-end encryption and compliance-first infrastructure." },
  { icon: Zap, title: "Seamless Connections", description: "Integrate with Zoho, Darwinbox, Twilio, Surepass, and more in just a few clicks." },
  { icon: Globe, title: "Trusted Worldwide", description: "Powering verification and compliance workflows for teams across the globe." },
  { icon: FiCheckCircle, title: "Multi-Channel Delivery", description: "Send verification requests via SMS, Email, WhatsApp, or automated Twilio flows." },
  { icon: Zap, title: "Smart Workflows", description: "Set up custom verification workflows triggered immediately or on scheduled dates." },
  { icon: Globe, title: "AI Chatbot Assistant", description: "An intelligent assistant that guides candidates and admins through the verification journey." },
];

export default function VettifyAuthPage() {
  const borderRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    // Animate border gradient
    if (borderRef.current) {
      gsap.to(borderRef.current, {
        backgroundPosition: "200% center",
        duration: 12,
        ease: "linear",
        repeat: -1,
      });
    }

    // Animate background gradient
    if (bgRef.current) {
        gsap.to(bgRef.current, {
            filter: "hue-rotate(20deg)",
            duration: 10,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
        });
    }
  }, []);

  return (
    <div
      ref={bgRef}
      className="font-sans antialiased min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(120deg, #E0F2FE, #93C5FD, #E0E7FF, #E0F2FE)",
        backgroundSize: "300% 300%",
      }}
    >
      {/* Animated Border Container */}
      <div
        ref={borderRef}
        className="relative w-full max-w-4xl rounded-2xl p-[3px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #CBD5E1, #93C5FD, #60A5FA, #CBD5E1)",
          backgroundSize: "200% 300%",
        }}
      >
        {/* Inner Card */}
        <div className="grid overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2 bg-white">
          {/* Left Side: Branding and Features */}
          <div
            className="p-8 md:p-12 rounded-l-2xl"
            style={{
              backgroundColor: PALETTE.primary.dark,
              color: PALETTE.neutral.DEFAULT,
            }}
          >
            <h1 className="flex items-center text-2xl font-bold">
              <CheckCircle className="h-7 w-7 mr-2" />
              {BRAND_NAME}
            </h1>
            <p className="mt-4 text-gray-300">
              The secure, simple, and seamless way to verify identities —
              with smart workflows, multi-channel notifications, and
              AI-powered assistance.
            </p>
            <div className="mt-10 space-y-8">
              {BRAND_FEATURES.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Authentication */}
          <div
            className="flex flex-col justify-center p-8 md:p-12 rounded-r-2xl"
            style={{ backgroundColor: PALETTE.neutral.DEFAULT }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
              <p className="mt-2 text-gray-600">
                Sign in to your account to continue.
              </p>
              <button
                className="mt-8 inline-flex w-full justify-center items-center rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiCheckCircle className="mr-3 h-6 w-6 text-emerald-500" />
                Sign in with Zoho
              </button>
              <div className="mt-8 text-xs text-gray-500">
                By continuing, you agree to our{" "}
                <a
                  href="#"
                  className="font-medium hover:underline"
                  style={{ color: PALETTE.primary.DEFAULT }}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium hover:underline"
                  style={{ color: PALETTE.primary.DEFAULT }}
                >
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
