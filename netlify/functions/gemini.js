exports.handler = async () => {
  const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [{ text: "Tell me a cool space fact" }]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error("❌ Gemini function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
