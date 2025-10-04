// Enhanced search functionality for Space Biology Dashboard
class SearchManager {
    constructor() {
        this.searchIndex = [];
        this.init();
    }

    async init() {
        // With experiments UI removed, only wire article search bridge
        await this.buildSearchIndex();
        this.setupSearchListeners();
    }

    async buildSearchIndex() {
        // Experiments index not used anymore; keep no-op to avoid network traffic
        this.searchIndex = [];
    }

    setupSearchListeners() {
        // Main dashboard search UI removed; focus on article search handled in dashboard.html
    }

    handleSearch(query) {
        // Forward to articles loading only
        const q = (query || '').trim();
        if (typeof window.__articlesLoad === 'function') {
            window.__articlesLoad(1, q);
        }
    }

    matchItem(item, query) {
        const searchableFields = [
            item.title,
            item.description,
            item.organism,
            item.mission,
            item.keyFindings,
            ...item.keywords
        ];

        return searchableFields.some(field =>
            field && field.toString().toLowerCase().includes(query)
        );
    }

    displaySearchResults(results, query) {
        // Experiments section removed – no display
    }

    highlightSearchTerms(query) { /* not needed */ }

    clearSearch() {
        if (typeof window.__articlesLoad === 'function') {
            window.__articlesLoad(1, '');
        }
    }

    // Advanced search with filters
    advancedSearch(filters) {
        return this.searchIndex.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key] || filters[key] === 'all') return true;
                
                const itemValue = item[key]?.toString().toLowerCase();
                const filterValue = filters[key].toString().toLowerCase();
                
                return itemValue === filterValue;
            });
        });
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});

// Search utility functions
const SearchUtils = {
    // Fuzzy search implementation
    fuzzySearch(query, items, keys) {
        return items.filter(item => {
            return keys.some(key => {
                const value = item[key]?.toString().toLowerCase() || '';
                return this.fuzzyMatch(value, query.toLowerCase());
            });
        });
    },

    fuzzyMatch(text, pattern) {
        pattern = pattern.toLowerCase();
        let patternIdx = 0;
        
        for (let i = 0; i < text.length; i++) {
            if (text[i] === pattern[patternIdx]) {
                patternIdx++;
            }
            if (patternIdx === pattern.length) {
                return true;
            }
        }
        return false;
    },

    // Search result scoring
    scoreSearchResult(item, query) {
        let score = 0;
        const queryTerms = query.toLowerCase().split(' ');

        queryTerms.forEach(term => {
            if (item.title.toLowerCase().includes(term)) score += 10;
            if (item.keyFindings.toLowerCase().includes(term)) score += 5;
            if (item.description.toLowerCase().includes(term)) score += 3;
            if (item.organism.toLowerCase().includes(term)) score += 2;
            if (item.mission.toLowerCase().includes(term)) score += 1;
        });

        return score;
    }
};