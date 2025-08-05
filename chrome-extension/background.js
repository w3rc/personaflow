// Crystal LinkedIn Extractor - Background Script
// Properly structured for Chrome Extension Manifest V3

console.log('🚀 Crystal LinkedIn Extractor - Background Script Starting');

// Configuration
const CONFIG = {
  API_BASE_URL: 'https://crystalknows-clone.vercel.app',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// State management
let isInitialized = false;

// Utility Functions
function logError(context, error) {
  console.error(`❌ ${context}:`, error);
}

function logInfo(context, message) {
  console.log(`ℹ️ ${context}:`, message);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API Communication Functions
async function sendToCrystalAPI(analysisData) {
  try {
    logInfo('API', 'Sending profile to Crystal API...');
    console.log('Analysis data:', analysisData);
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: analysisData.name,
        data: analysisData
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    logInfo('API', 'Profile created successfully');
    
    return {
      success: true,
      data: result,
      profileUrl: `${CONFIG.API_BASE_URL}/dashboard/profiles/${result.id}?source=extension`
    };
  } catch (error) {
    logError('API', error);
    return {
      success: false,
      error: error.message,
      profileUrl: `${CONFIG.API_BASE_URL}/dashboard/create-profile`
    };
  }
}

function prepareAnalysisData(profileData) {
  return {
    name: profileData.name || '',
    headline: profileData.headline || '',
    location: profileData.location || '',
    about: profileData.about || '',
    experience: profileData.experience || [],
    education: profileData.education || [],
    skills: profileData.skills || [],
    source: 'linkedin_extension',
    extractedAt: profileData.timestamp,
    url: profileData.url
  };
}

// Storage Functions
async function storeProfileData(profileData) {
  try {
    const storageKey = `profile_${Date.now()}`;
    await chrome.storage.local.set({
      [storageKey]: {
        ...profileData,
        extractedAt: new Date().toISOString(),
        id: storageKey
      }
    });
    
    logInfo('Storage', `Profile stored with key: ${storageKey}`);
    return { success: true, storageKey };
  } catch (error) {
    logError('Storage', error);
    return { success: false, error: error.message };
  }
}

async function getStoredProfiles() {
  try {
    const result = await chrome.storage.local.get(null);
    const profiles = Object.entries(result)
      .filter(([key]) => key.startsWith('profile_'))
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => new Date(b.extractedAt) - new Date(a.extractedAt));

    return { success: true, profiles };
  } catch (error) {
    logError('Storage', error);
    return { success: false, error: error.message };
  }
}

// Message Handler Functions
async function handleProfileExtracted(data) {
  logInfo('Handler', 'Processing extracted profile data');
  return await storeProfileData(data);
}

async function handleAnalyzeProfile(data) {
  logInfo('Handler', 'Starting profile analysis');
  
  try {
    const analysisData = prepareAnalysisData(data);
    const response = await sendToCrystalAPI(analysisData);
    
    if (response.success) {
      // Store analysis result
      const storageKey = `analysis_${Date.now()}`;
      await chrome.storage.local.set({
        [storageKey]: {
          profileData: analysisData,
          analysisResult: response.data,
          analyzedAt: new Date().toISOString(),
          id: storageKey
        }
      });

      logInfo('Handler', 'Analysis completed successfully');
      return {
        success: true,
        message: 'Profile sent for analysis',
        profileUrl: response.profileUrl,
        analysisId: storageKey
      };
    } else {
      throw new Error(response.error || 'Analysis failed');
    }
  } catch (error) {
    logError('Handler', error);
    return { success: false, error: error.message };
  }
}

// Main Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logInfo('Message', `Received action: ${request.action}`);
  
  (async () => {
    try {
      let result;
      
      switch (request.action) {
        case 'profileExtracted':
          result = await handleProfileExtracted(request.data);
          break;
          
        case 'analyzeProfile':
          result = await handleAnalyzeProfile(request.data);
          break;
          
        case 'getStoredProfiles':
          result = await getStoredProfiles();
          break;
          
        case 'ping':
          result = { success: true, message: 'Background script is running' };
          break;
          
        default:
          result = { success: false, error: `Unknown action: ${request.action}` };
      }
      
      sendResponse(result);
    } catch (error) {
      logError('Message Handler', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Keep message channel open for async response
});

// Installation Handler
chrome.runtime.onInstalled.addListener((details) => {
  logInfo('Install', `Extension ${details.reason}`);
  
  if (details.reason === 'install') {
    chrome.storage.local.set({
      installDate: new Date().toISOString(),
      extractionCount: 0,
      version: chrome.runtime.getManifest().version
    });
    
    // Show install notification
    chrome.action.setBadgeText({ text: 'NEW' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
    
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 5000);
  }
});

// Initialize
function initialize() {
  if (isInitialized) return;
  
  logInfo('Init', 'Background script initialized successfully');
  isInitialized = true;
}

// Start initialization
initialize();