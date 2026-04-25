# Policy Pilot Chrome Extension - Complete Developer Guide

## Overview

A Chrome Extension built with **pure HTML/CSS/JavaScript** (no build tools required) that analyzes insurance coverage for health and wellness services. The extension detects health websites, scrapes service information, and displays coverage analysis in a side panel.

## Architecture & User Flow

### 1. Health Website Detection
- **Content Script** automatically detects health/wellness websites using keyword matching
- Stores website info in chrome.storage for side panel access
- No floating buttons on the page (clean UX)

### 2. Side Panel Analysis
- User opens extension side panel
- Side panel shows **"🏥 Analyze [domain]"** button for detected health sites
- Clicking analyze triggers scraping and API analysis

### 3. Data Processing
- Content script scrapes webpage for services, prices, providers, descriptions
- Data is chunked and sent to Graph RAG backend API
- Results stored in chrome.storage and displayed immediately

### 4. Results Display
- Comprehensive coverage analysis with:
  - Summary text
  - Coverage checklist (✅/❌ status indicators)
  - Feasibility recommendation (High/Medium/Low)
  - Cost breakdown and potential savings
  - Benefit details (service, coverage type, co-pay, renewal)

## File Structure

```
chrome-extension/
├── manifest.json              # Extension configuration (Manifest V3)
├── src/
│   ├── content.js            # Website detection & scraping
│   └── background.js         # API communication & storage
├── sidepanel.html            # Side panel UI
├── js/
│   └── sidepanel.js         # Side panel functionality & event handling
├── styles/
│   └── sidepanel.css        # Side panel styling
├── assets/
│   └── README.md            # Asset placeholder
├── extension-dev.md          # This developer guide
└── README.md                # Setup instructions
```

## Core Components

### 1. Content Script (`src/content.js`)

**Purpose**: Detect health websites and scrape service data

**Key Functions**:
- `isHealthWebsite()`: Detects health/wellness sites using keyword matching
- `scrapeWebsiteData()`: Extracts services, prices, providers, descriptions
- `chunkData()`: Formats scraped data for API consumption
- Message listener for scraping requests from side panel

**Health Detection Keywords**:
```javascript
const HEALTH_KEYWORDS = [
  'acupuncture', 'massage', 'therapy', 'wellness', 'gym', 'fitness',
  'chiropractor', 'physical therapy', 'mental health', 'counseling',
  'nutrition', 'yoga', 'pilates', 'spa', 'medical', 'healthcare'
];
```

**Scraping Selectors**:
- Services: `h1, h2, h3, .service, .treatment, .class-name`
- Prices: `[contains '$'], .price, .cost, .fee`
- Providers: `.provider, .doctor, .therapist, .instructor`
- Descriptions: `p, .description, .details, .info`

### 2. Background Script (`src/background.js`)

**Purpose**: Handle API communication and manage chrome extension APIs

**Key Functions**:
- `callAnalysisAPI()`: Sends scraped data to Graph RAG backend
- `handleWebsiteAnalysis()`: Orchestrates analysis workflow
- Chrome storage management for cross-component communication
- Side panel management and opening

**API Integration**:
- Primary: `http://localhost:8000/api/analyze` (Graph RAG backend)
- Fallback: Comprehensive dummy data for development/demo
- Error handling with graceful degradation

### 3. Side Panel (`sidepanel.html` + `js/sidepanel.js`)

**Purpose**: User interface for triggering analysis and displaying results

**Features**:
- Analyze button that shows current domain
- Loading states with spinner animations
- Comprehensive results display
- Clear analysis functionality
- Real-time updates via chrome.storage listeners

**UI States**:
1. **Loading**: Initial state with spinner
2. **No Data**: Instructions and disabled analyze button
3. **Ready**: Shows "🏥 Analyze [domain]" for health sites
4. **Analyzing**: Loading spinner during API call
5. **Results**: Complete coverage analysis display

## API Specification

### Request Format

