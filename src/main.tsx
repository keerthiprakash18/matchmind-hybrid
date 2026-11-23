import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowDownRight, ArrowRight, BarChart3, CheckCircle2, CircleHelp,
  Cloud, Compass, Cpu, FileText, LockKeyhole, Plus, RotateCcw,
  ShieldCheck, Sparkles, Target, Trash2, WifiOff, Zap
} from 'lucide-react';
import { generateAnalysis, isFirebaseConfigured } from './firebaseAI';
import { buildPrompt, EVENT_TYPES, sampleEvents, summarize } from './logic.mjs';
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
  const [events, setEvents] = useState<GameEvent[]>(initialEvents);
  const [newEvent, setNewEvent] = useState(defaults);
  const [mode, setMode] = useState<Mode>('hybrid');
  const [goal, setGoal] = useState<Goal>('Halftime briefing');
  const [output, setOutput] = useState('');
  const [source, setSource] = useState('');
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const stats = useMemo(() => summarize(events), [events]);
  const ready = isFirebaseConfigured();

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
    setOutput(''); setState('idle');
  };

  const analyze = async () => {
    setError(''); setState('working'); setOutput(''); setSource(''); setProgress(null);
    try {
      const prompt = buildPrompt(events, goal);
      const result = await generateAnalysis(prompt, mode, (fraction) => setProgress(Math.round(fraction * 100)));
      setOutput(result.text); setSource(result.source); setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inference failed. Check Firebase setup and Chrome support.');
      setState('error');
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
        <div className="sidebar-footer"><div className="private-card"><LockKeyhole size={19}/><strong>Designed for privacy</strong><p>Match notes stay in this tab until you ask the AI to analyze them. No database is connected in this starter.</p></div><span>PROJECT 01 · #BuildHybridAI 2026</span></div>
      </aside>

      <main>
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Match intelligence</div><div className="top-right"><span className="status-dot"/> Prototype workspace <span className="avatar">MM</span></div></header>
        <div className="content">
          <section className="hero" id="overview"><div className="eyebrow"><span className="eyebrow-line"/> THE NEW PLAYBOOK</div><div className="hero-row"><div><h1>Better decisions.<br/><em>Every match.</em></h1><p>Log what you see. Find the patterns that matter. Get tactical clarity with AI that prefers to run on your device.</p></div><div className="hero-badge"><span>01 / 03</span><strong>Observe.<br/>Understand.<br/>Adapt.</strong><span className="badge-bottom">BUILT FOR THE TOUCHLINE <ArrowRight size={15}/></span></div></div></section>

          <div className="section-label"><div><span className="label-index">01</span><h2>Match dashboard</h2></div><div className="tag">SYNTHETIC DEMO DATA</div></div>
          <div className="match-card"><div className="match-meta"><span>FRIENDLY / DEMO MATCH</span><span>FIRST HALF · MINUTE 45</span></div><div className="match-line"><div><span className="team-monogram blue">E</span><strong>Eastport FC</strong></div><div className="vs">VS<span>NO SCORE TRACKED</span></div><div className="right-team"><span className="team-monogram ink">N</span><strong>Northbridge</strong></div></div><p className="match-notice"><ShieldCheck size={15}/> Example teams and events are fictional. Insights are based on recorded observations, not an actual match feed.</p></div>
          <div className="stat-grid">{statDisplay.map(([key, label, Icon]) => <div className="stat-card" key={key}><span className="stat-top"><span>{label}</span><Icon size={18}/></span><strong>{stats[key]}</strong><span className="stat-foot">From {stats.logged} logged observations</span></div>)}</div>

          <div className="two-col">
            <section className="panel" id="notebook"><div className="panel-title"><div><span className="overline">THE INPUT</span><h2>Touchline notebook</h2><p>A simple record of what actually happened.</p></div><span className="counter">{events.length}/50</span></div>
              <div className="timeline">{events.length === 0 && <p className="empty">No events yet. Log your first observation below.</p>}{events.map((event) => <div className="event" key={event.id}><div className="minute">{event.minute}'</div><span className={'event-marker ' + (event.team === 'Us' ? 'ours' : 'theirs')}/><div className="event-body"><div className="event-top"><strong>{event.type}</strong><span className={event.team === 'Us' ? 'team-pill ours-pill' : 'team-pill'}>{event.team === 'Us' ? 'OUR TEAM' : 'OPPONENT'}</span></div><p>{event.note}</p></div><button className="icon-button" title="Delete this observation" aria-label={'Delete event at minute ' + event.minute} onClick={() => {setEvents(prev => prev.filter(e => e.id !== event.id));setOutput('');setState('idle');}}><Trash2 size={15}/></button></div>)}</div>
              <form className="event-form" onSubmit={addEvent}><strong><Plus size={15}/> Add an observation</strong><div className="form-row"><label>MIN<input type="number" min="0" max="120" value={newEvent.minute} onChange={(e) => setNewEvent(p=>({...p,minute: Number(e.target.value)}))} required/></label><label>TEAM<select value={newEvent.team} onChange={e=>setNewEvent(p=>({...p,team:e.target.value as Team}))}><option>Us</option><option>Opponent</option></select></label><label className="type-select">EVENT<select value={newEvent.type} onChange={e=>setNewEvent(p=>({...p,type:e.target.value}))}>{EVENT_TYPES.map((type: string)=><option key={type}>{type}</option>)}</select></label></div><label className="note-label">WHAT HAPPENED?<textarea value={newEvent.note} onChange={e=>setNewEvent(p=>({...p,note:e.target.value.slice(0,240)}))} placeholder="e.g. Left side exposed during transition..." maxLength={240} rows={2} required/></label><button className="button-secondary" type="submit" disabled={events.length>=50}><Plus size={16}/> Log observation</button></form>
            </section>

            <section className="panel ai-panel" id="ai-studio"><div className="panel-title"><div><span className="overline blue-text">THE INTELLIGENCE</span><h2>Hybrid AI studio <Sparkles size={21}/></h2><p>Turn raw observations into coaching decisions.</p></div></div>
              <div className="mode-header"><strong>INFERENCE ENGINE</strong><span className={ready ? 'ready-badge' : 'not-ready-badge'}>{ready ? 'FIREBASE CONFIGURED' : 'SETUP REQUIRED'}</span></div>
              <div className="mode-grid" role="radiogroup" aria-label="AI inference preference">
                <button role="radio" aria-checked={mode==='hybrid'} className={'mode '+(mode==='hybrid'?'selected':'')} onClick={()=>setMode('hybrid')}><Zap size={19}/><strong>Hybrid</strong><small>Device first, cloud fallback</small></button>
                <button role="radio" aria-checked={mode==='local'} className={'mode '+(mode==='local'?'selected':'')} onClick={()=>setMode('local')}><Cpu size={19}/><strong>On-device</strong><small>Local model only</small></button>
                <button role="radio" aria-checked={mode==='cloud'} className={'mode '+(mode==='cloud'?'selected':'')} onClick={()=>setMode('cloud')}><Cloud size={19}/><strong>Cloud</strong><small>Remote model only</small></button>
              </div>
              <div className="focus-box"><label htmlFor="goal">WHAT DO YOU NEED?</label><select id="goal" value={goal} onChange={(e)=>setGoal(e.target.value as Goal)}><option>Halftime briefing</option><option>Tactical adjustments</option><option>Training priorities</option></select><p>AI grounds its recommendations in your logged events. It may be wrong; a coach makes the final decision.</p></div>
              <button className="button-main" onClick={analyze} disabled={state==='working'||!events.length}><Sparkles size={18}/>{state === 'working' ? 'Analyzing observations…' : 'Generate match intelligence'}<ArrowRight size={18}/></button>
              {progress !== null && state === 'working' && mode !== 'cloud' && <p className="download-progress">On-device model download: {progress}% (cloud may be used while downloading)</p>}
              {state === 'error' && <div className="error" role="alert">{error}</div>}
              {state === 'done' && <div className="ai-result"><div className="result-heading"><strong><CheckCircle2 size={17}/> Analysis generated</strong><span className="source-pill">{source === 'ON_DEVICE' ? '✓ DEVICE' : source === 'IN_CLOUD' ? '☁ CLOUD' : 'SOURCE UNREPORTED'}</span></div><div className="result-body">{output}</div><p>AI-generated guidance — verify with the full match context before acting.</p></div>}
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
