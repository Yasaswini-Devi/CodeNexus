import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

const LANG_ICONS = { javascript: '⚡', python: '🐍', html: '🌐', ide: '📁' };
const LANG_LABELS = { javascript: 'JavaScript', python: 'Python', html: 'HTML/CSS', ide: 'IDE Folder' };
const LANG_ROUTES = { javascript: '/javascript', python: '/python', html: '/html', ide: '/ide' };

const API = 'http://localhost:5001/api/projects';

export default function Dashboard() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    const fetchProjects = useCallback(async () => {
        if (!token) {
            setLoading(false);
            toast.error('Session expired — please sign in again');
            return;
        }
        try {
            const res = await fetch(`${API}?t=${Date.now()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                cache: 'no-store'
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Could not load projects');
                setProjects([]);
                return;
            }
            setProjects(data.projects || []);
        } catch {
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { if (token !== null) fetchProjects(); else setLoading(false); }, [fetchProjects, token]);

    const handleOpen = (project) => {
        if (project.language === 'ide') {
            sessionStorage.setItem('cn_load_ide_project', JSON.stringify({
                id: project._id,
                title: project.title,
            }));
            navigate('/ide');
            return;
        }

        // Store code in sessionStorage so the editor can pick it up
        sessionStorage.setItem('cn_load_project', JSON.stringify({
            id: project._id,
            title: project.title,
            language: project.language,
        }));
        navigate(LANG_ROUTES[project.language]);
    };

    const handleDelete = async (project) => {
        if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
        setDeleting(project._id);
        try {
            const res = await fetch(`${API}/${project._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setProjects(prev => prev.filter(p => p._id !== project._id));
            toast.success('Project deleted');
        } catch {
            toast.error('Failed to delete project');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="dashRoot">
            {/* Header */}
            <div className="dashHeader">
                <div>
                    <h1 className="dashTitle">My Projects</h1>
                    <p className="dashSub">
                        {user?.username ? `@${user.username}` : ''} · {projects.length} saved project{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="dashHeaderBtns">
                    <button className="dashNewBtn" onClick={() => navigate('/javascript')}>+ New Project</button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="dashLoading">
                    <div className="dashSpinner" />
                    <p>Loading your projects…</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="dashEmpty">
                    <div className="dashEmptyIcon">📂</div>
                    <h2>No projects yet</h2>
                    <p>Head to an editor and click <strong>💾 Save Project</strong> to get started.</p>
                    <div className="dashEmptyActions">
                        <button onClick={() => navigate('/javascript')} className="dashEmptyBtn">⚡ JavaScript</button>
                        <button onClick={() => navigate('/python')} className="dashEmptyBtn">🐍 Python</button>
                        <button onClick={() => navigate('/html')} className="dashEmptyBtn">🌐 HTML/CSS</button>
                    </div>
                </div>
            ) : (
                <div className="dashGrid">
                    {projects.map(project => (
                        <div className="dashCard" key={project._id} data-lang={project.language}>
                            <div className="dashCardTop">
                                <span className="dashCardLangIcon">{LANG_ICONS[project.language]}</span>
                                <span className={`dashCardLangBadge dashCardLangBadge--${project.language}`}>
                                    {LANG_LABELS[project.language]}
                                </span>
                            </div>
                            <h3 className="dashCardTitle">{project.title}</h3>
                            <p className="dashCardDate">Updated {formatDate(project.updatedAt)}</p>
                            <div className="dashCardActions">
                                <button
                                    className="dashCardOpen"
                                    onClick={() => handleOpen(project)}
                                    id={`open-project-${project._id}`}
                                >
                                    Open →
                                </button>
                                <button
                                    className="dashCardDelete"
                                    onClick={() => handleDelete(project)}
                                    disabled={deleting === project._id}
                                    id={`delete-project-${project._id}`}
                                >
                                    {deleting === project._id ? '…' : '🗑'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
