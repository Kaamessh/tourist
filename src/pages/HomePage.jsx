import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseClient';
import { MapPin, Compass, Clock, Heart, MessageCircle, ArrowRight, Shield, Eye, Gift } from 'lucide-react';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';

const HOTSPOTS = [
  { name: "Baga Beach", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80", tag: "Most Popular" },
  { name: "Dudhsagar Falls", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80", tag: "Scenic" },
  { name: "Calangute Beach", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80", tag: "Hotspot" },
  { name: "Fort Aguada", img: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=400&q=80", tag: "Historic" },
  { name: "Palolem Beach", img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&q=80", tag: "Serene" },
  { name: "Anjuna Beach", img: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80", tag: "Vibrant" },
];

const GEMS = [
  { name: "Butterfly Beach", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", tag: "Secret" },
  { name: "Divar Island", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80", tag: "Peaceful" },
  { name: "Cola Beach", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80", tag: "Hidden" },
  { name: "Chorla Ghat", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80", tag: "Nature" },
  { name: "Fontainhas", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80", tag: "Culture" },
];

const HOW_STEPS = [
  { icon: <Eye size={36} color="#0D9488" />, title: "Check AI Forecasts", desc: "Our model ingests 168 hours of real crowd data to predict exactly how busy each spot will be." },
  { icon: <Shield size={36} color="#0D9488" />, title: "Avoid Crowds", desc: "Get instant green/red alerts and AI-recommended hidden alternatives near you." },
  { icon: <Gift size={36} color="#0D9488" />, title: "Earn Rewards", desc: "Discover hidden gems and unlock exclusive local discounts by being an AURA pioneer." },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (user) setUserProfile({
          id: user.id,
          name: user.user_metadata?.username || user.email?.split('@')[0] || 'Tourist',
          email: user.email,
          phone: user.user_metadata?.phone_number || 'N/A',
        });
        const { data } = await supabaseAuth.from('posts').select('*').order('created_at', { ascending: false }).limit(2);
        if (data) setRecentPosts(data);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  return (
    <div className="tourist-app home-page">
      <NavBar onCreatePost={() => setShowPostModal(true)} />

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <div className="hero-badge">🏆 #1 AI Travel App for Goa</div>
          <h1>Experience the<br /><span>Real Goa.</span></h1>
          <p>Beat the crowds with AI, discover hidden gems, and unlock exclusive discounts.</p>
          <div className="hero-ctas">
            <button className="btn-hero-primary" onClick={() => navigate('/map')}>
              <Compass size={20} /> Open Live AI Predictor
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/feed')}>
              <MessageCircle size={20} /> Community Feed
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>29</strong><span>Destinations</span></div>
            <div className="hero-stat-div" />
            <div className="hero-stat"><strong>168h</strong><span>Forecasts</span></div>
            <div className="hero-stat-div" />
            <div className="hero-stat"><strong>Live</strong><span>AI Intel</span></div>
          </div>
        </div>
      </section>

      {/* HOTSPOTS CAROUSEL */}
      <section className="home-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Popular Hotspots</h2>
            <p className="section-sub">Real-time crowd predictions for Goa's most visited places</p>
          </div>
          <button className="see-all-btn" onClick={() => navigate('/map')}>See All <ArrowRight size={16} /></button>
        </div>
        <div className="carousel">
          {HOTSPOTS.map(({ name, img, tag }) => (
            <div className="carousel-card" key={name} onClick={() => navigate('/map')}>
              <div className="carousel-img" style={{ backgroundImage: `url(${img})` }}>
                <span className="carousel-tag">{tag}</span>
              </div>
              <div className="carousel-label">
                <MapPin size={14} color="#0D9488" />
                <span>{name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HIDDEN GEMS CAROUSEL */}
      <section className="home-section" style={{ background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Discover Hidden Gems 💎</h2>
            <p className="section-sub">Uncrowded paradises the algorithm wants you to find</p>
          </div>
          <button className="see-all-btn" onClick={() => navigate('/map')}>Explore <ArrowRight size={16} /></button>
        </div>
        <div className="carousel">
          {GEMS.map(({ name, img, tag }) => (
            <div className="carousel-card gem-card" key={name} onClick={() => navigate('/map')}>
              <div className="carousel-img" style={{ backgroundImage: `url(${img})` }}>
                <span className="carousel-tag gem-tag">{tag}</span>
              </div>
              <div className="carousel-label">
                <span style={{ color: '#059669' }}>✦</span>
                <span>{name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW AURA WORKS */}
      <section className="home-section how-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">How AURA Works</h2>
          <p className="section-sub">Three simple steps to a perfect Goa experience</p>
        </div>
        <div className="how-grid">
          {HOW_STEPS.map(({ icon, title, desc }, i) => (
            <div className="how-card" key={i}>
              <div className="how-number">{i + 1}</div>
              <div className="how-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING INTEL */}
      <section className="home-section" style={{ background: '#f8fafc' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">🔥 Trending Intel</h2>
            <p className="section-sub">Latest from the community</p>
          </div>
          <button className="see-all-btn" onClick={() => navigate('/feed')}>View Feed <ArrowRight size={16} /></button>
        </div>
        {recentPosts.length === 0 ? (
          <div className="empty-feed-hint">
            <p>No posts yet. <button onClick={() => setShowPostModal(true)} style={{ color: '#0D9488', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Be the first to post!</button></p>
          </div>
        ) : (
          <div className="trending-grid">
            {recentPosts.map(post => (
              <div className="trending-card" key={post.id} onClick={() => navigate('/feed')}>
                {post.media_url && <img src={post.media_url} alt={post.caption} className="trending-img" />}
                <div className="trending-body">
                  <div className="trending-author">
                    <div className="mini-avatar">{post.user_name?.[0]?.toUpperCase()}</div>
                    <strong>{post.user_name}</strong>
                    {post.location_name && <span className="trending-loc"><MapPin size={12} /> {post.location_name}</span>}
                  </div>
                  {post.caption && <p className="trending-caption">{post.caption.slice(0, 120)}{post.caption.length > 120 ? '…' : ''}</p>}
                  <div className="trending-stats">
                    <span><Heart size={14} /> {post.likes || 0}</span>
                    <span><Clock size={14} /> {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-brand">● AURA Goa</div>
        <p>AI-Powered Crowd Intelligence for Smart Travel © 2025</p>
      </footer>

      {showPostModal && (
        <CreatePostModal
          userProfile={userProfile}
          onClose={() => setShowPostModal(false)}
          onPosted={() => { setShowPostModal(false); }}
        />
      )}
    </div>
  );
}