**Endpoint**: `POST http://localhost:8000/api/analyze`

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer [API_KEY]" // Optional
}
```

**Request Body**:
```json
{
  "basic_info": {
    "url": "https://example-acupuncture.com/services",
    "title": "Acupuncture Services - Downtown Wellness",
    "domain": "example-acupuncture.com",
    "timestamp": "2026-04-25T10:30:00.000Z"
  },
  "content_chunks": [
    {
      "type": "services",
      "data": ["Acupuncture Treatment", "Cupping Therapy", "Herbal Consultation"]
    },
    {
      "type": "pricing",
      "data": ["$120 per session", "$85 consultation", "Package deals available"]
    },
    {
      "type": "provider",
      "data": ["Dr. Sarah Chen, L.Ac.", "Licensed Acupuncturist", "15 years experience"]
    },
    {
      "type": "descriptions",
      "data": ["Traditional Chinese Medicine approach", "Pain management specialist"]
    },
    {
      "type": "summary",
      "data": ["Page content excerpt...", "Meta description", "Keywords"]
    }
  ]
}
```

### Expected Response Format

```json
{
  "summary": "Great news! Your insurance covers acupuncture treatments under Alternative Medicine benefits. You have excellent coverage with low out-of-pocket costs.",
  
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
    "renewal_date": "January 1, 2027"
  },
  
  "money_saved": {
    "session_cost": "$120",
    "your_cost": "$25",
    "insurance_pays": "$95",
    "savings_per_visit": "$95",
    "potential_annual_savings": "$1,520"
  }
}
```

## Technical Implementation Details

### Chrome Extension Manifest V3

```json
{
  "manifest_version": 3,
  "name": "Policy Pilot - Insurance Coverage Navigator",
  "version": "1.0.0",
  "permissions": ["activeTab", "sidePanel", "storage"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["src/content.js"]
  }],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_title": "Policy Pilot"
  }
}
```

### Communication Architecture

1. **Content → Background**: 
   - Health website detection: `health-website-detected` message
   - Scraping response: `scrape-website` message listener

2. **Background → Storage**:
   - Website info: `currentWebsiteInfo` storage key
   - Analysis results: `analysisResult` storage key
   - Metadata: `lastAnalysis` storage key

3. **Side Panel ← Storage**:
   - `chrome.storage.onChanged` listener for real-time updates
   - Automatic UI state management based on stored data

### Error Handling & Fallbacks

1. **API Failure**: Uses comprehensive dummy data with customized service names
2. **Missing Elements**: Defensive programming with element existence checks
3. **Chrome API Errors**: Graceful degradation with console logging
4. **Network Issues**: Timeout handling and user feedback

### Development Features

- **No Build Process**: Pure HTML/CSS/JavaScript for rapid development
- **Hot Reload**: Simple extension reload for changes
- **Console Logging**: Comprehensive debug information
- **Dummy Data**: Rich fallback data for offline development
- **Cross-Platform**: Works on any OS with Chrome

### Security Considerations

- **Content Security Policy**: Standard Manifest V3 restrictions
- **Host Permissions**: Required for health website access
- **API Keys**: Optional Bearer token authentication
- **Data Sanitization**: Scraping data validation and limits

## Integration with Graph RAG Backend

The extension is designed to work with a FastAPI backend that:

1. **Receives chunked website data** in the specified format
2. **Performs Graph RAG similarity search** against insurance knowledge base
3. **Uses Neo4j knowledge graphs** for coverage rules and networks
4. **Leverages LangGraph/LangChain** for AI orchestration
5. **Returns structured analysis** matching the expected response format

### Backend Components Expected
- **Neo4j Database**: Insurance plans, providers, coverage rules
- **Vector Store**: Embeddings for similarity search
- **LangGraph Workflow**: Multi-step analysis pipeline
- **Gemini 1.5 Pro**: AI model for coverage analysis
- **FastAPI Server**: REST API endpoint handling

This architecture enables real-time, intelligent insurance coverage analysis for any health or wellness service discovered on the web.
  if (!result) return <div className="p-4">No analysis available</div>;

  return (
    <div className="w-80 p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Coverage Analysis</h2>
      
      {/* Summary */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm">{result.summary}</p>
      </div>

      {/* Match Checklist */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Coverage Checklist</h3>
        {result.match_checklist.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <span className="mr-2">{item.status}</span>
            <span className="text-sm">{item.item}</span>
          </div>
        ))}
      </div>

      {/* Feasibility */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Recommendation</h3>
        <div className={`p-2 rounded text-white bg-${result.feasibility.color}-500`}>
          <span className="font-medium">{result.feasibility.score}</span>
          <p className="text-sm">{result.feasibility.message}</p>
        </div>
      </div>

      {/* Money Saved */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Cost Breakdown</h3>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm mb-1">Session Cost: {result.money_saved.session_cost}</div>
          <div className="text-sm mb-1">Your Cost: {result.money_saved.your_cost}</div>
          <div className="text-lg font-bold text-green-600">
            You Save: {result.money_saved.savings_per_visit}
          </div>
        </div>
      </div>

      {/* Benefits Details */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Benefit Details</h3>
        <div className="text-sm space-y-1">
          <div>Service: {result.benefits_services.service_name}</div>
          <div>Coverage: {result.benefits_services.coverage_type}</div>
          <div>Sessions: {result.benefits_services.sessions_used}</div>
          <div>Remaining: {result.benefits_services.sessions_remaining}</div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
```

## Simple Development Steps

### Phase 1: Basic Setup (2 hours)
- [ ] Create Plasmo project
- [ ] Setup Tailwind CSS
- [ ] Create basic file structure
- [ ] Test extension loading in Chrome

### Phase 2: Scraping (3 hours) 
- [ ] Implement content script to scrape website data
- [ ] Add analyze button to websites
- [ ] Test data extraction on sample health sites
- [ ] Create data chunking function

### Phase 3: API Integration (2 hours)
- [ ] Setup background script for API calls
- [ ] Connect to FastAPI backend
- [ ] Handle API responses
- [ ] Store results in Chrome storage

### Phase 4: Side Panel UI (4 hours)
- [ ] Create side panel component
- [ ] Implement result display using dummy JSON structure
- [ ] Style with Tailwind CSS
- [ ] Test complete user flow

### Phase 5: Testing & Polish (1 hour)
- [ ] Test on multiple health websites
- [ ] Fix any bugs
- [ ] Package for deployment

## Quick Commands
```bash
# Development
pnpm dev

# Build
pnpm build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" 
# 4. Select build/chrome-mv3-dev folder
```

---
**Total Time**: 12 hours  
**Priority**: Build working MVP first, polish later  
**Focus**: Simple button → scrape → API → display results