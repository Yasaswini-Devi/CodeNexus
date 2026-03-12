import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './AuthPage.css';

export default function AuthPage() {
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login, register, user } = useAuth();
    const navigate = useNavigate();

    // Already logged in — go to home
    if (user) return <Navigate to="/" replace />;

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (tab === 'login') {
                await login(form.email, form.password);
                toast.success('Welcome back! 👋');
            } else {
                await register(form.username, form.email, form.password);
                toast.success('Account created! 🎉');
            }
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authBg">
            <div className="authOrb authOrb1" />
            <div className="authOrb authOrb2" />

            <div className="authCard">
                {/* Brand */}
                <div className="authBrand">
                    <span className="authBrandPrimary">Code</span>
                    <span className="authBrandAccent">Nexus</span>
                </div>
                <p className="authTagline">Your code. Your space. Always saved.</p>

                {/* Tabs */}
                <div className="authTabs">
                    <button
                        className={`authTab${tab === 'login' ? ' authTabActive' : ''}`}
                        onClick={() => setTab('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`authTab${tab === 'register' ? ' authTabActive' : ''}`}
                        onClick={() => setTab('register')}
                    >
                        Create Account
                    </button>
                    <div className={`authTabIndicator ${tab === 'register' ? 'authTabIndicatorRight' : ''}`} />
                </div>

                {/* Form */}
                <form className="authForm" onSubmit={handleSubmit} noValidate>
                    {tab === 'register' && (
                        <div className="authField">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="e.g. sneha_dev"
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                                minLength={2}
                            />
                        </div>
                    )}

                    <div className="authField">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="authField">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={tab === 'register' ? 'At least 6 characters' : '••••••••'}
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`authSubmit${loading ? ' authSubmitLoading' : ''}`}
                        disabled={loading}
                        id="authSubmitBtn"
                    >
                        {loading
                            ? 'Please wait…'
                            : tab === 'login'
                                ? 'Sign In →'
                                : 'Create Account →'}
                    </button>
                </form>

                <p className="authSwitch">
                    {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        className="authSwitchLink"
                        type="button"
                        onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                    >
                        {tab === 'login' ? 'Create one' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
}
