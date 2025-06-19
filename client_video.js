document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("videoFile");
  const file = fileInput.files[0];
  const output = document.getElementById("output");

  if (!file) {
    output.textContent = "Please select a video file.";
    return;
  }

  const formData = new FormData();
  formData.append("video", file);

  output.textContent = "Uploading and analyzing...";

  try {
    const response = await fetch("/.netlify/functions/geminiVideo", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      output.textContent = result.summaryAndQuiz;
    } else {
      output.textContent = "Error: " + result.error;
    }
  } catch (err) {
    output.textContent = "❌ Network error: " + err.message;
  }
});
