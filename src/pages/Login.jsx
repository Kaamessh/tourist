import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAuth } from '../lib/supabaseClient';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unified state for both flows
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let loginEmail = username; 
      
      // Feature: Resolve email implicitly if User inputs Username instead
      if (!username.includes('@')) {
        const { data: profile, error: fetchError } = await supabaseAuth
          .from('tourists')
          .select('email')
          .eq('username', username)
          .single();
          
        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
               throw new Error(`Username '${username}' does not exist in the Tourist database. Register a new account first!`);
            }
            throw new Error(`Supabase Error: ${fetchError.message}`);
        }
        if (!profile) {
            throw new Error("Profile not retrieved from database.");
        }
        loginEmail = profile.email;
      }

      // Natively sign-in to the Isolated Tourist Network
      const { error: authError } = await supabaseAuth.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) throw authError;

      navigate('/portal');
    } catch (err) {
      setErrorMsg(err.message === "Failed to fetch" ? "Database offline. Run the .sql setup script!" : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Create user inside Auth instance & natively trigger the metadata bridge
      const { data, error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            phone_number: phone
          }
        }
      });

      if (error) throw error;
      
      // Auto-switch back to login after a successful provisioning
      alert("Aura Tourist Profile secured!\nPlease login using your new credentials.");
      setIsLogin(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f9ff', padding: '2rem'}}>
      <div style={{background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px'}}>
        <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <div style={{display: 'inline-flex', padding: '1rem', background: 'var(--teal-primary)', borderRadius: '50%', marginBottom: '1rem'}}>
            <LogIn size={36} color="white" />
          </div>
          <h1 style={{color: '#1a365d', fontSize: '1.8rem', fontWeight: 700}}>AURA Travel Portal</h1>
          <p style={{color: 'var(--text-muted)'}}>{isLogin ? 'Consumer Identity Verification' : 'Register Secure Tourist Profile'}</p>
        </div>

        {errorMsg && (
          <div style={{background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '0.8rem', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4}}>
            <AlertCircle size={20} style={{flexShrink: 0, marginTop: '2px'}} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleSignUp} style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
          <div>
             <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '0.5rem'}}>
                 {isLogin ? 'USERNAME OR EMAIL' : 'UNIQUE CHOSEN USERNAME (ID)'}
             </label>
             <input 
               type="text"
               required
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               placeholder={isLogin ? "Enter kaamesh_tourist" : "kaamesh_tourist"}
               style={{width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: '0.2s'}}
             />
          </div>

          {!isLogin && (
            <>
              <div>
                 <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '0.5rem'}}>ACTIVE EMAIL ADDRESS</label>
                 <input 
                   type="email"
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="traveler@example.com"
                   style={{width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none'}}
                 />
              </div>
              <div>
                 <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '0.5rem'}}>PHONE NUMBER</label>
                 <input 
                   type="tel"
                   required
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   placeholder="+91 98765 43210"
                   style={{width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none'}}
                 />
              </div>
            </>
          )}

          <div>
             <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '0.5rem'}}>SECURE PASSWORD</label>
             <input 
               type="password"
               required
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••"
               style={{width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none'}}
             />
          </div>

          <button 
             type="submit"
             disabled={loading}
             style={{
                 marginTop: '1rem', width: '100%', padding: '1rem', background: 'var(--teal-primary)', color: 'white',
                 border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                 opacity: loading ? 0.7 : 1, transition: '0.2s', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 14px rgba(2, 132, 118, 0.4)'
             }}
          >
             {loading ? 'Processing Protocol...' : (isLogin ? 'SECURE LOGIN' : 'PROVISION TOURIST PASSPORT')}
          </button>
        </form>

        <div style={{marginTop: '2.5rem', textAlign: 'center', color: '#718096', fontSize: '0.95rem'}}>
           {isLogin ? (
               <span>First time traveling? <button onClick={() => {setIsLogin(false); setErrorMsg('');}} style={{background: 'none', border: 'none', color: 'var(--accent-orange)', fontWeight: 600, cursor: 'pointer', outline: 'none'}}>Register Profile</button></span>
           ) : (
               <span>Already configured? <button onClick={() => {setIsLogin(true); setErrorMsg('');}} style={{background: 'none', border: 'none', color: 'var(--accent-orange)', fontWeight: 600, cursor: 'pointer', outline: 'none'}}>Access Portal</button></span>
           )}
        </div>
      </div>
    </div>
  );
}
