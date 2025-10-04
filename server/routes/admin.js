const express = require('express');
const mongoose = require('mongoose');
const AdminContent = require('../models/AdminContent');
const { buffers, isDBConnected } = require('../config/offlineSync');
const router = express.Router();

// In-memory fallback store when MongoDB is not available
const inMemoryAdminContents = [];

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Get all admin content
router.get('/content', requireAdmin, async (req, res) => {
    try {
        const dbUp = isDBConnected();

        if (dbUp) {
            const contents = await AdminContent.find().sort({ createdAt: -1 });
            return res.json(contents);
        }

        // Fallback: return in-memory contents
        const contents = [...inMemoryAdminContents].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new admin content
router.post('/content', requireAdmin, async (req, res) => {
    try {
        const { keyword, title, content, category } = req.body;
        const dbUp = isDBConnected();

        if (dbUp) {
            // DB-backed flow
            const existingContent = await AdminContent.findOne({ 
                keyword: keyword.toLowerCase() 
            });
            
            if (existingContent) {
                return res.status(400).json({ error: 'Keyword already exists' });
            }

            const newContent = new AdminContent({
                keyword: keyword.toLowerCase(),
                title,
                content,
                category: category || 'general',
                createdBy: req.session.user.username
            });

            await newContent.save();
            return res.json({ success: true, content: newContent });
        }

        // Fallback: in-memory flow
        const key = (keyword || '').toLowerCase();
        const exists = inMemoryAdminContents.find(c => c.keyword === key);
        if (exists) {
            return res.status(400).json({ error: 'Keyword already exists' });
        }

        const newContent = {
            _id: String(Date.now()),
            keyword: key,
            title,
            content,
            category: category || 'general',
            createdBy: req.session.user.username,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        inMemoryAdminContents.push(newContent);
        buffers.adminContent.push({ op: 'create', payload: {
            keyword: newContent.keyword,
            title: newContent.title,
            content: newContent.content,
            category: newContent.category,
            createdBy: newContent.createdBy,
            isActive: newContent.isActive,
            createdAt: new Date(),
            updatedAt: new Date()
        }});
        res.json({ success: true, content: newContent });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update admin content
router.put('/content/:id', requireAdmin, async (req, res) => {
    try {
        const { title, content, category, isActive } = req.body;
        const dbUp = isDBConnected();
        
        if (dbUp) {
            const updatedContent = await AdminContent.findByIdAndUpdate(
                req.params.id,
                {
                    title,
                    content,
                    category,
                    isActive,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updatedContent) {
                return res.status(404).json({ error: 'Content not found' });
            }

            return res.json({ success: true, content: updatedContent });
        }

        // Fallback: in-memory update
        const idx = inMemoryAdminContents.findIndex(c => c._id === req.params.id);
        if (idx === -1) {
            return res.status(404).json({ error: 'Content not found' });
        }
        const updated = {
            ...inMemoryAdminContents[idx],
            title,
            content,
            category,
            isActive: isActive === 'true' || isActive === true,
            updatedAt: new Date().toISOString()
        };
        inMemoryAdminContents[idx] = updated;
        buffers.adminContent.push({ op: 'update', id: req.params.id, payload: {
            title: updated.title,
            content: updated.content,
            category: updated.category,
            isActive: updated.isActive,
            updatedAt: new Date()
        }});
        res.json({ success: true, content: updated });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete admin content
router.delete('/content/:id', requireAdmin, async (req, res) => {
    try {
        const dbUp = isDBConnected();

        if (dbUp) {
            const deletedContent = await AdminContent.findByIdAndDelete(req.params.id);
            
            if (!deletedContent) {
                return res.status(404).json({ error: 'Content not found' });
            }

            return res.json({ success: true, message: 'Content deleted successfully' });
        }

        // Fallback: in-memory delete
        const idx = inMemoryAdminContents.findIndex(c => c._id === req.params.id);
        if (idx === -1) {
            return res.status(404).json({ error: 'Content not found' });
        }
        inMemoryAdminContents.splice(idx, 1);
        buffers.adminContent.push({ op: 'delete', id: req.params.id });
        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Search admin content (public endpoint)
router.get('/content/search/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        const dbUp = isDBConnected();

        if (dbUp) {
            const content = await AdminContent.findOne({ 
                keyword: keyword.toLowerCase(),
                isActive: true
            });
            return res.json(content);
        }

        // Fallback: in-memory search
        const content = inMemoryAdminContents.find(c => 
            c.keyword === keyword.toLowerCase() && c.isActive
        ) || null;
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;