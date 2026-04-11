import VerificationReviewPage from "@/app/components/VerificationReview/VerificationReviewPage";

// The 'params' object is automatically passed to page components in dynamic routes
// It contains the dynamic segments from the URL, like { id: '101' }
export default function ReviewPage({ params }) {
  const { id } = params; // Extract the id from the URL

  return (
    <div style={{ backgroundColor: '#F0F2F5', padding: '20px' }}>
      {/* Pass the extracted id as a prop to our component */}
      <VerificationReviewPage id={id} />
    </div>
  );
}