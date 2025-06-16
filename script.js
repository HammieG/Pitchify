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

import { InferenceClient } from "https://esm.sh/@huggingface/inference"
const HF_TOKEN = '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';
const client = new InferenceClient(HF_TOKEN);
const prompt = "You are a world-class public speaking coach. You help students and professionals improve their speeches by giving clear, constructive, and structured feedback. Evaluate the following speech as if it were presented aloud. Focus on the following areas: 1. **Clarity and Structure** – Is the speech well-organized and easy to follow? Are the transitions effective? 2. **Language and Word Choice** – Are the words appropriate, persuasive, and vivid? Any awkward phrasing or better alternatives? 3. **Tone and Engagement** – Is the tone appropriate for the context and audience? Is it engaging and expressive? 4. **Persuasiveness and Impact** – How convincing is the speech? Does it have a strong opening and a memorable closing? 5. **Suggestions for Improvement** – Provide 2–3 specific, actionable ways the speaker can improve. Be honest but encouraging. If possible, rewrite a small section of the speech to demonstrate how to improve it. Here is the Speech: "


// ===== APP INITIALIZATION =====
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
// Handles switching between different main sections when nav buttons are clicked
function initNavigation() {
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all nav buttons and sections
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active-section'));
      
      // Activate the clicked nav button and corresponding section
      btn.classList.add('active');
      document.getElementById(btn.dataset.section).classList.add('active-section');
    });
  });
}

// ===== TAB SYSTEM =====
// Handles switching between different text tabs (e.g., problem, solution, market)
function initTabs() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset all tabs
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Activate the selected tab and its content
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
  });
}

// ===== TEMPLATE SYSTEM =====
// Provides pre-filled pitch templates users can insert into textareas
function initTemplates() {
  const TEMPLATES = {
    elevator: `**Problem:** \n- [Clearly state the pain point]\n\n**Solution:**\n- [Your product/service]\n- [Key differentiator]`,
    investor: `**Market Opportunity:**\n- Total Addressable Market: $[X]B\n- Key Trends: [Trend1], [Trend2]\n\n**Business Model:**\n- Revenue Streams: [Stream1], [Stream2]`,
    demo: `**Hook:** \n- Start with a surprising stat/question\n\n**Demo:**\n- Show core functionality in 60 sec\n- Highlight UX differentiators`
  };

  useTemplateBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      // Determine which template to insert
      const templateKey = Object.keys(TEMPLATES)[index];
      const activeTab = document.querySelector('.tab-content.active textarea');

      // Insert template text if a textarea is active
      if (activeTab) {
        activeTab.value = TEMPLATES[templateKey];
        alert(`"${btn.parentElement.querySelector('h4').textContent}" template inserted!`);
      }
    });
  });
}

// ===== VIDEO UPLOAD =====
// Handles the video upload and previews the video
function initVideoUpload() {
  // Trigger hidden input when upload area is clicked
  uploadArea.addEventListener('click', () => videoInput.click());
  
  // Handle selected video file
  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    // Make sure it's a video
    if (file && file.type.includes('video')) {
      // Load the video into player
      pitchVideo.src = URL.createObjectURL(file);
      uploadArea.classList.add('hidden');
      videoPlayer.classList.remove('hidden');
      
      // Simulate AI feedback after short delay
      setTimeout(() => {
        document.getElementById('videoFeedback').innerHTML = `
          <div class="feedback-point">
            <span class="timecode">0:15</span>
            <p>Strong opening hook!</p>
          </div>
          <div class="feedback-point">
            <span class="timecode">0:42</span>
            <p>Consider slowing down during technical explanations</p>
          </div>
        `;
      }, 2000);
    }
  });
}

// ===== PITCH ANALYSIS =====
// Handles AI-based feedback generation when user clicks "Analyze"
function initAnalysis() {
  analyzeBtn.addEventListener('click', async () => {
    // Get user inputs
    const projectName = document.getElementById('projectName').value;
    const problem = document.querySelector('#problem-tab textarea').value;
    const solution = document.querySelector('#solution-tab textarea').value;
    const market = document.querySelector('#market-tab textarea').value;
    
    // Validate input
    if (!problem || !solution) {
      alert('Please fill in both Problem and Solution sections');
      return;
    }
    
    // Show loading spinner
    analyzeBtn.innerHTML = '<div class="spinner"></div><span>Analyzing...</span>';
    analyzeBtn.disabled = true;
    const text = problem + solution + market;
    
    try {
  const output = await getAiOutput(text); // Add await here
  aiResponse.innerHTML = formatAIResponse(output);
  textResults.classList.remove('hidden');
  textResults.scrollIntoView({ behavior: 'smooth' });
} catch (error) {
  console.error("AI Error:", error);
  alert(`Analysis failed: ${error.message}`);
}  finally {
      // Reset button
      analyzeBtn.innerHTML = '<span>Analyze with AI</span>';
      analyzeBtn.disabled = false;
    }
  });
}

// ===== FORMAT AI RESPONSE =====
// Converts markdown-style feedback to formatted HTML
function formatAIResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>');
}

async function getAiOutput(message) {
  const out = await client.chatCompletion({
  model: "meta-llama/Meta-Llama-3-70B-Instruct",
  messages: [{ role: "user", content: prompt + message}],
  max_tokens: 512
});
return out.choices[0].message.content;
}

