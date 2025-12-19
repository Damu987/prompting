import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faFilePdf, faEdit, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";

export default function PromptResponse({
  messages,
  audioEnabled,
  copyToClipboard,
  handleEditMessage,
}) {
  const messagesEndRef = useRef(null);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Show loader if last message is from user and there’s no bot reply yet
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === "user") {
        setShowLoader(true);
      } else {
        setShowLoader(false);
      }
    }
  }, [messages]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;
    messages.forEach((msg) => {
      doc.setFontSize(12);
      doc.text(10, yOffset, msg.text);
      yOffset += 10;
    });
    doc.save("prompt_response.pdf");
  };

  return (
    <div className="messages-container">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.sender}`}>
          <pre className="message-text">{msg.text}</pre>

          <div className="message-actions">
            {msg.sender === "user" && (
              <button className="btn small-btn" onClick={() => handleEditMessage(idx)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}

            {msg.sender === "bot" && (
              <>
                <button className="small-btn" onClick={() => copyToClipboard(msg.text)}>
                  <FontAwesomeIcon icon={faClipboard} />
                </button>

                <button className="small-btn" onClick={downloadPDF}>
                  <FontAwesomeIcon icon={faFilePdf} />
                </button>

                {audioEnabled && (
                  <button
                    className="btn small-btn"
                    onClick={() => {
                      const synth = window.speechSynthesis;
                      synth.cancel();
                      const utter = new SpeechSynthesisUtterance(msg.text);
                      utter.lang = "en-US";
                      synth.speak(utter);
                    }}
                  >
                    <FontAwesomeIcon icon={faVolumeUp} /> Speak
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}

      {/* Inline AI Loader */}
      {showLoader && (
        <div className="spinner-inline">
          <div className="spinner"></div>
          <span>AI is typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
