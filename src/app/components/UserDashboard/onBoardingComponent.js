'use client';

import { motion } from 'framer-motion';
import { FaUserCheck, FaShieldAlt, FaTasks, FaRobot, FaUsersCog, FaChartLine, FaStar } from 'react-icons/fa';
import Sparkle from "react-sparkle";
import Link from 'next/link';
import Marquee from "react-fast-marquee";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

// Animation helper
const sectionAnimation = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
  viewport: { once: true },
};

const EmployeeVerificationLandingPage = () => {
  return (
    <div className="bg-gray-50 text-gray-900 font-sans">
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <WorkflowSection />
        <TestimonialsSection />
        <AnalyticsSection />
        <PricingSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

//
// HERO
//
const HeroSection = () => (
  <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-white mt-40">
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-serif mb-4 max-w-4xl mx-auto">
        VETTIFY
        <span className=" ml-3 relative inline-block bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
          Employee Experience
        </span>
        Faster. Smarter. Safer.
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        Automate employment verification with AI follow-ups, Apollo.io data, and transparent dashboards for HR, admins, and employees.
      </p>
      <div className="flex justify-center gap-4 mb-12">
        <button className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300">
          Get Started
        </button>
        <button className="relative bg-emerald-200 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors duration-300">
          <Link href="/login">Login</Link>
          <Sparkle color="#FFD700" count={3} minSize={20} maxSize={25} flicker fadeOutSpeed={10} style={{ position: "absolute", top: 0, right: 0 }}/>
        </button>
      </div>
    </motion.div>
    <motion.div
      className="w-full max-w-5xl mx-auto px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-2 border border-gray-200 ">
        <img
          src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg"
          alt="Verification dashboard"
          className="w-full rounded-lg"
        />
      </div>
    </motion.div>
  </section>
);

//
// PROBLEM
//
const ProblemSection = () => (
  <motion.section {...sectionAnimation} className="py-20 sm:py-32 px-4 bg-white">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div className="text-left">
        <h2 className="text-4xl font-bold mb-6">Say goodbye to <span className='bg-red-200'>manual checks</span> & endless email loops.</h2>
        <p className="text-gray-600 text-lg mb-4">
          Employment verification today is slow, inefficient, and open to fraud. HR teams waste hours chasing responses, while candidates face delays.
        </p>
        <p className="text-gray-600 text-lg">
          Our platform automates the entire flow—from request to validation—giving you a faster, safer, and more reliable process.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-xl p-2 border border-gray-200">
        <img
          src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
          alt="Problems in manual verification"
          className="rounded-md w-full h-auto"
        />
      </div>
    </div>
  </motion.section>
);

//
// FEATURES
//
const features = [
  { icon: FaUserCheck, title: "Automated Email Verification", description: "Send secure HR verification requests instantly." },
  { icon: FaRobot, title: "AI Follow-ups", description: "Our AI nudges HR every 14 days until response." },
  { icon: FaShieldAlt, title: "Apollo.io Fallback", description: "Scrape Apollo.io data to fill gaps and prevent fraud." },
  { icon: FaTasks, title: "Role-based Dashboards", description: "Admins, Companies, Employees, and HRs see what matters to them." },
  { icon: FaUsersCog, title: "Access Control & Logs", description: "Granular role-based access with immutable logs." },
  { icon: FaChartLine, title: "Analytics & Reports", description: "Track progress, bottlenecks, and success rates in real-time." },
];

const FeaturesSection = () => (
  <motion.section {...sectionAnimation} className="py-20 sm:py-32 px-4">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-4">All-in-one platform for <span className="bg-blue-200">employee verification</span></h2>
      <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">No more spreadsheets. No more uncertainty.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-blue-600 mb-4">
              <f.icon size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

//
// WORKFLOW
//
const workflowSteps = [
  { name: "Onboarding", description: "Add employee details and initiate verification." },
  { name: "HR Email Request", description: "Secure request sent to HR automatically." },
  { name: "AI Follow-up", description: "AI reminders every 14 days if no response." },
  { name: "Apollo.io Scraping", description: "Fallback data collection from Apollo.io." },
  { name: "Approval", description: "HR verifies & system logs immutable record." },
];

const WorkflowSection = () => (
  <motion.section {...sectionAnimation} className="py-20 sm:py-32 px-4 bg-white">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-4">Verification made simple.</h2>
      <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto">From request to final approval, in one smooth flow.</p>
      <div className="relative flex flex-col md:flex-row justify-between items-center">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-300 transform -translate-y-1/2"></div>
        {workflowSteps.map((step, i) => (
          <motion.div
            key={i}
            className="relative z-10 flex flex-col items-center text-center w-full md:w-auto mb-8 md:mb-0"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 0.9, scale: 1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="bg-white border-2 border-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl mb-4 shadow-md">
              {i + 1}
            </div>
            <h3 className="font-semibold">{step.name}</h3>
            <p className="text-sm text-gray-500 max-w-xs mt-1">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.section>
);

//
// TESTIMONIALS
//
const reviews = [
  {
    text: "This cut our verification turnaround time by 60%. Onboarding is much faster.",
    name: "Sarah Jones",
    role: "HR Director",
    company: "FinTech Corp",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    text: "Fraudulent claims dropped dramatically. Apollo.io fallback is a lifesaver.",
    name: "James Lee",
    role: "Compliance Lead",
    company: "Bright Media",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
];

const TestimonialsSection = () => (
  <motion.section className="py-20 sm:py-32 px-4 bg-gray-50">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-12">
        Trusted by leading HR & Compliance teams
      </h2>
      <Marquee pauseOnHover gradient={true} speed={50}>
        {reviews.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl h-70 shadow-lg border mx-6 p-6 w-80 flex-shrink-0 transition-transform hover:-translate-y-2 duration-300">
            <div className="flex justify-center text-yellow-400 mb-4">
              {[...Array(5)].map((_, idx) => <FaStar key={idx} />)}
            </div>
            <blockquote className="text-base text-gray-700 italic leading-relaxed mb-6">
              “{r.text}”
            </blockquote>
            <div className="flex items-center gap-3">
              <img src={r.avatar} alt={r.name} className="w-12 h-12 rounded-full border" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">{r.name}</p>
                <p className="text-sm text-gray-500">{r.role}, {r.company}</p>
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  </motion.section>
);

//
// ANALYTICS
//
const AnalyticsSection = () => (
  <motion.section {...sectionAnimation} className="py-20 sm:py-32 px-4 bg-white">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div className="bg-white rounded-lg shadow-xl p-2 border border-gray-200">
        <img
          src="https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg"
          alt="Analytics dashboard"
          className="rounded-md w-full h-auto"
        />
      </div>
      <div className="text-left">
        <h2 className="text-4xl font-bold mb-6">Track progress in real time.</h2>
        <p className="text-gray-600 text-lg mb-4">
          Measure verification timelines, fraud detection, and HR response rates with built-in analytics.
        </p>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center gap-2"><FaUserCheck className="text-blue-600"/> Response time per company</li>
          <li className="flex items-center gap-2"><FaShieldAlt className="text-blue-600"/> Fraud risk score</li>
          <li className="flex items-center gap-2"><FaChartLine className="text-blue-600"/> Verification success rate</li>
        </ul>
      </div>
    </div>
  </motion.section>
);

//
// PRICING
//
const PricingSection = () => (
  <motion.section {...sectionAnimation} className="py-20 sm:py-32 px-4">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-4">Simple, clear pricing</h2>
      <p className="text-lg text-gray-600 mb-16">Choose a plan that fits your organization.</p>
      <div className="grid lg:grid-cols-3 gap-8 items-stretch">
        <div className="bg-white p-8 rounded-xl shadow-lg border flex flex-col">
          <h3 className="text-2xl font-semibold mb-2">Starter</h3>
          <p className="text-gray-500 mb-6">For small teams.</p>
          <p className="text-4xl font-bold mb-6">Free</p>
          <ul className="space-y-4 text-left mb-8 flex-grow">
            <li className="flex items-center gap-3"><FaUserCheck className="text-blue-600"/> Up to 10 verifications</li>
            <li className="flex items-center gap-3"><FaTasks className="text-blue-600"/> Basic dashboard</li>
          </ul>
          <button className="w-full bg-gray-200 py-3 rounded-lg hover:bg-gray-300">Start Now</button>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-blue-600 relative flex flex-col">
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
            <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">Most Popular</span>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Growth</h3>
          <p className="text-gray-500 mb-6">For growing teams.</p>
          <p className="text-4xl font-bold mb-6">$49<span className="text-lg font-normal text-gray-500">/mo</span></p>
          <ul className="space-y-4 text-left mb-8 flex-grow">
            <li className="flex items-center gap-3"><FaUserCheck className="text-blue-600"/> 500 verifications</li>
            <li className="flex items-center gap-3"><FaRobot className="text-blue-600"/> AI follow-ups</li>
            <li className="flex items-center gap-3"><FaChartLine className="text-blue-600"/> Reports & analytics</li>
          </ul>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700">Choose Growth</button>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border flex flex-col">
          <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
          <p className="text-gray-500 mb-6">For large-scale organizations.</p>
          <p className="text-4xl font-bold mb-6">Custom</p>
          <ul className="space-y-4 text-left mb-8 flex-grow">
            <li className="flex items-center gap-3"><FaUsersCog className="text-blue-600"/> Unlimited verifications</li>
            <li className="flex items-center gap-3"><FaShieldAlt className="text-blue-600"/> Dedicated compliance support</li>
          </ul>
          <button className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900">Contact Sales</button>
        </div>
      </div>
    </div>
  </motion.section>
);

//
// FINAL CTA
//
const FinalCTASection = () => (
  <section className="py-20 px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-12 rounded-xl shadow-xl"
    >
      <h2 className="text-4xl font-bold mb-4">Ready to verify smarter?</h2>
      <p className="text-lg mb-8 opacity-90">Save time, reduce fraud, and onboard employees faster.</p>
      <button className="bg-white text-blue-600 font-bold py-4 px-10 rounded-lg shadow-lg hover:bg-gray-100 transition-colors text-lg">
        Get Started Today
      </button>
    </motion.div>
  </section>
);

//
// FOOTER
//
const Footer = () => (
  <motion.footer
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    viewport={{ once: true }}
    className="bg-gradient-to-r from-gray-50 to-gray-100 py-12 px-4 border-t border-gray-200"
  >
    <div className="max-w-6xl mx-auto text-center text-gray-600">
      <div className="flex justify-center gap-8 mb-6 flex-wrap">
        {["Features", "Pricing", "Contact", "Docs"].map((link, i) => (
          <a key={i} href="#" className="font-medium hover:text-blue-600">{link}</a>
        ))}
      </div>
      <div className="flex justify-center gap-6 mb-8">
        {[FaTwitter, FaGithub, FaLinkedin].map((Icon, i) => (
          <a key={i} href="#" className="text-xl hover:text-blue-600"><Icon /></a>
        ))}
      </div>
      <p className="text-sm">&copy; {new Date().getFullYear()} VerifyX. All rights reserved.</p>
    </div>
  </motion.footer>
);

export default EmployeeVerificationLandingPage;
