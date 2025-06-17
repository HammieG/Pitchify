(async () => {
  try {
    const prompt = "Tell me a cool black hole fact";

    const res = await fetch('/.netlify/functions/gemini', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }) // Send the prompt as JSON
    });

    const data = await res.json();

    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(text);
    } else {
      console.error("❌ Gemini Error:\n", data.error);
    }

  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
  }
})();
