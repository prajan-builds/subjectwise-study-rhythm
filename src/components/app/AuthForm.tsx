import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';
export function AuthForm({recovery=false}:{recovery?:boolean}) {
 const navigate=useNavigate(); const [mode,setMode]=useState<'signin'|'signup'|'forgot'>('signin');
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [validRecovery,setValidRecovery]=useState(false); const [dark,setDark]=useState(false);
 useEffect(() => {
  const pref=localStorage.getItem('studyos:theme'); const isDark=pref==='dark'||(pref!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches); setDark(isDark); document.documentElement.classList.toggle('dark',isDark);
  if(recovery) { const params=new URLSearchParams(window.location.hash.slice(1)); const recoveryLink=params.get('type')==='recovery'; void supabase.auth.getUser().then(({data}) => setValidRecovery(recoveryLink && !!data.user)); }
  else void supabase.auth.getUser().then(({data}) => { if(data.user) void navigate({to:'/dashboard',replace:true}); });
 },[recovery,navigate]);
 const toggle=() => {setDark(!dark); localStorage.setItem('studyos:theme',dark?'light':'dark'); document.documentElement.classList.toggle('dark',!dark);};
 async function submit(e: React.FormEvent) {
  e.preventDefault(); setBusy(true); setMessage(''); setError('');
  try {
   if(recovery) { if(!validRecovery) throw new Error('Open a valid password-reset link from your email.'); const {error}=await supabase.auth.updateUser({password}); if(error) throw error; setMessage('Password updated. You can return to your workspace.'); }
   else if(mode==='forgot') { const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/reset-password'}); if(error) throw error; setMessage('If this account exists, a password-reset email is on its way.'); }
   else if(mode==='signup') { const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin, data:{display_name:name.trim()}}}); if(error) throw error; if(data.session) await navigate({to:'/dashboard',replace:true}); else setMessage('Check your email to confirm your account, then sign in.'); }
   else { const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; await navigate({to:'/dashboard',replace:true}); }
  } catch(e) {setError(e instanceof Error?e.message:'Unable to connect. Check your connection and try again.');}
  finally {setBusy(false);}
 }
 return <div className="min-h-dvh bg-background px-6 py-8"><header className="mx-auto flex max-w-5xl items-center justify-between"><span className="text-xl font-semibold">StudyOS</span><Button variant="ghost" size="icon" aria-label="Toggle light and dark theme" title="Toggle light and dark theme" onClick={toggle}>{dark?<Sun/>:<Moon/>}</Button></header>
 <main className="mx-auto max-w-sm pt-20"><h1 className="text-2xl font-semibold">{recovery?'Reset your password':mode==='signup'?'Create your account':mode==='forgot'?'Forgot password?':'Welcome back'}</h1><p className="mt-2 text-sm text-muted-foreground">{recovery?'Choose a new password.':mode==='signup'?'Your study workspace, on every device.':mode==='forgot'?'Enter your account email.':'Sign in to your study workspace.'}</p>
 <form onSubmit={submit} className="mt-8 grid gap-5">{mode==='signup'&&!recovery&&<div className="grid gap-2"><Label htmlFor="auth-name">Display name</Label><Input id="auth-name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></div>}
 {!recovery&&<div className="grid gap-2"><Label htmlFor="auth-email">Email</Label><Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>}
 {(recovery||mode!=='forgot')&&<div className="grid gap-2"><Label htmlFor="auth-password">Password</Label><Input id="auth-password" type="password" minLength={8} autoComplete={mode==='signin'&&!recovery?'current-password':'new-password'} required value={password} onChange={e=>setPassword(e.target.value)}/></div>}
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{message&&<p role="status" className="text-sm text-success">{message}</p>}
 <Button type="submit" disabled={busy || (recovery&&!validRecovery)}>{busy?'Please wait…':recovery?'Update password':mode==='signup'?'Create account':mode==='forgot'?'Send reset email':'Sign in'}</Button>
 </form><div className="mt-5 grid gap-2">{recovery?<Button variant="ghost" onClick={()=>navigate({to:'/dashboard',replace:true})}>Return to workspace</Button>:<><Button variant="ghost" disabled={busy} onClick={()=>{setMode(mode==='signup'?'signin':'signup');setMessage('');setError('');}}>{mode==='signup'?'Already have an account? Sign in':'Create an account'}</Button><Button variant="ghost" disabled={busy} onClick={()=>{setMode(mode==='forgot'?'signin':'forgot');setMessage('');setError('');}}>{mode==='forgot'?'Back to sign in':'Forgot password?'}</Button></>}
 </div></main></div>;
}
