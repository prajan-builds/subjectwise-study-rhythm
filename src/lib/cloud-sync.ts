import { useSyncExternalStore } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { configureWorkspace, getData, migrate, replaceWorkspace, type AppData } from './store';
export type SyncStatus = 'loading' | 'synced' | 'pending' | 'offline' | 'error' | 'conflict';
type SyncInfo = { status: SyncStatus; message: string; ready: boolean };
let info: SyncInfo = { status: 'loading', message: 'Loading your workspace…', ready: false };
const listeners = new Set<() => void>();
let owner = ''; let revision = 0; let pending = false; let busy = false; let generation = 0;
let lastSaved = ''; let timer: ReturnType<typeof setTimeout> | undefined;
function notify(status: SyncStatus, message: string, ready = info.ready) { info = {status, message, ready}; listeners.forEach(fn => fn()); }
export function useSyncInfo() { return useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => info, () => info); }
const key = () => `studyos:sync:${owner}`;
function persistMeta() { try { localStorage.setItem(key(), JSON.stringify({ revision, pending })); } catch { notify('error', 'Device storage unavailable. Keep this tab open and export a backup.'); } }
export function downloadBackup(data: AppData = getData(), name = 'StudyOS-backup.json') {
 const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}));
 const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
async function fetchRow() { const {data,error} = await supabase.from('study_workspaces').select('data,revision').eq('user_id',owner).single(); if(error) throw error; return data; }
export async function startWorkspace(userId: string) {
 const run = ++generation; owner=userId; busy=false; pending=false; lastSaved='';
 notify('loading','Loading your workspace…',false);
 configureWorkspace(userId, () => { pending=true; persistMeta(); if(info.status!=='conflict') { notify(navigator.onLine?'pending':'offline', navigator.onLine?'Pending cloud sync':'Offline · changes saved on this device only',true); clearTimeout(timer); timer=setTimeout(() => void syncNow(),500); } });
 try { const raw=localStorage.getItem(key()); if(raw) { const meta=JSON.parse(raw); revision=Number(meta.revision)||0; pending=meta.pending===true; } } catch { /* safely reload from cloud */ }
 try {
  const row=await fetchRow(); if(run!==generation) return;
  if(pending && row.revision!==revision) { notify('conflict','Another device changed your workspace. Choose which version to keep.',true); return; }
  revision=row.revision;
  if(!pending) { replaceWorkspace(migrate(row.data as unknown as AppData)); lastSaved=JSON.stringify(getData()); }
  persistMeta(); notify(pending?'pending':'synced',pending?'Pending cloud sync':'Saved to cloud',true);
  if(pending) await syncNow();
 } catch { if(run!==generation) return; const cached=localStorage.getItem(`studyos:user:${userId}`); notify(navigator.onLine?'error':'offline', 'Cloud unavailable. '+(cached?'Using your device copy; changes are not synced.':'Retry when your connection returns.'), !!cached); }
}
export async function syncNow() {
 if(!owner || busy || info.status==='conflict') return;
 if(!navigator.onLine) { notify('offline','Offline · changes saved on this device only'); return; }
 const run=generation; busy=true;
 try {
  if(pending) {
   const snapshot=JSON.stringify(getData()); notify('pending','Syncing changes…');
   const {data,error}=await supabase.rpc('save_study_workspace',{expected_revision:revision,next_data:JSON.parse(snapshot) as Json});
   if(run!==generation) return;
   if(error) throw error;
   const row=data?.[0];
   if(!row) { notify('conflict','Another device changed your workspace. Choose which version to keep.',true); return; }
   revision=row.revision; lastSaved=snapshot; pending=JSON.stringify(getData())!==snapshot; persistMeta();
   notify(pending?'pending':'synced',pending?'Pending cloud sync':'Saved to cloud',true);
  } else {
   const row=await fetchRow(); if(run!==generation) return;
   // Edits can occur while a refresh is in flight. Never overwrite them.
   if(pending) { if(row.revision!==revision) notify('conflict','Another device changed your workspace. Choose which version to keep.',true); }
   else { revision=row.revision; replaceWorkspace(migrate(row.data as unknown as AppData)); lastSaved=JSON.stringify(getData()); persistMeta(); notify('synced','Saved to cloud',true); }
  }
 } catch { if(run===generation) notify(navigator.onLine?'error':'offline','Cloud sync failed · device changes retained. Retry when connected.'); }
 finally { if(run===generation) { busy=false; if(pending && info.status==='pending') timer=setTimeout(() => void syncNow(),500); } }
}
export async function resolveConflict(keepDevice: boolean) {
 if(!owner || busy) return;
 const local=getData(); downloadBackup(local,'StudyOS-before-conflict.json');
 try { const row=await fetchRow(); revision=row.revision;
  if(keepDevice) { pending=true; persistMeta(); notify('pending','Pending cloud sync',true); await syncNow(); }
  else { replaceWorkspace(migrate(row.data as unknown as AppData)); pending=false; lastSaved=JSON.stringify(getData()); persistMeta(); notify('synced','Saved to cloud',true); }
 } catch { notify('conflict','Could not resolve while offline. Both copies are retained.',true); }
}
export function stopWorkspace() { ++generation; clearTimeout(timer); owner=''; pending=false; busy=false; configureWorkspace(null,null); notify('loading','Loading your workspace…',false); }
export function hasPendingChanges() { return pending || (lastSaved!=='' && JSON.stringify(getData())!==lastSaved); }
export function localLegacyData(): AppData | null { try { const raw=localStorage.getItem('studyos:v1'); return raw?migrate(JSON.parse(raw)):null; } catch { return null; } }
