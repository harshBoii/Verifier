'use client';

import { useState, useEffect } from 'react';

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'multi', label: 'Regional' },
];

/**
 * @param {object} props
 * @param {string} props.defaultPhone
 * @param {number} [props.experienceId]
 * @param {string} [props.externalId]
 * @param {() => void} [props.onSuccess]
 */
export default function OutboundCallForm({
  defaultPhone = '',
  experienceId,
  externalId,
  onSuccess,
}) {
  const [phone, setPhone] = useState(defaultPhone);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setPhone(defaultPhone || '');
  }, [defaultPhone]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body = {
        to: phone.trim(),
        language,
        ...(externalId != null ? { externalId: String(externalId) } : { experienceId }),
      };
      const res = await fetch('/api/verification/outbound-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Request failed');
      }
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center text-green-900 shadow-sm">
        <p className="text-lg font-semibold">Call scheduled</p>
        <p className="mt-2 text-sm text-green-800">
          You should receive the verification call shortly on{' '}
          <span className="font-medium">{phone.trim()}</span>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-gray-900">Verify using call</h2>
      <p className="mt-1 text-sm text-gray-600">
        Enter the number to receive the automated verification call. You can edit it if needed.
      </p>

      <label className="mt-4 block text-sm font-medium text-gray-700">Phone number</label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+919876543210"
        required
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-gray-700">Call language</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {LANG_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                language === opt.value
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <input
                type="radio"
                name="call-lang"
                value={opt.value}
                checked={language === opt.value}
                onChange={() => setLanguage(opt.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !phone.trim()}
        className="mt-5 w-full rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Calling…' : 'Proceed — call me'}
      </button>
    </form>
  );
}
