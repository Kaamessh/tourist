import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseClient';
import { User, Mail, Phone, LogOut, Grid, Bell, ChevronRight, Trash2, X } from 'lucide-react';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';
import CustomVideoPlayer from '../components/CustomVideoPlayer';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nudgeEnabled, setNudgeEnabled] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (!user) { navigate('/login'); return; }
        const profile = {
          id: user.id,
          name: user.user_metadata?.username || user.email?.split('@')[0] || 'Tourist',
          email: user.email,
          phone: user.user_metadata?.phone_number || '—',
        };
        setUserProfile(profile);
        const { data } = await supabaseAuth.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setMyPosts(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabaseAuth.auth.signOut();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) return setEditError('Username cannot be empty');
    setSaving(true);
    setEditError('');
    try {
      // 1. Update Database
      const { error: dbErr } = await supabaseAuth
        .from('tourists')
        .update({ 
          username: editForm.username, 
          phone_number: editForm.phone 
        })
        .eq('id', userProfile.id);

      if (dbErr) {
        if (dbErr.code === '23505') throw new Error('Username or Phone Number already taken!');
        throw dbErr;
      }

      // 2. Update Auth Metadata
      const { error: authErr } = await supabaseAuth.auth.updateUser({
        data: { 
          username: editForm.username, 
          phone_number: editForm.phone 
        }
      });
      if (authErr) throw authErr;

      setUserProfile(prev => ({ ...prev, name: editForm.username, phone: editForm.phone }));
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (post, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this discovery permanently?")) return;
    try {
      // 1. Remove from Storage if media exists
      if (post.media_url) {
        const fileName = post.media_url.split('/').pop();
        await supabaseAuth.storage.from('tourist_media').remove([fileName]);
      }

      // 2. Remove from Database
      const { error } = await supabaseAuth.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      
      setMyPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const initial = userProfile?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="tourist-app profile-page">
      <NavBar onCreatePost={() => setShowPostModal(true)} />

      <div className="profile-content">
        {/* Avatar + name */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{loading ? '…' : initial}</div>
          <h2 className="profile-name">{loading ? 'Loading…' : userProfile?.name}</h2>
          <p className="profile-tagline">AURA Explorer · Goa Traveler</p>
          <div className="profile-stats-row">
            <div className="profile-stat"><strong>{myPosts.length}</strong><span>Posts</span></div>
            <div className="profile-stat-div" />
            <div className="profile-stat"><strong>{myPosts.reduce((s, p) => s + (p.likes || 0), 0)}</strong><span>Likes</span></div>
          </div>
        </div>

        {/* Info cards */}
        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="profile-section-title" style={{ margin: 0 }}>Profile Information</h3>
            <button 
              onClick={() => {
                setEditForm({ username: userProfile?.name, phone: userProfile?.phone });
                setIsEditing(true);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--teal-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Edit Profile
            </button>
          </div>
          {[
            { icon: <User size={18} color="#0D9488" />, label: 'Username', value: userProfile?.name },
            { icon: <Mail size={18} color="#0D9488" />, label: 'Email', value: userProfile?.email },
            { icon: <Phone size={18} color="#0D9488" />, label: 'Phone', value: userProfile?.phone },
          ].map(({ icon, label, value }) => (
            <div key={label} className="profile-info-row">
              {icon}
              <div className="profile-info-text">
                <span className="info-label">{label}</span>
                <span className="info-value">{loading ? '—' : (value || '—')}</span>
              </div>
              <ChevronRight size={16} color="#cbd5e1" />
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {isEditing && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Update Your Identity</h3>
                <button onClick={() => setIsEditing(false)} className="modal-close"><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="modal-field">
                  <User size={16} color="#0D9488" />
                  <input
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="New Username"
                    className="modal-input"
                  />
                </div>
                <div className="modal-field">
                  <Phone size={16} color="#0D9488" />
                  <input
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="modal-input"
                  />
                </div>
                {editError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{editError}</p>}
              </div>
              <div className="modal-footer">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  disabled={saving} 
                  className="btn-post"
                >
                  {saving ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="profile-section">
          <h3 className="profile-section-title">Settings</h3>
          <div className="profile-info-row">
            <Bell size={18} color="#0D9488" />
            <div className="profile-info-text">
              <span className="info-label">Crowd Alert Notifications</span>
              <span className="info-value" style={{ color: nudgeEnabled ? '#0D9488' : '#94a3b8', fontSize: '0.85rem' }}>{nudgeEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <button
              onClick={() => setNudgeEnabled(p => !p)}
              className={`toggle-btn${nudgeEnabled ? ' on' : ''}`}
              aria-label="Toggle notifications"
            >
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Eco-Rewards Center */}
        <div className="profile-section">
          <h3 className="profile-section-title">🌿 Eco-Rewards Center</h3>
          <div className="eco-rewards-container">
            <div className="rewards-header-card">
              <h4>Current Balance</h4>
              <div className="big-coin-display">1,250 <span style={{ fontSize: '1.2rem' }}>AURA</span></div>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>You've saved 4kg of CO2 this week!</p>
            </div>
            
            <div className="rewards-grid">
              {[
                { title: 'VIP Sunbed at Palolem', desc: 'Reserved front-row seating.', cost: 500, icon: '🏖️' },
                { title: 'Skip-the-line Basilica', desc: 'No-wait entry for 2 people.', cost: 1000, icon: '⛪' },
                { title: '1-Day Scooter Rental', desc: 'Electric scooter for island tours.', cost: 2000, icon: '🛵' }
              ].map(r => (
                <div key={r.title} className="reward-card">
                  <div className="reward-icon-box">{r.icon}</div>
                  <h5>{r.title}</h5>
                  <p>{r.desc}</p>
                  <div className="reward-cost">
                    <span>🌿 {r.cost}</span>
                  </div>
                  <button className="btn-redeem" onClick={() => alert('Redeem Successful! Check your email for the voucher.')}>
                    Redeem Reward
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Posts Grid */}
        {myPosts.length > 0 && (
          <div className="profile-section">
            <h3 className="profile-section-title"><Grid size={18} /> My Posts</h3>
            <div className="my-posts-grid">
              {myPosts.map(post => (
                <div key={post.id} className="my-post-thumb">
                  {post.media_url ? (
                    post.media_url.toLowerCase().endsWith('.mp4') ? (
                      <CustomVideoPlayer src={post.media_url} />
                    ) : (
                      <img src={post.media_url} alt={post.caption} />
                    )
                  ) : (
                    <div className="post-text-thumb">{post.caption?.slice(0, 30) || '📝'}</div>
                  )}
                  <div className="my-post-hover">
                    <span>❤️ {post.likes || 0}</span>
                    <button 
                      onClick={(e) => handleDeletePost(post, e)} 
                      className="btn-delete-thumb"
                      title="Delete Post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className="profile-section danger-zone">
          <button onClick={handleSignOut} className="btn-signout">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {showPostModal && (
        <CreatePostModal
          userProfile={userProfile}
          onClose={() => setShowPostModal(false)}
          onPosted={() => setShowPostModal(false)}
        />
      )}
    </div>
  );
}
