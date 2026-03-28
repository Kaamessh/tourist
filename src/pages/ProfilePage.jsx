import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseClient';
import { User, Mail, Phone, LogOut, Grid, Bell, ChevronRight } from 'lucide-react';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nudgeEnabled, setNudgeEnabled] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

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
          <h3 className="profile-section-title">Profile Information</h3>
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

        {/* My Posts Grid */}
        {myPosts.length > 0 && (
          <div className="profile-section">
            <h3 className="profile-section-title"><Grid size={18} /> My Posts</h3>
            <div className="my-posts-grid">
              {myPosts.map(post => (
                <div key={post.id} className="my-post-thumb">
                  {post.media_url ? (
                    <img src={post.media_url} alt={post.caption} />
                  ) : (
                    <div className="post-text-thumb">{post.caption?.slice(0, 30) || '📝'}</div>
                  )}
                  <div className="my-post-hover">
                    <span>❤️ {post.likes || 0}</span>
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
