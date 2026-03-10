/**
 * useSaveProject – hook to save/update a project via the API.
 * Used by all three editors (Javascript, Python, Html).
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const API = 'http://localhost:5001/api/projects';

export function useSaveProject({ code, language }) {
    const { user, token } = useAuth();
    const [saving, setSaving] = useState(false);
    const [projectId, setProjectId] = useState(null);
    const defaultTitle = `${language[0].toUpperCase() + language.slice(1)} Project – ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
    const [projectTitle, setProjectTitle] = useState(defaultTitle);

    // Check if we were asked to load a project from the Dashboard
    useEffect(() => {
        const raw = sessionStorage.getItem('cn_load_project');
        if (!raw) return;
        try {
            const meta = JSON.parse(raw);
            if (meta.language === language) {
                setProjectId(meta.id);
                setProjectTitle(meta.title);
                sessionStorage.removeItem('cn_load_project');
            }
        } catch { /* ignore */ }
    }, [language]);

    const saveProject = async (currentCode) => {
        if (!user || !token) {
            toast.error('Sign in to save projects');
            return;
        }
        if (!currentCode || !currentCode.trim()) {
            toast.error('Nothing to save — editor is empty');
            return;
        }
        const title = projectTitle.trim() || defaultTitle;

        setSaving(true);
        try {
            let res, data;

            if (projectId) {
                // Update existing project
                res = await fetch(`${API}/${projectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ title, code: currentCode }),
                });
                data = await res.json();
            } else {
                // Create new project
                res = await fetch(API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ title, language, code: currentCode }),
                });
                data = await res.json();
                if (res.ok && data.project) {
                    setProjectId(data.project._id);
                    setProjectTitle(data.project.title);
                }
            }

            if (!res.ok) {
                throw new Error(data?.error || `Server error ${res.status}`);
            }

            toast.success('Project saved! 💾');
        } catch (err) {
            toast.error(err.message || 'Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    // Load code from server when a project is opened from Dashboard
    const [loadedCode, setLoadedCode] = useState(null);
    useEffect(() => {
        if (!projectId || !token) return;
        fetch(`${API}/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.project) {
                    setLoadedCode(data.project.code);
                    setProjectTitle(data.project.title);
                }
            })
            .catch(() => { });
    }, [projectId, token]);

    return { saveProject, saving, loadedCode, projectTitle, setProjectTitle };
}
