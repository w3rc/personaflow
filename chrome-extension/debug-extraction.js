// Debug extraction script - inject this in console on LinkedIn to test extraction
console.log('🔧 Debug Extraction Script');

// Test basic selectors first
function testBasicSelectors() {
  console.log('\n🧪 Testing Basic Selectors:');
  
  // Test name selectors
  const nameSelectors = [
    '.pv-text-details__left-panel h1.text-heading-xlarge',
    '.pv-top-card .pv-top-card__content h1',
    'main .pv-text-details__left-panel h1',
    'h1.text-heading-xlarge'
  ];
  
  console.log('👤 Name extraction test:');
  nameSelectors.forEach((selector, i) => {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      console.log(`  ${i+1}. ✅ "${selector}" → "${el.textContent.trim()}"`);
    } else {
      console.log(`  ${i+1}. ❌ "${selector}" → No match`);
    }
  });
  
  // Test headline selectors
  const headlineSelectors = [
    '.pv-text-details__left-panel .text-body-medium.break-words',
    '.pv-top-card .pv-top-card__content .text-body-medium',
    'main .pv-text-details__left-panel div:nth-child(2)'
  ];
  
  console.log('\n💼 Headline extraction test:');
  headlineSelectors.forEach((selector, i) => {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      console.log(`  ${i+1}. ✅ "${selector}" → "${el.textContent.trim()}"`);
    } else {
      console.log(`  ${i+1}. ❌ "${selector}" → No match`);
    }
  });
  
  // Test location selectors
  const locationSelectors = [
    'span.text-body-small.inline.t-black--light.break-words',
    '.pv-text-details__left-panel .text-body-small.inline.t-black--light.break-words'
  ];
  
  console.log('\n📍 Location extraction test:');
  locationSelectors.forEach((selector, i) => {
    const el = document.querySelector(selector);
    if (el && el.textContent) {
      console.log(`  ${i+1}. ✅ "${selector}" → "${el.textContent.trim()}"`);
    } else {
      console.log(`  ${i+1}. ❌ "${selector}" → No match`);
    }
  });
}

// Test experience section
function testExperienceSection() {
  console.log('\n🧪 Testing Experience Section:');
  
  const experienceSection = document.querySelector('#experience');
  if (!experienceSection) {
    console.log('❌ No #experience section found');
    return;
  }
  
  console.log('✅ Experience section found');
  
  const parentSection = experienceSection.closest('section');
  if (!parentSection) {
    console.log('❌ No parent section found');
    return;
  }
  
  console.log('✅ Parent section found');
  
  const experienceItems = parentSection.querySelectorAll('li.artdeco-list__item, li.SLqTEBLyvUqeaIuZXlBnwAbMfODKGoqfhqMuw');
  console.log(`📊 Found ${experienceItems.length} experience items`);
  
  experienceItems.forEach((item, index) => {
    console.log(`\n   Experience item ${index + 1}:`);
    
    // Test title selectors
    const titleSelectors = [
      '.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden="true"]',
      '.mr1.t-bold span[aria-hidden="true"]',
      '.t-bold span[aria-hidden="true"]'
    ];
    
    titleSelectors.forEach((selector, i) => {
      const el = item.querySelector(selector);
      if (el && el.textContent) {
        console.log(`     Title ${i+1}: ✅ "${el.textContent.trim()}"`);
      }
    });
    
    // Test company selector
    const companyEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
    if (companyEl && companyEl.textContent) {
      console.log(`     Company: ✅ "${companyEl.textContent.trim()}"`);
    }
  });
}

// Run tests
testBasicSelectors();
testExperienceSection();

console.log('\n✅ Debug extraction complete. Check the results above.');
console.log('💡 Copy this script and paste it in the LinkedIn page console to test extraction.');