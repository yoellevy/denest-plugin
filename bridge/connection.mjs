import {createServer} from 'node:http';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {spawn} from 'node:child_process';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';

export async function connect(profile,{login=false}={}){
 const {data,save}=profile;data.auth??={};let state,callback,server,timer;
 const auth=data.auth;
 if(login){
  state=randomBytes(24).toString('base64url');
  server=createServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(auth.port??0,'127.0.0.1',resolve);});
  auth.port=server.address().port;await save();
  callback=new Promise((resolve,reject)=>{
   timer=setTimeout(()=>reject(Error('Sign-in timed out; run login again')),180000);
   server.on('request',(request,response)=>{
    let url;try{url=new URL(request.url,'http://127.0.0.1');}catch{response.writeHead(400).end();return;}
    const supplied=Buffer.from(url.searchParams.get('state')??''),expected=Buffer.from(state);
    if(request.method!=='GET'||url.pathname!=='/callback'||supplied.length!==expected.length||!timingSafeEqual(supplied,expected)){response.writeHead(400).end('Invalid callback');return;}
    if(url.searchParams.has('error')||!url.searchParams.get('code')){response.writeHead(400).end('Sign-in was not completed');reject(Error('Sign-in was not completed'));return;}
    response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'"}).end('<!doctype html><title>DeNest connected</title><body style="font:18px system-ui;padding:3rem">DeNest connected. You can return to your agent.<script>window.close()</script></body>');
    resolve(url.searchParams.get('code'));
   });
  });callback.catch(()=>{});
 }
 const provider={
  get redirectUrl(){return `http://127.0.0.1:${auth.port??49176}/callback`;},
  get clientMetadata(){return {client_name:'DeNest Automatic Send',redirect_uris:[this.redirectUrl],grant_types:['authorization_code','refresh_token'],response_types:['code'],token_endpoint_auth_method:'none',scope:'denest:mcp'};},
  state:()=>state,
  clientInformation:()=>auth.client,
  saveClientInformation:async value=>{auth.client=value;await save();},
  tokens:()=>auth.tokens,
  saveTokens:async value=>{auth.tokens=value;await save();},
  saveCodeVerifier:async value=>{auth.verifier=value;await save();},
  codeVerifier:()=>auth.verifier,
  redirectToAuthorization:async url=>{
   if(!login)throw Error('Bridge sign-in required: run login');
   const executable=process.platform==='win32'?'explorer.exe':process.platform==='darwin'?'open':'xdg-open';
   const child=spawn(executable,[url.href],{shell:false,windowsHide:true,stdio:'ignore'});child.on('error',()=>{});child.unref();
   console.log('Complete DeNest sign-in in your browser.');
  },
  invalidateCredentials:async scope=>{if(scope==='all'||scope==='client')delete auth.client;if(scope==='all'||scope==='tokens')delete auth.tokens;if(scope==='all'||scope==='verifier')delete auth.verifier;await save();}
 };
 const make=()=>({client:new Client({name:'denest-automatic-send',version:'0.1.0'}),transport:new StreamableHTTPClientTransport(new URL('https://denest.ai/api/mcp'),{authProvider:provider})});
 let {client,transport}=make();
 try{
  try{await client.connect(transport);}catch(error){
   if(!login||error.constructor.name!=='UnauthorizedError')throw error;
   const code=await callback;await transport.finishAuth(code);await client.close();({client,transport}=make());await client.connect(transport);
  }
  const call=async(name,args={})=>{
   const result=await client.callTool({name,arguments:args});if(result.isError)throw Error('DeNest rejected '+name);
   if(result.structuredContent)return result.structuredContent;
   const text=result.content.find(item=>item.type==='text')?.text;if(!text)throw Error('Invalid DeNest response');return JSON.parse(text);
  };
  await call('list_projects');return {call,close:()=>client.close()};
 }catch(error){await client.close().catch(()=>{});throw error;}finally{clearTimeout(timer);server?.close();}
}
