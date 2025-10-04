const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Try to find a CSV file automatically, or use env var ARTICLES_CSV
const ROOT_DIR = path.join(__dirname, '..', '..');
let discoveredCSVPath = null;
let cachedArticles = null;
let cachedMtimeMs = 0;

async function findCSVFile(startDir, maxDepth = 3) {
  try {
    const stack = [{ dir: startDir, depth: 0 }];
    while (stack.length) {
      const { dir, depth } = stack.shift();
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isFile()) {
          if (entry.name.toLowerCase().endsWith('.csv') || entry.name === 'csv') {
            return full;
          }
        } else if (entry.isDirectory() && depth < maxDepth) {
          stack.push({ dir: full, depth: depth + 1 });
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function parseCSV(text) {
  // Basic RFC4180-ish CSV parser supporting quoted fields and commas within quotes
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') { // escaped quote
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(field); field = ''; i++; continue; }
      if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      if (ch === '\r') { i++; continue; }
      field += ch; i++;
    }
  }
  // Last field/row
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  // Convert to objects using header row
  if (!rows.length) return [];
  const headers = rows[0].map(h => String(h || '').trim());
  const records = rows.slice(1).map(r => {
    const obj = {};
    for (let idx = 0; idx < headers.length; idx++) {
      const key = headers[idx] || `col_${idx}`;
      obj[key] = r[idx] !== undefined ? r[idx] : '';
    }
    return obj;
  });
  return records;
}

async function loadArticles() {
  const explicit = process.env.ARTICLES_CSV;
  const candidate = explicit || discoveredCSVPath || await findCSVFile(ROOT_DIR, 3);
  if (!candidate) {
    discoveredCSVPath = null;
    cachedArticles = [];
    cachedMtimeMs = 0;
    return [];
  }
  discoveredCSVPath = candidate;

  try {
    const stats = await fs.promises.stat(candidate);
    if (stats.mtimeMs === cachedMtimeMs && Array.isArray(cachedArticles)) {
      return cachedArticles;
    }

    const text = await fs.promises.readFile(candidate, 'utf8');
    const records = parseCSV(text);

    // Normalize some common fields for display convenience
    const normalized = records.map((r, idx) => ({
      id: r.id || r.ID || String(idx + 1),
      title: r.title || r.Title || r.name || r.Name || `Article ${idx + 1}`,
      authors: r.authors || r.Authors || r.author || r.Author || '',
      year: Number(r.year || r.Year || r.date || r.Date || '') || '',
      journal: r.journal || r.Journal || r.source || r.Source || '',
      url: r.url || r.URL || r.link || r.Link || '',
      abstract: r.abstract || r.Abstract || r.summary || r.Summary || '',
      raw: r
    }));

    cachedArticles = normalized;
    cachedMtimeMs = stats.mtimeMs;
    return cachedArticles;
  } catch (e) {
    console.error('Failed to load CSV:', e.message);
    return [];
  }
}

function filterSearch(items, q) {
  if (!q) return items;
  const needle = String(q).toLowerCase();
  return items.filter(item => {
    const parts = [];
    if (item.title) parts.push(item.title);
    if (item.authors) parts.push(item.authors);
    if (item.journal) parts.push(item.journal);
    if (item.abstract) parts.push(item.abstract);
    if (item.year) parts.push(String(item.year));
    if (item.url) parts.push(item.url);
    if (item.raw && typeof item.raw === 'object') {
      for (const v of Object.values(item.raw)) {
        if (v !== null && v !== undefined) {
          parts.push(String(v));
        }
      }
    }
    const hay = parts.join(' ').toLowerCase();
    return hay.includes(needle);
  });
}

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const all = await loadArticles();
    if (!discoveredCSVPath) {
      return res.status(200).json({ articles: [], total: 0, totalPages: 0, currentPage: 1, note: 'No CSV found' });
    }

    const filtered = filterSearch(all, search);
    const total = filtered.length;
    const start = (page - 1) * limit;
    const pageItems = filtered.slice(start, start + limit);

    res.json({
      articles: pageItems,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      csvPath: discoveredCSVPath
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
