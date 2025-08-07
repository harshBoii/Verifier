// 'use client';
// import { useState } from 'react';
// import { useParams } from 'next/navigation';
// import Swal from 'sweetalert2';

// const SubmitHrEmailPage = () => {
//     const [hrEmail, setHrEmail] = useState('');
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const params = useParams();
//     const { userId } = params;

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSubmitting(true);
//         try {
//             const response = await fetch('/api/update-hr-email', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ userId, hrEmail }),
//             });

//             if (!response.ok) throw new Error('Submission failed.');

//             Swal.fire('Success!', 'Thank you, the HR email has been submitted.', 'success');
//             setHrEmail(''); // Clear the form
//         } catch (error) {
//             Swal.fire('Error!', error.message, 'error');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div style={{ padding: '40px', maxWidth: '500px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
//             <h2>Submit HR Email Address</h2>
//             <p>Please provide the email address for your HR representative to complete the verification process.</p>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     type="email"
//                     value={hrEmail}
//                     onChange={(e) => setHrEmail(e.target.value)}
//                     placeholder="hr.manager@example.com"
//                     required
//                     style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '20px' }}
//                 />
//                 <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
//                     {isSubmitting ? 'Submitting...' : 'Submit'}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default SubmitHrEmailPage;

// app/submit-hr-email/[userId]/page.js
'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';

const SubmitHrEmailPage = () => {
    const [hrEmail, setHrEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();
    const { userId } = params;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/update-hr-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, hrEmail }),
            });

            if (!response.ok) throw new Error('Submission failed.');
            
            // --- THIS IS THE NEW LOGIC ---
            // After successful API call, save the update to the browser's local storage.
            // We create a unique key for each user, e.g., 'hrEmail-101'.
            localStorage.setItem(`hrEmail-${userId}`, hrEmail);
            // ---------------------------

            Swal.fire('Success!', 'Thank you, the HR email has been submitted.', 'success');
            setHrEmail(''); // Clear the form
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '500px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Submit HR Email Address</h2>
            <p>Please provide the email address for your HR representative to complete the verification process.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder="hr.manager@example.com"
                    required
                    style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '20px' }}
                />
                <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default SubmitHrEmailPage;