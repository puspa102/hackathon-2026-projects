// Side Panel JavaScript
console.log('Policy Pilot: Side panel loaded');

// Global variables
let analysisResult = null;
let lastAnalysis = null;
let currentWebsiteInfo = null;

// DOM elements - wrapped in DOMContentLoaded for safety
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing side panel...');
  
  const loadingEl = document.getElementById('loading');
  const noDataEl = document.getElementById('no-data');
  const resultsEl = document.getElementById('results');
  const clearBtn = document.getElementById('clear-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  
  // Verify elements exist
  console.log('Elements found:', {
    loading: !!loadingEl,
    noData: !!noDataEl,
    results: !!resultsEl,
    clearBtn: !!clearBtn,
    analyzeBtn: !!analyzeBtn
  });
  
  // Store globally for other functions
  window.policyPilotElements = {
    loadingEl,
    noDataEl,
    resultsEl,
    clearBtn,
    analyzeBtn
  };
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize
  loadResult();
});

// Load analysis result from storage
async function loadResult() {
  try {
    const data = await chrome.storage.local.get(['analysisResult', 'lastAnalysis', 'currentWebsiteInfo']);
    
    if (data.analysisResult) {
      analysisResult = data.analysisResult;
      lastAnalysis = data.lastAnalysis;
      displayResults();
      hideLoading();
    } else {
      hideLoading();
      showNoData();
    }
    
    // Update website info and button state
    if (data.currentWebsiteInfo) {
      currentWebsiteInfo = data.currentWebsiteInfo;
      updateAnalyzeButton();
    }
    
  } catch (error) {
    console.error('Error loading analysis result:', error);
    hideLoading();
    showNoData();
  }
}

// Display analysis results
function displayResults() {
  if (!analysisResult) {
    hideLoading();
    showNoData();
    return;
  }

  hideLoading();

  // Show last analysis info
  if (lastAnalysis) {
    const analysisInfo = document.getElementById('last-analysis');
    const url = new URL(lastAnalysis.url);
    analysisInfo.innerHTML = `
      <div class="label">Last Analysis:</div>
      <div class="url">${url.hostname}</div>
      <div>${new Date(lastAnalysis.timestamp).toLocaleString()}</div>
    `;
  }

  // Summary
  document.getElementById('summary-text').textContent = analysisResult.summary;

  // Match Checklist
  const checklistItems = document.getElementById('checklist-items');
  checklistItems.innerHTML = '';
  
  analysisResult.match_checklist.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'checklist-item';
    itemEl.innerHTML = `
      <span class="status">${item.status.split(' ')[0]}</span>
      <div class="content">
        <div class="item-title">${item.item}</div>
        <div class="item-details">${item.details}</div>
      </div>
    `;
    checklistItems.appendChild(itemEl);
  });

  // Feasibility
  const feasibilityBadge = document.getElementById('feasibility-badge');
  const feasibility = analysisResult.feasibility;
  feasibilityBadge.className = `feasibility-badge ${feasibility.color.toLowerCase()}`;
  feasibilityBadge.innerHTML = `
    <div class="feasibility-score">${feasibility.score}</div>
    <div class="feasibility-message">${feasibility.message}</div>
  `;

  // Cost Breakdown
  const costDetails = document.getElementById('cost-details');
  const money = analysisResult.money_saved;
  costDetails.innerHTML = `
    <div class="cost-row">
      <span>Session Cost:</span>
      <span>${money.session_cost}</span>
    </div>
    <div class="cost-row">
      <span>Your Cost:</span>
      <span>${money.your_cost}</span>
    </div>
    <div class="cost-row">
      <span>Insurance Pays:</span>
      <span>${money.insurance_pays}</span>
    </div>
    <div class="cost-row highlight">
      <span>You Save:</span>
      <span>${money.savings_per_visit}</span>
    </div>
    <div class="annual-savings">
      Potential annual savings: <strong>${money.potential_annual_savings}</strong>
    </div>
  `;

  // Benefit Details
  const benefitDetails = document.getElementById('benefit-details');
  const benefits = analysisResult.benefits_services;
  benefitDetails.innerHTML = `
    <div class="benefit-row">
      <span class="label">Service:</span>
      <span class="value">${benefits.service_name}</span>
    </div>
    <div class="benefit-row">
      <span class="label">Coverage:</span>
      <span class="value">${benefits.coverage_type}</span>
    </div>
    <div class="benefit-row">
      <span class="label">Co-pay:</span>
      <span class="value">${benefits.copay}</span>
    </div>
    <div class="benefit-row renewal">
      <span class="label">Renews:</span>
      <span class="value">${benefits.renewal_date}</span>
    </div>
  `;

  showResults();
}

