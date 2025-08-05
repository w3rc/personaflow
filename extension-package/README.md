# PersonaFlow Chrome Extension

Extract LinkedIn profiles and get AI-powered personality insights with DISC analysis.

## Features

- ✅ **One-Click Extraction**: Extract LinkedIn profile data instantly
- ✅ **AI-Powered Analysis**: Get DISC personality insights using Claude AI
- ✅ **Secure Authentication**: Uses your existing PersonaFlow account
- ✅ **Privacy Protected**: Your data stays private and secure
- ✅ **Dashboard Integration**: Profiles appear in your PersonaFlow dashboard
- ✅ **Comprehensive Data**: Name, headline, experience, education, skills, and more

## Installation Instructions

### For End Users:

1. **Download** the extension package (personaflow-extension.zip)
2. **Extract** the zip file to a folder on your computer
3. **Open Chrome** and go to `chrome://extensions/`
4. **Enable Developer Mode** (toggle in top-right corner)
5. **Click "Load unpacked"** and select the extracted folder
6. **Pin the extension** to your toolbar for easy access

### Requirements:

- Google Chrome browser (version 88+)
- Active PersonaFlow account at https://crystalknows-clone.vercel.app
- LinkedIn profile pages to analyze

## Usage

### How to Use PersonaFlow Extension:

1. **Sign in** to PersonaFlow at https://crystalknows-clone.vercel.app
2. **Navigate** to any LinkedIn profile page (e.g., `https://www.linkedin.com/in/someone`)
3. **Click** the PersonaFlow extension icon in your browser toolbar
4. **Verify** you're signed in (shows your email in the extension popup)
5. **Click "Extract Profile Data"** to analyze the profile
6. **View results** in your PersonaFlow dashboard at https://crystalknows-clone.vercel.app/dashboard/profiles

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