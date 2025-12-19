import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faUser } from "@fortawesome/free-solid-svg-icons";
import { getCurrentUser, updateUser } from "../api/API";
import "./Profile.css";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const [formData, setFormData] = useState({
        fullname: "",
        username: "",
        email: "",
        avatar: "" 
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        (async () => {
            const res = await getCurrentUser(token);
            if (res.ok) {
                setUser(res.user);
                setFormData(res.user);
                setPreviewImage(res.user.avatar || null);
            }
        })();
    }, []);

    if (!user) return <div className="loading-text">Loading profile...</div>;

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imgURL = URL.createObjectURL(file);
            setPreviewImage(imgURL);

            setFormData({ ...formData, avatar: file });
        }
    };

    const saveProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const form = new FormData();
        form.append("fullname", formData.fullname);
        form.append("username", formData.username);
        form.append("email", formData.email);

        if (formData.avatar instanceof File) {
            form.append("avatar", formData.avatar);
        }

        const res = await updateUser(token, form);

        if (res.ok) {
            alert("Profile updated!");
            setUser(res.user);
            setIsEditing(false);
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="profile-card">

            {/* Avatar */}
            <div className="avatar-container">
                {previewImage ? (
                    <img src={previewImage} alt="avatar" className="avatar-img" />
                ) : (
                    <FontAwesomeIcon icon={faUser} className="avatar-placeholder" />
                )}

                {isEditing && (
                    <label className="upload-btn">
                        Upload Photo
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                )}
            </div>

            {/* Edit Icon */}
            <div className="edit-icon" onClick={() => setIsEditing(!isEditing)}>
                <FontAwesomeIcon icon={faPenToSquare} />
            </div>

            {/* VIEW MODE */}
            {!isEditing && (
                <div className="info-section">
                    <p><strong>Full Name:</strong> {user.fullname}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            )}

            {/* EDIT MODE */}
            {isEditing && (
                <div className="edit-section">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input name="fullname" value={formData.fullname} onChange={handleInput} />
                    </div>

                    <div className="input-group">
                        <label>Username</label>
                        <input name="username" value={formData.username} onChange={handleInput} />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input name="email" value={formData.email} disabled />
                    </div>

                    <button className="save-btn" onClick={saveProfile}>Save Changes</button>
                </div>
            )}
        </div>
    );
}
