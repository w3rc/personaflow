# Crystal Knows LinkedIn Extractor

A Chrome extension that extracts LinkedIn profile data and sends it to your Crystal Knows clone for personality analysis.

## Features

- **One-click extraction** from LinkedIn profiles
- **Comprehensive data collection** including profile info, experience, education, and skills
- **Real-time preview** of extracted data
- **Secure transmission** to Crystal Knows clone API
- **Export functionality** for extracted data
- **Local storage** with automatic cleanup

## Installation

### Development Mode

1. **Build the Crystal Knows clone** (if not already running):
   ```bash
   cd crystalknows-clone
   npm run dev
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. **Verify installation**:
   - Extension icon should appear in Chrome toolbar
   - Navigate to any LinkedIn profile
   - Click the extension icon to open the popup

### Production Build

For production deployment, you'll need to:

1. Create proper extension icons (16x16, 48x48, 128x128 pixels)
2. Update the API URL in `background.js` to your production domain
3. Package the extension for Chrome Web Store submission

## Usage

### Extracting LinkedIn Data

1. **Navigate to a LinkedIn profile** (e.g., `https://www.linkedin.com/in/someone`)
2. **Click the Crystal extension icon** in your browser toolbar
3. **Click "Extract Profile Data"** in the popup
4. **Review the extracted data** in the preview section
5. **Send to Crystal** for personality analysis or **Export as JSON**

### Data Points Extracted

The extension captures:

- **Basic Info**: Name, headline, location, profile image
- **About Section**: Professional summary/description
- **Experience**: Job titles, companies, durations, descriptions
- **Education**: Schools, degrees, duration
- **Skills**: Listed skills and endorsements
- **Contact Info**: Available contact details
- **Metadata**: Profile URL, extraction timestamp

### Privacy & Security

- **Local Storage**: Data is stored locally in your browser
- **Secure Transmission**: HTTPS communication with your Crystal API
- **Automatic Cleanup**: Old data is removed after 30 days
- **No External Tracking**: Extension only communicates with your Crystal instance

## Configuration

### API Endpoints

The extension communicates with these Crystal API endpoints:

- `POST /api/profiles` - Create profile from LinkedIn data
- `POST /api/analyze-personality` - Analyze personality from profile
- `GET /api/health` - Check API connectivity

### Updating API URL

To change the API URL (default: `http://localhost:3000`):

1. Edit `chrome-extension/background.js`
2. Update the `apiBaseUrl` variable
3. Reload the extension in `chrome://extensions/`

## Development

### File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.js              # Popup functionality
├── content.js            # LinkedIn page interaction
├── content.css           # Content script styles
├── background.js         # Background service worker
├── icons/                # Extension icons
└── README.md             # This file
```

### Key Components

- **Content Script** (`content.js`): Runs on LinkedIn pages, extracts profile data
- **Popup** (`popup.html/js`): User interface for data preview and actions
- **Background Script** (`background.js`): Handles API communication and data storage
- **Manifest** (`manifest.json`): Extension configuration and permissions

### Adding New Data Points

To extract additional LinkedIn data:

1. **Update `content.js`**: Add new extraction methods
2. **Update `background.js`**: Handle new data in API requests
3. **Update popup**: Display new data points in preview
4. **Update API**: Ensure Crystal API can process new fields

## Troubleshooting

### Extension Not Working

1. **Check permissions**: Ensure extension has access to LinkedIn
2. **Verify API**: Test `http://localhost:3000/api/health` in browser
3. **Check console**: Look for errors in Chrome DevTools
4. **Reload extension**: Disable and re-enable in `chrome://extensions/`

### Data Extraction Issues

1. **LinkedIn updates**: LinkedIn frequently changes their HTML structure
2. **Profile privacy**: Some profiles may have limited public data
3. **Rate limiting**: LinkedIn may block rapid requests
4. **Content loading**: Some data loads dynamically and may need retry

### API Communication Problems

1. **CORS issues**: Ensure your Crystal API allows extension origins
2. **Authentication**: Extension creates profiles without user auth by default
3. **Network errors**: Check internet connection and API status
4. **Rate limits**: Your Crystal API may have usage limits

## Contributing

To contribute improvements:

1. **Fork the repository**
2. **Create a feature branch**
3. **Test thoroughly on multiple LinkedIn profiles**
4. **Submit a pull request with clear description**

## License

This extension is part of the Crystal Knows clone project and follows the same licensing terms.

## Disclaimer

This extension is for educational and personal use. Always respect LinkedIn's Terms of Service and users' privacy. The extension only accesses publicly available profile information.