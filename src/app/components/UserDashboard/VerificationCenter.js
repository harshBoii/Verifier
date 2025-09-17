'use client';
import React, { useState } from 'react';
import { FiHome, FiDollarSign, FiShield, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import BankVerificationModal from './BankVerificationModal';
import PfVerificationModal from './PfVerificationModal';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Default marker fix for Next.js + Leaflet
const DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png", // make sure to put leaflet's marker icon in /public
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const initialVerificationStatus = {
  address: 'PENDING',
  bank: 'PENDING',
  pf: 'VERIFIED',
};

const VerificationDashboard = () => {
  const [isBankModalOpen, setBankModalOpen] = useState(false);
  const [isPfModalOpen, setPfModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(initialVerificationStatus);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [verifiedLocation, setVerifiedLocation] = useState(null); // store lat/lng

  const handleVerificationSuccess = (type) => {
    setVerificationStatus((prev) => ({ ...prev, [type]: 'VERIFIED' }));
  };

  // 🔹 Geolocation for Address Verification
  const handleAddressVerification = () => {
    if (!('geolocation' in navigator)) {
      alert('❌ Geolocation not supported in this browser.');
      return;
    }

    setLoadingAddress(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            }),
          });

          if (res.ok) {
            setVerifiedLocation({ latitude, longitude });
            handleVerificationSuccess('address');
          } else {
            alert('❌ Failed to verify address.');
          }
        } catch (err) {
          console.error(err);
          alert('❌ Error sending location.');
        } finally {
          setLoadingAddress(false);
        }
      },
      (error) => {
        console.error(error);
        alert('❌ Unable to fetch location: ' + error.message);
        setLoadingAddress(false);
      }
    );
  };

  const verificationRows = [
    {
      type: 'address',
      icon: <FiHome className="text-blue-500" size={24} />,
      title: 'Address Verification (via Location)',
      description: 'Verify your current address by sharing your live location.',
      status: verificationStatus.address,
      action: handleAddressVerification,
    },
    {
      type: 'bank',
      icon: <FiDollarSign className="text-green-500" size={24} />,
      title: 'Bank Account Verification',
      description: 'Verify your bank account for payouts.',
      status: verificationStatus.bank,
      action: () => setBankModalOpen(true),
    },
    {
      type: 'pf',
      icon: <FiShield className="text-purple-500" size={24} />,
      title: 'PF Verification',
      description: 'Verify your PF account via Aadhaar.',
      status: verificationStatus.pf,
      action: () => setPfModalOpen(true),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Verification</h2>
          <p className="text-gray-500 mb-6">
            Secure your account by completing the following verification steps.
          </p>

          <div className="space-y-4">
            {verificationRows.map((row) => (
              <div
                key={row.type}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 rounded-full p-3">{row.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">{row.title}</h3>
                    <p className="text-sm text-gray-500">{row.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {row.status === 'VERIFIED' ? (
                    <span className="flex items-center text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      <FiCheckCircle className="mr-2" />
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={row.action}
                      disabled={row.type === 'address' && loadingAddress}
                      className={`${
                        row.type === 'address' && loadingAddress
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white font-semibold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105`}
                    >
                      {row.type === 'address' && loadingAddress ? 'Fetching...' : 'Verify'}
                    </button>
                  )}
                  {row.status !== 'VERIFIED' && <FiChevronRight className="text-gray-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show map if address verified */}
        {verificationStatus.address === 'VERIFIED' && verifiedLocation && (
          <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Verified Address Location</h3>
            <MapContainer
              center={[verifiedLocation.latitude, verifiedLocation.longitude]}
              zoom={15}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[verifiedLocation.latitude, verifiedLocation.longitude]}>
                <Popup>Your verified location</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      {/* Other modals */}
      <BankVerificationModal
        isOpen={isBankModalOpen}
        onClose={() => setBankModalOpen(false)}
        onSuccess={() => handleVerificationSuccess('bank')}
      />

      <PfVerificationModal
        isOpen={isPfModalOpen}
        onClose={() => setPfModalOpen(false)}
        onSuccess={() => handleVerificationSuccess('pf')}
      />
    </div>
  );
};

export default VerificationDashboard;
