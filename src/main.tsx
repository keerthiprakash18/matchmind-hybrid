import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowDownRight, ArrowRight, BarChart3, CheckCircle2, CircleHelp,
  Cloud, Compass, Cpu, FileText, LockKeyhole, Plus, RotateCcw,
  ShieldCheck, Sparkles, Target, Trash2, WifiOff, Zap, Download, Save, RotateCw, Copy, Pencil, Search, Upload, Undo2, X
} from 'lucide-react';
import { generateAnalysis, isFirebaseConfigured } from './firebaseAI';
import { buildPrompt, EVENT_TYPES, sampleEvents, summarize } from './logic.mjs';
import { SESSION_KEY, validateSession, exportEventsCsv, exportBrief, eventDistribution, exportSessionJson, importSessionJson, MAX_SESSION_FILE_BYTES } from './session.mjs';
import { filterObservations } from './notebook.mjs';
import { friendlyInferenceError } from './errors.mjs';
import { inferenceLabel } from './inferenceSource.mjs';
import { structureCoachingReport, groupReportBlocks } from './reportFormat.mjs';
import { analyzeEvidence } from './evidence.mjs';
import { deriveSignals } from './signals.mjs';
import './style.css';

type Team = 'Us' | 'Opponent';
type GameEvent = { id: string; minute: number; team: Team; type: string; note: string };
type EventDraft = Omit<GameEvent, 'id'>;
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

const renderEmphasis = (value: string) =>
  value.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={index}>{part}</React.Fragment>
  );

