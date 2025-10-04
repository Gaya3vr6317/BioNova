const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AdminContent = require('../models/AdminContent');
const Experiment = require('../models/Experiment');

// Sample data for testing
const sampleExperiments = [
    {
        id: 1,
        title: "Plant Habitat-01",
        description: "Study of Arabidopsis thaliana growth in microgravity",
        organism: "Arabidopsis",
        organismCategory: "Plant",
        mission: "ISS",
        year: 2018,
        keyFindings: "Plants exhibited normal growth patterns with slight morphological changes",
        dataLink: "https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=2032",
        principalInvestigator: "Dr. Anna-Lisa Paul",
        duration: 30
    },
    {
        id: 2,
        title: "Rodent Research-1",
        description: "Effects of microgravity on mammalian musculoskeletal system",
        organism: "Mouse",
        organismCategory: "Mammal",
        mission: "ISS",
        year: 2014,
        keyFindings: "Significant bone density loss and muscle atrophy observed",
        dataLink: "https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=2",
        principalInvestigator: "Dr. Michael Roberts",
        duration: 45
    },
    {
        id: 3,
        title: "Microbial Tracking-1",
        description: "Monitoring microbial changes in the ISS environment",
        organism: "Microbes",
        organismCategory: "Microbe",
        mission: "ISS",
        year: 2016,
        keyFindings: "Microbial diversity remains stable with some species showing adaptation",
        dataLink: "https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=1665",
        principalInvestigator: "Dr. Kasthuri Venkateswaran",
        duration: 180
    }
];

// Get all experiments
router.get('/', async (req, res) => {
    try {
        const { organism, category, yearFrom, yearTo, keyword } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        
        let query = {};
        
        if (organism && organism !== 'all') query.organism = organism;
        if (category && category !== 'all') query.organismCategory = category;
        if (yearFrom || yearTo) {
            query.year = {};
            if (yearFrom) query.year.$gte = parseInt(yearFrom, 10);
            if (yearTo) query.year.$lte = parseInt(yearTo, 10);
        }
        if (keyword) {
            query.$text = { $search: keyword };
        }

        const isDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

        let experiments = [];
        let total = 0;
        let adminContent = null;

        if (isDBConnected) {
            experiments = await Experiment.find(query)
                .sort({ year: -1 })
                .limit(limit)
                .skip((page - 1) * limit);

            total = await Experiment.countDocuments(query);

            if (keyword) {
                adminContent = await AdminContent.findOne({
                    keyword: keyword.toLowerCase(),
                    isActive: true
                });
            }
        } else {
            // Fallback to in-memory sample data when DB is not available
            const matchesQuery = (exp) => {
                if (query.organism && exp.organism !== query.organism) return false;
                if (query.organismCategory && exp.organismCategory !== query.organismCategory) return false;
                if (query.year) {
                    if (query.year.$gte && exp.year < query.year.$gte) return false;
                    if (query.year.$lte && exp.year > query.year.$lte) return false;
                }
                if (keyword) {
                    const hay = `${exp.title} ${exp.description} ${exp.keyFindings} ${exp.organism} ${exp.organismCategory} ${exp.mission}`.toLowerCase();
                    if (!hay.includes(keyword.toLowerCase())) return false;
                }
                return true;
            };

            const filtered = sampleExperiments.filter(matchesQuery).sort((a, b) => b.year - a.year);
            total = filtered.length;
            const start = (page - 1) * limit;
            experiments = filtered.slice(start, start + limit);
        }

        res.json({
            experiments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            adminContent: adminContent || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        const isDBConnected = mongoose.connection && mongoose.connection.readyState === 1;

        if (isDBConnected) {
            const [byCategory, byYear, byOrganism] = await Promise.all([
                Experiment.aggregate([{ $group: { _id: '$organismCategory', count: { $sum: 1 } } }]),
                Experiment.aggregate([
                    { $group: { _id: '$year', count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]),
                Experiment.aggregate([{ $group: { _id: '$organism', count: { $sum: 1 } } }])
            ]);

            return res.json({ byCategory, byYear, byOrganism });
        }

        // Fallback sample stats when DB is not available
        const stats = {
            byCategory: [
                { _id: 'Plant', count: 1 },
                { _id: 'Mammal', count: 1 },
                { _id: 'Microbe', count: 1 }
            ],
            byYear: [
                { _id: 2014, count: 1 },
                { _id: 2016, count: 1 },
                { _id: 2018, count: 1 }
            ],
            byOrganism: [
                { _id: 'Arabidopsis', count: 1 },
                { _id: 'Mouse', count: 1 },
                { _id: 'Microbes', count: 1 }
            ]
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;