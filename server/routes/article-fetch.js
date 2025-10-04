const express = require('express');
const router = express.Router();

// Dependencies: axios and cheerio must be installed
// npm install axios cheerio
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * POST /api/fetch-article
 * Fetches and extracts text content from a given URL
 */
router.post('/api/fetch-article', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Valid URL is required' });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Fetch the article
        const response = await axios.get(url, {
            timeout: 15000, // 15s
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            maxRedirects: 5,
            validateStatus: (status) => status < 400
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script, style, nav, header, footer, iframe, noscript').remove();
        $('.advertisement, .ad, .sidebar, .menu, .navigation').remove();

        // Try to extract main content
        let mainContent = '';
        const selectors = [
            'article',
            '[role="main"]',
            'main',
            '.article-content',
            '.post-content',
            '.entry-content',
            '.content',
            '#content',
            '.article-body',
            '.story-body'
        ];

        for (const selector of selectors) {
            const el = $(selector);
            if (el.length > 0) {
                mainContent = el.text();
                break;
            }
        }

        // Fallbacks
        if (!mainContent || mainContent.trim().length < 100) {
            mainContent = $('p').map((i, el) => $(el).text()).get().join(' ');
        }
        if (!mainContent || mainContent.trim().length < 100) {
            mainContent = $('body').text();
        }

        // Normalize and clamp size
        mainContent = (mainContent || '')
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim();

        const maxLength = 50000; // 50k chars
        if (mainContent.length > maxLength) {
            mainContent = mainContent.slice(0, maxLength);
        }

        if (mainContent.length < 100) {
            return res.status(404).json({ error: 'Could not extract sufficient content from the article', content: null });
        }

        res.json({ success: true, content: mainContent, url, length: mainContent.length });
    } catch (error) {
        console.error('Article fetch error:', error.message);

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(404).json({ error: 'Unable to reach the article URL' });
        }
        if (error.code === 'ETIMEDOUT') {
            return res.status(408).json({ error: 'Request timed out' });
        }
        if (error.response) {
            return res.status(error.response.status).json({ error: `Article server returned status ${error.response.status}` });
        }

        res.status(500).json({ error: 'Failed to fetch article', message: error.message });
    }
});

module.exports = router;
