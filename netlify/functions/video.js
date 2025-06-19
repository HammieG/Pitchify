const Busboy = require("busboy");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // Validate request method
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  // Ensure body is base64-encoded (which Netlify does by default)
  if (!event.isBase64Encoded) {
    return {
      statusCode: 400,
      body: "Request body must be base64 encoded",
    };
  }

  const busboy = Busboy({ headers: event.headers });
  const tmpdir = os.tmpdir();
  let filePath;

  const filePromise = new Promise((resolve, reject) => {
    busboy.on("file", (_, file, filename, __, mimeType) => {
      const safeFilename = typeof filename === "string" ? filename : `upload-${Date.now()}.mp4`;
      const savePath = path.join(tmpdir, safeFilename);
      filePath = savePath;

      const writeStream = fs.createWriteStream(savePath);
      file.pipe(writeStream);
      writeStream.on("close", () => resolve({ filePath, mimeType }));
      writeStream.on("error", reject);
    });

    busboy.on("error", reject);
    busboy.end(Buffer.from(event.body, "base64"));
  });

  try {
    const { filePath, mimeType } = await filePromise;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });

    // Upload video file to Gemini
    const fileData = await fs.promises.readFile(filePath);
    const fileUpload = await genAI.uploadFile(fileData, {
      mimeType,
      fileName: path.basename(filePath),
    });

    // Generate feedback from Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType,
                fileUri: fileUpload.uri,
              },
            },
            {
              text: "You are given a video, of a startup pitch or other speech or public speaking moment. Give feedback on how they can improve, with both the content, as well as the delivery. Give specific timestamps where the delivery can be improved. Also, please give positive feedback as well.",
            },
          ],
        },
      ],
    });

    const text = await result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ summaryAndQuiz: text }),
    };
  } catch (err) {
    console.error("❌ Video Analysis Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
