// Policy Pilot Background Script - Service Worker
console.log('Policy Pilot: Background script loaded');

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/analyze';
const API_KEY = ''; // Add your API key here

// Dummy response for development/testing when API is not available
const DUMMY_API_RESPONSE = {
  "summary": "Great news! Your insurance covers acupuncture treatments under Alternative Medicine benefits. You have excellent coverage with low out-of-pocket costs and plenty of sessions remaining for this year.",
  "match_checklist": [
    {
      "item": "Service Coverage",
      "status": "✅ Covered",
      "details": "Acupuncture is covered under Alternative Medicine"
    },
    {
      "item": "Network Status", 
      "status": "✅ In-Network",
      "details": "Provider is in your preferred network"
    },
    {
      "item": "Annual Limit",
      "status": "✅ Available", 
      "details": "16 sessions remaining out of 20"
    }
  ],
  "feasibility": {
    "score": "High",
    "color": "green",
    "message": "Highly recommended - excellent coverage and savings"
  },
  "benefits_services": {
    "service_name": "Acupuncture Treatment",
    "coverage_type": "Alternative Medicine", 
    "copay": "$25 per session",
    "sessions_used": "4 of 20",
    "sessions_remaining": 16,
    "renewal_date": "January 1, 2027"
  },
  "money_saved": {
    "session_cost": "$120",
    "your_cost": "$25", 
    "insurance_pays": "$95",
    "savings_per_visit": "$95",
    "potential_annual_savings": "$1,520"
  }
};

// Call the analysis API
async function callAnalysisAPI(websiteData) {
  try {
    console.log('Sending data to API:', websiteData);
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
      },
      body: JSON.stringify(websiteData)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('API Response:', result);
    return result;
    
  } catch (error) {
    console.error('API call failed, using dummy data:', error);
    
    // Customize dummy response based on website data
    const customDummy = { ...DUMMY_API_RESPONSE };
    
    // Try to extract service name from scraped data
    const services = websiteData.content_chunks?.find(chunk => chunk.type === 'services')?.data || [];
    const firstService = services[0] || 'Health Service';
    
    // Update service name in response
    customDummy.benefits_services.service_name = firstService;
    customDummy.summary = `Good news! Your insurance may cover ${firstService.toLowerCase()} under your health benefits. Here's what we found based on typical coverage patterns.`;
    
    return customDummy;
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.action === 'analyze-website') {
    handleWebsiteAnalysis(message.data, sender.tab?.id)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Analysis failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  } else if (message.action === 'health-website-detected') {
    // Store website info for side panel to access
    chrome.storage.local.set({
      'currentWebsiteInfo': {
        url: message.url,
        title: message.title,
        domain: message.domain,
        isHealthSite: true,
        timestamp: new Date().toISOString()
      }
    });
    sendResponse({ success: true });
  }
});

// Handle the website analysis workflow
async function handleWebsiteAnalysis(websiteData, tabId) {
  try {
    // Call API to analyze the scraped data
    const analysisResult = await callAnalysisAPI(websiteData);
    
    // Store result for side panel
    await chrome.storage.local.set({
      'analysisResult': analysisResult,
      'lastAnalysis': {
        timestamp: new Date().toISOString(),
        url: websiteData.basic_info?.url,
        tabId: tabId
      }
    });
    
    console.log('Analysis result stored:', analysisResult);
    
    // Try to open side panel if we have a tab ID
    if (tabId) {
      try {
        await chrome.sidePanel.setOptions({
          tabId: tabId,
          path: 'sidepanel.html',
          enabled: true
        });
        
        await chrome.sidePanel.open({ tabId: tabId });
        console.log('Side panel opened successfully');
        
      } catch (sidePanelError) {
        console.error('Failed to open side panel:', sidePanelError);
        // Side panel might not be available, that's okay for development
      }
    }
    
    return analysisResult;
    
  } catch (error) {
    console.error('Error in handleWebsiteAnalysis:', error);
    throw error;
  }
}

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Policy Pilot Extension installed');
  
  // Set up side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch(error => console.log('Side panel setup failed:', error));
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Policy Pilot Extension started');
});