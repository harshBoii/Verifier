'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import OutboundCallForm from '@/app/components/verification/OutboundCallForm';

function PublicExperienceCallInner() {
  const searchParams = useSearchParams();
  const externalId = searchParams.get('externalId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [defaultPhone, setDefaultPhone] = useState('');

  useEffect(() => {
    if (!externalId) {
      setError('This link is missing required parameters.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/experience/external/${encodeURIComponent(externalId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Experience not found');
        if (cancelled) return;
        setDefaultPhone(data.verifier_number?.trim() || '');
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [externalId]);

  if (!externalId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 text-red-700">
        Invalid verification link.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-600">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-lg pt-6">
        <h1 className="text-center text-xl font-bold text-gray-900">Employment verification</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Confirm the number below to receive an automated verification call.
        </p>
        <div className="mt-8">
          <OutboundCallForm defaultPhone={defaultPhone} externalId={externalId} />
        </div>
      </div>
    </div>
  );
}

export default function PublicExperiencePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-600">
          Loading…
        </div>
      }
    >
      <PublicExperienceCallInner />
    </Suspense>
  );
}
