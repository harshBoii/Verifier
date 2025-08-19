'use client'
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation'; 

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
  </div>
);


const MessageBubble = ({ message, isUser }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div
      className={`max-w-md px-4 py-3 rounded-2xl shadow ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-white text-gray-800 rounded-bl-none'
      }`}
    >
      {/* Using dangerouslySetInnerHTML to render markdown for bolding, etc. in summary */}
      <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br />') }}></p>
    </div>
  </div>
);

// --- Main Chat Component ---
export default function ChatPage() {
  // --- State Management ---
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [QADone, setQADone] = useState(false); // State to track if the summary has been received
  const [empId,setEmpId] = useState(0)
  const [summary,setSummmary]= useState("")
  const chatEndRef = useRef(null);

  
  const router = useRouter(); 
  const params = useParams(); 
  const experienceId = params.experienceId;

  // --- Effects ---

  // Automatically scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start the conversation on component mount when experienceId is available
  useEffect(() => {
    if (experienceId) {
      startConversation(experienceId);
    } else {
      setMessages([{ text: "Waiting for a work experience ID in the URL...", isUser: false }]);
    }
  }, [experienceId]); 

  // --- API Interaction ---
  const startConversation = async (id) => {
    setIsLoading(true);
    setMessages([]);
    setSession(null);
    setQADone(false); // Reset the QA status on new session


    try {
      // Step 1: Fetch the dynamic experience data from your Next.js API
      const experienceResponse = await fetch(`/api/experience/${id}`);
      console.log(experienceData)
      if (!experienceResponse.ok) {
        throw new Error(`Failed to fetch experience data. Status: ${experienceResponse.status}`);
      }
      const experienceData = await experienceResponse.json();
      setEmpId(experienceData.user.id)

      // Extract skill names and concatenate them into a single string.
      const skillsString = experienceData.skills?.map(s => s.skill.name).join(', ') || '';
      
      // Combine the original description with the new skills string.
      const combinedExperience = `${experienceData.description}\n\nSkills: ${skillsString}`;
      
      // Step 2: Use the fetched data to start the feedback session.
      const feedbackResponse = await fetch('https://questionbotverifier.onrender.com/start-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: experienceData.jobTitle || experienceData.role, // Use user's position if available
          work_experience: combinedExperience, // Send the combined description and skills
          name: experienceData.user?.fullName || "User"
        }),
      });

      if (!feedbackResponse.ok) throw new Error('Failed to start conversation');

      const data = await feedbackResponse.json();
      
      setSession({
        sessionId: data.session_id,
        checkpointId: data.checkpoint_id,
      });

      setMessages([{ text: data.question, isUser: false }]);
    } catch (error)
 {
      console.error("Start conversation error:", error);
      setMessages([{ text: "Sorry, I couldn't start the conversation. Please try again later.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !session) return;

    const userMessage = { text: userInput, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://questionbotverifier.onrender.com/continue-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.sessionId,
          answer: userInput,
          checkpoint_id: session.checkpointId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();

      if (data.question) {
        setSession({
          sessionId: data.session_id,
          checkpointId: data.checkpoint_id,
        });
        setMessages(prev => [...prev, { text: data.question, isUser: false }]);
      } else if (data.summary) {
        setMessages(prev => [...prev, { text: `**Feedback Summary:**\n\n${data.summary}`, isUser: false }]);
        setSession(null);
        setQADone(true); // Set QA to done to show the final buttons
        setSummmary(data.summary)
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessages(prev => [...prev, { text: "Sorry, an error occurred. Please try again.", isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Button Handlers for Final Step ---
  const handleFinalSubmit = async () => {
    const updateDb = await fetch('/api/submit-verification',{
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({
        employeeId:parseInt(empId),
        revisionComment:summary,
        expId:parseInt(experienceId)      
      })
    })
    // employeeId, revisionComment,expId
    console.log("Submitting final feedback...");
    setIsLoading(true);
    setTimeout(() => {
        setMessages(prev => [...prev, { text: "Thank you for your feedback!", isUser: false }]);
        setIsLoading(false);
    }, 1500);
  };

  // --- Render ---
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Feedback Agent</h1>
            <p className="text-sm text-gray-500">AI-powered feedback collection</p>
          </div>
          <button
            onClick={() => experienceId && startConversation(experienceId)}
            disabled={isLoading || !experienceId}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            New Session
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg.text} isUser={msg.isUser} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-md px-4 py-3 rounded-2xl shadow bg-white text-gray-800 rounded-bl-none">
                <LoadingSpinner />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Form or Final Action Buttons */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          {QADone ? (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => experienceId && startConversation(experienceId)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Submit
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={session ? "Type your answer..." : "Session ended. Start a new one."}
                disabled={isLoading || !session}
                className="flex-1 w-full px-4 py-2 text-sm text-gray-800 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim() || !session}
                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </form>
          )}
        </div>
      </footer>
    </div>
  );
}
