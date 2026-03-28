import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseClient';
import { MapPin, Clock, Heart, MessageCircle, PlusCircle, Send, X, UploadCloud, Compass, Trash2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';

export default function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showPostModal, setShowPostModal] = useState(false);

  const loadPosts = async () => {
    try {
      const { data: postsData } = await supabaseAuth.from('posts').select('*').order('created_at', { ascending: false });
      if (postsData) {
        const { data: commentsData } = await supabaseAuth.from('comments').select('*').order('created_at', { ascending: true });
        setPosts(postsData.map(p => ({ ...p, comments: commentsData?.filter(c => c.post_id === p.id) || [] })));
      }
    } catch (err) { console.error("Feed error:", err); }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (user) setUserProfile({
        id: user.id,
        name: user.user_metadata?.username || user.email?.split('@')[0] || 'Tourist',
        email: user.email,
        phone: user.user_metadata?.phone_number || 'N/A',
      });
      await loadPosts();
    };
    init();
  }, []);

  const handleLike = async (postId, currentLikes) => {
    await supabaseAuth.from('posts').update({ likes: (currentLikes || 0) + 1 }).eq('id', postId);
    loadPosts();
  };

  const handleComment = async (postId) => {
    const txt = commentInputs[postId];
    if (!txt?.trim() || !userProfile) return;
    await supabaseAuth.from('comments').insert({ post_id: postId, user_id: userProfile.id, user_name: userProfile.name, comment_text: txt });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    loadPosts();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this discovery? This cannot be undone.")) return;
    try {
      const { error } = await supabaseAuth.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert("Failed to delete post: " + err.message);
    }
  };

  return (
    <div className="tourist-app feed-page">
      <NavBar onCreatePost={() => setShowPostModal(true)} />

      <div className="feed-page-header">
        <div className="feed-page-brand">
          <Compass size={28} /> AURA Intel Feed
        </div>
        <p>Real-time reports and discoveries from fellow travelers</p>
      </div>

      <main className="feed-main">
        {posts.length === 0 ? (
          <div className="feed-empty">
            <div className="feed-empty-icon">📸</div>
            <h3>No posts yet!</h3>
            <p>Be the first to share your Goa discoveries.</p>
            <button className="btn-create-post-hero" onClick={() => setShowPostModal(true)}>
              <PlusCircle size={20} /> Create First Post
            </button>
          </div>
        ) : (
          <div className="feed-grid">
            {posts.map((post, i) => (
              <div key={post.id} className="post-card-premium" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="post-header">
                  <div className="avatar">{post.user_name?.[0]?.toUpperCase()}</div>
                  <div className="post-meta">
                    <h4>{post.user_name}</h4>
                    <span><Clock size={12} /> {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {userProfile?.id === post.user_id && (
                    <button 
                      onClick={() => handleDeletePost(post.id)} 
                      className="btn-delete-intel"
                      title="Delete your post"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {post.media_url && (
                  <div className="post-media-container">
                    {post.media_url.toLowerCase().endsWith('.mp4') ? (
                      <video src={post.media_url} controls style={{ width: '100%' }} />
                    ) : (
                      <img src={post.media_url} alt="Post" />
                    )}
                    {post.location_name && (
                      <div className="post-glass-overlay">
                        <MapPin size={16} color="#f97316" /> <strong>{post.location_name}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="post-body">
                  {post.caption && <p className="post-caption">{post.caption}</p>}
                  <div className="post-actions-row">
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <button onClick={() => handleLike(post.id, post.likes)} className="action-btn like-btn" style={{ color: post.likes > 0 ? '#e11d48' : '#64748b' }}>
                        <Heart size={20} fill={post.likes > 0 ? '#e11d48' : 'none'} /> {post.likes || 0}
                      </button>
                      <button className="action-btn"><MessageCircle size={20} /> {post.comments?.length || 0}</button>
                    </div>
                    <button className="share-btn">Share Intel</button>
                  </div>

                  {post.comments?.length > 0 && (
                    <div className="comments-list">
                      {post.comments.slice(0, 2).map(c => (
                        <div key={c.id} className="comment-item">
                          <strong>{c.user_name}</strong> {c.comment_text}
                        </div>
                      ))}
                      {post.comments.length > 2 && <span className="see-more">View all {post.comments.length} comments</span>}
                    </div>
                  )}

                  <div className="comment-input-row">
                    <div className="comment-avatar">{userProfile?.name?.[0]?.toUpperCase() || '?'}</div>
                    <input
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs(p => ({ ...p, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                      placeholder="Add a comment…"
                      className="comment-input"
                    />
                    <button onClick={() => handleComment(post.id)} className="comment-send"><Send size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showPostModal && (
        <CreatePostModal
          userProfile={userProfile}
          onClose={() => setShowPostModal(false)}
          onPosted={() => { setShowPostModal(false); loadPosts(); }}
        />
      )}
    </div>
  );
}
