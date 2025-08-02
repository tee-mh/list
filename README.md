# Smart Shopping List Mobile App

A fully-featured shopping list application that works as a Progressive Web App (PWA) and can be installed on mobile devices.

## Features

- **Add Items**: Add shopping items with automatic UK price suggestions (Aldi pricing)
- **Edit & Delete**: Modify or remove items from your list
- **Drag & Drop**: Reorder items by dragging them up or down
- **Timestamps**: Track when items were added
- **Price Tracking**: Automatic price suggestions for common items
- **Offline Support**: Works without internet connection
- **Mobile Optimized**: Touch-friendly interface for mobile devices
- **PWA Installation**: Install as an app on your mobile device

## Installation Options

### Option 1: PWA Installation (Recommended)

1. **Generate App Icons**:
   - Open `icon-generator.html` in your browser
   - Click "Generate and Download Icons"
   - Extract the downloaded zip file to the `icons/` folder

2. **Serve the App**:
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Or use any local web server
   ```

3. **Install on Mobile**:
   - Visit `http://your-ip:8000/working.html` on your mobile device
   - Look for "Add to Home Screen" or "Install App" prompt
   - Follow the installation instructions

### Option 2: Capacitor Build (Native App)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init "Smart Shopping List" "com.yourname.shoppinglist"
   ```

3. **Add Platforms**:
   ```bash
   npx cap add android
   npx cap add ios
   ```

4. **Build**:
   ```bash
   npx cap build
   ```

### Option 3: Cordova Build

1. **Install Cordova**:
   ```bash
   npm install -g cordova
   ```

2. **Create Cordova Project**:
   ```bash
   cordova create shopping-app com.yourname.shoppinglist "Smart Shopping List"
   ```

3. **Copy Files**: Copy all files to the `www` folder of the Cordova project

4. **Add Platforms and Build**:
   ```bash
   cordova platform add android
   cordova build android
   ```

## File Structure

```
shopping-list/
├── working.html          # Main application file
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── icon-generator.html   # Icon generation tool
├── icons/               # App icons (generate using icon-generator.html)
├── package.json         # Project configuration
└── README.md           # This file
```

## Usage

1. **Adding Items**: Click the "+" button and enter an item name
2. **Price Suggestions**: Prices are automatically suggested based on UK Aldi pricing
3. **Editing**: Click the edit button (pencil icon) next to any item
4. **Deleting**: Click the delete button (trash icon) to remove items
5. **Reordering**: Drag items using the grip handle (≡) to reorder
6. **Purchasing**: Click the checkbox to mark items as purchased

## Features Included

- ✅ Add/Edit/Delete items
- ✅ Drag & drop reordering
- ✅ Timestamp tracking
- ✅ Price suggestions (UK Aldi pricing)
- ✅ Mobile-responsive design
- ✅ PWA support with offline functionality
- ✅ Touch-optimized controls
- ✅ Local storage persistence

## Browser Compatibility

- Chrome/Edge (full PWA support)
- Firefox (basic PWA support)
- Safari (iOS PWA support)
- Any modern mobile browser

## Next Steps

1. Generate icons using `icon-generator.html`
2. Test the PWA installation on your mobile device
3. Optionally build as native app using Capacitor or Cordova

Enjoy your new shopping list app! 🛒

2. **Adding Items**
   - Type an item name in the input field
   - Click "Add Item" or press Enter

3. **Managing Items**
   - **Edit**: Click the pencil icon to edit an item
   - **Price Check**: Click the dollar icon to check individual prices
   - **Move**: Use the up/down arrows to reorder items
   - **Delete**: Click the trash icon to remove an item

4. **Using Templates**
   - Add items to your list
   - Click "Save as Template" and give it a name
   - Use the dropdown to load templates later

5. **Price Checking**
   - Click "Check Prices" to get prices for all items
   - Use "Show/Hide Prices" to toggle price display
   - Individual price checks available per item

6. **Scheduling**
   - Select a template and enable "Auto-Refill"
   - Choose weekly or monthly schedule
   - Your list will automatically update based on the schedule

## 📁 File Descriptions

### `index.html`
Enhanced structure including:
- Template management controls
- Price checking buttons
- Schedule configuration
- Modal dialogs for template saving

### `styles.css`
Complete styling featuring:
- Template section styling
- Price display components
- Modal dialog styles
- Loading animations
- Enhanced responsive design

### `script.js`
Advanced functionality including:
- Template management system
- Mock price checking (for demo)
- Scheduling system with notifications
- Enhanced data persistence
- Price comparison display

### `price-crawler.js`
Real-world implementation guide for:
- Walmart API integration
- Target API integration
- Amazon price checking (via Rainforest API)
- Kroger API integration
- Best Buy API integration
- Web scraping alternatives

## 🛒 Price Checking Features

### Current Implementation (Demo)
- Mock price data for demonstration
- Simulates real API calls with delays
- Shows price comparison from multiple "stores"

### Real Implementation (See price-crawler.js)
To implement real price checking, you'll need:
1. **API Keys** from retailers (Walmart, Target, etc.)
2. **Backend Service** for web scraping (to avoid CORS)
3. **Rate Limiting** to respect API quotas
4. **Error Handling** for failed API calls

### Supported Retailers (With Real APIs)
- 🏪 Walmart Labs API
- 🎯 Target RedSky API
- 📦 Amazon (via Rainforest API)
- 🛒 Kroger API
- 💻 Best Buy API

## 📱 Template System

### Template Features
- **Save Current List**: Convert your current shopping list into a reusable template
- **Load Templates**: Instantly populate your list from saved templates
- **Template Management**: View all saved templates with item counts
- **Smart Replacement**: Option to replace current list or add to it

### Scheduling Features
- **Weekly Auto-Fill**: Automatically add template items every week
- **Monthly Auto-Fill**: Perfect for monthly household shopping
- **Browser Notifications**: Get notified when templates are auto-loaded
- **Schedule Management**: Enable/disable schedules as needed

## 🔧 Technical Features

### Data Persistence
- Templates stored in browser localStorage
- Schedule configurations preserved
- Price cache for performance
- Cross-session data retention

### Performance Optimizations
- Efficient DOM manipulation
- Price caching to reduce API calls
- Lazy loading of price data
- Minimal re-renders

### Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- 📱 Mobile browsers

## 🔮 Future Enhancements

### Planned Features
- [ ] Barcode scanning for easy item addition
- [ ] Store location-based price filtering
- [ ] Shopping list sharing with family
- [ ] Quantity and unit tracking
- [ ] Nutrition information integration
- [ ] Meal planning integration
- [ ] Dark mode theme
- [ ] Offline functionality with Service Workers
- [ ] Export to PDF/print functionality

### Advanced Price Features
- [ ] Price history tracking
- [ ] Price drop alerts
- [ ] Coupon integration
- [ ] Bulk pricing calculations
- [ ] Store inventory checking

## 🔐 Privacy & Data

- All data stored locally in your browser
- No personal information sent to external services
- Price checking uses public APIs only
- Templates and schedules remain private

## 📚 Implementation Notes

### For Developers

#### Adding New Retailers
1. Add API configuration to `price-crawler.js`
2. Implement store-specific search function
3. Add error handling and rate limiting
4. Update UI to display new retailer

#### Customizing Templates
- Templates are stored as JSON objects
- Easy to extend with additional metadata
- Can include categories, tags, or custom fields

#### Extending Scheduling
- Current system supports weekly/monthly
- Easy to add daily, bi-weekly, or custom intervals
- Notification system can be enhanced with more detail

## 🆘 Troubleshooting

### Common Issues
- **Prices not loading**: Check browser console for API errors
- **Templates not saving**: Ensure localStorage is enabled
- **Notifications not working**: Grant notification permissions
- **Mobile display issues**: Clear browser cache

### Development Setup
For real price checking:
1. Register for retailer API keys
2. Set up CORS proxy or backend service
3. Configure rate limiting
4. Test with small item sets first

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional retailer integrations
- UI/UX enhancements
- Performance optimizations
- New template features
- Better price comparison algorithms
