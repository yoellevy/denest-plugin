import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deliver,recover} from '../worker.mjs';
import {command,runAgent} from '../adapters.mjs';
import {storage} from '../storage.mjs';

const config={agent:'codex',session:'test-session',projectId:'project',pipelineId:'main',workspace:tmpdir()},request={id:'request1',type:'send'};
function fixture({claimed=true,acknowledged=true,exit=0}={}){
 const ledger={},calls=[],writes=[];let runs=0;
 return {ledger,calls,writes,get runs(){return runs;},save:async()=>writes.push(JSON.parse(JSON.stringify(ledger))),call:async(name,args)=>{calls.push({name,args});return name==='report_agent_delivery'?{claimed}:name==='get_pipeline'?{requests:acknowledged?[]:[request]}:null;},run:async()=>{runs++;assert.equal(writes.at(-1).request1.status,'dispatching');return {code:exit};}};
}
test('a repeated request launches once, only after its claim and durable dispatch record',async()=>{
 const f=fixture();assert.equal((await deliver(config,request,f)).completed,true);await deliver(config,request,f);assert.equal(f.runs,1);assert.equal(f.calls[0].args.status,'received');assert.equal(f.calls[1].args.status,'working');assert.equal(f.ledger.request1.status,'completed');
});
test('a competing claim never launches an agent',async()=>{
 const f=fixture({claimed:false});assert.equal((await deliver(config,request,f)).skipped,true);assert.equal(f.runs,0);
});
test('exit zero does not pretend an unfinished canvas request is complete',async()=>{
 const f=fixture({acknowledged:false});assert.equal((await deliver(config,request,f)).failed,true);assert.equal(f.calls.at(-1).args.status,'failed');await deliver(config,request,f);assert.equal(f.runs,1);
});
test('interrupted dispatch is reported for review without automatic relaunch',async()=>{
 const f=fixture();f.ledger.request1={consumerId:'existing-owner',status:'dispatching'};await recover(config,f);await deliver(config,request,f);assert.equal(f.runs,0);assert.equal(f.ledger.request1.status,'interrupted');assert.equal(f.calls[0].args.consumerId,'existing-owner');
});
test('profile credentials survive reload without appearing in the sealed file',async()=>{
 const root=await mkdtemp(join(tmpdir(),'denest-bridge-'));try{const profile=await storage(root);profile.data.auth={tokens:{access_token:'private-test-token'}};await profile.save();assert.ok(!(await readFile(join(root,'profile.sealed'),'utf8')).includes('private-test-token'));assert.equal((await storage(root)).data.auth.tokens.access_token,'private-test-token');}finally{await rm(root,{recursive:true,force:true});}
});
test('adapters keep session identity explicit and reject executable shell wrappers',async()=>{
 for(const agent of ['codex','claude','cursor','antigravity']){const spec=command(agent,'chosen-session','a prompt with ` $() & |');assert.ok(spec.args.includes('chosen-session'));assert.ok(!spec.args.some(arg=>['--last','--continue','--force','--yolo','--dangerously-skip-permissions','--dangerously-bypass-approvals-and-sandbox'].includes(arg)));}
 assert.throws(()=>command('codex','--last','prompt'));assert.throws(()=>runAgent({...config,executable:'agent.cmd'},'prompt'));
});
