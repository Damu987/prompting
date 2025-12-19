import React, { useEffect, useState } from "react";
import { addInteraction } from "../utils/history";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faChartLine, faFolderOpen, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function DashboardEnhanced() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [stats, setStats] = useState({ totalPrompts: 0, userPrompts: 0 });

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  useEffect(() => {
    addInteraction("Visited Dashboard");

    // Fetch usage stats from backend
    const fetchStats = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!userId || !token) return;

      try {
        const res = await fetch(`http://localhost:5000/api/stats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats({
          totalPrompts: data.totalPrompts || 0,
          userPrompts: data.userPrompts || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  const handleGenerateClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/prompting");
    } else {
      alert("Please login first to generate prompts.");
    }
  };

  return (
    <div className="enhanced-dash-wrapper">

      {/* Hero Section */}
      <div className="dash-hero">
        <h1 className="dash-hero-title">Welcome to Prompt Generator</h1>
        <p className="dash-hero-subtitle">
          Transform your ideas into actionable tasks effortlessly. 
          Generate, organize, and track AI-powered prompts for projects, learning, or personal use.
          Take control of your productivity and make sure no idea is ever lost.
        </p>
        <button className="dash-hero-btn" onClick={handleGenerateClick}>
          Generate Your First Prompt
        </button>
      </div>

      {/* Quick Stats */}
      <section className="dash-stats-section">
        <h2 className="dash-stats-header">Your Productivity at a Glance</h2>
        <p className="dash-stats-description">
          Keep track of your prompts, projects, and tasks. Understand your progress and identify areas to focus on.
        </p>
        <div className="dash-stats">
          <div className="stat-card">
            <h3>{stats.totalPrompts}</h3>
            <p>Total Prompts Generated</p>
            <small>All your creative ideas captured and structured for action.</small>
          </div>
          <div className="stat-card">
            <h3>{stats.userPrompts}</h3>
            <p>Your Prompts</p>
            <small>Prompts you personally generated and tracked.</small>
          </div>
          <div className="stat-card">
            <h3>5</h3>
            <p>Pending Tasks</p>
            <small>Tasks that need your attention to ensure smooth project completion.</small>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="dash-features-section">
        <h2 className="dash-container-header">Core Features</h2>
        <p className="dash-features-description">
          Each feature is designed to boost your productivity and make project management effortless.
        </p>
        <div className="dash-container">
          <div className="dash-card">
            <FontAwesomeIcon icon={faRocket} className="card-icon" />
            <h3>Generate Prompts</h3>
            <p>
              Quickly convert your raw ideas into structured, actionable prompts. Perfect for project planning, study notes, or creative tasks.
            </p>
          </div>

          <div className="dash-card">
            <FontAwesomeIcon icon={faChartLine} className="card-icon" />
            <h3>Track Progress</h3>
            <p>
              Visualize your productivity trends and identify areas of improvement. Keep your workflow efficient and transparent.
            </p>
          </div>

          <div className="dash-card">
            <FontAwesomeIcon icon={faFolderOpen} className="card-icon" />
            <h3>Organize Projects</h3>
            <p>
              Categorize your prompts into projects or themes. Easily navigate between tasks and maintain an organized workflow.
            </p>
          </div>

          <div className="dash-card dash-card-cta">
            <FontAwesomeIcon icon={faPlusCircle} className="card-icon" />
            <h3>New Prompt</h3>
            <p>
              Start a new prompt with AI assistance. Generate actionable tasks and ideas in seconds.
            </p>
            <button className="dash-btn" onClick={handleGenerateClick}>
              Generate Now
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {[
            { q: "What does this Prompt Generator do?", a: "It converts your ideas into structured, actionable prompts that you can use for projects, study, or planning." },
            { q: "Do I need an account to generate prompts?", a: "Yes, authentication is required to store your history and keep your data secure." },
            { q: "Can I track my prompt history?", a: "Yes! All generated prompts are saved in your history automatically." },
            { q: "Will new features be added soon?", a: "Absolutely! More features like project boards, analytics, and templates are coming soon." }
          ].map((item, index) => (
            <div className={`faq-item ${openFAQ === index ? "open" : ""}`} key={index}>
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                {item.q} <span className="arrow">{openFAQ === index ? "-" : "+"}</span>
              </div>
              <div className="faq-answer"><p>{item.a}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
