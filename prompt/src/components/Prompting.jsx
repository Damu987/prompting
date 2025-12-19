import React, { useState, useEffect, useRef } from "react";
import { fetchAIResponse, fetchHistory, saveHistoryItem, deleteHistoryItemAPI } from "./api/API";
import PromptInput from "./PromptInput";
import PromptResponse from "./PromptResponse";
import "./Prompting.css";

export default function Prompting() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const recognitionRef = useRef(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const itemsToShow = showFullHistory ? history : history.slice(0, 7);
  //Load history from backend
  useEffect(() => {
    if (!userId || !token) return;

    const loadHistory = async () => {
      try {
        const res = await fetchHistory(userId, token);
        const formatted = (res.history || []).map((item) => ({
          user: item.user || item.prompt || item.userInput || "",
          bot: item.bot || item.response || item.aiResponse || "",
        }));
        setHistory(formatted);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    loadHistory();
  }, [userId, token]);
//speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
    };

    recognitionRef.current.onerror = () => setListening(false);
    recognitionRef.current.onend = () => setListening(false);
  }, []);

  const handleMic = () => {
    if (!recognitionRef.current) return alert("Speech recognition not supported.");
    listening ? recognitionRef.current.stop() : recognitionRef.current.start();
    setListening(!listening);
  };
//generate ai response
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setMessages((prev) => [...prev, { sender: "user", text: prompt }]);

    try {
      const aiRes = await fetchAIResponse(prompt, token, userId);
      const botText = aiRes?.response || "Error generating response";
      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);

      if (editingItem) {
        await deleteHistoryItemAPI(userId, editingItem.user, editingItem.bot, token);
        await saveHistoryItem(userId, prompt, botText, token);
      } else {
        await saveHistoryItem(userId, prompt, botText, token);
      }

      // Refresh history
      const historyRes = await fetchHistory(userId, token);
      const formatted = (historyRes.history || []).map((item) => ({
        user: item.user || item.prompt || item.userInput || "",
        bot: item.bot || item.response || item.aiResponse || "",
      }));
      setHistory(formatted);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error generating response" }]);
    }

    setPrompt("");
    setEditingItem(null);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(console.error);
  };

 //Load history into chat
  const loadHistoryItem = (item) => {
    setMessages([
      { sender: "user", text: item.user },
      { sender: "bot", text: item.bot },
    ]);
    setPrompt(item.user);
    setEditingItem(item);
  };
//delete history item
  const deleteHistoryItem = async (item) => {
    setHistory((prev) => prev.filter(h => !(h.user === item.user && h.bot === item.bot)));

    try {
      const res = await deleteHistoryItemAPI(userId, item.user, item.bot, token);
      if (!res.success) {
        console.error("Failed to delete history item from backend:", res.message);
      } else {
        showToast("History item deleted successfully!");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }

    if (editingItem && editingItem.user === item.user && editingItem.bot === item.bot) {
      setEditingItem(null);
      setPrompt("");
      setMessages([]);
    }
  };

//toast
  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  return (
    <div className="prompting-wrapper">
      <div className="prompt-left">
        <h2 className="prompt-title">Prompt Generator</h2>

        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          editing={!!editingItem}
          listening={listening}
          handleMic={handleMic}
          handleGenerate={handleGenerate}
          loading={loading}
          handleKeyDown={handleKeyDown}
        />

        <PromptResponse
          messages={messages}
          copyToClipboard={copyToClipboard}
          handleEditMessage={(index) => {
            setPrompt(messages[index].text);
            setEditingItem({ user: messages[index].text, bot: messages[index + 1]?.text || "" });
          }}
        />
      </div>

      <div className="prompt-right">
        <h3 className="history-title">Task List / Prompt History</h3>

        {history.length === 0 ? (
          <p className="empty-history">No history yet</p>
        ) : (
          <ul className="history-list">
            {itemsToShow.map((item, i) => (
              <li key={i} className="history-item">
                <span className="history-text" onClick={() => loadHistoryItem(item)}>
                  {item.user}
                </span>
                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item); }}>
                  ✕
                </button>
              </li>
            ))}

            {history.length > 7 && (
              <button className="show-more-btn" onClick={() => setShowFullHistory(!showFullHistory)}>
                {showFullHistory ? "Show Less" : "Show More"}
              </button>
            )}
          </ul>
        )}
      </div>

      {/* Custom Toast */}
      {toast.visible && <div className="custom-toast">{toast.message}</div>}
    </div>
  );
}
