// ===== CONFIGURATION =====
const OPENAI_API_KEY = ""; // 🔑 REPLACE WITH YOUR KEY
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// ===== DOM ELEMENTS =====
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

// ===== APP INITIALIZATION =====
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
      // Remove active classes
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active-section'));
      
      // Set new active
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
function initVideoUpload() {
  uploadArea.addEventListener('click', () => videoInput.click());
  
  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.includes('video')) {
      pitchVideo.src = URL.createObjectURL(file);
      uploadArea.classList.add('hidden');
      videoPlayer.classList.remove('hidden');
      
      // Simulate AI video analysis
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
function initAnalysis() {
  analyzeBtn.addEventListener('click', async () => {
    const projectName = document.getElementById('projectName').value;
    const problem = document.querySelector('#problem-tab textarea').value;
    const solution = document.querySelector('#solution-tab textarea').value;
    const market = document.querySelector('#market-tab textarea').value;
    
    if (!problem || !solution) {
      alert('Please fill in both Problem and Solution sections');
      return;
    }
    
    // UI Loading State
    analyzeBtn.innerHTML = '<div class="spinner"></div><span>Analyzing...</span>';
    analyzeBtn.disabled = true;
    
    try {
      // Real OpenAI API Call
      const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert startup pitch coach. Provide concise, actionable feedback with these sections:\n1. Problem Strength (0-10)\n2. Solution Effectiveness (0-10)\n3. Market Potential (0-10)\n4. Specific suggestions (bullets)\n5. Overall score (0-10)"
            },
            {
              role: "user",
              content: `Pitch Analysis Request:\n\n**Project:** ${projectName || "Untitled"}\n\n**Problem:** ${problem}\n\n**Solution:** ${solution}\n\n**Market:** ${market || "Not specified"}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      aiResponse.innerHTML = formatAIResponse(data.choices[0].message.content);
      textResults.classList.remove('hidden');
      textResults.scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error("OpenAI Error:", error);
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

