#!/usr/bin/env node
import {parseArgs} from 'node:util';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {mkdir,open,unlink,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {storage} from './storage.mjs';
import {connect} from './connection.mjs';
import {command} from './adapters.mjs';
import {deliver,recover} from './worker.mjs';

const {values,positionals}=parseArgs({allowPositionals:true,options:{profile:{type:'string',default:'default'},agent:{type:'string'},session:{type:'string'},workspace:{type:'string'},project:{type:'string'},pipeline:{type:'string',default:'main'},executable:{type:'string'},request:{type:'string'},once:{type:'boolean',default:false}}});
async function main(){
 const action=positionals[0];
 if(!['login','link','start','status','retry'].includes(action)){console.log('DeNest bridge: login | link --agent NAME --session ID --workspace PATH --project ID [--pipeline main] [--executable PATH] | start [--once] | status | retry --request ID. Optional: --profile NAME');return;}
 if(!/^[A-Za-z0-9_-]{1,60}$/.test(values.profile))throw Error('Invalid profile name');
 const root=join(homedir(),'.denest','bridge'),directory=join(root,values.profile);await mkdir(directory,{recursive:true,mode:0o700});
 // Serialize profile writes and prevent two workers from sharing one credential session.
 const lockPath=join(directory,'profile.lock');let lock;try{lock=await open(lockPath,'wx',0o600);await lock.writeFile(String(process.pid));}catch{throw Error('This profile is already running or was interrupted. Stop its process and review it before removing profile.lock');}
 let connection,sessionLock;
 try{
  const profile=await storage(directory),{data,save}=profile;
  if(action==='link'){
   if(!values.workspace||!values.project)throw Error('Workspace and project are required');command(values.agent,values.session,'validate');
   if(!/^[A-Za-z0-9_-]{1,100}$/.test(values.project)||!/^[A-Za-z0-9_-]{1,100}$/.test(values.pipeline))throw Error('Invalid project or pipeline ID');
   const workspace=await realpath(resolve(values.workspace));
   if(data.config&&Object.values(data.ledger).some(item=>['claiming','dispatching','running'].includes(item.status)))throw Error('Review interrupted work before relinking');
   connection=await connect(profile);await connection.call('get_pipeline',{projectId:values.project,pipelineId:values.pipeline});
   data.config={agent:values.agent,session:values.session,workspace,projectId:values.project,pipelineId:values.pipeline,...(values.executable?{executable:resolve(values.executable)}:{})};data.ledger={};await save();console.log('Linked the selected canvas and agent session. Automatic Send starts when you run start.');return;
  }
  if(action==='login'){connection=await connect(profile,{login:true});console.log('DeNest connection verified.');return;}
  if(action==='status'){console.log(JSON.stringify({linked:!!data.config,agent:data.config?.agent,projectId:data.config?.projectId,pipelineId:data.config?.pipelineId,requests:Object.entries(data.ledger).map(([id,item])=>({id,status:item.status}))},null,2));return;}
  if(!data.config)throw Error('Link this profile first');const config=data.config;
  const sessionHash=createHash('sha256').update(JSON.stringify([config.agent,config.session])).digest('hex');sessionLock=join(root,sessionHash+'.lock');
  let sessionFile;try{sessionFile=await open(sessionLock,'wx',0o600);await sessionFile.writeFile(String(process.pid));await sessionFile.close();}catch{sessionLock=undefined;throw Error('Another bridge owns this agent session; review its lock before restarting');}
  connection=await connect(profile);
  if(action==='retry'){
   if(!values.request||!data.ledger[values.request])throw Error('Choose a recorded request to retry after reviewing the agent session');
   const item=data.ledger[values.request];if(!['failed','interrupted'].includes(item.status))throw Error('Only failed or interrupted work can be retried');
   await connection.call('report_agent_delivery',{projectId:config.projectId,pipelineId:config.pipelineId,requestId:values.request,consumerId:item.consumerId,agent:config.agent,status:'retry'});delete data.ledger[values.request];await save();console.log('Request ready for retry. Run start.');return;
  }
  await recover(config,{call:connection.call,save,ledger:data.ledger});let stopped=false;process.once('SIGINT',()=>{stopped=true;});process.once('SIGTERM',()=>{stopped=true;});
  console.log('Automatic Send running for the selected canvas and agent CLI session.');
  do{
   try{
    const pipeline=await connection.call('get_pipeline',{projectId:config.projectId,pipelineId:config.pipelineId});
    for(const request of pipeline.requests){
     if(stopped)break;if(!['send','plan','chat','subgraph'].includes(request.type)||request.delivery||request.version&&request.version!==pipeline.meta.currentVersion)continue;
     const result=await deliver(config,request,{call:connection.call,save,ledger:data.ledger});if(result.failed)console.log('A request needs attention; inspect the agent session before retrying.');else if(result.completed)console.log('Canvas request completed.');
    }
   }catch{console.log('Connection or delivery needs attention; no ambiguous request will be relaunched.');if(values.once)throw Error('Automatic Send check failed');}
   if(!stopped&&!values.once)await new Promise(done=>setTimeout(done,5000));
  }while(!stopped&&!values.once);
 }finally{await connection?.close();if(sessionLock)await unlink(sessionLock);await lock.close();await unlink(lockPath);}
}
main().catch(error=>{console.error(error.message.startsWith('DeNest rejected')?error.message:'DeNest bridge: '+(error.message.includes('token')||error.message.includes('https:')?'Connection failed; run login and check the selected profile':error.message));process.exitCode=1;});
