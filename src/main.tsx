import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowDownRight, ArrowRight, BarChart3, CheckCircle2, CircleHelp,
  Cloud, Compass, Cpu, FileText, LockKeyhole, Plus, RotateCcw,
  ShieldCheck, Sparkles, Target, Trash2, WifiOff, Zap, Download, Save, RotateCw, Copy
} from 'lucide-react';
import { generateAnalysis, isFirebaseConfigured } from './firebaseAI';
import { buildPrompt, EVENT_TYPES, sampleEvents, summarize } from './logic.mjs';
import { SESSION_KEY, validateSession, exportEventsCsv, exportBrief, eventDistribution } from './session.mjs';
import { friendlyInferenceError } from './errors.mjs';
import { inferenceLabel } from './inferenceSource.mjs';
import './style.css';

type Team = 'Us' | 'Opponent';
type GameEvent = { id: string; minute: number; team: Team; type: string; note: string };
type Mode = 'hybrid' | 'local' | 'cloud';
type Goal = 'Halftime briefing' | 'Tactical adjustments' | 'Training priorities';

const defaults = {
  minute: 45,
  team: 'Us' as Team,
  type: 'Ball recovery',
  note: ''
};
const initialEvents = sampleEvents as GameEvent[];
const statDisplay = [
  ['shots', 'Our shots', Target],
  ['bigChances', 'Big chances', Zap],
  ['recoveries', 'Ball recoveries', RotateCcw],
  ['opponentThreats', 'Opponent threats', ArrowDownRight]
] as const;

