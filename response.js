(async () => {
  try {
    const res = await fetch('/.netlify/functions/gemini');
    const data = await res.json(); // works because now it's always JSON

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
