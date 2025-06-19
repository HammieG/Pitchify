// ===== IMPORT GEMINI SDK =====
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri
} from "https://esm.run/@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCrN3GbiqRQbQmj1OCtZnAqQRSds3wwn5I" }); // 🔐 Replace with your Gemini API Key


// ===== DOM ELEMENTS =====
// Grab references to UI elements for navigation, tabs, video upload, and AI interaction
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('main > section');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const analyzeBtn = document.getElementById('analyzeBtn');
const videoInput = document.getElementById('videoInput');
const uploadArea = document.getElementById('uploadArea');
const videoPlayer = document.getElementById('videoPlayer');
const pitchVideo = document.getElementById('pitchVideo');
const textResults = document.getElementById('textResults');
const aiResponse = document.getElementById('aiResponse');
const useTemplateBtns = document.querySelectorAll('.use-btn');
const authBtn = document.getElementById('authBtn');
const videoFeedback = document.getElementById('videoFeedback');


const pitch_prompt = "You are an elite startup pitch coach, whose job is to help this startup with its pitch. They will give you the problem their startup solves, the solution, aka how the startup solves this problem, and then the market that the the startup wishes to target. Provide specific feedback on how the pitch can be better targeting all 3 sections. If possible give examples of how to change, and draw upon past successful startup pitches as examples to show the user."
const video_prompt = "You are given a video, of a startup pitch or other speech or public speaking moment. Give feedback on how they can improve, with both the content, as well as the delivery. Give specific timestamps where the delivery can be improved. Also, please give positive feedback as well."


// Initialize the entire app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTabs();
  initTemplates();
  initVideoUpload();
  initAnalysis();
  initAuth();
});

// ===== NAVIGATION SYSTEM =====
function initNavigation() {
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active-section'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.section).classList.add('active-section');
    });
  });
}

// ===== TAB SYSTEM =====
function initTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
  });
}

// ===== TEMPLATE SYSTEM =====
function initTemplates() {
  const TEMPLATES = {
    elevator: `**Problem:** \n- [Clearly state the pain point]\n\n**Solution:**\n- [Your product/service]\n- [Key differentiator]`,
    investor: `**Market Opportunity:**\n- Total Addressable Market: $[X]B\n- Key Trends: [Trend1], [Trend2]\n\n**Business Model:**\n- Revenue Streams: [Stream1], [Stream2]`,
    demo: `**Hook:** \n- Start with a surprising stat/question\n\n**Demo:**\n- Show core functionality in 60 sec\n- Highlight UX differentiators`
  };

  useTemplateBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const templateKey = Object.keys(TEMPLATES)[index];
      const activeTab = document.querySelector('.tab-content.active textarea');
      if (activeTab) {
        activeTab.value = TEMPLATES[templateKey];
        alert(`"${btn.parentElement.querySelector('h4').textContent}" template inserted!`);
      }
    });
  });
}

// ===== VIDEO UPLOAD =====
async function initVideoUpload() {
  uploadArea.addEventListener('click', () => videoInput.click());
  videoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enhanced file validation
    if (!file.type.includes('video') || !file.name.endsWith('.mp4')) {
      videoFeedback.innerHTML = "Please upload a standard MP4 video file";
      return;
    }

    pitchVideo.src = URL.createObjectURL(file);
    uploadArea.classList.add('hidden');
    videoPlayer.classList.remove('hidden');
    videoFeedback.innerHTML = "Analyzing video...";

    try {
      console.log("1. Uploading video file:", file.name);
      
      // Upload with progress tracking
      const uploadResponse = await ai.files.upload({
        file: file,
        mimeType: 'video/mp4'
      });
      
      if (!uploadResponse?.uri) {
        throw new Error("Upload failed - no URI returned");
      }

      console.log("2. File uploaded. URI:", uploadResponse.uri);
      videoFeedback.innerHTML = "Processing video content...";

      // Extended processing delay (10 seconds)
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Enhanced analysis with response validation
      let analysisResult;
      try {
        console.log("3. Starting video analysis");
        
        analysisResult = await ai.models.generateContent({
          model: "gemini-2.0-flash-lite-001",
          contents: [{
            role: "user",
            parts: [
              { fileData: { 
                mimeType: 'video/mp4',
                fileUri: uploadResponse.uri 
              }},
              { text: video_prompt }
            ]
          }]
        });

        console.log("4. Raw API response:", analysisResult);
        console.log(analysisResult.text)
        
        //videoFeedback.innerHTML=analysisResult.text
        videoFeedback.innerHTML = formatAIResponse(analysisResult.text);

        // Comprehensive response validation
        if (!analysisResult || 
            !analysisResult.response || 
            !analysisResult.response.candidates || 
            analysisResult.response.candidates.length === 0) {
          throw new Error("API returned empty response");
        }

        const firstCandidate = analysisResult.response.candidates[0];
        if (!firstCandidate.content || !firstCandidate.content.parts) {
          throw new Error("Malformed API response structure");
        }

        const textParts = firstCandidate.content.parts
          .filter(part => part.text)
          .map(part => part.text);
        
        if (textParts.length === 0) {
          throw new Error("No text content in response");
        }

        const analysisText = textParts.join('\n\n');
        console.log("5. Analysis successful:", analysisText);
        

      } catch (analysisError) {
        console.error("Analysis error:", analysisError);
        throw new Error(`Video analysis failed: ${analysisError.message}`);
      }
      
    } catch (err) {
      console.error("Full error:", err);
      
      //uploadArea.classList.remove('hidden');
      //videoPlayer.classList.add('hidden');
    }
  });
}
// ===== PITCH ANALYSIS =====
function initAnalysis() {
  analyzeBtn.addEventListener('click', async () => {
    const problem = document.querySelector('#problem-tab textarea').value;
    const solution = document.querySelector('#solution-tab textarea').value;
    const market = document.querySelector('#market-tab textarea').value;
    if (!problem || !solution) {
      alert('Please fill in both Problem and Solution sections');
      return;
    }
    analyzeBtn.innerHTML = '<div class="spinner"></div><span>Analyzing...</span>';
    analyzeBtn.disabled = true;
    const text = problem + solution + market;
    try {
      const output = await callGemini(text);
      aiResponse.innerHTML = formatAIResponse(output);
      textResults.classList.remove('hidden');
      textResults.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("AI Error:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      analyzeBtn.innerHTML = '<span>Analyze with AI</span>';
      analyzeBtn.disabled = false;
    }
  });
}

function formatAIResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>');
}

async function callGemini(prompt) {
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: pitch_prompt + "\n" + prompt }] }],
  });
  return await result.response.text();
}
