import React, { useState, useEffect } from "react";
import { addInteraction } from "../../utils/history";
import "./Settings.css";

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [darkmode, setDarkmode] = useState(false);
    const [fontFamily, setFontFamily] = useState("Arial");
    const [primaryColor, setPrimaryColor] = useState("#4f46e5");
    const [fontSize, setFontSize] = useState("16px");

    useEffect(() => {
        addInteraction("Settings");
    }, []);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("dashboardSettings"));

        if (saved) {
            setDarkmode(saved.darkmode);
            setNotifications(saved.notifications);
            setFontSize(saved.fontSize);
            setFontFamily(saved.fontFamily);
            setPrimaryColor(saved.primaryColor);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "dashboardSettings",
            JSON.stringify({ darkmode, fontFamily, fontSize, primaryColor, notifications })
        );

        document.body.className = darkmode ? "dark-mode" : "light-mode";
        document.body.style.fontFamily = fontFamily;
        document.body.style.fontSize = fontSize;

    }, [darkmode, fontFamily, fontSize, primaryColor, notifications]);

    const resetDefaults = () => {
        setDarkmode(false);
        setFontFamily("Arial");
        setFontSize("16px");
        setPrimaryColor("#4f46e5");
        setNotifications(true);
    };

    return (
        <div className="settings-container">
            <h2 className="settings-title">Settings</h2>

            <div className="settings-group">
                {/* Dark Mode */}
                <div className="setting-row">
                    <label>Dark Mode</label>
                    <input 
                        type="checkbox"
                        checked={darkmode}
                        onChange={e => setDarkmode(e.target.checked)}
                    />
                </div>

                {/* Font Family */}
                <div className="setting-row">
                    <label>Font Family</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
                        <option>Arial</option>
                        <option>Helvetica</option>
                        <option>Times New Roman</option>
                        <option>Courier New</option>
                        <option>Verdana</option>
                    </select>
                </div>

                {/* Font Size */}
                <div className="setting-row">
                    <label>Font Size</label>
                    <select value={fontSize} onChange={e => setFontSize(e.target.value)}>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                    </select>
                </div>

                {/* Primary Color */}
                <div className="setting-row">
                    <label>Primary Color</label>
                    <input 
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                    />
                </div>

                {/* Notifications */}
                <div className="setting-row">
                    <label>Enable Notifications</label>
                    <input 
                        type="checkbox"
                        checked={notifications}
                        onChange={e => setNotifications(e.target.checked)}
                    />
                </div>

                <button 
                    className="reset-btn"
                    style={{ backgroundColor: primaryColor }}
                    onClick={resetDefaults}
                >
                    Reset to Default
                </button>
            </div>
        </div>
    );
}


