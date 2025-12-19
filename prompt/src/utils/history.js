export function addInteraction(pageName) {
    const old = JSON.parse(localStorage.getItem("interactionHistory") || "[]");

    const newEntry = {
        page: pageName,
        time: new Date().toLocaleString()
    };

    const updated = [newEntry, ...old]; // newest first
    localStorage.setItem("interactionHistory", JSON.stringify(updated));
}

export function getInteractionHistory() {
    return JSON.parse(localStorage.getItem("interactionHistory") || "[]");
}
