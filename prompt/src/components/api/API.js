export const API_BASE = "http://localhost:5000";  
//send otp
export async function sendOtp(email) {
  const res = await fetch(`${API_BASE}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}
//register
export async function registerUser(data) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
//login
export async function loginUser(data) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
//get user
export async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
//ai chat
export async function fetchAIResponse(prompt, token, userId) {
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt, userId }),
    });

    if (!res.ok) throw new Error("AI request failed");

    return await res.json();
  } catch (err) {
    console.error("fetchAIResponse Error:", err);
    return { response: "Server error" };
  }
}
//fetch history
export async function fetchHistory(userId, token) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/history/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch history");
    return await res.json();
  } catch (err) {
    console.error("fetchHistory Error:", err);
    return { history: [] };
  }
}
//save history
export async function saveHistoryItem(userId, userInput, aiResponse, token) {
  try {
    const res = await fetch(`${API_BASE}/api/history/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        userInput,
        aiResponse,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Backend error:", errText);
      throw new Error("Failed to save history item");
    }

    return await res.json();
  } catch (err) {
    console.error("saveHistoryItem Error:", err);
    return { success: false };
  }
}


//update user data
export async function updateUser(id, data) {
  const response = await fetch(`${API_BASE}/api/users/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await response.json();
}
export async function deleteHistoryItemAPI(userId, userInput, aiResponse, token) {
  try {
    const res = await fetch(`${API_BASE}/api/chat/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, userInput, aiResponse }),
    });

    // Debug: check status & text before parsing
    const text = await res.text();
    console.log("Delete API response text:", text);

    // Only parse JSON if content-type is application/json
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Response is not valid JSON");
    }

    if (!data.success) throw new Error(data.message || "Failed to delete history item");
    return data;
  } catch (err) {
    console.error("deleteHistoryItemAPI Error:", err);
    return { success: false, message: err.message };
  }
}

// Frontend API function to get stats
export async function fetchStats(userId, token) {
  try {
    const res = await fetch(`${API_BASE}/api/stats/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch stats");

    return await res.json();
  } catch (err) {
    console.error("fetchStats Error:", err);
    return { totalPrompts: 0, userPrompts: 0 };
  }
}


