// Minimal background script for diagnostics
console.log('🚀 Background script starting...');

// Test basic Chrome extension APIs
try {
  console.log('📋 Chrome runtime available:', !!chrome.runtime);
  console.log('📋 Chrome tabs available:', !!chrome.tabs);
  console.log('📋 Chrome storage available:', !!chrome.storage);
} catch (error) {
  console.error('❌ Chrome API test failed:', error);
}

// Test basic message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Received message:', request);
  
  try {
    sendResponse({ success: true, message: 'Background script is working!' });
  } catch (error) {
    console.error('❌ Response failed:', error);
  }
  
  return true; // Keep message channel open
});

// Test installation listener
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🔧 Extension installed/updated:', details.reason);
});

console.log('✅ Background script loaded successfully!');