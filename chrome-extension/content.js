// LinkedIn Data Extractor Content Script
class LinkedInExtractor {
  constructor() {
    this.profileData = {};
    this.isExtractingData = false;
    this.init();
  }

  init() {
    // Wait for page to load completely
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupExtractor());
    } else {
      this.setupExtractor();
    }
  }

  setupExtractor() {
    // Add extraction button to LinkedIn interface
    // this.addExtractionButton();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'ping') {
        sendResponse({ success: true, message: 'Content script ready' });
        return true;
      }
      
      if (request.action === 'extractProfile') {
        this.extractProfileData().then(data => {
          sendResponse({ success: true, data });
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
      }
    });
  }

  addExtractionButton() {
    // Only add button on profile pages
    if (!window.location.pathname.includes('/in/')) return;

    const existingButton = document.getElementById('crystal-extract-btn');
    if (existingButton) return;

    const button = document.createElement('button');
    button.id = 'crystal-extract-btn';
    button.innerHTML = '🔍 Extract for Crystal';
    button.className = 'crystal-extract-button';
    button.onclick = () => this.handleExtractClick();

    // Find a good location to insert the button
    const actionsSection = document.querySelector('.pv-s-profile-actions') || 
                          document.querySelector('.ph5.pb5') ||
                          document.querySelector('main');
    
    if (actionsSection) {
      actionsSection.appendChild(button);
    }
  }

  async handleExtractClick() {
    if (this.isExtractingData) return;
    
    this.isExtractingData = true;
    const button = document.getElementById('crystal-extract-btn');
    if (button) {
      button.innerHTML = '⏳ Extracting...';
      button.disabled = true;
    }

    try {
      const data = await this.extractProfileData();
      
      // First store the data locally
      await this.sendToBackground({ action: 'profileExtracted', data });
      
      // Then immediately send for analysis to Crystal API
      console.log('📤 Sending profile for analysis...');
      const analysisResult = await this.sendToBackground({ action: 'analyzeProfile', data });
      
      if (button) {
        if (analysisResult && analysisResult.success) {
          button.innerHTML = '✅ Sent to Crystal!';
          console.log('🎉 Profile successfully analyzed and sent to Crystal!');
          console.log('🔗 View profile:', analysisResult.profileUrl);
        } else {
          button.innerHTML = '⚠️ Extracted (Analysis Failed)';
          console.warn('⚠️ Analysis failed:', analysisResult?.error);
        }
        
        setTimeout(() => {
          button.innerHTML = '🔍 Extract for Crystal';
          button.disabled = false;
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (button) {
        button.innerHTML = `❌ Failed: ${error.message}`;
        setTimeout(() => {
          button.innerHTML = '🔍 Extract for Crystal';
          button.disabled = false;
        }, 3000);
      }
    } finally {
      this.isExtractingData = false;
    }
  }

  async extractProfileData() {
    try {
      console.log('🚀 Starting LinkedIn profile extraction...');
      
      const data = {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        type: 'profile'
      };

      // Extract basic profile information with validation
      console.log('\n📊 Extracting profile data...');
      
      try {
        data.name = this.extractName();
        if (!this.validateName(data.name)) {
          console.warn('⚠️ Invalid name detected, trying alternative extraction...');
          data.name = this.extractNameFallback();
        }
      } catch (error) {
        console.error('❌ Name extraction error:', error);
        data.name = '';
      }
      
      try {
        data.headline = this.extractHeadline();
        if (!this.validateHeadline(data.headline)) {
          console.warn('⚠️ Invalid headline detected, trying alternative extraction...');
          data.headline = this.extractHeadlineFallback();
        }
      } catch (error) {
        console.error('❌ Headline extraction error:', error);
        data.headline = '';
      }
      
      try {
        data.location = this.extractLocation();
        if (!this.validateLocation(data.location)) {
          console.warn('⚠️ Invalid location detected, clearing...');
          data.location = '';
        }
      } catch (error) {
        console.error('❌ Location extraction error:', error);
        data.location = '';
      }
      
      try {
        data.about = this.extractAbout();
      } catch (error) {
        console.error('❌ About extraction error:', error);
        data.about = '';
      }
      
      try {
        data.experience = this.extractExperience();
      } catch (error) {
        console.error('❌ Experience extraction error:', error);
        data.experience = [];
      }
      
      try {
        data.education = this.extractEducation();
      } catch (error) {
        console.error('❌ Education extraction error:', error);
        data.education = [];
      }
      
      try {
        data.skills = this.extractSkills();
      } catch (error) {
        console.error('❌ Skills extraction error:', error);
        data.skills = [];
      }
      
      try {
        data.profileImage = this.extractProfileImage();
      } catch (error) {
        console.error('❌ Profile image extraction error:', error);
        data.profileImage = '';
      }
      
      try {
        data.contactInfo = this.extractContactInfo();
      } catch (error) {
        console.error('❌ Contact info extraction error:', error);
        data.contactInfo = {};
      }
      
      try {
        data.posts = await this.extractRecentPosts();
      } catch (error) {
        console.error('❌ Posts extraction error:', error);
        data.posts = [];
      }

      // Final validation and logging
      console.log('\n✅ Extraction Summary:');
      console.log(`   Name: "${data.name}" (${data.name ? 'Valid' : 'Missing'})`);
      console.log(`   Headline: "${data.headline?.substring(0, 50)}..." (${data.headline ? 'Valid' : 'Missing'})`);
      console.log(`   Location: "${data.location}" (${data.location ? 'Valid' : 'Empty'})`);
      console.log(`   About: ${data.about ? 'Present' : 'Missing'} (${data.about?.length || 0} chars)`);
      console.log(`   Experience: ${data.experience?.length || 0} items`);
      console.log(`   Skills: ${data.skills?.length || 0} items`);

      // Ensure we have at least basic data
      if (!data.name && !data.headline) {
        throw new Error('Could not extract basic profile information (name or headline)');
      }

      return data;
    } catch (error) {
      console.error('❌ Critical extraction error:', error);
      throw new Error(`Profile extraction failed: ${error.message}`);
    }
  }

  // Fallback extraction methods
  extractNameFallback() {
    console.log('🔄 Using fallback name extraction...');
    // Try even more specific selectors or use text patterns
    const fallbackSelectors = [
      'h1:first-of-type',
      '[data-test-id="profile-name"]',
      'main h1',
      '.pv-top-card h1'
    ];
    return this.getTextFromSelectors(fallbackSelectors);
  }

  extractHeadlineFallback() {
    console.log('🔄 Using fallback headline extraction...');
    // Try alternative selectors for headline
    const fallbackSelectors = [
      '.pv-top-card .text-body-medium:first-of-type',
      'main .text-body-medium',
      '[data-test-id="profile-headline"]'
    ];
    return this.getTextFromSelectors(fallbackSelectors);
  }

  extractName() {
    // More specific selectors for LinkedIn profile name
    const selectors = [
      // Current LinkedIn layout - most specific first
      '.pv-text-details__left-panel h1.text-heading-xlarge',
      '.pv-top-card .pv-top-card__content h1',
      'main .pv-text-details__left-panel h1',
      'h1[data-anonymize="person-name"]',
      // Fallback selectors
      '.pv-top-card--list h1',
      '.top-card-layout__title',
      'h1.text-heading-xlarge'
    ];
    
    console.log('🔍 Extracting name...');
    const result = this.getTextFromSelectors(selectors);
    console.log('👤 Name extracted:', result);
    return result;
  }

  extractHeadline() {
    // More specific selectors for LinkedIn headline/position
    const selectors = [
      // Current LinkedIn layout - targeting headline specifically
      '.pv-text-details__left-panel .text-body-medium.break-words',
      '.pv-top-card .pv-top-card__content .text-body-medium',
      'main .pv-text-details__left-panel div:nth-child(2)',
      '.pv-top-card--list .text-body-medium',
      // Fallback selectors
      '.top-card-layout__headline',
      '.pv-top-card .text-body-medium.break-words'
    ];
    
    console.log('🔍 Extracting headline...');
    const result = this.getTextFromSelectors(selectors);
    console.log('💼 Headline extracted:', result);
    return result;
  }

  extractLocation() {
    // Updated selectors based on actual HTML structure
    const selectors = [
      // Most specific - from the HTML you provided
      'span.text-body-small.inline.t-black--light.break-words',
      '.pv-text-details__left-panel .text-body-small.inline.t-black--light.break-words',
      '.pv-top-card .text-body-small.t-black--light',
      // Fallback selectors  
      '.top-card__subline-item',
      '.pv-top-card .text-body-small:last-child'
    ];
    
    console.log('🔍 Extracting location...');
    const result = this.getTextFromSelectors(selectors);
    console.log('📍 Location extracted:', result);
    return result;
  }

  extractAbout() {
    const aboutSection = document.querySelector('#about') || 
                        document.querySelector('[data-section="summary"]');
    
    if (aboutSection) {
      const contentDiv = aboutSection.closest('section')
        ?.querySelector('.pv-shared-text-with-see-more') ||
        aboutSection.closest('section')?.querySelector('.full-width');
      
      if (contentDiv) {
        return contentDiv.innerText.trim();
      }
    }
    
    return '';
  }

  extractExperience() {
    console.log('🔍 Extracting experience...');
    const experiences = [];
    
    // Find experience section by ID anchor
    const experienceSection = document.querySelector('#experience');
    if (!experienceSection) {
      console.log('❌ Experience section not found');
      return experiences;
    }

    // Get the parent section containing all experience items
    const parentSection = experienceSection.closest('section');
    if (!parentSection) {
      console.log('❌ Experience parent section not found');
      return experiences;
    }

    // Updated selectors based on actual HTML structure
    const experienceItems = parentSection.querySelectorAll('li.artdeco-list__item, li.SLqTEBLyvUqeaIuZXlBnwAbMfODKGoqfhqMuw');
    console.log(`📊 Found ${experienceItems.length} experience items`);
    
    experienceItems.forEach((item, index) => {
      console.log(`   Processing experience item ${index + 1}...`);
      
      // Extract job title - more specific selector
      const titleElement = item.querySelector('.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]') ||
                          item.querySelector('.mr1.t-bold span[aria-hidden="true"]') ||
                          item.querySelector('.t-bold span[aria-hidden="true"]');
      const title = titleElement?.textContent?.trim();
      
      // Extract company name and employment type
      const companyElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const company = companyElement?.textContent?.trim();
      
      // Extract duration
      const durationElement = item.querySelector('.t-14.t-normal.t-black--light .pvs-entity__caption-wrapper[aria-hidden="true"]') ||
                             item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');
      const duration = durationElement?.textContent?.trim();
      
      // Extract location (like Remote, etc.)
      const locationElement = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]:last-child');
      const workLocation = locationElement?.textContent?.trim();
      
      // Extract description/details
      const descriptionElement = item.querySelector('.WRxqGdXHCymFdMxNcCgPUXntJsPcFiBnXAxw span[aria-hidden="true"]') ||
                                item.querySelector('.inline-show-more-text span[aria-hidden="true"]') ||
                                item.querySelector('.pv-shared-text-with-see-more');
      const description = descriptionElement?.textContent?.trim();
      
      if (title || company) {
        const experience = {
          title: title || '',
          company: company || '',
          duration: duration || '',
          location: workLocation || '',
          description: description || ''
        };
        
        console.log(`   ✅ Experience ${index + 1}: ${title} at ${company}`);
        experiences.push(experience);
      } else {
        console.log(`   ❌ Experience ${index + 1}: No title or company found`);
      }
    });
    
    console.log(`💼 Extracted ${experiences.length} experience entries`);
    return experiences;
  }

  extractEducation() {
    console.log('🔍 Extracting education...');
    const education = [];
    
    const educationSection = document.querySelector('#education');
    if (!educationSection) {
      console.log('❌ Education section not found');
      return education;
    }

    const parentSection = educationSection.closest('section');
    if (!parentSection) {
      console.log('❌ Education parent section not found');
      return education;
    }

    // Use similar selectors as experience
    const educationItems = parentSection.querySelectorAll('li.artdeco-list__item, li.SLqTEBLyvUqeaIuZXlBnwAbMfODKGoqfhqMuw');
    console.log(`📊 Found ${educationItems.length} education items`);
    
    educationItems.forEach((item, index) => {
      console.log(`   Processing education item ${index + 1}...`);
      
      // Extract school name
      const schoolElement = item.querySelector('.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]') ||
                           item.querySelector('.mr1.t-bold span[aria-hidden="true"]') ||
                           item.querySelector('.t-bold span[aria-hidden="true"]');
      const school = schoolElement?.textContent?.trim();
      
      // Extract degree/program
      const degreeElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const degree = degreeElement?.textContent?.trim();
      
      // Extract duration
      const durationElement = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');
      const duration = durationElement?.textContent?.trim();
      
      if (school || degree) {
        const educationEntry = {
          school: school || '',
          degree: degree || '',
          duration: duration || ''
        };
        
        console.log(`   ✅ Education ${index + 1}: ${degree} at ${school}`);
        education.push(educationEntry);
      } else {
        console.log(`   ❌ Education ${index + 1}: No school or degree found`);
      }
    });
    
    console.log(`🎓 Extracted ${education.length} education entries`);
    return education;
  }

  extractSkills() {
    console.log('🔍 Extracting skills...');
    const skills = [];
    
    // Method 1: Try to find dedicated skills section
    const skillsSection = document.querySelector('#skills');
    if (skillsSection) {
      console.log('📊 Found skills section');
      const parentSection = skillsSection.closest('section');
      if (parentSection) {
        // Look for individual skill items
        const skillItems = parentSection.querySelectorAll('.mr1.t-bold span[aria-hidden="true"]') || [];
        
        skillItems.forEach(item => {
          const skill = item.textContent?.trim();
          if (skill && skill.length > 0 && !skills.includes(skill)) {
            console.log(`   ✅ Skill found: ${skill}`);
            skills.push(skill);
          }
        });
      }
    }
    
    // Method 2: Extract skills mentioned in experience sections
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
      const parentSection = experienceSection.closest('section');
      if (parentSection) {
        // Look for skill mentions like "Node.js, Flutter and +1 skill"
        const skillMentions = parentSection.querySelectorAll('.hoverable-link-text.display-flex.align-items-center strong');
        
        skillMentions.forEach(mention => {
          const text = mention.textContent?.trim();
          if (text && text.includes(' and +')) {
            // Parse skills like "Spring Framework, Node.js and +16 skills"
            const skillsPart = text.split(' and +')[0];
            const individualSkills = skillsPart.split(',').map(s => s.trim());
            
            individualSkills.forEach(skill => {
              if (skill && skill.length > 0 && !skills.includes(skill)) {
                console.log(`   ✅ Experience skill found: ${skill}`);
                skills.push(skill);
              }
            });
          }
        });
      }
    }
    
    // Method 3: Look for skills in any other sections with common patterns
    const allSkillElements = document.querySelectorAll('[class*="skill"], [data-test*="skill"]');
    allSkillElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 50 && !skills.includes(text)) {
        // Basic validation - should be short and not contain common non-skill words
        const nonSkillWords = ['see more', 'show all', 'skills', 'endorsements', 'experience', 'years'];
        const isValidSkill = !nonSkillWords.some(word => text.toLowerCase().includes(word));
        
        if (isValidSkill) {
          console.log(`   ✅ General skill found: ${text}`);
          skills.push(text);
        }
      }
    });
    
    console.log(`🛠️ Extracted ${skills.length} skills`);
    return skills;
  }

  extractProfileImage() {
    const img = document.querySelector('.pv-top-card__photo img') ||
                document.querySelector('.profile-photo-edit__preview img') ||
                document.querySelector('img.profile-photo');
    
    return img ? img.src : '';
  }

  extractContactInfo() {
    // This would require clicking contact info section
    // For now, return empty object
    return {};
  }

  async extractRecentPosts() {
    // Would need to navigate to activity section
    // For now, return empty array
    return [];
  }

  getTextFromSelectors(selectors) {
    console.log('🔍 Trying selectors:', selectors);
    
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      console.log(`   ${i + 1}. Testing: ${selector}`);
      
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          const text = element.textContent.trim();
          if (text.length > 0) {
            console.log(`   ✅ Match found: "${text.substring(0, 50)}..."`);
            return text;
          }
        }
        console.log(`   ❌ No match or empty text`);
      } catch (error) {
        console.log(`   ⚠️ Selector error: ${error.message}`);
      }
    }
    
    console.log('   😞 No valid matches found');
    return '';
  }

  // Data validation helpers
  validateName(name) {
    if (!name || name.length < 2) return false;
    if (name.length > 200) return false;
    // Check if it looks like a section header instead of a name
    const sectionWords = ['experience', 'education', 'about', 'skills', 'recommendations', 'activity'];
    return !sectionWords.some(word => name.toLowerCase().includes(word));
  }

  validateHeadline(headline) {
    if (!headline || headline.length < 5) return false;
    if (headline.length > 500) return false;
    // Should not be the same as name
    return true;
  }

  validateLocation(location) {
    if (!location) return true; // Optional field
    if (location.length > 100) return false;
    // Should not contain obvious non-location text
    const nonLocationWords = ['experience', 'education', 'see more', 'connect'];
    return !nonLocationWords.some(word => location.toLowerCase().includes(word));
  }

  async sendToBackground(message) {
    console.log('📤 Sending message to background script:', message.action);
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('❌ Background communication error:', chrome.runtime.lastError);
            reject(new Error(`Background script error: ${chrome.runtime.lastError.message}`));
          } else {
            console.log('📥 Background response received:', response);
            resolve(response);
          }
        });
      } catch (error) {
        console.error('❌ Send message error:', error);
        reject(new Error(`Failed to send message: ${error.message}`));
      }
    });
  }
}

// Initialize the extractor
new LinkedInExtractor();