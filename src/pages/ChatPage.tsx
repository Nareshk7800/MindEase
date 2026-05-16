import { useState } from "react";
import Layout from "../components/Layout";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

const ChatPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const userText = userInput;
    const tempBotId = `bot-${Date.now()}`;

    setMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: userText },
      { id: tempBotId, role: "bot", text: "Typing..." },
    ]);
    setUserInput("");
    setLoading(true);

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const controller = new AbortController();
      const timeoutMs = 25000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(
          data?.reply || `Chat request failed (${res.status})`
        );
      }

      const reply = data?.reply || "No response from Gemini.";

      setMessages(prev =>
        prev.map(msg => (msg.id === tempBotId ? { ...msg, text: reply } : msg))
      );
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out. Please try again."
          : err instanceof Error
            ? err.message
            : "Chat failed to respond.";

      setMessages(prev => {
        const hasPlaceholder = prev.some(m => m.id === tempBotId);
        if (!hasPlaceholder) {
          return [
            ...prev,
            { id: tempBotId, role: "bot", text: message },
          ];
        }
        // Replace the "Typing..." placeholder with the error (preserve ordering)
        return prev.map(msg =>
          msg.id === tempBotId ? { ...msg, text: message } : msg
        );
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-[60vh]">
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-4">
          {messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={`max-w-[70%] p-3 rounded-xl ${msg.role === "user"
                  ? "ml-auto bg-pink-500 text-white"
                  : "bg-gray-100 text-black"
                }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2 p-4 border-t">
          <input
            className="flex-1 border rounded-lg px-4 py-2"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg"
              disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
