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
    
    try {
      // Make OpenAI API request
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

      // Check if API call was successful
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();

      // Format and display AI response
      aiResponse.innerHTML = formatAIResponse(data.choices[0].message.content);
      textResults.classList.remove('hidden');
      textResults.scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error("OpenAI Error:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
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
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\n/g, '<br>') // Line breaks
    .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>'); // Bullet points
}