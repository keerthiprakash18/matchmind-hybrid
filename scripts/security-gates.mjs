import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const fail=(text)=>{console.error('FAIL '+text);process.exitCode=1;};
const pass=(text)=>console.log('PASS '+text);
const pkg=JSON.parse(readFileSync('package.json','utf8'));
if(pkg.name==='matchmind-hybrid')pass('Independent project');else fail('Unexpected project');
const ignore=readFileSync('.gitignore','utf8');
if(ignore.split(/\r?\n/).includes('.env'))pass('.env ignored');else fail('.env not ignored');
const ai=readFileSync('src/firebaseAI.ts','utf8');
if(/import\.meta\.env\.DEV\s*&&/.test(ai))pass('App Check debug restricted to development');else fail('Missing debug-mode guard');
if(/gemini-2\.5-flash-lite/.test(ai))fail('Retired Gemini model');else pass('Retired model not referenced');
let files=[];
try { files=execFileSync('git',['ls-files'],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean); }
catch { console.log('INFO Git index unavailable: tracked-file check skipped'); }
if(files.some(path=>/(^|\/)\.env($|\.)/.test(path)&&!path.endsWith('.env.example')))fail('Private environment file tracked');else pass('No private env files tracked');
if(files.some(path=>/\.(pem|p12|key)$/.test(path)))fail('Credential file extension tracked');else pass('No private credential extensions tracked');
console.log('This is a source safety check, NOT a full dependency/penetration audit.');
