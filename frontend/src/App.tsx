import React, { useState } from "react";
import { Send, Brain, MessageSquare } from "lucide-react";
import { sendMessage } from "./services/api";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I'm your AI therapist. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage({ message: input });
      const aiResponse: Message = {
        content: response.data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error communicating with the backend:", error);
      const errorMessage: Message = {
        content: "Oops! Something went wrong. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Brain className="w-8 h-8 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-800">EmpathyAI</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg min-h-[600px] flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.isUser
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">AI Therapist</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-4">
                  <p className="text-sm">AI Therapist is typing...</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                disabled={loading}>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
