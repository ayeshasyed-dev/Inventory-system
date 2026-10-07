import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Boxes, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, Play } from 'lucide-react';
import IntroAnimation from '../components/IntroAnimation';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    const hasSeen = sessionStorage.getItem('hasSeenLoginIntro_v2');
    return !hasSeen;
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('hasSeenLoginIntro_v2', 'true');
  };

  const { login, register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          showError('Please enter your full name');
          setLoading(false);
          return;
        }
        await register(name, email, password);
        showSuccess('Account registered successfully! Welcome to CoreInventory.');
      } else {
        await login(email, password);
        showSuccess('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err) {
      showError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 45%), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.15), transparent 45%), #090d16',
      }}
    >
      {/* 3D Intro Animation Overlay */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      {/* Top Floating Watch 3D Logistics Intro Button */}
      <button
        type="button"
        onClick={() => setShowIntro(true)}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#e2e8f0',
          padding: '8px 16px',
          borderRadius: '999px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#60a5fa';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.color = '#e2e8f0';
        }}
      >
        <Play size={14} style={{ color: '#3b82f6', fill: '#3b82f6' }} /> Watch 3D Logistics Intro
      </button>

      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: '1rem',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Boxes size={28} />
          </div>

          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              background: 'linear-gradient(to right, #ffffff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CoreInventory
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {isRegister ? 'Create your administrator account' : 'Sign in to access your inventory portal'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {isRegister && (
            <div>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Switch Register/Login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an admin account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: '4px',
              textDecoration: 'underline',
            }}
          >
            {isRegister ? 'Sign In' : 'Register Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
