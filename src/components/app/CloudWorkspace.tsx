import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { startWorkspace, stopWorkspace, syncNow, useSyncInfo, resolveConflict, downloadBackup } from '@/lib/cloud-sync';
export function CloudWorkspace({userId,children}:{userId:string;children:ReactNode}) {
 const sync=useSyncInfo();
 useEffect(()=>{void startWorkspace(userId); const online=()=>void syncNow(); const offline=()=>void syncNow(); const focus=()=>{if(document.visibilityState==='visible') void syncNow();};
 window.addEventListener('online',online);window.addEventListener('offline',offline);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);
 const interval=window.setInterval(focus,30000);
 return ()=>{window.clearInterval(interval);window.removeEventListener('online',online);window.removeEventListener('offline',offline);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);stopWorkspace();};},[userId]);
 if(!sync.ready) return <div className="grid min-h-dvh place-content-center gap-4 px-6 text-center"><h1 className="text-xl font-semibold">StudyOS</h1><p role="status" className="text-sm text-muted-foreground">{sync.message}</p>{sync.status!=='loading'&&<Button onClick={()=>startWorkspace(userId)}><RefreshCw/> Retry</Button>}</div>;
 return <><div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-3 border-b bg-background px-4 py-2 text-xs" role="status"><span>{sync.message}</span>{(sync.status==='error'||sync.status==='offline')&&<Button variant="ghost" size="sm" onClick={()=>syncNow()}><RefreshCw/> Retry</Button>}{sync.status==='conflict'&&<><Button size="sm" variant="outline" onClick={()=>resolveConflict(false)}>Use cloud copy</Button><Button size="sm" variant="outline" onClick={()=>resolveConflict(true)}>Keep device copy</Button></>}{sync.status!=='synced'&&<Button size="sm" variant="ghost" onClick={()=>downloadBackup()} aria-label="Download device backup" title="Download device backup"><Download/></Button>}</div>{children}</>;
}
