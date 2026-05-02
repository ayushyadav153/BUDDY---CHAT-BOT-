import { GoogleGenAI } from '@google/genai';
import { Square, Loader2, Send, Bot, Sparkles, Mic, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// Initialize the API
// Note: process.env.GEMINI_API_KEY is resolved by Vite.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a professional AI Chat Assistant named "Buddy". Your role is to answer ANY question the user asks, accurately and conversationally.

CORE INSTRUCTIONS:
1. Language: Always respond in English unless the user switches to another language. 
2. Tone: Sound natural, friendly, and human. Use varied sentence length. Avoid robotic phrases like "As an AI" or "I'm a language model".
3. Accuracy: For facts, current events, news, weather, sports, prices: search for real-time data first. If you don't know or can't find info, say "I don't know" instead of guessing.
4. Conciseness: Lead with the direct answer. Then add detail only if needed. Keep responses short and clear.
5. Safety: Never give instructions for violence, self-harm, illegal acts, or medical diagnosis. For health, say "Please consult a healthcare professional". Never ask for passwords, OTPs, bank details, Aadhaar, or other sensitive data.
6. Identity: If asked who you are, say: "I'm Buddy, an AI assistant designed to help you with any question."
7. Complexity: For multi-step questions, break answers into numbered steps or bullet points.
8. Neutrality: Stay neutral on politics, religion, and controversial topics. Provide balanced facts without personal opinions.

PROJECT KNOWLEDGE BASE - Online Employee Payroll Management System:
- Purpose: Web-based system that automates salary processing for organizations.
- Built by: Ayush Yadav, Shivam Soni, Tarun Solanki
- Admin Login: User ID = ayushyadav19, Password = itpresen153
- Admin Features: Add/edit employees, set salary structure, calculate payroll, generate PDF payslips, track attendance & leave, generate salary reports.
- Employee Features: Login, view/download payslips, update profile, check attendance/leave balance.
- Tech Stack: React, TailwindCSS, Node.js, Express, MongoDB, JWT authentication, PDF generation.
- Payroll Components: Basic, HRA, DA, PF, ESI, TDS, LOP calculation.
- Footer: "This website is designed by Ayush Yadav, Shivam Soni, Tarun Solanki"

RESPONSE STYLE:
- Keep it conversational. 
- Example: "The payroll system calculates your salary by adding basic pay, HRA, DA, then deducting PF, ESI, and tax to get your net pay."
- If asked about something outside this project, answer using general knowledge and web search.

Your goal: Be the most helpful, accurate, and natural-sounding chat assistant for any question.`;

export default function App() {
  const [logs, setLogs] = useState<{ id: string, role: 'user' | 'buddy', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const clearChats = () => {
    setLogs([]);
    setShowConfirmDelete(false);
    
    // Reset chat session to clear history in the API too
    chatRef.current = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
  };

  useEffect(() => {
    // Initialize standard chat session
    chatRef.current = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setChatInput(transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setChatInput(''); // Clear input before starting
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isTyping]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const textToSend = chatInput;
    setChatInput('');
    setLogs((prev) => [...prev, { id: Math.random().toString(), role: 'user', text: textToSend }]);
    setIsTyping(true);

    try {
      if (!chatRef.current) {
         chatRef.current = ai.chats.create({
            model: "gemini-3.1-pro-preview",
            config: { systemInstruction: SYSTEM_INSTRUCTION }
         });
      }
      const response = await chatRef.current.sendMessage({ message: textToSend });
      setLogs((prev) => [...prev, { id: Math.random().toString(), role: 'buddy', text: response.text }]);
    } catch (err: any) {
      console.error("Error sending chat", err);
      setLogs((prev) => [...prev, { id: Math.random().toString(), role: 'buddy', text: "Sorry, I encountered an error responding to that. " + (err?.message || '') }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#1A1A1A] text-[#F3F4F6] font-[Inter,sans-serif]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#3A3A3A] bg-[#262626] shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#A855F7] p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#262626] rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#A855F7]" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#3B82F6] to-[#A855F7] bg-clip-text text-transparent flex items-center">
              Buddy <Sparkles className="w-4 h-4 ml-1 text-[#3B82F6]" />
            </h1>
            <p className="text-xs text-[#9CA3AF]">Designed by Ayush Yadav</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowConfirmDelete(true)}
            disabled={logs.length === 0}
            className={`p-2 rounded-lg transition-colors ${logs.length === 0 ? 'text-[#4B5563] cursor-not-allowed' : 'text-[#9CA3AF] hover:text-red-400 hover:bg-[#3A3A3A]'}`}
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full transition-colors bg-[#10B981]"></span>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Online</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col scrollbar-thin scrollbar-thumb-[#3A3A3A]">
        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 bg-[#262626] border border-[#3A3A3A]">
              <Bot className="w-10 h-10 text-[#3B82F6]" />
            </div>
            <h2 className="text-2xl font-semibold">Hi Ayush, I'm Buddy.</h2>
            <p className="text-[#9CA3AF]">
              Your Academic Success Coach and Chat Assistant. Say hi or ask a question!
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto w-full pb-4 mt-auto">
             {logs.map((log) => (
               <div key={log.id} className={`flex flex-col ${log.role === 'buddy' ? 'items-start' : 'items-end'}`}>
                 <span className={`text-[10px] uppercase tracking-wider mb-1 font-semibold ${log.role === 'buddy' ? 'text-[#3B82F6]' : 'text-[#A855F7]'}`}>
                   {log.role}
                 </span>
                 <div className={`px-5 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                   log.role === 'buddy' 
                     ? 'bg-[#262626] border border-[#3A3A3A] rounded-tl-sm text-[#D1D5DB]' 
                     : 'bg-[#3B82F6] text-white rounded-tr-sm shadow-sm'
                 }`}>
                   {log.text}
                 </div>
               </div>
             ))}
             {isTyping && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-wider mb-1 font-semibold text-[#3B82F6]">
                    buddy
                  </span>
                  <div className="px-5 py-3 rounded-2xl bg-[#262626] border border-[#3A3A3A] rounded-tl-sm text-[#D1D5DB]">
                    <div className="flex space-x-1 items-center h-5">
                       <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
             )}
             <div ref={scrollRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-6 bg-[#1A1A1A] border-t border-[#3A3A3A] shrink-0">
        <form onSubmit={handleSendChat} className="max-w-3xl mx-auto relative flex items-center">
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute left-2 p-2.5 rounded-full transition-all duration-200 z-10 ${
               isListening 
                 ? 'text-[#3B82F6] bg-[#3B82F6]/10' 
                 : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#3A3A3A]'
            }`}
            title={isListening ? "Listening..." : "Voice input"}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>

          {/* Input Field */}
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isTyping}
            className={`w-full bg-[#262626] text-[#F3F4F6] text-sm rounded-full pl-14 pr-14 py-4 outline-none border border-[#3A3A3A] focus:border-[#3B82F6] transition-colors focus:ring-1 focus:ring-[#3B82F6] ${isTyping && 'opacity-50 cursor-not-allowed'}`}
            placeholder={isListening ? "Listening..." : (isTyping ? "Buddy is typing..." : "Message Buddy...")}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!chatInput.trim() || isTyping}
            className={`absolute right-2 p-2.5 rounded-full transition-colors z-10 ${
               (!chatInput.trim() || isTyping)
                 ? 'text-[#6B7280] bg-transparent' 
                 : 'text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-md'
            }`}
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin text-[#9CA3AF]" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-2">Clear History?</h3>
            <p className="text-[#9CA3AF] mb-6">
              Are you sure you want to delete all chats? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#3A3A3A] hover:bg-[#4B5563] text-white transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={clearChats}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors font-medium"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
