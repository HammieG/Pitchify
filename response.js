(async () => {
  try {
    const res = await fetch('/.netlify/functions/gemini');
    const data = await res.json(); // works because now it's always JSON

    if (res.ok) {
      console.log("✅ Gemini Response:\n", JSON.stringify(data, null, 2));
    } else {
      console.error("❌ Gemini Error:\n", data.error);
    }

  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
  }
})();
