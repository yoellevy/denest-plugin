import {randomUUID} from 'node:crypto';
import {runAgent,requestPrompt} from './adapters.mjs';

export async function deliver(config,request,{call,save,ledger,run=runAgent}){
 const key=request.id;
 if(ledger[key])return {skipped:true};
 const consumerId=randomUUID(),ids={projectId:config.projectId,pipelineId:config.pipelineId,requestId:key,consumerId,agent:config.agent};
 // Record before even claiming: a crash cannot silently launch the same request again.
 ledger[key]={consumerId,status:'claiming'};await save();
 const claim=await call('report_agent_delivery',{...ids,status:'received'});
 if(!claim.claimed){ledger[key].status='skipped';await save();return {skipped:true};}
 ledger[key].status='dispatching';await save();
 try{
  await call('report_agent_delivery',{...ids,status:'working'});
  const result=await run(config,requestPrompt(config,request,consumerId));
  const pipeline=await call('get_pipeline',{projectId:config.projectId,pipelineId:config.pipelineId});
  const completed=!pipeline.requests.some(item=>item.id===key);
  if(!completed)throw Error(result.code===0?'Agent ended without acknowledging the request':'Agent stopped before completing the request');
  ledger[key].status='completed';await save();return {completed:true};
 }catch{
  ledger[key].status='failed';await save();
  await call('report_agent_delivery',{...ids,status:'failed',message:'Automatic delivery stopped before verified completion. Review the agent session before retrying.'});
  return {failed:true};
 }
}

export async function recover(config,{call,save,ledger}){
 for(const [requestId,item] of Object.entries(ledger)){
  if(!['claiming','dispatching','running'].includes(item.status))continue;
  // No automatic relaunch after an ambiguous interruption.
  try{await call('report_agent_delivery',{projectId:config.projectId,pipelineId:config.pipelineId,requestId,consumerId:item.consumerId,agent:config.agent,status:'failed',message:'Bridge was interrupted. Review the agent session before retrying.'});}catch{}
  item.status='interrupted';await save();
 }
}
