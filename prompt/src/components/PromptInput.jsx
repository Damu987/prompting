import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export default function PromptInput({
  prompt,
  setPrompt,
  listening,
  editing,
  handleMic,
  handleGenerate,
  loading,
  handleKeyDown,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="prompt-wrapper">
      <div className={`textarea-box ${listening ? "listening-active" : ""}`}>
        <textarea
          ref={textareaRef}
          className="prompt-textarea"
          rows="3"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={listening ? "Listening…" : editing ? "Editing previous prompt..." : "Type your message..."}
          disabled={listening || loading}
          onKeyDown={handleKeyDown}
        />

        <div className="left-icons">
          <button
            className={`icon-btn ${listening ? "mic-active" : ""}`}
            onClick={handleMic}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
        </div>

        <button
          className="send-btn"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}
