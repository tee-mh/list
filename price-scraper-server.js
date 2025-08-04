// Backend Price Scraper - Node.js/Express Server
// Save as: price-scraper-server.js
// Run with: node price-scraper-server.js

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();

// Enable CORS for your frontend
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'file://']
}));

app.use(express.json());

// Shop configurations with real scraping selectors
const shopConfigs = {
    tesco: {
        name: 'Tesco',
        baseUrl: 'https://www.tesco.com/groceries/en-GB/search',
        searchParam: 'query',
        selectors: {
            price: '.price-per-unit',
            fallback: '[data-testid="price-per-unit"]',
            container: '[data-testid="product-tile"]'
        }
    },
    asda: {
        name: 'ASDA',
        baseUrl: 'https://groceries.asda.com/search',
        searchParam: 'term',
        selectors: {
            price: '.co-product__price',
            fallback: '.pdp-main-details__price',
            container: '.co-product'
        }
    },
    sainsburys: {
        name: 'Sainsbury\'s',
        baseUrl: 'https://www.sainsburys.co.uk/gol-ui/SearchResults',
        searchParam: 'keywords',
        selectors: {
            price: '.pd__cost__now',
            fallback: '.pricing__now',
            container: '.product-tile'
        }
    },
    aldi: {
        name: 'Aldi',
        baseUrl: 'https://groceries.aldi.co.uk/search',
        searchParam: 'keywords',
        selectors: {
            price: '.price',
            fallback: '.product-price',
            container: '.product-tile'
        }
    }
};

// Price scraping endpoint
app.get('/api/prices/:shop/:item', async (req, res) => {
    const { shop, item } = req.params;
    const config = shopConfigs[shop.toLowerCase()];
    
    if (!config) {
        return res.status(400).json({ error: 'Unsupported shop' });
    }

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set user agent to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // Navigate to search page
        const searchUrl = `${config.baseUrl}?${config.searchParam}=${encodeURIComponent(item)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        
        // Wait for products to load
        await page.waitForSelector(config.selectors.container, { timeout: 10000 });
        
        // Extract price data
        const priceData = await page.evaluate((selectors, shopName) => {
            const containers = document.querySelectorAll(selectors.container);
            const results = [];
            
            for (let i = 0; i < Math.min(containers.length, 3); i++) {
                const container = containers[i];
                let priceElement = container.querySelector(selectors.price) || 
                                 container.querySelector(selectors.fallback);
                
                if (priceElement) {
                    const priceText = priceElement.textContent.trim();
                    const priceMatch = priceText.match(/£?([\d.]+)/);
                    
                    if (priceMatch) {
                        const titleElement = container.querySelector('h3, .product-name, [data-testid="product-name"]');
                        const title = titleElement ? titleElement.textContent.trim() : 'Product';
                        
                        results.push({
                            store: shopName,
                            price: priceMatch[1],
                            title: title,
                            url: window.location.href
                        });
                    }
                }
            }
            
            return results;
        }, config.selectors, config.name);
        
        if (priceData.length > 0) {
            res.json({ success: true, data: priceData });
        } else {
            res.json({ success: false, error: 'No prices found' });
        }
        
    } catch (error) {
        console.error(`Error scraping ${shop}:`, error);
        res.status(500).json({ error: 'Scraping failed', details: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

// Get prices from multiple shops
app.get('/api/prices/all/:item', async (req, res) => {
    const { item } = req.params;
    const results = [];
    
    // Check multiple shops in parallel
    const promises = Object.keys(shopConfigs).map(async (shop) => {
        try {
            const response = await fetch(`http://localhost:3001/api/prices/${shop}/${item}`);
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                results.push(...data.data);
            }
        } catch (error) {
            console.error(`Failed to get prices from ${shop}:`, error);
        }
    });
    
    await Promise.all(promises);
    
    // Sort by price
    results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    
    res.json({ success: true, data: results });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Price scraper server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`  GET /api/prices/:shop/:item - Get prices from specific shop`);
    console.log(`  GET /api/prices/all/:item - Get prices from all shops`);
    console.log(`  GET /health - Health check`);
});

// Export for testing
module.exports = app;