// Show/hide different states
function hideLoading() {
  const { loadingEl } = window.policyPilotElements || {};
  if (loadingEl) loadingEl.style.display = 'none';
}

function showLoading() {
  const { loadingEl } = window.policyPilotElements || {};
  if (loadingEl) loadingEl.style.display = 'block';
}

function showNoData() {
  const { noDataEl, resultsEl } = window.policyPilotElements || {};
  if (noDataEl) noDataEl.style.display = 'block';
  if (resultsEl) resultsEl.style.display = 'none';
}

function showResults() {
  const { noDataEl, resultsEl, analyzeBtn } = window.policyPilotElements || {};
  if (noDataEl) noDataEl.style.display = 'none';
  if (resultsEl) resultsEl.style.display = 'block';
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '🏥 Analyze Current Page';
  }
}

function hideResults() {
  const { resultsEl } = window.policyPilotElements || {};
  if (resultsEl) resultsEl.style.display = 'none';
}

// Update analyze button based on current website
function updateAnalyzeButton() {
  const { analyzeBtn } = window.policyPilotElements || {};
  if (currentWebsiteInfo && analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = `🏥 Analyze ${currentWebsiteInfo.domain}`;
  } else if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🏥 Visit a health website first';
  }
}

// Analyze current website
function analyzeCurrentWebsite() {
  const { analyzeBtn } = window.policyPilotElements || {};
  
  if (!currentWebsiteInfo) {
    console.log('No website info available');
    alert('Please visit a health or wellness website first');
    return;
  }

  if (!analyzeBtn) {
    console.error('Analyze button not found');
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<div class="spinner-small"></div> Analyzing...';
  hideResults();
  showLoading();

  // Ask content script to scrape the current page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape-website' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          resetAnalyzeButton();
          hideLoading();
          showNoData();
          return;
        }
        
        if (response?.success) {
          // Send scraped data to background for analysis
          chrome.runtime.sendMessage({
            action: 'analyze-website',
            data: response.data
          }, (result) => {
            if (chrome.runtime.lastError) {
              console.error('Analysis message error:', chrome.runtime.lastError);
              resetAnalyzeButton();
              hideLoading();
              showNoData();
            }
            // Result will be handled by storage listener
          });
        } else {
          console.error('Failed to scrape website:', response?.error);
          resetAnalyzeButton();
          hideLoading();
          showNoData();
        }
      });
    } else {
      console.error('No active tab found');
      resetAnalyzeButton();
      hideLoading();
      showNoData();
    }
  });
}

function resetAnalyzeButton() {
  const { analyzeBtn } = window.policyPilotElements || {};
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '🏥 Analyze Current Page';
  }
}

// Clear analysis
function clearAnalysis() {
  chrome.storage.local.clear().then(() => {
    analysisResult = null;
    lastAnalysis = null;
    currentWebsiteInfo = null;
    showNoData();
    hideLoading();
    updateAnalyzeButton();
  });
}

// Listen for storage changes (new analysis results)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.analysisResult) {
    analysisResult = changes.analysisResult.newValue;
    displayResults();
  }
  if (changes.lastAnalysis) {
    lastAnalysis = changes.lastAnalysis.newValue;
  }
  if (changes.currentWebsiteInfo) {
    currentWebsiteInfo = changes.currentWebsiteInfo.newValue;
    updateAnalyzeButton();
  }
});

// Event listeners - set up after DOM is ready
function setupEventListeners() {
  const { clearBtn, analyzeBtn } = window.policyPilotElements || {};
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAnalysis);
  }
  
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeCurrentWebsite);
  }
  
  console.log('Event listeners set up');
}