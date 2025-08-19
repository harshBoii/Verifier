'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { FiMail, FiArrowRight } from 'react-icons/fi';

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SubmitHrEmailPage = () => {
    const [hrEmail, setHrEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();
    const { experienceId } = params;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/experience/${experienceId}/update-hr-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hrEmail }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed.');
            }
            
            await Swal.fire({
                title: 'Success!',
                text: 'Thank you, the HR email has been submitted.',
                icon: 'success',
                confirmButtonColor: '#2563eb',
            });

            setHrEmail('');
            // You can optionally close the window after success
            // window.close();

        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <FiMail className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">Submit HR Email Address</h2>
                <p className="mt-2 text-gray-600">
                    Please provide the email address for your HR representative for this work experience.
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="relative">
                        <input
                            type="email"
                            value={hrEmail}
                            onChange={(e) => setHrEmail(e.target.value)}
                            placeholder="hr.manager@example.com"
                            required
                            className="w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full flex justify-center items-center gap-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Spinner /> : 'Submit'}
                        {!isSubmitting && <FiArrowRight />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitHrEmailPage;
