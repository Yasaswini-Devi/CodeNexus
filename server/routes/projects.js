const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// All project routes require authentication
router.use(authMiddleware);

// GET /api/projects  – list current user's projects
router.get('/', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        console.log('GET /api/projects — user id:', req.user.id);
        const projects = await Project.find({ owner: req.user.id })
            .sort({ updatedAt: -1 })
            .select('title language updatedAt createdAt');
        console.log('  found', projects.length, 'project(s)');
        res.json({ projects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/projects  – create a new project
router.post('/', async (req, res) => {
    try {
        const { title, language, code, tree, activeFileId } = req.body;
        if (!language) return res.status(400).json({ error: 'Language is required' });
        console.log('POST /api/projects — user id:', req.user.id, '| lang:', language, '| title:', title);

        const project = await Project.create({
            owner: req.user.id,
            title: title || 'Untitled Project',
            language,
            code: code || '',
            tree: Array.isArray(tree) ? tree : [],
            activeFileId: activeFileId || null,
        });
        console.log('  created project _id:', project._id);

        res.status(201).json({ project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/projects/:id  – fetch a single project's full code
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json({ project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/projects/:id  – update title or code
router.put('/:id', async (req, res) => {
    try {
        const { title, code, tree, activeFileId, language } = req.body;
        const update = {
            ...(title !== undefined && { title }),
            ...(code !== undefined && { code }),
            ...(tree !== undefined && { tree }),
            ...(activeFileId !== undefined && { activeFileId }),
            ...(language !== undefined && { language }),
        };

        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            update,
            { returnDocument: 'after' }
        );
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json({ project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
