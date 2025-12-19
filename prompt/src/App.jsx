import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import Prompting from "./components/Prompting";
import ProfileSection from "./components/Profile/ProfileSection";

function App() {
  return (
    <Router>
      <Routes>

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />  
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prompting" element={<Prompting />} />
          <Route path="/profile" element={<ProfileSection />} />
          <Route path="*" element={<Dashboard />} />
        </Route>

        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
      </Routes>
    </Router>
  );
}

export default App;
