import React, { useState } from "react";
import Profile from "./Profile";
import Settings from "./Settings";
import "./ProfileSection.css";

export default function ProfileSection() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="profile-section-container">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "profile" && <Profile />}
        {activeTab === "settings" && <Settings />}
      </div>
    </div>
  );
}
