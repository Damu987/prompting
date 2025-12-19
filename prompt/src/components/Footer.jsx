import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faTwitter, faLinkedinIn, faGithub } from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-about">
          <h3>Prompt Generator</h3>
          <p>
            Your ultimate platform to generate, organize, and manage AI-powered prompts efficiently.
          </p>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><FontAwesomeIcon icon={faEnvelope} /> support@promptgen.com</p>
          <p><FontAwesomeIcon icon={faPhone} /> +91 123-456-7890</p>
          <p><FontAwesomeIcon icon={faMapMarkerAlt} /> Bangalore, India</p>
        </div>

        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
            <a href="#" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
            <a href="#" aria-label="LinkedIn"><FontAwesomeIcon icon={faLinkedinIn} /></a>
            <a href="#" aria-label="GitHub"><FontAwesomeIcon icon={faGithub} /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Prompt Generator. All rights reserved.</p>
      </div>
    </footer>
  );
}