function App() {
  const [events, setEvents] = useState<GameEvent[]>(initialEvents.map(e => ({...e})));
  const [home, setHome] = useState('Eastport FC');
  const [away, setAway] = useState('Northbridge');
  const [sessionStatus, setSessionStatus] = useState('Demo session · Not saved');
  const [deviceStatus, setDeviceStatus] = useState('Checking browser support…');
  const [exportStatus, setExportStatus] = useState('');
  const generationVersion = useRef(0);
  const [newEvent, setNewEvent] = useState(defaults);
  const [mode, setMode] = useState<Mode>('hybrid');
  const [goal, setGoal] = useState<Goal>('Halftime briefing');
  const [output, setOutput] = useState('');
  const [source, setSource] = useState('');
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const stats = useMemo(() => summarize(events), [events]);
  const distribution = useMemo(() => eventDistribution(events), [events]);
  const topDistribution = Math.max(1,...distribution);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const api=(globalThis as typeof globalThis & {LanguageModel?: {availability:()=>Promise<string>}}).LanguageModel;
        const status=api && typeof api.availability==='function' ? await api.availability() : 'unavailable';
        if (!active) return;
        setDeviceStatus(status==='available' ? 'Local model available (inference not yet verified)' :
          status==='downloadable' ? 'Local model can be downloaded' :
          status==='downloading' ? 'Local model downloading' :
          'On-device model unavailable in this browser');
      } catch { if(active)setDeviceStatus('Local model support could not be checked'); }
    })();
    return () => { active = false; };
  }, []);
  const ready = isFirebaseConfigured();


  const invalidateResult = () => {
    generationVersion.current += 1;
    setOutput(''); setSource(''); setState('idle'); setError(''); setProgress(null);
  };
  const saveSession = () => {
    try {
      const session=validateSession({schemaVersion:2,home,away,events});
      sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
      setSessionStatus('Saved in this browser tab only · Not uploaded');
    } catch {
      setSessionStatus('Could not save session. Check local browser storage.');
    }
  };
  const restoreSession = () => {
    try {
      const saved=sessionStorage.getItem(SESSION_KEY);
      if(!saved){setSessionStatus('No saved session found in this tab');return;}
      const session=validateSession(JSON.parse(saved));
      setHome(session.home);setAway(session.away);
      setEvents(session.events as GameEvent[]);invalidateResult();
      setSessionStatus('Saved session restored');
    } catch {setSessionStatus('Saved session invalid — current events preserved');}
  };
  const clearSession = () => {
    if(!window.confirm('Clear match notes and the saved tab session? This cannot be undone.'))return;
    sessionStorage.removeItem(SESSION_KEY);setEvents([]);invalidateResult();
    setSessionStatus('Notes and saved session cleared');
  };
  const downloadText = (filename:string,body:string,mime:string) => {
    const url=URL.createObjectURL(new Blob([body],{type:mime}));
    const link=document.createElement('a');link.href=url;link.download=filename;
    document.body.appendChild(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  const coachingBrief=()=>exportBrief({home,away,events,goal,output,source});
  const downloadBrief=()=>{downloadText('matchmind-coaching-brief.md',coachingBrief(),'text/markdown;charset=utf-8');setExportStatus('Coaching brief downloaded');};
  const downloadCsv=()=>{downloadText('matchmind-observations.csv',exportEventsCsv(events),'text/csv;charset=utf-8');setExportStatus('Observations exported to CSV');};
  const copyBrief=async()=>{
    try{await navigator.clipboard.writeText(coachingBrief());setExportStatus('Coaching brief copied');}
    catch{setExportStatus('Clipboard unavailable — use Download brief');}
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.note.trim() || events.length >= 50) return;
    const event: GameEvent = {
      id: crypto.randomUUID(),
      minute: Math.max(0, Math.min(120, newEvent.minute)),
      team: newEvent.team,
      type: newEvent.type,
      note: newEvent.note.trim().slice(0, 240)
    };
    setEvents((prev) => [...prev, event].sort((a, b) => a.minute - b.minute));
    setNewEvent((prev) => ({ ...prev, note: '', minute: Math.min(prev.minute + 1, 120) }));
    invalidateResult();
  };

  const analyze = async () => {
    const version=++generationVersion.current;
    setError('');setState('working');setOutput('');setSource('');setProgress(null);
    try {
      const prompt=buildPrompt(events,goal);
      const result=await generateAnalysis(prompt,mode,(fraction)=>{
        if(generationVersion.current===version)setProgress(Math.round(Math.min(1,Math.max(0,fraction))*100));
      });
      if(generationVersion.current!==version)return;
      setOutput(result.text);setSource(result.source);setState('done');
    } catch(error) {
      if(generationVersion.current!==version)return;
      setError(friendlyInferenceError(error));setState('error');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><Activity size={22} strokeWidth={2.7} /></div><div><strong>MATCHMIND</strong><small>HYBRID INTELLIGENCE</small></div></div>
        <p className="sidebar-caption">WORKSPACE</p>
        <nav className="nav-list" aria-label="Primary navigation">
          <a className="nav-item active" href="#overview"><BarChart3 size={18}/> Match overview</a>
          <a className="nav-item" href="#notebook"><FileText size={18}/> Live notebook</a>
          <a className="nav-item" href="#ai-studio"><Sparkles size={18}/> AI studio <span className="nav-new">NEW</span></a>
          <a className="nav-item" href="#how-it-works"><Compass size={18}/> How it works</a>
        </nav>
        <div className="sidebar-footer"><div className="private-card"><LockKeyhole size={19}/><strong>Designed for privacy</strong><p>Observations remain in this tab unless you explicitly save a tab session. Cloud analysis sends the notes to Firebase AI Logic. No database is connected.</p></div><span>PROJECT 01 · #BuildHybridAI 2026</span></div>
      </aside>

      <main>
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Match intelligence</div><div className="top-right"><span className="status-dot"/> Prototype workspace <span className="avatar">MM</span></div></header>
        <div className="content">
          <section className="hero" id="overview"><div className="eyebrow"><span className="eyebrow-line"/> THE NEW PLAYBOOK</div><div className="hero-row"><div><h1>Better decisions.<br/><em>Every match.</em></h1><p>Log what you see. Find the patterns that matter. Get tactical clarity with AI that prefers to run on your device.</p></div><div className="hero-badge"><span>01 / 03</span><strong>Observe.<br/>Understand.<br/>Adapt.</strong><span className="badge-bottom">BUILT FOR THE TOUCHLINE <ArrowRight size={15}/></span></div></div></section>

          <div className="section-label"><div><span className="label-index">01</span><h2>Match dashboard</h2></div><div className="tag">SYNTHETIC DEMO DATA</div></div>
          <div className="match-card"><div className="match-meta"><span>FRIENDLY / DEMO MATCH</span><span>FIRST HALF · MINUTE 45</span></div><div className="match-line"><div><span className="team-monogram blue">E</span><input className="team-name-input" aria-label="Our team name" maxLength={42} value={home} onChange={e=>{setHome(e.target.value);invalidateResult();}}/></div><div className="vs">VS<span>NO SCORE TRACKED</span></div><div className="right-team"><span className="team-monogram ink">N</span><input className="team-name-input away-team-input" aria-label="Opponent team name" maxLength={42} value={away} onChange={e=>{setAway(e.target.value);invalidateResult();}}/></div></div><p className="match-notice"><ShieldCheck size={15}/> Example teams and events are fictional. Insights are based on recorded observations, not an actual match feed.</p></div>
          <div className="stat-grid">{statDisplay.map(([key, label, Icon]) => <div className="stat-card" key={key}><span className="stat-top"><span>{label}</span><Icon size={18}/></span><strong>{stats[key]}</strong><span className="stat-foot">From {stats.logged} logged observations</span></div>)}</div>


          <section className="ops-panel" aria-label="Local session controls">
            <div className="ops-heading"><div><span className="overline">MATCH OPERATIONS</span><strong>One workspace. Every decision.</strong><small role="status">{sessionStatus}</small></div><span className="privacy-tag"><ShieldCheck size={14}/> Local by default</span></div>
            <div className="ops-buttons">
              <button type="button" onClick={saveSession}><Save size={15}/> Save session</button>
              <button type="button" onClick={restoreSession}><RotateCw size={15}/> Restore</button>
              <button type="button" onClick={downloadCsv} disabled={!events.length}><Download size={15}/> Export CSV</button>
              <button type="button" className="danger-button" onClick={clearSession}><Trash2 size={15}/> Clear notes</button>
            </div>
          </section>
          <section className="insight-panel" aria-label="Observation frequency over time">
            <div><span className="overline">TACTICAL SIGNAL</span><h3>Events through the match</h3><p>These bars show how many events you recorded in each period — not measured possession or performance.</p></div>
            <div className="distribution" role="img" aria-label={'Logged events: 0 to 29 minutes '+distribution[0]+', 30 to 59 '+distribution[1]+', 60 to 89 '+distribution[2]+', 90 to 120 '+distribution[3]}>
              {distribution.map((count,index)=><div className="dist-item" key={index}><span className="dist-count">{count}</span><div className="dist-track"><div className="dist-fill" style={{height:(Math.max(8,100*count/topDistribution))+'%'}}/></div><small>{index*30}–{index===3?120:index*30+29}′</small></div>)}
            </div>
          </section>

          <div className="two-col">
            <section className="panel" id="notebook"><div className="panel-title"><div><span className="overline">THE INPUT</span><h2>Touchline notebook</h2><p>A simple record of what actually happened.</p></div><span className="counter">{events.length}/50</span></div>
              <div className="timeline">{events.length === 0 && <p className="empty">No events yet. Log your first observation below.</p>}{events.map((event) => <div className="event" key={event.id}><div className="minute">{event.minute}'</div><span className={'event-marker ' + (event.team === 'Us' ? 'ours' : 'theirs')}/><div className="event-body"><div className="event-top"><strong>{event.type}</strong><span className={event.team === 'Us' ? 'team-pill ours-pill' : 'team-pill'}>{event.team === 'Us' ? 'OUR TEAM' : 'OPPONENT'}</span></div><p>{event.note}</p></div><button className="icon-button" title="Delete this observation" aria-label={'Delete event at minute ' + event.minute} onClick={() => {setEvents(prev => prev.filter(e => e.id !== event.id));invalidateResult();}}><Trash2 size={15}/></button></div>)}</div>
              <form className="event-form" onSubmit={addEvent}><strong><Plus size={15}/> Add an observation</strong><div className="form-row"><label>MIN<input type="number" min="0" max="120" value={newEvent.minute} onChange={(e) => setNewEvent(p=>({...p,minute: Number(e.target.value)}))} required/></label><label>TEAM<select value={newEvent.team} onChange={e=>setNewEvent(p=>({...p,team:e.target.value as Team}))}><option>Us</option><option>Opponent</option></select></label><label className="type-select">EVENT<select value={newEvent.type} onChange={e=>setNewEvent(p=>({...p,type:e.target.value}))}>{EVENT_TYPES.map((type: string)=><option key={type}>{type}</option>)}</select></label></div><label className="note-label">WHAT HAPPENED?<textarea value={newEvent.note} onChange={e=>setNewEvent(p=>({...p,note:e.target.value.slice(0,240)}))} placeholder="e.g. Left side exposed during transition..." maxLength={240} rows={2} required/></label><button className="button-secondary" type="submit" disabled={events.length>=50}><Plus size={16}/> Log observation</button></form>
            </section>

            <section className="panel ai-panel" id="ai-studio"><div className="panel-title"><div><span className="overline blue-text">THE INTELLIGENCE</span><h2>Hybrid AI studio <Sparkles size={21}/></h2><p>Turn raw observations into coaching decisions.</p></div></div>
              <div className="mode-header"><strong>INFERENCE ENGINE</strong><span className={ready ? 'ready-badge' : 'not-ready-badge'}>{ready ? 'FIREBASE CONFIGURED' : 'SETUP REQUIRED'}</span></div>
              <div className="mode-grid" role="group" aria-label="AI inference preference">
                <button aria-pressed={mode==='hybrid'} className={'mode '+(mode==='hybrid'?'selected':'')} onClick={()=>{setMode('hybrid');invalidateResult();}}><Zap size={19}/><strong>Hybrid</strong><small>Device first, cloud fallback</small></button>
                <button aria-pressed={mode==='local'} className={'mode '+(mode==='local'?'selected':'')} onClick={()=>{setMode('local');invalidateResult();}}><Cpu size={19}/><strong>On-device</strong><small>Local model only</small></button>
                <button aria-pressed={mode==='cloud'} className={'mode '+(mode==='cloud'?'selected':'')} onClick={()=>{setMode('cloud');invalidateResult();}}><Cloud size={19}/><strong>Cloud</strong><small>Remote model only</small></button>
              </div>
              <div className="device-readiness"><Cpu size={15}/><span>{deviceStatus}</span></div>
              <div className="focus-box"><label htmlFor="goal">WHAT DO YOU NEED?</label><select id="goal" value={goal} onChange={(e)=>{setGoal(e.target.value as Goal);invalidateResult();}}><option>Halftime briefing</option><option>Tactical adjustments</option><option>Training priorities</option></select><p>AI grounds its recommendations in your logged events. It may be wrong; a coach makes the final decision.</p></div>
              <button className="button-main" onClick={analyze} disabled={state==='working'||!events.length}><Sparkles size={18}/>{state === 'working' ? 'Analyzing observations…' : 'Generate match intelligence'}<ArrowRight size={18}/></button>
              {progress !== null && state === 'working' && mode !== 'cloud' && <p className="download-progress">On-device model download: {progress}% (cloud may be used while downloading)</p>}
              {state === 'error' && <div className="error" role="alert">{error}</div>}
              {state === 'done' && <div className="ai-result"><div className="result-heading"><strong><CheckCircle2 size={17}/> Analysis generated</strong><span className="source-pill">{inferenceLabel(source)}</span></div><div className="result-body">{output}</div><p>AI-generated guidance — verify with the full match context before acting.</p><div className="export-actions"><button onClick={downloadBrief}><Download size={15}/> Download briefing</button><button onClick={copyBrief}><Copy size={15}/> Copy briefing</button></div><span className="export-status" role="status">{exportStatus}</span></div>}
              {state === 'idle' && <div className="result-placeholder"><div className="orb"><Sparkles size={23}/></div><h3>Your next insight starts here.</h3><p>Choose a focus, then analyze real observations using Firebase AI Logic. No mock AI response is shown.</p></div>}
            </section>
          </div>

          <section className="architecture" id="how-it-works"><div><span className="overline">BUILT FOR HYBRID</span><h2>Intelligence that meets you <em>where you are.</em></h2><p>Local when supported. Cloud when needed. Clear about which one actually answered.</p></div><div className="architecture-flow"><div><Cpu size={22}/><strong>Gemini Nano 4</strong><span>On your Chrome desktop</span></div><ArrowRight className="flow-arrow" size={22}/><div><Activity size={22}/><strong>Firebase AI Logic</strong><span>Routes every request</span></div><ArrowRight className="flow-arrow" size={22}/><div><Cloud size={22}/><strong>Gemini Cloud</strong><span>Fallback when unavailable</span></div></div></section>
          <footer><span>© 2026 MATCHMIND · DEMONSTRATION PROTOTYPE</span><span><WifiOff size={15}/> Offline requires a supported on-device model <CircleHelp size={14}/></span></footer>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
