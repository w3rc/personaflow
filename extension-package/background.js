// PersonaFlow LinkedIn Extractor - Background Script
// Properly structured for Chrome Extension Manifest V3

console.log('🚀 PersonaFlow LinkedIn Extractor - Background Script Starting');

// Configuration
const CONFIG = {
  PRODUCTION_URL: 'https://crystalknows-clone.vercel.app',
  DEVELOPMENT_URLS: ['http://localhost:3001', 'http://localhost:3000'],
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  currentAPI: 'https://crystalknows-clone.vercel.app' // Default to production
};

// Environment detection function
async function detectEnvironment() {
  logInfo('Environment', 'Detecting available API environment...');
  
  // For production extension, try localhost briefly, then use production
  let localhostAvailable = false;
  
  // Quick check for localhost (shorter timeout for production users)
  for (const devUrl of CONFIG.DEVELOPMENT_URLS) {
    try {
      logInfo('Environment', `Checking development API: ${devUrl}`);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 1000) // Shorter timeout
      );
      
      const fetchPromise = fetch(`${devUrl}/api/auth/user`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (response.ok || response.status === 401) {
        CONFIG.currentAPI = devUrl;
        logInfo('Environment', `Using development API: ${CONFIG.currentAPI}`);
        localhostAvailable = true;
        return CONFIG.currentAPI;
      }
    } catch (error) {
      // Silently continue to production for normal users
    }
  }
  
  // Use production (default for most users)
  if (!localhostAvailable) {
    CONFIG.currentAPI = CONFIG.PRODUCTION_URL;
    logInfo('Environment', `Using production API: ${CONFIG.currentAPI}`);
  }
  
  return CONFIG.currentAPI;
}

// Get current API URL (with fallback)
function getAPIBaseURL() {
  return CONFIG.currentAPI || CONFIG.PRODUCTION_URL;
}

// State management
let isInitialized = false;
let currentUser = null;

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

// Authentication Functions
async function checkUserAuthentication() {
  try {
    logInfo('Auth', 'Checking user authentication...');
    
    // Ensure we have detected the environment
    if (!CONFIG.currentAPI) {
      await detectEnvironment();
    }
    
    const response = await fetch(`${getAPIBaseURL()}/api/auth/user`, {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (result.authenticated && result.user) {
      currentUser = result.user;
      logInfo('Auth', `User authenticated: ${result.user.email}`);
      return { success: true, user: result.user };
    } else {
      currentUser = null;
      logInfo('Auth', 'User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }
  } catch (error) {
    logError('Auth', error);
    currentUser = null;
    return { success: false, error: error.message };
  }
}

async function requireAuthentication() {
  const authResult = await checkUserAuthentication();
  if (!authResult.success) {
    const currentURL = getAPIBaseURL();
    throw new Error(`User must be signed in to PersonaFlow to use this extension. Please visit ${currentURL} and sign in.`);
  }
  return authResult.user;
}

// API Communication Functions
async function sendToCrystalAPI(analysisData, user) {
  try {
    logInfo('API', 'Sending profile to PersonaFlow API...');
    console.log('Analysis data:', analysisData);
    console.log('User context:', user);
    
    const response = await fetch(`${getAPIBaseURL()}/api/profiles`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: analysisData.name,
        data: analysisData,
        userId: user.id // Pass user ID for proper association
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
      profileUrl: `${getAPIBaseURL()}/dashboard/profiles/${result.id}?source=extension`
    };
  } catch (error) {
    logError('API', error);
    return {
      success: false,
      error: error.message,
      profileUrl: `${getAPIBaseURL()}/dashboard/create-profile`
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
    // Check authentication before proceeding
    const user = await requireAuthentication();
    
    const analysisData = prepareAnalysisData(data);
    const response = await sendToCrystalAPI(analysisData, user);
    
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
          
        case 'checkAuth':
          result = await checkUserAuthentication();
          break;
          
        case 'getAPIUrl':
          // Ensure environment is detected
          if (!CONFIG.currentAPI) {
            await detectEnvironment();
          }
          result = { success: true, url: getAPIBaseURL() };
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