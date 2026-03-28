import React, { useState, useEffect } from 'react';
import { supabaseAuth } from '../lib/supabaseClient';
import { X, UploadCloud, MapPin } from 'lucide-react';

export default function CreatePostModal({ userProfile, onClose, onPosted }) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file || !userProfile) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const name = `${userProfile.id}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabaseAuth.storage.from('tourist_media').upload(name, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabaseAuth.storage.from('tourist_media').getPublicUrl(name);
      const { error: ins } = await supabaseAuth.from('posts').insert({
        user_id: userProfile.id, user_name: userProfile.name,
        media_url: publicUrl, caption, location_name: location,
      });
      if (ins) throw ins;
      onPosted();
    } catch (e) {
      alert('Upload failed. Make sure you ran the SQL setup!\n\n' + e.message);
    } finally { setUploading(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Share Your Discovery</h3>
          <button onClick={onClose} className="modal-close"><X size={20} /></button>
        </div>

        <div className="modal-body">
          <label className="upload-zone">
            {preview ? (
              <img src={preview} alt="preview" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">
                <UploadCloud size={40} color="#0D9488" />
                <p>Click to upload photo or video</p>
                <span>JPG, PNG, MP4 supported</span>
              </div>
            )}
            <input type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
          </label>

          <div className="modal-field">
            <MapPin size={16} color="#0D9488" />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Tag a location (e.g. Baga Beach)"
              className="modal-input"
            />
          </div>

          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Tell the community what you discovered…"
            className="modal-textarea"
            rows={3}
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={handleSubmit} disabled={!file || uploading} className="btn-post">
            {uploading ? 'Posting…' : '📤 Share Intel'}
          </button>
        </div>
      </div>
    </div>
  );
}
