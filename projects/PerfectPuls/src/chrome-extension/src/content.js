// Policy Pilot Content Script - Vanilla JavaScript
console.log('Policy Pilot: Content script loaded');

// Health-related keywords to identify relevant websites
const HEALTH_KEYWORDS = [
  'appointment', 'treatment', 'therapy', 'massage', 'chiropractic', 
  'acupuncture', 'physiotherapy', 'counseling', 'nutrition', 'wellness',
  'fitness', 'gym', 'yoga', 'meditation', 'clinic', 'doctor', 'health',
  'medical', 'dental', 'vision', 'mental health', 'alternative medicine'
];

// Scraping selectors for different types of content
const SCRAPING_SELECTORS = {
  serviceName: [
    '.service-name', '.treatment-name', '[data-service]', 
    'h1', 'h2', 'h3', '.title', '.name', '.service-title'
  ],
  servicePrice: [
    '.price', '.cost', '.fee', '[data-price]', '.amount',
    '.pricing', '.rate', '$', 'USD', 'cost'
  ],
  providerName: [
    '.provider-name', '.clinic-name', '.business-name',
    '.company-name', '.practice-name', 'h1'
  ],
  serviceDescription: [
    '.description', '.service-details', '.about', 
    '.summary', '.overview', 'p'
  ]
};

// Check if current website is health-related
function isHealthWebsite() {
  const pageText = document.body.innerText.toLowerCase();
  const pageTitle = document.title.toLowerCase();
  const url = window.location.href.toLowerCase();
  
  return HEALTH_KEYWORDS.some(keyword => 
    pageText.includes(keyword) || 
    pageTitle.includes(keyword) || 
    url.includes(keyword)
  );
}

// Extract text content using multiple selectors
function extractBySelectors(selectors) {
  const results = [];
  
  selectors.forEach(selector => {
    try {
      if (selector.startsWith('[') || selector.startsWith('.') || selector.startsWith('#')) {
        // CSS selector
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 0) {
            results.push(text);
          }
        });
      } else {
        // Text search
        const pageText = document.body.innerText;
        const regex = new RegExp(selector, 'gi');
        const matches = pageText.match(regex);
        if (matches) {
          results.push(...matches);
        }
      }
    } catch (error) {
      console.log(`Error with selector ${selector}:`, error);
    }
  });
  
  return [...new Set(results)]; // Remove duplicates
}

// Main scraping function
function scrapeWebsiteData() {
  const data = {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: new Date().toISOString(),
    
    // Extract different types of content
    services: extractBySelectors(SCRAPING_SELECTORS.serviceName),
    prices: extractBySelectors(SCRAPING_SELECTORS.servicePrice),
    provider: extractBySelectors(SCRAPING_SELECTORS.providerName),
    descriptions: extractBySelectors(SCRAPING_SELECTORS.serviceDescription),
    
    // Get page content summary
    pageContent: document.body.innerText.substring(0, 2000), // First 2000 chars
    
    // Extract metadata
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || ''
  };
  
  return data;
}

// Chunk data for API consumption
function chunkData(data) {
  return {
    basic_info: {
      url: data.url,
      title: data.title,
      domain: data.domain,
      timestamp: data.timestamp
    },
    content_chunks: [
      {
        type: 'services',
        data: data.services.slice(0, 10) // Limit to first 10 services
      },
      {
        type: 'pricing',
        data: data.prices.slice(0, 10)
      },
      {
        type: 'provider',
        data: data.provider.slice(0, 5)
      },
      {
        type: 'descriptions',
        data: data.descriptions.slice(0, 5)
      },
      {
        type: 'summary',
        data: [data.pageContent, data.metaDescription, data.keywords].filter(Boolean)
      }
    ]
  };
}

// Expose scraping functions to background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape-website') {
    try {
      const websiteData = scrapeWebsiteData();
      const chunkedData = chunkData(websiteData);
      sendResponse({ success: true, data: chunkedData });
    } catch (error) {
      console.error('Error scraping website:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
  }
});

// Initialize when page loads - just log if health website detected
function init() {
  if (isHealthWebsite()) {
    console.log('Policy Pilot: Health website detected');
    // Store website info for side panel to access
    chrome.runtime.sendMessage({
      action: 'health-website-detected',
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname
    });
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}