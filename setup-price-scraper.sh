#!/bin/bash
# setup-price-scraper.sh - Quick setup script for the price scraper backend

echo "🛒 Setting up Real Price Scraper Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install express puppeteer cors nodemon

# Create start script
echo "📝 Creating start script..."
cat > start-price-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Price Scraper Server..."
echo "🌐 Server will be available at http://localhost:3001"
echo "📱 Make sure your shopping list app is running on http://localhost:8000"
echo ""
node price-scraper-server.js
EOF

chmod +x start-price-server.sh

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the price scraper server:"
echo "   ./start-price-server.sh"
echo ""
echo "📱 Or manually:"
echo "   node price-scraper-server.js"
echo ""
echo "🔗 The server will run on http://localhost:3001"
echo "🛒 Your shopping list app will now fetch real prices!"
