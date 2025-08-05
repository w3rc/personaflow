class PopupController {
    constructor() {
        this.currentProfileData = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    setupEventListeners() {
        document.getElementById('extract-btn').addEventListener('click', () => this.extractProfile());
        document.getElementById('analyze-btn').addEventListener('click', () => this.sendToAnalysis());
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
    }

    async checkAuthentication() {
        try {
            console.log('🔐 Checking user authentication...');
            const response = await chrome.runtime.sendMessage({ action: 'checkAuth' });
            console.log('🔐 Auth response:', response);
            
            if (response && response.success && response.user) {
                this.currentUser = response.user;
                this.updateAuthStatus('authenticated', `✅ Signed in as ${response.user.email}`);
                // Now check the current tab
                this.checkCurrentTab();
            } else {
                this.currentUser = null;
                this.updateAuthStatus('unauthenticated', 
                    '⚠️ Please sign in to PersonaFlow', 
                    'Click here to sign in', 
                    () => this.openLoginPage()
                );
                // Still check tab but disable extraction
                this.checkCurrentTab();
            }
        } catch (error) {
            console.error('🔐 Auth check error:', error);
            this.updateAuthStatus('error', '❌ Authentication check failed');
        }
    }

    updateAuthStatus(status, message, linkText = null, linkAction = null) {
        const authStatus = document.getElementById('auth-status');
        const authContent = document.getElementById('auth-content');
        
        authStatus.className = `status ${status}`;
        
        let html = message;
        if (linkText && linkAction) {
            html += `<div class="auth-info"><span class="login-link">${linkText}</span></div>`;
        }
        
        authContent.innerHTML = html;
        
        if (linkAction) {
            const link = authContent.querySelector('.login-link');
            if (link) {
                link.addEventListener('click', linkAction);
            }
        }
    }

    async openLoginPage() {
        // Get the current API URL from background script
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getAPIUrl' });
            const baseUrl = response?.url || 'http://localhost:3000';
            chrome.tabs.create({ url: `${baseUrl}/auth/login` });
        } catch (error) {
            // Fallback to localhost if background script fails
            chrome.tabs.create({ url: 'http://localhost:3000/auth/login' });
        }
    }

    async checkCurrentTab() {
        try {
            console.log('🔍 Checking current tab...');
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('📍 Current tab URL:', tab.url);
            
            if (tab.url && tab.url.includes('linkedin.com/in/')) {
                console.log('✅ LinkedIn profile page detected');
                
                // Test if content script is ready
                try {
                    console.log('📡 Testing content script connection...');
                    const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                    console.log('📥 Content script response:', response);
                    this.updateStatus('ready', '✅ LinkedIn profile detected');
                    // Only enable extraction if user is authenticated
                    document.getElementById('extract-btn').disabled = !this.currentUser;
                } catch (contentError) {
                    console.log('⚠️ Content script not ready, injecting...', contentError);
                    
                    // Content script not ready, inject it
                    await this.injectContentScript(tab.id);
                    this.updateStatus('ready', '✅ LinkedIn profile detected (script injected)');
                    // Only enable extraction if user is authenticated
                    document.getElementById('extract-btn').disabled = !this.currentUser;
                }
            } else if (tab.url && tab.url.includes('linkedin.com')) {
                console.log('⚠️ On LinkedIn but not profile page');
                this.updateStatus('error', '❌ Please navigate to a specific LinkedIn profile (/in/...)');
            } else {
                console.log('❌ Not on LinkedIn');
                this.updateStatus('error', '❌ Please navigate to a LinkedIn profile');
            }
        } catch (error) {
            console.error('❌ Tab check error:', error);
            this.updateStatus('error', '❌ Unable to access current tab');
        }
    }

    async injectContentScript(tabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            await chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ['content.css']
            });
        } catch (error) {
            console.error('Script injection failed:', error);
        }
    }

    updateStatus(type, message) {
        const statusEl = document.getElementById('status');
        const contentEl = document.getElementById('status-content');
        
        statusEl.className = `status ${type}`;
        contentEl.innerHTML = message;
    }

    async extractProfile() {
        const extractBtn = document.getElementById('extract-btn');
        const originalText = extractBtn.textContent;
        
        try {
            extractBtn.disabled = true;
            extractBtn.innerHTML = '<div class="loading"></div>Extracting...';
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Ensure content script is ready
            try {
                await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
            } catch (pingError) {
                // Inject content script if not ready
                await this.injectContentScript(tab.id);
                // Wait a moment for script to initialize
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'extractProfile' 
            });
            
            if (response && response.success) {
                this.currentProfileData = response.data;
                this.showProfilePreview(response.data);
                this.updateStatus('ready', '✅ Profile data extracted successfully');
                
                // Enable other actions
                document.getElementById('analyze-btn').disabled = false;
                document.getElementById('export-btn').disabled = false;
                
                extractBtn.textContent = '✅ Extracted';
                setTimeout(() => {
                    extractBtn.textContent = originalText;
                    extractBtn.disabled = false;
                }, 2000);
            } else {
                throw new Error(response?.error || 'Extraction failed - no response from content script');
            }
        } catch (error) {
            console.error('Extraction error:', error);
            this.updateStatus('error', `❌ ${error.message || 'Connection error'}`);
            extractBtn.textContent = originalText;
            extractBtn.disabled = false;
        }
    }

    showProfilePreview(data) {
        const preview = document.getElementById('profile-preview');
        
        document.getElementById('preview-name').textContent = data.name || 'Not found';
        document.getElementById('preview-headline').textContent = data.headline || 'Not found';
        document.getElementById('preview-location').textContent = data.location || 'Not found';
        
        // Count data points
        let dataPoints = 0;
        if (data.name) dataPoints++;
        if (data.headline) dataPoints++;
        if (data.location) dataPoints++;
        if (data.about) dataPoints++;
        if (data.experience && data.experience.length > 0) dataPoints += data.experience.length;
        if (data.education && data.education.length > 0) dataPoints += data.education.length;
        if (data.skills && data.skills.length > 0) dataPoints += data.skills.length;
        
        document.getElementById('data-count').textContent = `${dataPoints} data points extracted`;
        
        preview.classList.add('visible');
    }

    async sendToAnalysis() {
        if (!this.currentProfileData) {
            this.updateStatus('error', '❌ No profile data to analyze');
            return;
        }

        const analyzeBtn = document.getElementById('analyze-btn');
        const originalText = analyzeBtn.textContent;

        try {
            console.log('🚀 Starting analysis process...');
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<div class="loading"></div>Sending to PersonaFlow...';

            // Test background script connection first
            try {
                const pingResponse = await chrome.runtime.sendMessage({ action: 'ping' });
                console.log('📡 Background script ping:', pingResponse);
                if (!pingResponse || !pingResponse.success) {
                    throw new Error('Background script not responding');
                }
            } catch (pingError) {
                console.error('❌ Background script ping failed:', pingError);
                throw new Error('Extension background script not running. Try reloading the extension.');
            }

            // Send to background script for API communication
            console.log('📤 Sending profile data to background script...');
            const response = await chrome.runtime.sendMessage({
                action: 'analyzeProfile',
                data: this.currentProfileData
            });

            console.log('📥 Background script response:', response);

            if (response && response.success) {
                this.updateStatus('ready', '✅ Sent to PersonaFlow for analysis');
                analyzeBtn.innerHTML = '✅ Sent to PersonaFlow';

                // Open PersonaFlow dashboard in new tab
                if (response.profileUrl) {
                    chrome.tabs.create({ url: response.profileUrl });
                }
                
                setTimeout(() => {
                    analyzeBtn.textContent = originalText;
                    analyzeBtn.disabled = false;
                }, 3000);
            } else {
                const errorMsg = response?.error || 'Analysis request failed - no response from background script';
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('❌ Analysis error:', error);
            const displayError = error.message || 'Unknown error occurred';
            this.updateStatus('error', `❌ ${displayError}`);
            analyzeBtn.textContent = originalText;
            analyzeBtn.disabled = false;
        }
    }

    exportData() {
        if (!this.currentProfileData) {
            this.updateStatus('error', '❌ No profile data to export');
            return;
        }

        const dataStr = JSON.stringify(this.currentProfileData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkedin-profile-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.updateStatus('ready', '✅ Profile data exported');
        
        const exportBtn = document.getElementById('export-btn');
        const originalText = exportBtn.textContent;
        exportBtn.textContent = '✅ Exported';
        setTimeout(() => {
            exportBtn.textContent = originalText;
        }, 2000);
    }
}

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});