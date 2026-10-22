import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, Shield, LayoutDashboard, Radar, Bell, Settings, Search,
  ChevronDown, CircleHelp, Download, RefreshCw, ShieldAlert, Server, Network,
  ArrowUpRight, Check, Clock3, Filter, Menu, X, Zap, Globe, Eye,
  MoreHorizontal, User, Lock, AlertTriangle, FileText, Code, CheckCircle,
  Terminal, Paperclip, ExternalLink, ArrowLeft, Send, Sparkles, UserCheck,
  ShieldCheck, KeyRound, Copy
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

const request = async (path, options = {}) => {
  const token = sessionStorage.getItem('netsentinel_token');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

const colors = { Critical: '#ff5470', High: '#ff9d4d', Medium: '#f6c85f', Low: '#50d7b0', Info: '#7aa8ff' };

function timeAgo(date) {
  if (!date) return 'recently';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  return mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
}

function Badge({ children, severity }) {
  const cls = String(severity || children || '').toLowerCase().replace(/\s+/g, '-');
  return <span className={`badge ${cls}`}>{children}</span>;
}

function Stat({ icon: Icon, label, value, delta, accent, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${accent}`}><Icon size={19} /></span>
        <span className="stat-delta"><ArrowUpRight size={14} />{delta}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// 1. SEPARATE USER LOGIN & REGISTRATION & PASSWORD RESET (/user/login)
// -----------------------------------------------------------------------------
function UserLogin({ onLogin, onNavigate }) {
  const [tab, setTab] = useState('login'); // 'login', 'register', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      if (tab === 'login') {
        const data = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        sessionStorage.setItem('netsentinel_token', data.token);
        onLogin(data.user);
        if (data.user.role === 'admin') {
          onNavigate('/admin/dashboard');
        } else {
          onNavigate('/user/dashboard');
        }
      } else if (tab === 'register') {
        const data = await request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });
        sessionStorage.setItem('netsentinel_token', data.token);
        onLogin(data.user);
        onNavigate('/user/dashboard');
      } else if (tab === 'forgot') {
        if (resetStep === 1) {
          const res = await request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
          });
          setResetToken(res.resetToken || '');
          setSuccess('Reset token generated. Please enter your new password below.');
          setResetStep(2);
        } else {
          const res = await request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token: resetToken, newPassword })
          });
          setSuccess(res.message || 'Password successfully reset! You can now sign in.');
          setTab('login');
          setResetStep(1);
          setPassword('');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-panel user-theme" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-mark" style={{ width: 34, height: 34 }}>
              <Shield size={20} />
            </div>
            <div>
              <b style={{ color: '#fff', fontSize: 16 }}>NetSentinel AI</b>
              <small style={{ display: 'block', color: '#7a91b3', fontSize: 9 }}>USER PORTAL</small>
            </div>
          </div>
          <span className="auth-badge-user"><User size={12} /> User Access</span>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={tab === 'login' ? 'active' : ''}
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'active' : ''}
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
          >
            Create Account
          </button>
          <button
            type="button"
            className={tab === 'forgot' ? 'active' : ''}
            onClick={() => { setTab('forgot'); setError(''); setSuccess(''); setResetStep(1); }}
          >
            Forgot Password
          </button>
        </div>

        {tab === 'login' && (
          <>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, color: '#f1f5fd' }}>Welcome back</h2>
              <p style={{ margin: 0, fontSize: 11, color: '#889cb8' }}>Sign in to submit and track your security problem reports</p>
            </div>
            <label>
              Email Address
              <input
                required
                type="email"
                placeholder="name@organization.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
          </>
        )}

        {tab === 'register' && (
          <>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, color: '#f1f5fd' }}>Create user account</h2>
              <p style={{ margin: 0, fontSize: 11, color: '#889cb8' }}>Public registration automatically assigns standard <code>user</code> role</p>
            </div>
            <label>
              Full Name
              <input
                required
                minLength={2}
                maxLength={100}
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </label>
            <label>
              Email Address
              <input
                required
                type="email"
                placeholder="jane@organization.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                minLength={8}
                placeholder="At least 8 chars (letters and numbers)"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <span className="auth-hint">Must contain at least 8 characters with both letters and numbers.</span>
            </label>
          </>
        )}

        {tab === 'forgot' && (
          <>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, color: '#f1f5fd' }}>Reset account password</h2>
              <p style={{ margin: 0, fontSize: 11, color: '#889cb8' }}>Secure cryptographic token verification</p>
            </div>
            {resetStep === 1 ? (
              <label>
                Account Email
                <input
                  required
                  type="email"
                  placeholder="Enter registered email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>
            ) : (
              <>
                <label>
                  Reset Token (Valid for 15 minutes)
                  <input
                    required
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                  />
                </label>
                <label>
                  New Password
                  <input
                    required
                    type="password"
                    minLength={8}
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <span className="auth-hint">Must contain at least 8 characters with letters and numbers.</span>
                </label>
              </>
            )}
          </>
        )}

        {error && <div className="notice-error" role="alert">{error}</div>}
        {success && <div className="notice-success" role="status"><CheckCircle size={15} /> {success}</div>}

        <button className="primary-btn" type="submit" disabled={busy} style={{ width: '100%', padding: '12px' }}>
          {busy ? 'Processing...' : tab === 'login' ? 'Sign In to User Portal' : tab === 'register' ? 'Register Account' : resetStep === 1 ? 'Request Reset Token' : 'Confirm New Password'}
        </button>

        <div className="auth-switch-link">
          Are you a Security Operations Administrator?
          <button type="button" onClick={() => onNavigate('/admin/login')}>
            Access Admin Login →
          </button>
        </div>
      </form>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 2. SEPARATE ADMINISTRATOR LOGIN (/admin/login)
// -----------------------------------------------------------------------------
function AdminLogin({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const data = await request('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      sessionStorage.setItem('netsentinel_token', data.token);
      onLogin(data.user);
      onNavigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-panel admin-theme" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-mark" style={{ width: 34, height: 34, background: 'linear-gradient(140deg, #9333ea, #4f46e5)' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <b style={{ color: '#fff', fontSize: 16 }}>NetSentinel AI</b>
              <small style={{ display: 'block', color: '#c084fc', fontSize: 9 }}>SOC OPERATIONS</small>
            </div>
          </div>
          <span className="auth-badge-admin"><Lock size={12} /> SOC Clearance</span>
        </div>

        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 19, color: '#f3e8ff' }}>Administrator Portal</h2>
          <p style={{ margin: 0, fontSize: 11, color: '#a78bfa' }}>
            Authorized Security Personnel Only — All access attempts are cryptographically audited.
          </p>
        </div>

        <label>
          Administrator Email
          <input
            required
            type="email"
            placeholder="admin@netsentinel.local"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          Master Password
          <input
            required
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="notice-error" role="alert">{error}</div>}

        <button
          className="primary-btn"
          type="submit"
          disabled={busy}
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #7e22ce, #4338ca)', borderColor: '#a855f7' }}
        >
          {busy ? 'Authenticating Clearance...' : 'Authenticate as Administrator'}
        </button>

        <div style={{ background: '#120f21', border: '1px solid #3b2158', borderRadius: 8, padding: 10, fontSize: 10, color: '#c4b5fd', lineHeight: 1.4 }}>
          <b>Security Notice:</b> Administrator accounts are provisioned exclusively via CLI provisioning script (<code>npm run seed:admin</code>) and cannot be registered publicly.
        </div>

        <div className="auth-switch-link">
          Standard employee reporting problem?
          <button type="button" onClick={() => onNavigate('/user/login')}>
            Go to User Login →
          </button>
        </div>
      </form>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 3. USER DASHBOARD (/user/dashboard)
// -----------------------------------------------------------------------------
function UserDashboard({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview', 'Submit', 'MyComplaints'
  const [stats, setStats] = useState({ total: 0, pending: 0, underInvestigation: 0, resolved: 0, recent: [] });
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobile, setMobile] = useState(false);

  // Problem Submission Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other cybersecurity concerns',
    affectedSystem: '',
    errorMessage: '',
    codeSnippet: '',
    attachment: null
  });
  const [guidance, setGuidance] = useState(null);
  const [guidanceBusy, setGuidanceBusy] = useState(false);

  const problemCategories = [
    'Suspicious login attempts',
    'Malware or virus concerns',
    'Unauthorized access',
    'Network problems',
    'Application errors',
    'Website security vulnerabilities',
    'Source-code errors or bugs',
    'Other cybersecurity concerns'
  ];

  const loadData = async () => {
    try {
      const [st, list] = await Promise.all([
        request('/reports/stats'),
        request('/reports')
      ]);
      setStats(st);
      setComplaints(list);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Live Automated Guidance Preview
  const handlePreviewGuidance = async () => {
    if (!form.title && !form.description && !form.codeSnippet && !form.errorMessage) {
      setError('Enter a title, description, error message, or code snippet to analyze.');
      return;
    }
    setGuidanceBusy(true);
    setError('');
    try {
      const res = await request('/reports/guidance', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setGuidance(res);
      if (res.category && problemCategories.includes(res.category)) {
        setForm(prev => ({ ...prev, category: res.category }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGuidanceBusy(false);
    }
  };

  // Handle Attachment Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Attachment exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({
        ...prev,
        attachment: {
          name: file.name,
          mimeType: file.type || 'text/plain',
          size: file.size,
          dataUrl: reader.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Complaint
  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      const res = await request('/reports', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setSuccess(`Complaint #${res.incidentId} submitted successfully! Automated guidance has been generated.`);
      setForm({
        title: '',
        description: '',
        category: 'Other cybersecurity concerns',
        affectedSystem: '',
        errorMessage: '',
        codeSnippet: '',
        attachment: null
      });
      setGuidance(null);
      await loadData();
      setSelectedComplaint(res);
      setActiveTab('MyComplaints');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesStatus = filterStatus === 'All' || c.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesSearch = `${c.incidentId} ${c.title} ${c.category} ${c.affectedSystem}`.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [complaints, filterStatus, searchTerm]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'show' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Shield size={22} /><span /></div>
          <div>
            <b>Net<span>Sentinel</span></b>
            <small>USER INCIDENT PORTAL</small>
          </div>
          <button className="mobile-close icon-btn" onClick={() => setMobile(false)}><X size={18} /></button>
        </div>

        <div className="workspace">
          <div className="workspace-logo" style={{ background: '#1d2e46', color: '#93c5fd' }}>UP</div>
          <div>
            <b>Employee Self-Service</b>
            <small>Cybersecurity & Bug Reports</small>
          </div>
        </div>

        <div className="nav-caption">WORKSPACE</div>
        <nav>
          <button
            className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Overview'); setMobile(false); setSelectedComplaint(null); }}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'Submit' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Submit'); setMobile(false); setSelectedComplaint(null); }}
          >
            <ShieldAlert size={18} />
            <span>Submit Security Problem</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'MyComplaints' ? 'active' : ''}`}
            onClick={() => { setActiveTab('MyComplaints'); setMobile(false); }}
          >
            <FileText size={18} />
            <span>My Complaints</span>
            <i>{complaints.length}</i>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card" style={{ background: 'linear-gradient(140deg, #13243a, #0e1929)' }}>
            <div className="upgrade-icon" style={{ background: '#1d3554', color: '#93c5fd' }}><Sparkles size={17} /></div>
            <b>Need Urgent Assistance?</b>
            <p>If you suspect active malware or credential theft, disconnect from Wi-Fi immediately.</p>
            <button onClick={() => { setActiveTab('Submit'); setMobile(false); }}>
              Report Incident Now <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="profile">
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              {user.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
          </div>
        </div>
      </aside>

      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn menu-btn" onClick={() => setMobile(true)}><Menu size={19} /></button>
            <div className="breadcrumb">User Portal <span>/</span> <b>{activeTab}</b></div>
          </div>
          <div className="top-actions">
            <button className="primary-btn" onClick={() => { setActiveTab('Submit'); setSelectedComplaint(null); }}>
              <ShieldAlert size={15} /> Report Problem
            </button>
            <span className="top-divider" />
            <button className="secondary-btn" onClick={onLogout}>Log out</button>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="notice-error" role="alert">{error} <button onClick={() => setError('')}>Dismiss</button></div>}
          {success && <div className="notice-success" role="status"><CheckCircle size={15} /> {success}</div>}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow"><span className="live-dot" /> USER SECURITY DASHBOARD</div>
                  <h1>Security Problem Center</h1>
                  <p>Submit cybersecurity concerns, source code errors, and track resolution by security administrators.</p>
                </div>
                <div className="heading-actions">
                  <button className="secondary-btn" onClick={loadData}><RefreshCw size={15} /> Refresh</button>
                  <button className="primary-btn" onClick={() => setActiveTab('Submit')}>
                    <Send size={15} /> Report New Issue
                  </button>
                </div>
              </div>

              <section className="stats-grid">
                <Stat icon={FileText} label="Total Complaints" value={stats.total} delta="All time" accent="blue" sub="Submitted problems" />
                <Stat icon={Clock3} label="Pending Review" value={stats.pending} delta="Open" accent="orange" sub="Awaiting administrator review" />
                <Stat icon={Eye} label="Under Investigation" value={stats.underInvestigation} delta="In Progress" accent="blue" sub="Being examined by SOC" />
                <Stat icon={CheckCircle} label="Resolved Problems" value={stats.resolved} delta="Fixed" accent="green" sub="Completed with remediation" />
              </section>

              <div className="panel management-panel" style={{ marginTop: 20 }}>
                <div className="panel-head">
                  <div>
                    <h2>Recent Complaint Activity</h2>
                    <p>Track updates and findings on your recent submissions</p>
                  </div>
                  <button className="secondary-btn" onClick={() => setActiveTab('MyComplaints')}>
                    View All Complaints ({complaints.length})
                  </button>
                </div>

                {!stats.recent?.length ? (
                  <div className="empty-state">
                    <FileText size={32} />
                    <b>No complaints submitted yet</b>
                    <span>Have you noticed a suspicious login, virus concern, or code bug? Report it now.</span>
                    <button className="primary-btn" style={{ marginTop: 10 }} onClick={() => setActiveTab('Submit')}>
                      Submit Security Problem
                    </button>
                  </div>
                ) : (
                  <div className="table-wrap" style={{ marginTop: 15 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>COMPLAINT ID</th>
                          <th>PROBLEM TITLE</th>
                          <th>CATEGORY</th>
                          <th>SEVERITY</th>
                          <th>STATUS</th>
                          <th>SUBMITTED</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent.map(r => (
                          <tr key={r._id || r.incidentId}>
                            <td><code>{r.incidentId}</code></td>
                            <td><b>{r.title}</b></td>
                            <td>{r.category}</td>
                            <td><Badge severity={r.severity}>{r.severity}</Badge></td>
                            <td><Badge severity={r.status}>{r.status}</Badge></td>
                            <td>{timeAgo(r.createdAt)}</td>
                            <td>
                              <button
                                className="secondary-btn"
                                style={{ padding: '5px 10px' }}
                                onClick={() => {
                                  const match = complaints.find(c => c.incidentId === r.incidentId);
                                  setSelectedComplaint(match || r);
                                  setActiveTab('MyComplaints');
                                }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: SUBMIT SECURITY PROBLEM */}
          {activeTab === 'Submit' && (
            <div className="panel management-panel">
              <div className="panel-head">
                <div>
                  <h2>Submit a Security Problem or Code Issue</h2>
                  <p>Report security anomalies, malware warnings, unauthorized access, or source code bugs</p>
                </div>
              </div>

              <form className="report-form" onSubmit={handleSubmitProblem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <label>
                    Problem Title *
                    <input
                      required
                      minLength={3}
                      maxLength={200}
                      placeholder="e.g. Unauthorized login attempt from foreign IP / React null pointer bug"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                    />
                  </label>

                  <label>
                    Problem Category *
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                    >
                      {problemCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 15 }}>
                  <label>
                    Affected Application, System, or Workstation
                    <input
                      placeholder="e.g. Production Billing API, User Authentication Service, Laptop #42"
                      value={form.affectedSystem}
                      onChange={e => setForm({ ...form, affectedSystem: e.target.value })}
                    />
                  </label>

                  <label>
                    Detailed Problem Description *
                    <textarea
                      required
                      rows={4}
                      minLength={5}
                      maxLength={10000}
                      placeholder="Describe what happened, any symptoms observed, steps to reproduce, or unexpected behavior in detail..."
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <label>
                    Optional Error Message / Stack Trace
                    <textarea
                      rows={4}
                      className="code-editor-textarea"
                      placeholder="Paste terminal error logs, HTTP 500 responses, or stack traces here..."
                      value={form.errorMessage}
                      onChange={e => setForm({ ...form, errorMessage: e.target.value })}
                    />
                  </label>

                  <label>
                    Optional Source Code Snippet
                    <textarea
                      rows={4}
                      className="code-editor-textarea"
                      placeholder="// Paste relevant source code (e.g. JavaScript, Python, SQL) where error occurs..."
                      value={form.codeSnippet}
                      onChange={e => setForm({ ...form, codeSnippet: e.target.value })}
                    />
                  </label>
                </div>

                {/* Supporting Attachment Upload with Validation */}
                <label>
                  Supporting Attachment (Optional, max 5MB — images, logs, text, json, code, pdf)
                  <div className="attachment-zone">
                    <input
                      type="file"
                      id="user-file-input"
                      style={{ display: 'none' }}
                      accept=".png,.jpg,.jpeg,.gif,.webp,.txt,.log,.json,.js,.py,.pdf,.md"
                      onChange={handleFileChange}
                    />
                    {!form.attachment ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => document.getElementById('user-file-input').click()}
                        >
                          <Paperclip size={15} /> Attach Supporting File
                        </button>
                        <span style={{ fontSize: 11, color: '#7a8fa9' }}>
                          Allowed: Screenshots (PNG/JPG), Log files (.log), JSON, Code files (.js, .py), PDF
                        </span>
                      </div>
                    ) : (
                      <div className="attachment-preview">
                        <span>
                          <FileText size={16} />
                          <b>{form.attachment.name}</b>
                          <small>({Math.round(form.attachment.size / 1024)} KB · {form.attachment.mimeType})</small>
                        </span>
                        <button
                          type="button"
                          title="Remove attachment"
                          onClick={() => setForm({ ...form, attachment: null })}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </label>

                {/* Automated Problem Guidance Preview */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={guidanceBusy}
                    onClick={handlePreviewGuidance}
                  >
                    <Sparkles size={15} /> {guidanceBusy ? 'Analyzing Problem...' : 'Analyze & Get Automated Guidance'}
                  </button>
                  <small style={{ color: '#7a8fa9', fontSize: 10 }}>
                    Generates initial rule-based diagnostic guidance and safe troubleshooting steps before submission.
                  </small>
                </div>

                {guidance && (
                  <div className="guidance-box">
                    <h3><Sparkles size={16} /> Initial Automated Guidance</h3>
                    <p>
                      <b>Suggested Category:</b> {guidance.category} &nbsp;·&nbsp;
                      <b>Estimated Severity:</b> <Badge severity={guidance.estimatedSeverity}>{guidance.estimatedSeverity}</Badge>
                    </p>
                    <div style={{ margin: '10px 0 6px', fontWeight: 600, fontSize: 11, color: '#93c5fd' }}>Possible Causes:</div>
                    <ul>
                      {guidance.possibleCauses?.map((cause, i) => <li key={i}>{cause}</li>)}
                    </ul>
                    <div style={{ margin: '10px 0 6px', fontWeight: 600, fontSize: 11, color: '#93c5fd' }}>Safe Troubleshooting Steps:</div>
                    <ul>
                      {guidance.troubleshootingSteps?.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                    <small>{guidance.disclaimer}</small>
                  </div>
                )}

                <div className="btn-group">
                  <button className="primary-btn" type="submit" disabled={busy} style={{ padding: '12px 24px' }}>
                    <Send size={15} /> {busy ? 'Submitting Problem...' : 'Submit Security Problem'}
                  </button>
                  <button type="button" className="secondary-btn" onClick={() => setActiveTab('Overview')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MY COMPLAINTS */}
          {activeTab === 'MyComplaints' && (
            <>
              {selectedComplaint ? (
                /* Complaint Details View */
                <div className="investigation-drawer">
                  <div className="drawer-header">
                    <div>
                      <h2>
                        <FileText size={20} color="#60a5fa" />
                        {selectedComplaint.incidentId}: {selectedComplaint.title}
                      </h2>
                      <p style={{ margin: '6px 0 0', color: '#8fa4c0', fontSize: 11 }}>
                        Submitted {new Date(selectedComplaint.createdAt).toLocaleString()} · Affected System: <b>{selectedComplaint.affectedSystem}</b>
                      </p>
                    </div>
                    <button className="secondary-btn" onClick={() => setSelectedComplaint(null)}>
                      <ArrowLeft size={15} /> Back to My Complaints
                    </button>
                  </div>

                  <div className="complaint-grid">
                    <div className="complaint-field">
                      <label>STATUS</label>
                      <div className="val"><Badge severity={selectedComplaint.status}>{selectedComplaint.status}</Badge></div>
                    </div>
                    <div className="complaint-field">
                      <label>ASSIGNED SEVERITY</label>
                      <div className="val"><Badge severity={selectedComplaint.severity}>{selectedComplaint.severity}</Badge></div>
                    </div>
                    <div className="complaint-field">
                      <label>PROBLEM CATEGORY</label>
                      <div className="val">{selectedComplaint.category}</div>
                    </div>
                    <div className="complaint-field">
                      <label>LEAD INVESTIGATOR</label>
                      <div className="val">{selectedComplaint.assignee || 'Assigned to Security Operations Center'}</div>
                    </div>
                  </div>

                  <div className="complaint-field" style={{ marginBottom: 15 }}>
                    <label>USER PROBLEM DESCRIPTION</label>
                    <div className="val" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selectedComplaint.description}</div>
                  </div>

                  {/* Submitted Error Message */}
                  {selectedComplaint.errorMessage && (
                    <div className="code-viewer-container">
                      <div className="code-viewer-header">
                        <b><Terminal size={14} /> Reported Error Message / Stack Trace</b>
                      </div>
                      <pre className="code-block">{selectedComplaint.errorMessage}</pre>
                    </div>
                  )}

                  {/* Submitted Code Snippet */}
                  {selectedComplaint.codeSnippet && (
                    <div className="code-viewer-container">
                      <div className="code-viewer-header">
                        <b><Code size={14} /> Submitted Source Code</b>
                      </div>
                      <pre className="code-block">{selectedComplaint.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Attachment Preview if present */}
                  {selectedComplaint.attachment && selectedComplaint.attachment.dataUrl && (
                    <div className="complaint-field" style={{ marginBottom: 15 }}>
                      <label>SUPPORTING ATTACHMENT</label>
                      <div style={{ marginTop: 8 }}>
                        {selectedComplaint.attachment.mimeType?.startsWith('image/') ? (
                          <div>
                            <img
                              src={selectedComplaint.attachment.dataUrl}
                              alt="Attachment preview"
                              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #283e5a' }}
                            />
                            <div style={{ marginTop: 4, fontSize: 10, color: '#8fa4c0' }}>
                              {selectedComplaint.attachment.name} ({Math.round((selectedComplaint.attachment.size || 0) / 1024)} KB)
                            </div>
                          </div>
                        ) : (
                          <a
                            href={selectedComplaint.attachment.dataUrl}
                            download={selectedComplaint.attachment.name}
                            className="secondary-btn"
                            style={{ width: 'fit-content' }}
                          >
                            <Download size={15} /> Download {selectedComplaint.attachment.name}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Automated Guidance received on submission */}
                  {selectedComplaint.automatedGuidance && selectedComplaint.automatedGuidance.disclaimer && (
                    <div className="guidance-box" style={{ margin: '15px 0' }}>
                      <h3><Sparkles size={16} /> Automated Guidance (Generated on Submission)</h3>
                      <p>
                        <b>Suggested Category:</b> {selectedComplaint.automatedGuidance.category} &nbsp;·&nbsp;
                        <b>Estimated Severity:</b> <Badge severity={selectedComplaint.automatedGuidance.estimatedSeverity}>{selectedComplaint.automatedGuidance.estimatedSeverity}</Badge>
                      </p>
                      <div style={{ margin: '10px 0 6px', fontWeight: 600, fontSize: 11, color: '#93c5fd' }}>Possible Causes:</div>
                      <ul>
                        {selectedComplaint.automatedGuidance.possibleCauses?.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                      <div style={{ margin: '10px 0 6px', fontWeight: 600, fontSize: 11, color: '#93c5fd' }}>Safe Troubleshooting Steps:</div>
                      <ul>
                        {selectedComplaint.automatedGuidance.troubleshootingSteps?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                      <small>{selectedComplaint.automatedGuidance.disclaimer}</small>
                    </div>
                  )}

                  {/* Administrator Investigation Findings & Suggested Fix */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #23354c' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#86efac', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShieldCheck size={18} /> Administrator Investigation & Resolution Notes
                    </h3>

                    <div className="complaint-grid">
                      <div className="complaint-field">
                        <label>INVESTIGATION FINDINGS</label>
                        <div className="val">{selectedComplaint.investigationFindings || 'Investigation in progress by SOC analysts.'}</div>
                      </div>
                      <div className="complaint-field">
                        <label>IDENTIFIED ROOT CAUSE</label>
                        <div className="val">{selectedComplaint.suspectedCause || 'Under technical evaluation.'}</div>
                      </div>
                    </div>

                    <div className="complaint-field" style={{ marginBottom: 15 }}>
                      <label>REMEDIATION STEPS</label>
                      <div className="val">{selectedComplaint.remediation || 'Remediation guidelines will be published upon conclusion of review.'}</div>
                    </div>

                    <div className="complaint-field" style={{ marginBottom: 15 }}>
                      <label>RESOLUTION NOTES</label>
                      <div className="val">{selectedComplaint.resolutionNotes || 'No closing resolution notes yet.'}</div>
                    </div>

                    {/* Suggested Code Correction (if provided by admin) */}
                    {selectedComplaint.codeCorrection && selectedComplaint.codeCorrection.correctedCode && (
                      <div style={{ marginTop: 15 }}>
                        <div className="notice-success">
                          <CheckCircle size={17} />
                          <b>Administrator Code Correction Published:</b>
                          <span>Status: <b>{selectedComplaint.codeCorrection.verificationStatus || 'Verified & Tested'}</b></span>
                        </div>

                        <div className="code-viewer-container">
                          <div className="code-viewer-header">
                            <b><Code size={14} color="#86efac" /> Suggested Corrected Code</b>
                            <span className="badge resolved">{selectedComplaint.codeCorrection.verificationStatus}</span>
                          </div>
                          <pre className="code-block diff-fixed">{selectedComplaint.codeCorrection.correctedCode}</pre>
                        </div>

                        {selectedComplaint.codeCorrection.explanation && (
                          <div className="complaint-field" style={{ marginTop: 10 }}>
                            <label>HOW THE FIX WORKS & WHAT WAS WRONG</label>
                            <div className="val">{selectedComplaint.codeCorrection.explanation}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Investigation Activity Updates Log */}
                  <div style={{ marginTop: 25 }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: 13, color: '#e2ecf9' }}>Activity Updates & Audit History</h3>
                    <div className="updates-timeline">
                      {selectedComplaint.updates?.map((u, i) => (
                        <div key={i} className={`timeline-item ${u.role === 'admin' ? 'admin-note' : ''}`}>
                          <div className="timeline-header">
                            <b>{u.author} {u.role === 'admin' ? '(Administrator)' : '(User)'}</b>
                            <span>{new Date(u.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="timeline-body">{u.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <button className="secondary-btn" onClick={() => setSelectedComplaint(null)}>
                      Close Details
                    </button>
                  </div>
                </div>
              ) : (
                /* Complaints Table List */
                <div className="panel management-panel">
                  <div className="panel-head">
                    <div>
                      <h2>My Submitted Complaints <span className="count-pill">{filteredComplaints.length}</span></h2>
                      <p>View all security problems and bug reports submitted under your account</p>
                    </div>
                    <button className="primary-btn" onClick={() => setActiveTab('Submit')}>
                      <Send size={15} /> Submit New Problem
                    </button>
                  </div>

                  <div className="filters" style={{ margin: '15px 0' }}>
                    <div className="filter-label"><Filter size={15} /> Filter Status:</div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="All">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <div className="searchbox" style={{ width: 250, marginLeft: 15 }}>
                      <Search size={16} />
                      <input
                        placeholder="Search ID, title, system..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <button className="secondary-btn" style={{ marginLeft: 'auto' }} onClick={loadData}>
                      <RefreshCw size={14} /> Refresh
                    </button>
                  </div>

                  {!filteredComplaints.length ? (
                    <div className="empty-state">
                      <FileText size={32} />
                      <b>No complaints match your criteria</b>
                      <span>Try adjusting your search query or status filter.</span>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>COMPLAINT ID</th>
                            <th>PROBLEM TITLE</th>
                            <th>CATEGORY</th>
                            <th>AFFECTED SYSTEM</th>
                            <th>SEVERITY</th>
                            <th>STATUS</th>
                            <th>SUBMITTED</th>
                            <th>ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComplaints.map(c => (
                            <tr key={c._id}>
                              <td><code>{c.incidentId}</code></td>
                              <td><b>{c.title}</b></td>
                              <td>{c.category}</td>
                              <td>{c.affectedSystem}</td>
                              <td><Badge severity={c.severity}>{c.severity}</Badge></td>
                              <td><Badge severity={c.status}>{c.status}</Badge></td>
                              <td>{timeAgo(c.createdAt)}</td>
                              <td>
                                <button
                                  className="secondary-btn"
                                  style={{ padding: '6px 12px' }}
                                  onClick={() => setSelectedComplaint(c)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <footer>
            <span>© 2026 NetSentinel Security Platform — User Portal</span>
            <span><span className="green-dot" /> Live System Active <span className="footer-divider" /> <CircleHelp size={14} /> Support Center</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 4. ADMINISTRATOR DASHBOARD (/admin/dashboard)
//    PRESERVES EXISTING NETSENTINEL AI MONITORING INTERFACE & ADDS COMPLAINTS
// -----------------------------------------------------------------------------
function AdminDashboard({ user, onLogout }) {
  const [active, setActive] = useState('Overview');
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [severity, setSeverity] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [error, setError] = useState('');

  // Complaint Management State in Admin View
  const [adminOverview, setAdminOverview] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [compFilterStatus, setCompFilterStatus] = useState('All');
  const [compFilterSeverity, setCompFilterSeverity] = useState('All');
  const [compSearch, setCompSearch] = useState('');
  const [investigationForm, setInvestigationForm] = useState({
    status: 'Open',
    severity: 'Medium',
    assignee: '',
    investigationFindings: '',
    suspectedCause: '',
    remediation: '',
    resolutionNotes: '',
    note: '',
    codeCorrection: {
      originalCode: '',
      reportedError: '',
      suspectedCause: '',
      correctedCode: '',
      explanation: '',
      verificationStatus: 'Verified & Tested'
    }
  });
  const [busySave, setBusySave] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Audit Logs & Simulation state
  const [auditLogs, setAuditLogs] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [e, s, ov, reps, aud] = await Promise.all([
        request('/events'),
        request('/dashboard'),
        request('/admin/overview'),
        request('/reports'),
        request('/admin/audit')
      ]);
      setEvents(e);
      setSummary(s);
      setAdminOverview(ov);
      setComplaints(reps);
      setAuditLogs(aud);
      setConnected(true);
    } catch (e) {
      setError(e.message);
      setConnected(false);
    }
    setLastSync(new Date());
  };

  useEffect(() => {
    loadDashboardData();
    const t = setInterval(loadDashboardData, 20000);
    return () => clearInterval(t);
  }, []);

  const visibleEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSev = severity === 'All' || e.severity === severity;
      const matchesCat = category === 'All' || e.category === category;
      const matchesSearch = `${e.title} ${e.sourceIp} ${e.category} ${e.destination}`.toLowerCase().includes(search.toLowerCase());
      return matchesSev && matchesCat && matchesSearch;
    });
  }, [events, severity, category, search]);

  const ackEvent = async (id) => {
    try {
      await request(`/events/${id}/acknowledge`, { method: 'POST' });
      await loadDashboardData();
    } catch (e) {
      setError(e.message);
    }
  };

  // Select Complaint for Investigation
  const openComplaintInvestigation = (comp) => {
    setSelectedComplaint(comp);
    setSaveSuccess('');
    setInvestigationForm({
      status: comp.status === 'Under investigation' ? 'Under Investigation' : comp.status,
      severity: comp.severity || 'Medium',
      assignee: comp.assignee || user.name,
      investigationFindings: comp.investigationFindings || '',
      suspectedCause: comp.suspectedCause || '',
      remediation: comp.remediation || '',
      resolutionNotes: comp.resolutionNotes || '',
      note: '',
      codeCorrection: {
        originalCode: comp.codeCorrection?.originalCode || comp.codeSnippet || '',
        reportedError: comp.codeCorrection?.reportedError || comp.errorMessage || '',
        suspectedCause: comp.codeCorrection?.suspectedCause || comp.suspectedCause || '',
        correctedCode: comp.codeCorrection?.correctedCode || '',
        explanation: comp.codeCorrection?.explanation || '',
        verificationStatus: comp.codeCorrection?.verificationStatus || 'Verified & Tested'
      }
    });
  };

  // Save Investigation Findings & Resolution Notes
  const handleSaveInvestigation = async () => {
    if (!selectedComplaint) return;
    setBusySave(true);
    setSaveSuccess('');
    setError('');

    try {
      const updated = await request(`/reports/${selectedComplaint._id}`, {
        method: 'PATCH',
        body: JSON.stringify(investigationForm)
      });
      setSelectedComplaint(updated);
      setSaveSuccess(`Complaint #${updated.incidentId} successfully updated with investigation findings.`);
      await loadDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusySave(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesStatus = compFilterStatus === 'All' || c.status.toLowerCase() === compFilterStatus.toLowerCase();
      const matchesSev = compFilterSeverity === 'All' || c.severity === compFilterSeverity;
      const matchesSearch = `${c.incidentId} ${c.title} ${c.reporterName} ${c.category}`.toLowerCase().includes(compSearch.toLowerCase());
      return matchesStatus && matchesSev && matchesSearch;
    });
  }, [complaints, compFilterStatus, compFilterSeverity, compSearch]);

  const timeline = summary?.timeline || [];
  const categories = summary?.categories || [];
  const total = summary?.total ?? events.length;
  const critical = summary?.critical ?? events.filter(e => e.severity === 'Critical' && e.status !== 'Acknowledged').length;
  const high = summary?.high ?? events.filter(e => e.severity === 'High' && e.status !== 'Acknowledged').length;

  const pendingComplaintsCount = complaints.filter(c => c.status === 'Open' || c.status === 'New').length;

  // Existing Main NetSentinel Navigation
  const nav = [
    ['Overview', LayoutDashboard],
    ['Threat activity', Radar],
    ['Endpoints', Server],
    ['Network map', Network],
    ['Alerts', Bell],
    ['Complaint Management', FileText],
    ['Audit logs', Eye],
    ['Simulation', Zap]
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'show' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Shield size={22} /><span /></div>
          <div>
            <b>Net<span>Sentinel</span></b>
            <small>SECURITY OPERATIONS CENTER</small>
          </div>
          <button className="mobile-close icon-btn" onClick={() => setMobile(false)}><X size={18} /></button>
        </div>

        <div className="workspace">
          <div className="workspace-logo">AC</div>
          <div>
            <b>Acme Corporation</b>
            <small>Enterprise SOC Workspace</small>
          </div>
          <ChevronDown size={15} />
        </div>

        <div className="nav-caption">SOC WORKSPACE</div>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              className={`nav-item ${active === name ? 'active' : ''}`}
              onClick={() => { setActive(name); setMobile(false); }}
            >
              <Icon size={18} />
              <span>{name}</span>
              {name === 'Alerts' && <i>{critical + high}</i>}
              {name === 'Complaint Management' && pendingComplaintsCount > 0 && (
                <i style={{ background: '#78350f', color: '#fde68a' }}>{pendingComplaintsCount}</i>
              )}
            </button>
          ))}
        </nav>

        <div className="nav-caption tools-caption">ADMINISTRATION</div>
        <button className="nav-item" onClick={() => setActive('Simulation')}>
          <Zap size={18} /><span>Telemetry Simulation</span>
        </button>
        <button className="nav-item" onClick={() => setActive('Audit logs')}>
          <Eye size={18} /><span>Security Audit Trail</span>
        </button>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><ShieldAlert size={17} /></div>
            <b>SOC Posture: Active</b>
            <p>128 simulated endpoints actively feeding intrusion detection telemetry.</p>
            <button onClick={() => setActive('Complaint Management')}>
              Review Complaints ({complaints.length}) <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="profile">
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
              {user.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <b>{user.name}</b>
              <small>Administrator</small>
            </div>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn menu-btn" onClick={() => setMobile(true)}><Menu size={19} /></button>
            <div className="breadcrumb">SOC Administration <span>/</span> <b>{active}</b></div>
          </div>
          <div className="top-actions">
            <div className="searchbox">
              <Search size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, IPs, complaints..." />
              <kbd>⌘ K</kbd>
            </div>
            <span className="top-divider" />
            <button className="icon-btn notification" onClick={() => setNotice(!notice)}>
              <Bell size={19} /><i />
            </button>
            {notice && (
              <div className="notification-pop">
                <b>SOC Notifications</b>
                <p><span className="dot red" /> {critical} critical events open</p>
                <p><span className="dot amber" /> {high} high severity alerts pending</p>
                <p><span className="dot red" /> {pendingComplaintsCount} user complaints awaiting review</p>
              </div>
            )}
            <button className="secondary-btn" onClick={onLogout}>Log out</button>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="notice-error" role="alert">{error} <button onClick={() => setError('')}>Dismiss</button></div>}

          {/* VIEW: COMPLAINT MANAGEMENT (User problem reporting & investigation) */}
          {active === 'Complaint Management' ? (
            <div>
              <div className="page-heading">
                <div>
                  <div className="eyebrow"><span className="live-dot" /> INCIDENT TRIAGE & RESOLUTION</div>
                  <h1>User Complaint Management</h1>
                  <p>Investigate reported cybersecurity problems, analyze code errors, and publish verified remediation fixes.</p>
                </div>
                <div className="heading-actions">
                  <button className="secondary-btn" onClick={loadDashboardData}><RefreshCw size={15} /> Refresh</button>
                  <button className="primary-btn" onClick={() => setActive('Overview')}>Back to Security Monitor</button>
                </div>
              </div>

              {/* Admin Overview Metrics Card Grid */}
              <section className="stats-grid">
                <Stat icon={UserCheck} label="Registered Users" value={adminOverview?.totalUsers ?? '—'} delta="Accounts" accent="blue" sub="Active user population" />
                <Stat icon={FileText} label="Total Complaints" value={adminOverview?.totalComplaints ?? complaints.length} delta="All time" accent="blue" sub="User reported issues" />
                <Stat icon={Clock3} label="Pending Review" value={adminOverview?.pendingComplaints ?? '—'} delta="Open" accent="orange" sub="Requires administrator action" />
                <Stat icon={Eye} label="Under Investigation" value={adminOverview?.underInvestigationComplaints ?? '—'} delta="Active" accent="blue" sub="In forensic evaluation" />
              </section>

              {/* Problem Investigation & Resolution Modal/Panel */}
              {selectedComplaint && (
                <div className="investigation-drawer">
                  <div className="drawer-header">
                    <div>
                      <h2>
                        <ShieldAlert size={22} color="#a855f7" />
                        Investigating {selectedComplaint.incidentId}: {selectedComplaint.title}
                      </h2>
                      <p style={{ margin: '6px 0 0', color: '#9bb2cf', fontSize: 11 }}>
                        Reporter: <b>{selectedComplaint.reporterName}</b> ({selectedComplaint.reporterEmail || 'N/A'}) &nbsp;·&nbsp;
                        Affected System: <b>{selectedComplaint.affectedSystem}</b> &nbsp;·&nbsp;
                        Submitted: {new Date(selectedComplaint.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button className="secondary-btn" onClick={() => setSelectedComplaint(null)}>
                      <X size={16} /> Close Investigation
                    </button>
                  </div>

                  {saveSuccess && <div className="notice-success"><CheckCircle size={15} /> {saveSuccess}</div>}

                  <div className="complaint-field" style={{ marginBottom: 15 }}>
                    <label>USER SUBMITTED PROBLEM DESCRIPTION</label>
                    <div className="val" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selectedComplaint.description}</div>
                  </div>

                  {/* Attachment Preview if uploaded */}
                  {selectedComplaint.attachment && selectedComplaint.attachment.dataUrl && (
                    <div className="complaint-field" style={{ marginBottom: 15 }}>
                      <label>SUBMITTED SUPPORTING ATTACHMENT</label>
                      <div style={{ marginTop: 8 }}>
                        {selectedComplaint.attachment.mimeType?.startsWith('image/') ? (
                          <img
                            src={selectedComplaint.attachment.dataUrl}
                            alt="Attachment preview"
                            style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 8, border: '1px solid #334c6e' }}
                          />
                        ) : (
                          <a
                            href={selectedComplaint.attachment.dataUrl}
                            download={selectedComplaint.attachment.name}
                            className="secondary-btn"
                            style={{ width: 'fit-content' }}
                          >
                            <Download size={15} /> Download {selectedComplaint.attachment.name}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Code Investigation Section */}
                  {(selectedComplaint.codeSnippet || selectedComplaint.errorMessage || selectedComplaint.category === 'Source-code errors or bugs') && (
                    <div style={{ background: '#0e1726', border: '1px solid #283e5c', borderRadius: 10, padding: 18, marginBottom: 20 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Terminal size={17} /> Code Error Detection & Suggested Correction
                      </h3>
                      <p style={{ margin: '0 0 14px', fontSize: 11, color: '#8aa1be' }}>
                        Review user-submitted errors and code. Suggest corrected code with an explanation. <i>(Untrusted code is never executed on the server.)</i>
                      </p>

                      <div className="investigation-form-grid">
                        <div>
                          <div className="code-viewer-header">
                            <b><Terminal size={14} /> Reported Error Message / Stack Trace</b>
                          </div>
                          <pre className="code-block">{selectedComplaint.errorMessage || 'No specific error message provided by user.'}</pre>
                        </div>
                        <div>
                          <div className="code-viewer-header">
                            <b><Code size={14} /> Original Submitted Code</b>
                          </div>
                          <pre className="code-block">{selectedComplaint.codeSnippet || 'No code snippet provided by user.'}</pre>
                        </div>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#7e93af', fontWeight: 700, marginBottom: 5 }}>
                          Suggested Corrected Code (Editable for Administrator)
                        </label>
                        <textarea
                          rows={6}
                          className="code-editor-textarea"
                          placeholder="// Write or edit the verified bug fix / patch here..."
                          value={investigationForm.codeCorrection.correctedCode}
                          onChange={e => setInvestigationForm({
                            ...investigationForm,
                            codeCorrection: { ...investigationForm.codeCorrection, correctedCode: e.target.value }
                          })}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#7e93af', fontWeight: 700, marginBottom: 5 }}>
                            Explanation: What was wrong and how the fix works
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Explain the root cause and why this correction solves the problem..."
                            value={investigationForm.codeCorrection.explanation}
                            onChange={e => setInvestigationForm({
                              ...investigationForm,
                              codeCorrection: { ...investigationForm.codeCorrection, explanation: e.target.value }
                            })}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#7e93af', fontWeight: 700, marginBottom: 5 }}>
                            Testing & Verification Status
                          </label>
                          <select
                            value={investigationForm.codeCorrection.verificationStatus}
                            onChange={e => setInvestigationForm({
                              ...investigationForm,
                              codeCorrection: { ...investigationForm.codeCorrection, verificationStatus: e.target.value }
                            })}
                          >
                            <option value="Verified & Tested">Verified & Tested</option>
                            <option value="Suggested Fix">Suggested Fix</option>
                            <option value="Pending Review">Pending Review</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Investigation Findings & Resolution Form */}
                  <div style={{ background: '#101c2d', border: '1px solid #23354c', borderRadius: 10, padding: 18 }}>
                    <h3 style={{ margin: '0 0 14px', fontSize: 14, color: '#e2ecf9' }}>
                      Remediation & Resolution Controls
                    </h3>

                    <div className="investigation-form-grid">
                      <label>
                        Complaint Status *
                        <select
                          value={investigationForm.status}
                          onChange={e => setInvestigationForm({ ...investigationForm, status: e.target.value })}
                        >
                          <option value="Open">Open</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </label>

                      <label>
                        Assigned Severity Level *
                        <select
                          value={investigationForm.severity}
                          onChange={e => setInvestigationForm({ ...investigationForm, severity: e.target.value })}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </label>
                    </div>

                    <div className="investigation-form-grid">
                      <label>
                        Lead Investigator (Assignee)
                        <input
                          placeholder="Investigator name"
                          value={investigationForm.assignee}
                          onChange={e => setInvestigationForm({ ...investigationForm, assignee: e.target.value })}
                        />
                      </label>

                      <label>
                        Investigation Findings
                        <input
                          placeholder="Key investigative findings..."
                          value={investigationForm.investigationFindings}
                          onChange={e => setInvestigationForm({ ...investigationForm, investigationFindings: e.target.value })}
                        />
                      </label>
                    </div>

                    <div className="investigation-form-grid">
                      <label>
                        Identified Root Cause
                        <textarea
                          rows={3}
                          placeholder="Explain the suspected technical cause..."
                          value={investigationForm.suspectedCause}
                          onChange={e => setInvestigationForm({ ...investigationForm, suspectedCause: e.target.value })}
                        />
                      </label>

                      <label>
                        Remediation Steps
                        <textarea
                          rows={3}
                          placeholder="Recommended remediation steps for the user or operations team..."
                          value={investigationForm.remediation}
                          onChange={e => setInvestigationForm({ ...investigationForm, remediation: e.target.value })}
                        />
                      </label>
                    </div>

                    <label style={{ marginTop: 10 }}>
                      Final Resolution Notes
                      <textarea
                        rows={2}
                        placeholder="Resolution summary published upon problem closure..."
                        value={investigationForm.resolutionNotes}
                        onChange={e => setInvestigationForm({ ...investigationForm, resolutionNotes: e.target.value })}
                      />
                    </label>

                    <label style={{ marginTop: 10 }}>
                      Append Investigation Update Note to History
                      <input
                        placeholder="e.g. Reviewed network packet dump; confirmed patch applied."
                        value={investigationForm.note}
                        onChange={e => setInvestigationForm({ ...investigationForm, note: e.target.value })}
                      />
                    </label>

                    <div className="btn-group" style={{ marginTop: 18 }}>
                      <button
                        className="primary-btn"
                        disabled={busySave}
                        onClick={handleSaveInvestigation}
                        style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                      >
                        <Check size={16} /> {busySave ? 'Saving Investigation...' : 'Save Investigation & Resolution'}
                      </button>
                      <button className="secondary-btn" onClick={() => setSelectedComplaint(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Complaint Update History */}
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: 13, color: '#d3e1f5' }}>Complaint Updates Log</h3>
                    <div className="updates-timeline">
                      {selectedComplaint.updates?.map((u, i) => (
                        <div key={i} className={`timeline-item ${u.role === 'admin' ? 'admin-note' : ''}`}>
                          <div className="timeline-header">
                            <b>{u.author} {u.role === 'admin' ? '(Administrator)' : '(User)'}</b>
                            <span>{new Date(u.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="timeline-body">{u.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Complaint Management Table */}
              <div className="panel management-panel">
                <div className="panel-head">
                  <div>
                    <h2>All User-Submitted Problems <span className="count-pill">{filteredComplaints.length}</span></h2>
                    <p>Select any complaint to inspect submitted errors, record causes, provide code corrections, and update resolution status.</p>
                  </div>
                </div>

                <div className="filters" style={{ margin: '15px 0' }}>
                  <div className="filter-label"><Filter size={15} /> Filters:</div>
                  <select value={compFilterStatus} onChange={e => setCompFilterStatus(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <select value={compFilterSeverity} onChange={e => setCompFilterSeverity(e.target.value)}>
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <div className="searchbox" style={{ width: 250, marginLeft: 10 }}>
                    <Search size={16} />
                    <input
                      placeholder="Search ID, title, user..."
                      value={compSearch}
                      onChange={e => setCompSearch(e.target.value)}
                    />
                  </div>

                  <button className="clear-filters" onClick={() => { setCompFilterStatus('All'); setCompFilterSeverity('All'); setCompSearch(''); }}>
                    Clear
                  </button>
                </div>

                {!filteredComplaints.length ? (
                  <div className="empty-state">
                    <FileText size={32} />
                    <b>No complaints match your criteria</b>
                    <span>Check back when users report incidents or clear your filters.</span>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>COMPLAINT ID</th>
                          <th>USER NAME</th>
                          <th>PROBLEM TITLE</th>
                          <th>CATEGORY</th>
                          <th>SEVERITY</th>
                          <th>STATUS</th>
                          <th>SUBMISSION DATE</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComplaints.map(c => (
                          <tr key={c._id}>
                            <td><code>{c.incidentId}</code></td>
                            <td>
                              <b>{c.reporterName}</b>
                              <div style={{ fontSize: 9, color: '#7a8fa9' }}>{c.reporterEmail || 'User'}</div>
                            </td>
                            <td><div className="event-title">{c.title}</div></td>
                            <td><span style={{ fontSize: 10, color: '#889eb8' }}>{c.category}</span></td>
                            <td><Badge severity={c.severity}>{c.severity}</Badge></td>
                            <td><Badge severity={c.status}>{c.status}</Badge></td>
                            <td><span className="time-text">{timeAgo(c.createdAt)}</span></td>
                            <td>
                              <button
                                className="primary-btn"
                                style={{ padding: '6px 12px', fontSize: 10 }}
                                onClick={() => openComplaintInvestigation(c)}
                              >
                                View Details & Fix
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : active === 'Audit logs' ? (
            /* Administrator Audit Logs */
            <div className="panel management-panel">
              <div className="panel-head">
                <div>
                  <h2>Administrator Security Audit Trail</h2>
                  <p>Immutable log of administrative access, incident mutations, and simulation commands</p>
                </div>
                <button className="secondary-btn" onClick={loadDashboardData}><RefreshCw size={15} /> Refresh</button>
              </div>

              {!auditLogs.length ? (
                <p style={{ color: '#8aa0bc' }}>No audit records registered yet.</p>
              ) : (
                <div className="table-wrap" style={{ marginTop: 15 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>TIMESTAMP</th>
                        <th>ACTOR</th>
                        <th>ACTION</th>
                        <th>TARGET</th>
                        <th>DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(a => (
                        <tr key={a._id}>
                          <td>{new Date(a.createdAt).toLocaleString()}</td>
                          <td><code>{a.actorEmail}</code></td>
                          <td><span className="badge new">{a.action}</span></td>
                          <td><code>{a.targetType}:{a.targetId}</code></td>
                          <td>{a.details || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : active === 'Simulation' ? (
            /* Simulation Controls */
            <div className="panel management-panel">
              <div className="panel-head">
                <div>
                  <h2>Telemetry Monitoring Simulation Engine</h2>
                  <p>All network traffic and detection events are synthetic college demo telemetry.</p>
                </div>
              </div>

              <div style={{ background: '#101d2d', border: '1px solid #23354c', borderRadius: 10, padding: 20, margin: '15px 0' }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: '#e2ecf9' }}>
                  Engine Status: <b>{simulationRunning ? 'Active (Generating Telemetry Every 20s)' : 'Paused'}</b>
                </p>

                <div className="btn-group">
                  <button
                    className="primary-btn"
                    onClick={async () => {
                      try {
                        const res = await request('/demo/control', {
                          method: 'POST',
                          body: JSON.stringify({ running: !simulationRunning })
                        });
                        setSimulationRunning(res.simulationRunning);
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    {simulationRunning ? 'Pause Simulation' : 'Resume Simulation'}
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={async () => {
                      try {
                        await request('/demo/tick', { method: 'POST' });
                        await loadDashboardData();
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    Generate Synthetic Security Event
                  </button>
                </div>
              </div>
            </div>
          ) : active === 'Endpoints' ? (
            /* Endpoints Inventory */
            <div className="panel management-panel">
              <div className="panel-head">
                <div>
                  <h2>Protected Network Endpoints (128 Online)</h2>
                  <p>Host monitoring agents, operating systems, and segment assignments</p>
                </div>
                <button className="secondary-btn" onClick={loadDashboardData}><RefreshCw size={15} /> Refresh</button>
              </div>

              <div className="table-wrap" style={{ marginTop: 15 }}>
                <table>
                  <thead>
                    <tr>
                      <th>HOSTNAME</th>
                      <th>IP ADDRESS</th>
                      <th>OPERATING SYSTEM</th>
                      <th>SEGMENT</th>
                      <th>AGENT STATUS</th>
                      <th>RISK LEVEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { host: 'srv-app-prod-01', ip: '10.0.1.12', os: 'Ubuntu 24.04 LTS', seg: 'App Cluster A', status: 'Online', risk: 'High' },
                      { host: 'db-primary-replica', ip: '10.0.0.8', os: 'Debian 12 Bookworm', seg: 'Core Database', status: 'Online', risk: 'Low' },
                      { host: 'gw-ingress-edge', ip: '192.168.1.1', os: 'FreeBSD / OPNsense', seg: 'Perimeter DMZ', status: 'Online', risk: 'Low' },
                      { host: 'ws-analyst-laptop', ip: '192.168.1.44', os: 'Windows 11 Enterprise', seg: 'Internal Office', status: 'Online', risk: 'Medium' },
                      { host: 'api-gateway-node', ip: '10.0.2.15', os: 'Alpine Linux (K8s)', seg: 'API Cluster', status: 'Online', risk: 'Critical' },
                      { host: 'sensor-probe-south', ip: '10.0.0.21', os: 'Custom Embedded Linux', seg: 'Sensor Grid', status: 'Online', risk: 'Low' }
                    ].map((ep, i) => (
                      <tr key={i}>
                        <td><b>{ep.host}</b></td>
                        <td><code>{ep.ip}</code></td>
                        <td>{ep.os}</td>
                        <td>{ep.seg}</td>
                        <td><Badge severity="acknowledged">{ep.status}</Badge></td>
                        <td><Badge severity={ep.risk}>{ep.risk}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : active === 'Network map' ? (
            /* Network Topology Map */
            <div className="panel management-panel">
              <div className="panel-head">
                <div>
                  <h2>Simulated Network Map & Subnet Segments</h2>
                  <p>Logical visualization of monitored network segments and sensor clusters</p>
                </div>
              </div>

              <div className="topology-grid">
                <div className="topology-node">
                  <div className="topology-node-header"><Globe size={18} /> Ingress Gateway</div>
                  <div className="topology-meta">Perimeter IP: <code>203.0.113.1</code><br />Firewall Filter: Active<br />Inspection: Stateful Packet Inspection</div>
                  <Badge severity="acknowledged">Normal Traffic Flow</Badge>
                </div>
                <div className="topology-node">
                  <div className="topology-node-header"><Server size={18} /> Core DMZ Segment</div>
                  <div className="topology-meta">Subnet: <code>10.0.1.0/24</code><br />Protected Hosts: 32<br />Active Beaconing Watch: On</div>
                  <Badge severity="high">Recent Port Probes</Badge>
                </div>
                <div className="topology-node">
                  <div className="topology-node-header"><Radar size={18} /> Telemetry Sensors</div>
                  <div className="topology-meta">Grid Nodes: 8 Sensors<br />Heartbeat Interval: 5s<br />Packet Capture: Simulated</div>
                  <Badge severity="acknowledged">All Probes Healthy</Badge>
                </div>
                <div className="topology-node">
                  <div className="topology-node-header"><Shield size={18} /> Internal Database VPC</div>
                  <div className="topology-meta">Subnet: <code>10.0.0.0/24</code><br />Encrypted Transit: TLS 1.3<br />Strict ACL Enforced</div>
                  <Badge severity="acknowledged">Encrypted & Isolated</Badge>
                </div>
              </div>
            </div>
          ) : (
            /* PRESERVED MAIN NETSENTINEL SECURITY OVERVIEW & THREAT MONITORING */
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow"><span className="live-dot" /> SIMULATED LIVE DEMO</div>
                  <h1>{active === 'Overview' ? 'Security overview' : active}</h1>
                  <p>Monitor your environment, investigate threats, and stay ahead of risk.</p>
                </div>
                <div className="heading-actions">
                  <span className={`connection ${connected ? 'online' : 'offline'}`}>
                    <span /> {connected ? 'API connected' : 'Demo preview'}
                  </span>
                  <button className="secondary-btn" onClick={loadDashboardData}><RefreshCw size={15} /> Refresh</button>
                  <button className="primary-btn" onClick={() => window.location.href = '#events'}><Download size={15} /> Review events</button>
                </div>
              </div>

              <div className="environment-strip">
                <div className="env-left">
                  <span className="env-icon"><Activity size={16} /></span>
                  <div>
                    <b>Simulated environment</b>
                    <span>Demo telemetry only — not real network traffic</span>
                  </div>
                </div>
                <div className="env-right">
                  <span><span className="green-dot" /> 128 endpoints online</span>
                  <span className="env-sep" />
                  <span><Clock3 size={14} /> Synced {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <section className="stats-grid">
                <Stat icon={Activity} label="Events analyzed" value={total.toLocaleString()} delta="+12.8%" accent="blue" sub="vs. previous 24 hours" />
                <Stat icon={ShieldAlert} label="Critical alerts" value={String(critical).padStart(2, '0')} delta={critical ? 'Needs review' : 'Clear'} accent="red" sub="Require immediate attention" />
                <Stat icon={Eye} label="High severity" value={String(high).padStart(2, '0')} delta="Active" accent="orange" sub="Open high-priority events" />
                <Stat icon={Server} label="Protected endpoints" value="128" delta="98.4%" accent="green" sub="Across 12 network segments" />
              </section>

              {/* Threat Activity & Event Distribution Charts */}
              <section className="chart-grid">
                <div className="panel timeline-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Threat activity</h2>
                      <p>Security events across your network</p>
                    </div>
                    <div className="chart-legend">
                      <span><i className="legend-dot blue-dot" /> Events</span>
                      <button className="range-select" onClick={loadDashboardData}>Last 12 hours <ChevronDown size={14} /></button>
                    </div>
                  </div>
                  <div className="chart-summary">
                    <b>{total}</b>
                    <span>total events</span>
                    <span className="summary-change">↗ 8.2% <small>vs last period</small></span>
                  </div>
                  <div className="timeline-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeline} margin={{ top: 12, right: 5, left: -22, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6389ff" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#6389ff" stopOpacity={0.015} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#263347" strokeDasharray="3 5" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#8391a7', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#8391a7', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#111d2d', border: '1px solid #2b3a50', borderRadius: 10, color: '#fff' }} />
                        <Area type="monotone" dataKey="events" name="Events" stroke="#7595ff" strokeWidth={2.5} fill="url(#areaFill)" activeDot={{ r: 5, fill: '#7595ff', stroke: '#fff' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel categories-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Event distribution</h2>
                      <p>Breakdown by detection category</p>
                    </div>
                    <button className="icon-btn"><MoreHorizontal size={19} /></button>
                  </div>
                  <div className="donut-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categories} dataKey="value" nameKey="name" innerRadius={65} outerRadius={89} paddingAngle={4} stroke="none">
                          {categories.map((c, i) => (
                            <Cell key={c.name} fill={['#718bff', '#ff9d4d', '#f6c85f', '#50d7b0', '#42c9d8', '#a58bfa'][i % 6]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#111d2d', border: '1px solid #2b3a50', borderRadius: 10, color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <b>{categories.reduce((n, c) => n + c.value, 0)}</b>
                      <span>detections</span>
                    </div>
                  </div>
                  <div className="category-legend">
                    {categories.slice(0, 4).map((c, i) => (
                      <div key={c.name}>
                        <span><i style={{ background: ['#718bff', '#ff9d4d', '#f6c85f', '#50d7b0'][i] }} />{c.name}</span>
                        <b>{c.value}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Recent Security Events Table */}
              <section className="panel events-panel" id="events">
                <div className="panel-head events-head">
                  <div>
                    <h2>Recent security events <span className="count-pill">{visibleEvents.length}</span></h2>
                    <p>Review simulated security events and acknowledge verified threats</p>
                  </div>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      const csv = [
                        'Timestamp,Severity,Category,Title,Source IP,Destination,Status',
                        ...visibleEvents.map(e => [e.timestamp, e.severity, e.category, `"${e.title}"`, e.sourceIp, e.destination, e.status].join(','))
                      ].join('\n');
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                      a.download = 'netsentinel-events.csv';
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }}
                  >
                    <Download size={15} /> Export CSV
                  </button>
                </div>

                <div className="filters">
                  <div className="filter-label"><Filter size={15} /> Filters</div>
                  <select value={severity} onChange={e => setSeverity(e.target.value)}>
                    <option>All</option>
                    {['Critical', 'High', 'Medium', 'Low', 'Info'].map(x => <option key={x}>{x}</option>)}
                  </select>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option>All</option>
                    {['Malware', 'Brute Force', 'Port Scan', 'Policy', 'Network', 'System'].map(x => <option key={x}>{x}</option>)}
                  </select>
                  <button className="clear-filters" onClick={() => { setSeverity('All'); setCategory('All'); setSearch(''); }}>
                    Clear filters
                  </button>
                  <span className="auto-refresh"><span className="live-dot" /> Auto-refresh on</span>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>SEVERITY</th>
                        <th>EVENT</th>
                        <th>SOURCE → DESTINATION</th>
                        <th>DETECTED</th>
                        <th>STATUS</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEvents.slice(0, 12).map(e => (
                        <tr key={e._id}>
                          <td><Badge severity={e.severity}><span className="severity-dot" /> {e.severity}</Badge></td>
                          <td>
                            <div className="event-title">{e.title}</div>
                            <div className="event-category">{e.category} <span>·</span> <code>{String(e._id).slice(-6).toUpperCase()}</code></div>
                          </td>
                          <td>
                            <div className="ip-pair"><code>{e.sourceIp}</code><span>→</span><code>{e.destination}</code></div>
                          </td>
                          <td><span className="time-text">{timeAgo(e.timestamp)}</span></td>
                          <td><Badge severity={e.status === 'Acknowledged' ? 'acknowledged' : 'new'}>{e.status === 'Acknowledged' ? 'Acknowledged' : 'New alert'}</Badge></td>
                          <td>
                            {e.status !== 'Acknowledged' && (
                              <button className="ack-btn" title="Acknowledge event" onClick={() => ackEvent(e._id)}>
                                <Check size={15} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!visibleEvents.length && (
                    <div className="empty-state">
                      <Search size={25} />
                      <b>No matching events</b>
                      <span>Try changing your filters or search term.</span>
                    </div>
                  )}
                </div>

                <div className="table-footer">
                  <span>Showing <b>{Math.min(visibleEvents.length, 12)}</b> of <b>{visibleEvents.length}</b> events</span>
                  <span>Data refreshes every 20 seconds <span className="live-dot" /></span>
                </div>
              </section>
            </>
          )}

          <footer>
            <span>© 2026 NetSentinel Security Platform — SOC Administrator Console</span>
            <span><span className="green-dot" /> All systems operational <span className="footer-divider" /> <CircleHelp size={14} /> Help center</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 5. MAIN ROUTER & APP COMPONENT (Handles /user/login, /admin/login, /user/dashboard, /admin/dashboard)
// -----------------------------------------------------------------------------
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/user/login');

  const navigate = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('netsentinel_token');
    if (!token) {
      setLoading(false);
      return;
    }

    request('/auth/me')
      .then(d => {
        setUser(d.user);
      })
      .catch(() => {
        sessionStorage.removeItem('netsentinel_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('netsentinel_token');
    const wasAdmin = user?.role === 'admin';
    setUser(null);
    navigate(wasAdmin ? '/admin/login' : '/user/login');
  };

  if (loading) {
    return <div className="auth-screen">Loading NetSentinel session...</div>;
  }

  // Routing resolution
  const path = currentPath.toLowerCase();

  // 1. Admin Login
  if (path === '/admin/login') {
    if (user && user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
    return <AdminLogin onLogin={setUser} onNavigate={navigate} />;
  }

  // 2. User Login
  if (path === '/user/login') {
    if (user) {
      if (user.role === 'admin') {
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      }
      return <UserDashboard user={user} onLogout={handleLogout} onNavigate={navigate} />;
    }
    return <UserLogin onLogin={setUser} onNavigate={navigate} />;
  }

  // 3. User Dashboard
  if (path === '/user/dashboard') {
    if (!user) {
      return <UserLogin onLogin={setUser} onNavigate={navigate} />;
    }
    return <UserDashboard user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }

  // 4. Admin Dashboard
  if (path === '/admin/dashboard') {
    if (!user) {
      return <AdminLogin onLogin={setUser} onNavigate={navigate} />;
    }
    if (user.role !== 'admin') {
      // Normal user trying to access admin dashboard -> redirect to user dashboard
      return <UserDashboard user={user} onLogout={handleLogout} onNavigate={navigate} />;
    }
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Default / fallback:
  if (user) {
    return user.role === 'admin'
      ? <AdminDashboard user={user} onLogout={handleLogout} />
      : <UserDashboard user={user} onLogout={handleLogout} onNavigate={navigate} />;
  }

  return <UserLogin onLogin={setUser} onNavigate={navigate} />;
}

export default App;
