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


const pitch_prompt = "You are an elite startup pitch coach, whose job is to help this startup with its pitch. They will give you the problem their startup solves, the solution, aka how the startup solves this problem, and then the market that the the startup wishes to target. Provide specific feedback on how the pitch can be better targeting all 3 sections. If possible give examples of how to change, and draw upon past successful startup pitches as examples to show the user."



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
  const output = await callGemini(text); // Add await here
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



async function callGemini(prompt) {
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

