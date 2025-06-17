export async function callGemini(prompt) {
  try {
    const res = await fetch('/.netlify/functions/gemini', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        console.log("💡 Gemini says:\n" + text);
        return text;
      } else {
        console.warn("⚠️ Gemini returned no content.");
        console.log("Full response:", data);
        return null;
      }
    } else {
      console.error("❌ Gemini API Error:", data.error);
      return null;
    }
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    return null;
  }
}