function App() {
  const [events, setEvents] = useState<GameEvent[]>(initialEvents.map(e => ({...e})));
  const [home, setHome] = useState('Eastport FC');
  const [away, setAway] = useState('Northbridge');
  const [sessionStatus, setSessionStatus] = useState('Demo session · Not saved');
  const [deviceStatus, setDeviceStatus] = useState('Checking browser support…');
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const generationVersion = useRef(0);
  const [newEvent, setNewEvent] = useState(defaults);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<'All' | Team>('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EventDraft | null>(null);
  const [lastDeleted, setLastDeleted] = useState<GameEvent | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('hybrid');
  const [goal, setGoal] = useState<Goal>('Halftime briefing');
  const [output, setOutput] = useState('');
  const [source, setSource] = useState('');
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [requestedMode, setRequestedMode] = useState<Mode | null>(null);
  const visibleEvents = useMemo(() => filterObservations(events, {search:searchQuery, team:teamFilter, type:typeFilter}) as GameEvent[], [events, searchQuery, teamFilter, typeFilter]);
  const stats = useMemo(() => summarize(events), [events]);
  const distribution = useMemo(() => eventDistribution(events), [events]);
  const topDistribution = Math.max(1,...distribution);
  const evidence = useMemo(() => analyzeEvidence(output,events), [output,events]);
  const reportSections = useMemo(() => structureCoachingReport(output), [output]);
  const signals = useMemo(() => deriveSignals(events), [events]);
  const lastLoggedMinute = events.length ? Math.max(...events.map(e=>e.minute)) : null;
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const api=(globalThis as typeof globalThis & {LanguageModel?: {availability:()=>Promise<string>}}).LanguageModel;
        const status=api && typeof api.availability==='function' ? await api.availability() : 'unavailable';
        if (!active) return;
        setDeviceStatus(status==='available' ? 'Chrome local model available' :
          status==='downloadable' ? 'Local model can be downloaded' :
          status==='downloading' ? 'Local model downloading' :
          'On-device model unavailable in this browser');
      } catch { if(active)setDeviceStatus('Local model support could not be checked'); }
    })();
    return () => { active = false; };
  }, []);
  const ready = isFirebaseConfigured();


  const resetNotebookFilters = () => {setSearchQuery('');setTeamFilter('All');setTypeFilter('All');};

  const invalidateResult = (revokeCloudConsent = true) => {
    generationVersion.current += 1;
    // Consent is specific to the observations in the current request.
    // Editing or replacing notes must require a fresh explicit acknowledgement.
    if (revokeCloudConsent) setPrivacyAcknowledged(false);
    setOutput(''); setSource(''); setState('idle'); setError(''); setProgress(null);setDurationMs(null);setRequestedMode(null);
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
      setEvents(session.events as GameEvent[]);setLastDeleted(null);setEditingId(null);setEditDraft(null);resetNotebookFilters();invalidateResult();
      setSessionStatus('Saved session restored');
    } catch {setSessionStatus('Saved session invalid — current events preserved');}
  };
  const exploreDemo = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('ai-studio')?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
  };
  const startBlankMatch = () => {
    if (!window.confirm('Start a blank match? Unsaved observations in this tab will be replaced. Your saved tab session can still be restored.')) return;
    setHome('Our team');
    setAway('Opposition');
    setEvents([]);
    setLastDeleted(null);setEditingId(null);setEditDraft(null);resetNotebookFilters();
    setNewEvent({...defaults});
    invalidateResult();
    setSessionStatus('Blank match · Ready to log');
    document.getElementById('notebook')?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  const loadSampleMatch = () => {
    if (!window.confirm('Load the fictional demo match? Your current unsaved observations will be replaced. Your saved tab session will remain available.')) return;
    setHome('Eastport FC');
    setAway('Northbridge');
    setEvents(initialEvents.map(e=>({...e})));
    setLastDeleted(null);setEditingId(null);setEditDraft(null);resetNotebookFilters();
    setNewEvent({...defaults});
    invalidateResult();
    setSessionStatus('Fictional demo restored · Not saved');
    document.getElementById('notebook')?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  const clearSession = () => {
    if(!window.confirm('Clear match notes and the saved tab session? This cannot be undone.'))return;
    let storageCleared = true;
    try { sessionStorage.removeItem(SESSION_KEY); }
    catch { storageCleared = false; }
    setEvents([]);setLastDeleted(null);setEditingId(null);setEditDraft(null);resetNotebookFilters();invalidateResult();
    setSessionStatus(storageCleared ? 'Notes and saved session cleared' : 'Notes cleared from the screen, but saved browser storage could not be removed. Check browser settings.');
  };
  const downloadText = (filename:string,body:string,mime:string) => {
    const url=URL.createObjectURL(new Blob([body],{type:mime}));
    const link=document.createElement('a');link.href=url;link.download=filename;
    document.body.appendChild(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  const coachingBrief=()=>exportBrief({home,away,events,goal,output,source});
  const downloadSession = () => {
    try {
      const json=exportSessionJson({schemaVersion:2,home,away,events});
      downloadText('matchmind-session.json',json,'application/json;charset=utf-8');
      setSessionStatus('Session JSON downloaded to your device · No cloud upload');
    } catch {setSessionStatus('Could not export session. Check your match notes.');}
  };
  const importSession = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input=e.currentTarget;
    const file=input.files?.[0];
    if (!file) return;
    try {
      if (file.size > MAX_SESSION_FILE_BYTES) throw new Error('File too large');
      const session=importSessionJson(await file.text());
      if (!window.confirm('Replace current unsaved notes with the imported session? Saved tab data will remain unchanged.')) return;
      setHome(session.home);setAway(session.away);setEvents(session.events as GameEvent[]);
      setEditingId(null);setEditDraft(null);setLastDeleted(null);resetNotebookFilters();
      invalidateResult();
      setSessionStatus('Imported '+session.events.length+' validated observations · No upload');
    } catch {
      setSessionStatus('Import rejected: invalid or oversized MatchMind session JSON. Your notes are unchanged.');
    } finally {
      input.value='';
    }
  };
  const validDraft = (draft:EventDraft) =>
    Number.isInteger(draft.minute) && draft.minute >= 0 && draft.minute <= 120 &&
    (draft.team === 'Us' || draft.team === 'Opponent') &&
    EVENT_TYPES.includes(draft.type) && Boolean(draft.note.trim());
  const editObservation = (event:GameEvent) => {
    setEditingId(event.id);
    setEditDraft({minute:event.minute,team:event.team,type:event.type,note:event.note});
  };
  const saveObservationEdit = () => {
    if (!editingId || !editDraft || !validDraft(editDraft)) {
      setSessionStatus('Could not update: enter a whole minute from 0–120, valid event and description.');
      return;
    }
    const updated:GameEvent = {id:editingId,minute:editDraft.minute,team:editDraft.team,type:editDraft.type,note:editDraft.note.trim().slice(0,240)};
    setEvents(prev=>prev.map(event=>event.id===editingId?updated:event).sort((a,b)=>a.minute-b.minute));
    setEditingId(null);setEditDraft(null);setLastDeleted(null);
    invalidateResult();
    setSessionStatus('Observation corrected · Previous AI output cleared');
  };
  const deleteObservation = (event:GameEvent) => {
    setEvents(prev=>prev.filter(item=>item.id!==event.id));
    setLastDeleted(event);setEditingId(null);setEditDraft(null);
    invalidateResult();
    setSessionStatus('Observation deleted · Undo is available below');
  };
  const undoDelete = () => {
    if (!lastDeleted || events.length >= 50 || events.some(event=>event.id===lastDeleted.id)) return;
    setEvents(prev=>[...prev,lastDeleted].sort((a,b)=>a.minute-b.minute));
    setLastDeleted(null);invalidateResult();
    setSessionStatus('Last deleted observation restored');
  };
  const downloadBrief=()=>{downloadText('matchmind-coaching-brief.md',coachingBrief(),'text/markdown;charset=utf-8');setExportStatus('Coaching brief downloaded');setSessionStatus('Coaching brief downloaded · Review evidence before acting');};
  const downloadCsv=()=>{downloadText('matchmind-observations.csv',exportEventsCsv(events),'text/csv;charset=utf-8');setExportStatus('Observations exported to CSV');};
  const copyBrief=async()=>{
    try{await navigator.clipboard.writeText(coachingBrief());setExportStatus('Coaching brief copied');}
    catch{setExportStatus('Clipboard unavailable — use Download brief');}
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (events.length >= 50) {
      setSessionStatus('Maximum 50 observations reached. Remove an event before adding another.');
      return;
    }
    if (!newEvent.note.trim() || !Number.isInteger(newEvent.minute) ||
        newEvent.minute < 0 || newEvent.minute > 120 ||
        !EVENT_TYPES.includes(newEvent.type) ||
        (newEvent.team !== 'Us' && newEvent.team !== 'Opponent')) {
      setSessionStatus('Check the observation: enter a whole minute from 0–120, a valid event type, and a description.');
      return;
    }
    const event: GameEvent = {
      id: crypto.randomUUID(),
      minute: newEvent.minute,
      team: newEvent.team,
      type: newEvent.type,
      note: newEvent.note.trim().slice(0, 240)
    };
    setEvents((prev) => [...prev, event].sort((a, b) => a.minute - b.minute));
    setLastDeleted(null);setEditingId(null);setEditDraft(null);resetNotebookFilters();
    setNewEvent((prev) => ({ ...prev, note: '', minute: Math.min(prev.minute + 1, 120) }));
    invalidateResult();
  };

  const analyze = async () => {
    if (mode !== 'local' && !privacyAcknowledged) {
      setError('Confirm that you understand cloud inference may transmit these observations before generating a report.');
      setState('error');
      return;
    }
    const version=++generationVersion.current;
    const startedAt=performance.now();
    const submittedMode=mode;
    setRequestedMode(submittedMode);setDurationMs(null);
    setError('');setState('working');setOutput('');setSource('');setProgress(null);
    try {
      const prompt=buildPrompt(events,goal);
      const result=await generateAnalysis(prompt,mode,(fraction)=>{
        if(generationVersion.current===version)setProgress(Math.round(Math.min(1,Math.max(0,fraction))*100));
      });
      if(generationVersion.current!==version)return;
      setDurationMs(performance.now()-startedAt);
      setOutput(result.text);setSource(result.source);setState('done');
    } catch(error) {
      if(generationVersion.current!==version)return;
      setDurationMs(performance.now()-startedAt);
      setError(friendlyInferenceError(error, import.meta.env.PROD ? 'production' : 'development'));setState('error');
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to match workspace</a>
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

      <main id="main-content" tabIndex={-1}>
        <header className="topbar"><a className="mobile-brand" href="#overview"><Activity size={17}/> MATCHMIND</a><div className="breadcrumb">Workspace <span>/</span> Match intelligence</div><div className="top-right"><span className="status-dot" aria-hidden="true"/> Demonstration workspace <span className="avatar">MM</span></div></header>
        <div className="content">
          <section className="hero" id="overview"><div className="eyebrow"><span className="eyebrow-line"/> THE NEW PLAYBOOK</div><div className="hero-row"><div><h1>Better decisions.<br/><em>Every match.</em></h1><p>Log what you see. Find the patterns that matter. Get tactical clarity with AI that prefers to run on your device.</p>
            <div className="hero-actions">
              <button type="button" className="hero-primary" onClick={exploreDemo}>Explore the demo <ArrowRight size={17}/></button>
              <button type="button" className="hero-secondary" onClick={startBlankMatch}>Start blank match</button>
            </div>
            <span className="hero-no-login"><ShieldCheck size={15}/> No login required · Fictional data ready to try</span>
          </div><div className="hero-badge"><span>01 / 03</span><strong>Observe.<br/>Understand.<br/>Adapt.</strong><span className="badge-bottom">BUILT FOR THE TOUCHLINE <ArrowRight size={15}/></span></div></div></section>

          <div className="section-label"><div><span className="label-index">01</span><h2>Match dashboard</h2></div><div className="tag">SYNTHETIC DEMO DATA</div></div>
          <div className="match-card"><div className="match-meta"><span>FRIENDLY / DEMO MATCH</span><span>{lastLoggedMinute === null ? 'NO OBSERVATIONS YET' : 'LAST RECORDED EVENT · '+lastLoggedMinute+'′'}</span></div><div className="match-line"><div><span className="team-monogram blue">{home.trim().slice(0,1).toUpperCase()||'H'}</span><input className="team-name-input" aria-label="Our team name" maxLength={42} value={home} onChange={e=>{setHome(e.target.value);invalidateResult();}}/></div><div className="vs">VS<span>NO SCORE TRACKED</span></div><div className="right-team"><span className="team-monogram ink">{away.trim().slice(0,1).toUpperCase()||'A'}</span><input className="team-name-input away-team-input" aria-label="Opponent team name" maxLength={42} value={away} onChange={e=>{setAway(e.target.value);invalidateResult();}}/></div></div><p className="match-notice"><ShieldCheck size={15}/> Example teams and events are fictional. Insights are based on recorded observations, not an actual match feed.</p></div>
          <div className="stat-grid">{statDisplay.map(([key, label, Icon]) => <div className="stat-card" key={key}><span className="stat-top"><span>{label}</span><Icon size={18}/></span><strong>{stats[key]}</strong><span className="stat-foot">From {stats.logged} logged observations</span></div>)}</div>


          <section className="ops-panel" aria-label="Local session controls">
            <div className="ops-heading"><div><span className="overline">MATCH OPERATIONS</span><strong>One workspace. Every decision.</strong><small role="status">{sessionStatus}</small></div><span className="privacy-tag"><ShieldCheck size={14}/> Local by default</span></div>
            <div className="ops-buttons">
              <button type="button" onClick={saveSession}><Save size={15}/> Save session</button>
              <button type="button" onClick={restoreSession}><RotateCw size={15}/> Restore</button>
              <button type="button" onClick={loadSampleMatch}><Sparkles size={15}/> Load demo match</button>
              <button type="button" onClick={downloadCsv} disabled={!events.length}><Download size={15}/> Export CSV</button>
              <button type="button" onClick={downloadSession}><Download size={15}/> Export session</button>
              <button type="button" onClick={()=>importInputRef.current?.click()}><Upload size={15}/> Import session</button>
              <button type="button" onClick={downloadBrief} disabled={!events.length}><FileText size={15}/> Coaching brief</button>
              <button type="button" className="danger-button" onClick={clearSession}><Trash2 size={15}/> Clear notes</button>
            </div>
            <input ref={importInputRef} className="visually-hidden" type="file" accept=".json,application/json" aria-label="Choose MatchMind session JSON file" onChange={importSession}/>
            <p className="ops-explainer">Export and import keep observations on your device. Filters never change the data used by AI. Reports contain only notes you entered.</p>
          </section>
          <section className="insight-panel" aria-label="Observation frequency over time">
            <div><span className="overline">TACTICAL SIGNAL</span><h3>Events through the match</h3><p>These bars show how many events you recorded in each period — not measured possession or performance.</p></div>
            <div className="distribution" role="img" aria-label={'Logged events: 0 to 29 minutes '+distribution[0]+', 30 to 59 '+distribution[1]+', 60 to 89 '+distribution[2]+', 90 to 120 '+distribution[3]}>
              {distribution.map((count,index)=><div className="dist-item" key={index}><span className="dist-count">{count}</span><div className="dist-track"><div className="dist-fill" style={{height:(Math.max(8,100*count/topDistribution))+'%'}}/></div><small>{index*30}–{index===3?120:index*30+29}′</small></div>)}
            </div>
          </section>

          <section className="signal-section" aria-label="Rule-based tactical signals">
            <div className="signal-section-head">
              <div><span className="overline">EVIDENCE FIRST</span><h2>Signals worth reviewing</h2></div>
              <span className="signal-method"><ShieldCheck size={15}/> Rule-based · Not AI predictions</span>
            </div>
            {signals.length ? <div className="signal-grid">{signals.map(item=>
              <article className={'signal-card '+item.tone} key={item.id}>
                <div className="signal-card-top"><Compass size={18}/><span>{item.count} logged {item.count===1?'event':'events'}</span></div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <small>Evidence: {item.minutes.length ? item.minutes.map(minute=>minute+'′').join(' · ') : 'Check notebook'}</small>
              </article>
            )}</div> : <p className="signal-empty">Log observations to see evidence-linked coaching questions. No tactical findings are inferred from an empty notebook.</p>}
          </section>

          <div className="two-col">
            <section className="panel" id="notebook"><div className="panel-title"><div><span className="overline">THE INPUT</span><h2>Touchline notebook</h2><p>A simple record of what actually happened.</p></div><span className="counter">{events.length}/50</span></div>
              <div className="notebook-tools" role="group" aria-label="Find observations">
                <label htmlFor="observation-search"><Search size={14}/> Search notes
                  <input id="observation-search" type="search" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                    placeholder="Minute, event or keyword" maxLength={100}/>
                </label>
                <label htmlFor="observation-team">Filter by team
                  <select id="observation-team" value={teamFilter} onChange={e=>setTeamFilter(e.target.value as 'All' | Team)}>
                    <option value="All">Both teams</option><option value="Us">Our team</option><option value="Opponent">Opponent</option>
                  </select>
                </label>
                <label htmlFor="observation-type">Filter by event
                  <select id="observation-type" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
                    <option value="All">All types</option>{EVENT_TYPES.map((type:string)=><option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
              </div>
              <p className="filtered-count" role="status">Showing {visibleEvents.length} of {events.length} logged observations. Summary and AI use all events.</p>
              {lastDeleted && <div className="undo-banner" role="status"><span>Observation at {lastDeleted.minute}′ removed.</span>
                <button type="button" onClick={undoDelete}><Undo2 size={14}/> Undo deletion</button></div>}
              <div className="timeline">
                {events.length === 0 && <p className="empty">No events yet. Log your first observation below.</p>}
                {events.length > 0 && visibleEvents.length === 0 && <p className="empty">No observations match these filters. Your original notes have not changed.</p>}
                {visibleEvents.map((event) => <div className="event" key={event.id}>
                  <div className="minute">{event.minute}'</div>
                  <span className={'event-marker ' + (event.team === 'Us' ? 'ours' : 'theirs')}/>
                  <div className="event-body">
                    <div className="event-top"><strong>{event.type}</strong>
                      <span className={event.team === 'Us' ? 'team-pill ours-pill' : 'team-pill'}>{event.team === 'Us' ? 'OUR TEAM' : 'OPPONENT'}</span>
                    </div>
                    {editingId === event.id && editDraft ? <div className="edit-form" role="group" aria-label={'Edit observation at minute ' + event.minute}>
                      <div className="edit-row">
                        <label>MIN<input aria-label={'Edit minute at ' + event.minute} type="number" min="0" max="120" step="1"
                          value={editDraft.minute} onChange={e=>setEditDraft(p=>p?{...p,minute:Number(e.target.value)}:null)}/></label>
                        <label>TEAM<select aria-label={'Edit team at ' + event.minute} value={editDraft.team}
                          onChange={e=>setEditDraft(p=>p?{...p,team:e.target.value as Team}:null)}>
                          <option value="Us">Us</option><option value="Opponent">Opponent</option>
                        </select></label>
                        <label>EVENT<select aria-label={'Edit event type at ' + event.minute} value={editDraft.type}
                          onChange={e=>setEditDraft(p=>p?{...p,type:e.target.value}:null)}>
                          {EVENT_TYPES.map((type:string)=><option key={type}>{type}</option>)}
                        </select></label>
                      </div>
                      <label>OBSERVATION<textarea aria-label={'Edit observation text at ' + event.minute}
                        rows={2} maxLength={240} value={editDraft.note}
                        onChange={e=>setEditDraft(p=>p?{...p,note:e.target.value}:null)}/></label>
                      <div className="edit-actions">
                        <button type="button" className="button-secondary" onClick={saveObservationEdit}>Save changes</button>
                        <button type="button" className="button-secondary" onClick={()=>{setEditingId(null);setEditDraft(null);}}><X size={14}/> Cancel</button>
                      </div>
                    </div> : <p>{event.note}</p>}
                  </div>
                  <div className="event-actions">
                    <button type="button" className="icon-button" title="Edit observation"
                      aria-label={'Edit event at minute ' + event.minute} onClick={()=>editObservation(event)}><Pencil size={15}/></button>
                    <button type="button" className="icon-button" title="Delete observation"
                      aria-label={'Delete event at minute ' + event.minute} onClick={()=>deleteObservation(event)}><Trash2 size={15}/></button>
                  </div>
                </div>)}
              </div>
              <form className="event-form" onSubmit={addEvent}><strong><Plus size={15}/> Add an observation</strong><div className="form-row"><label>MIN<input type="number" min="0" max="120" step="1" value={newEvent.minute} onChange={(e) => setNewEvent(p=>({...p,minute: Number(e.target.value)}))} required/></label><label>TEAM<select value={newEvent.team} onChange={e=>setNewEvent(p=>({...p,team:e.target.value as Team}))}><option>Us</option><option>Opponent</option></select></label><label className="type-select">EVENT<select value={newEvent.type} onChange={e=>setNewEvent(p=>({...p,type:e.target.value}))}>{EVENT_TYPES.map((type: string)=><option key={type}>{type}</option>)}</select></label></div><label className="note-label">WHAT HAPPENED?<textarea value={newEvent.note} onChange={e=>setNewEvent(p=>({...p,note:e.target.value.slice(0,240)}))} placeholder="e.g. Left side exposed during transition..." maxLength={240} rows={2} required/></label><button className="button-secondary" type="submit" disabled={events.length>=50}><Plus size={16}/> Log observation</button></form>
            </section>

            <section className="panel ai-panel" id="ai-studio"><div className="panel-title"><div><span className="overline blue-text">THE INTELLIGENCE</span><h2>Hybrid AI studio <Sparkles size={21}/></h2><p>Turn raw observations into coaching decisions.</p></div></div>
              <div className="mode-header"><strong>INFERENCE ENGINE</strong><span className={ready ? 'ready-badge' : 'not-ready-badge'}>{ready ? 'CONFIGURATION PRESENT' : 'SETUP REQUIRED'}</span></div>
              <div className="mode-grid" role="group" aria-label="AI inference preference">
                <button aria-pressed={mode==='hybrid'} className={'mode '+(mode==='hybrid'?'selected':'')} onClick={()=>{setMode('hybrid');invalidateResult(false);}}><Zap size={19}/><strong>Hybrid</strong><small>Device first, cloud fallback</small></button>
                <button aria-pressed={mode==='local'} className={'mode '+(mode==='local'?'selected':'')} onClick={()=>{setMode('local');invalidateResult(false);}}><Cpu size={19}/><strong>On-device</strong><small>Local model only</small></button>
                <button aria-pressed={mode==='cloud'} className={'mode '+(mode==='cloud'?'selected':'')} onClick={()=>{setMode('cloud');invalidateResult(false);}}><Cloud size={19}/><strong>Cloud</strong><small>Remote model only</small></button>
              </div>
              <div className="device-readiness" role="status" aria-live="polite"><Cpu size={15}/><span>{deviceStatus}. Browser support is advisory; verify the actual inference route below.</span></div>
              <details className="device-guide">
                <summary>Device setup & why the route can change</summary>
                <p><strong>On-device:</strong> compatible Chrome desktop (139+) and an installed Gemini Nano model are required. The first request may download a model. The exact SDK route appears in the analysis receipt.</p>
                <p><strong>Hybrid:</strong> prefers the device, and can send your notes to Firebase Gemini Cloud when local inference is unavailable. An internet-disconnected response is only possible when a supported on-device model is installed and the application can initialize it.</p>
                <a href="https://firebase.google.com/docs/ai-logic/hybrid/web/get-started" target="_blank" rel="noopener noreferrer">Firebase official setup guide ↗</a>
              </details>
              <div className="focus-box"><label htmlFor="goal">WHAT DO YOU NEED?</label><select id="goal" value={goal} onChange={(e)=>{setGoal(e.target.value as Goal);invalidateResult();}}><option>Halftime briefing</option><option>Tactical adjustments</option><option>Training priorities</option></select><p>AI suggestions use only logged observations. The model may still be wrong; the coach makes the final decision.</p></div>
              <div className="cloud-privacy" role="note">
                <LockKeyhole size={17} aria-hidden="true"/>
                <div><strong>Know where your notes go</strong>
                  <p>{mode === 'local' ? 'On-device only: the SDK will not choose a cloud model for this request. An installed compatible device model is required.' :
                    mode === 'hybrid' ? 'Hybrid: this request can send your logged notes to Firebase AI Logic and Gemini Cloud if on-device inference is unavailable. Do not enter real player identifiers.' :
                    'Cloud: your logged notes are sent to Firebase AI Logic and Gemini Cloud for analysis. Do not enter real player identifiers.'}</p>
                  {mode !== 'local' && <label className="privacy-confirm"><input type="checkbox" checked={privacyAcknowledged} onChange={e=>setPrivacyAcknowledged(e.target.checked)}/><span>I understand that this analysis may use cloud inference.</span></label>}
                </div>
              </div>
              <button type="button" className="button-main" onClick={analyze} aria-busy={state==='working'} disabled={state==='working'||!events.length||(mode!=='local'&&!privacyAcknowledged)}><Sparkles size={18}/>{state === 'working' ? 'Analyzing observations…' : 'Generate match intelligence'}<ArrowRight size={18}/></button>
              {progress !== null && state === 'working' && mode !== 'cloud' && <p className="download-progress">On-device model download: {progress}% (cloud may be used while downloading)</p>}
              {state === 'error' && <div className="error" role="alert">{error}</div>}
              {state === 'working' && <p className="analysis-status" role="status" aria-live="polite">Generating an evidence-linked report. The source will be displayed only after the Firebase SDK returns it.</p>}
              {state === 'done' && <div id="ai-output" className="ai-result" aria-label="Generated analysis" role="region"><div className="result-heading"><strong><CheckCircle2 size={17}/> Analysis generated</strong><span className="source-pill">{inferenceLabel(source)}</span></div><div className="report-introduction">
                  <span>COACHING INTELLIGENCE</span>
                  <h3>{goal}</h3>
                  <p>Analysis of {events.length} logged observations · Suggestions require coach review.</p>
                </div>
                <div className="result-body formatted-report" aria-label="Structured coaching report">
                  {reportSections.map((section, index) => <section className={'report-section section-'+section.key} key={index} aria-label={section.title}>
                    <div className="report-section-heading"><span className="report-section-index">{String(index+1).padStart(2,'0')}</span><h3>{section.title}</h3></div>
                    <div className="report-section-content">
                      {groupReportBlocks(section.blocks).map((block, itemIndex) =>
                        block.kind === 'bullets'
                          ? <ul className="report-list" key={itemIndex}>{block.items.map((item: string,j: number)=><li key={j}>{renderEmphasis(item)}</li>)}</ul>
                          : block.kind === 'ordered'
                            ? <ol className="report-list" key={itemIndex}>{block.items.map((item: string,j: number)=><li key={j}>{renderEmphasis(item)}</li>)}</ol>
                            : block.kind === 'heading'
                              ? <h4 key={itemIndex}>{renderEmphasis(block.text)}</h4>
                              : <p key={itemIndex}>{renderEmphasis(block.text)}</p>
                      )}
                    </div>
                  </section>)}
                </div>
                <div className="evidence-receipt" aria-label="Inference and evidence audit" role="region">
                  <div className="evidence-receipt-title"><ShieldCheck size={16}/><strong>Inference & evidence receipt</strong></div>
                  <div className="evidence-metrics">
                    <div><small>REQUESTED</small><strong>{requestedMode === 'hybrid' ? 'Hybrid' : requestedMode === 'local' ? 'On-device' : 'Cloud'}</strong></div>
                    <div><small>ACTUAL ROUTE</small><strong>{inferenceLabel(source)}</strong></div>
                    <div><small>RESPONSE TIME</small><strong>{durationMs === null ? '—' : (durationMs/1000).toFixed(1)+'s'}</strong></div>
                    <div><small>EVENTS CITED</small><strong>{evidence.linkedEventCount}/{evidence.loggedEventCount}</strong></div>
                  </div>
                  {requestedMode === 'hybrid' && (source === 'in_cloud' || source === 'IN_CLOUD') && <p className="fallback-verified"><CheckCircle2 size={15}/> Cloud response in Hybrid mode recorded. On-device availability and the reason for fallback require separate verification.</p>}
                  {evidence.citedMinutes.length === 0 && <p className="evidence-warning">This response contains no recognized logged timestamps. Review all recommendations against your notebook.</p>}
                  {evidence.unloggedMinutes.length > 0 && <p className="evidence-warning">Review unlogged time references: {evidence.unloggedMinutes.map(n=>n+'′').join(', ')}. They might refer to an event not in your notebook.</p>}
                  <p className="evidence-disclaimer">Timestamp matching only; it does not prove that the model's tactical statements are true. Review every recommendation.</p>
                </div>
                <p>AI-generated guidance — verify with the full match context before acting.</p><div className="export-actions"><button onClick={downloadBrief}><Download size={15}/> Download briefing</button><button onClick={copyBrief}><Copy size={15}/> Copy briefing</button></div><span className="export-status" role="status">{exportStatus}</span></div>}
              {state === 'idle' && <div className="result-placeholder"><div className="orb"><Sparkles size={23}/></div><h3>Your next insight starts here.</h3><p>Choose a focus, then analyze real observations using Firebase AI Logic. No mock AI response is shown.</p></div>}
            </section>
          </div>

          <section className="architecture" id="how-it-works"><div><span className="overline">BUILT FOR HYBRID</span><h2>Intelligence that meets you <em>where you are.</em></h2><p>Local when supported. Cloud when needed. Clear about which one actually answered.</p></div><div className="architecture-flow"><div><Cpu size={22}/><strong>Gemini Nano</strong><span>On your Chrome desktop</span></div><ArrowRight className="flow-arrow" size={22}/><div><Activity size={22}/><strong>Firebase AI Logic</strong><span>Routes every request</span></div><ArrowRight className="flow-arrow" size={22}/><div><Cloud size={22}/><strong>Gemini Cloud</strong><span>Fallback when unavailable</span></div></div></section>
          <footer><span>© 2026 MATCHMIND · COACHING WORKSPACE</span><span><WifiOff size={15}/> Offline requires a supported on-device model <CircleHelp size={14}/></span></footer>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#overview"><BarChart3 size={19}/><span>Overview</span></a>
          <a href="#notebook"><FileText size={19}/><span>Notebook</span></a>
          <a href="#ai-studio"><Sparkles size={19}/><span>AI studio</span></a>
          <a href="#how-it-works"><Compass size={19}/><span>How it works</span></a>
        </nav>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
