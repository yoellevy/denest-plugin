import {mkdir,readFile,writeFile,rename,open} from 'node:fs/promises';
import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {join} from 'node:path';

export async function storage(directory){
 await mkdir(directory,{recursive:true,mode:0o700});
 const keyPath=join(directory,'key');let key;
 try{key=await readFile(keyPath);}catch(error){if(error.code!=='ENOENT')throw error;const file=await open(keyPath,'wx',0o600);key=randomBytes(32);try{await file.writeFile(key);}finally{await file.close();}}
 if(key.length!==32)throw Error('Invalid bridge credential key');
 const file=join(directory,'profile.sealed');let data={ledger:{}};
 try{
  const bytes=JSON.parse(await readFile(file,'utf8')),decipher=createDecipheriv('aes-256-gcm',key,Buffer.from(bytes.iv,'base64'));
  decipher.setAuthTag(Buffer.from(bytes.tag,'base64'));data=JSON.parse(Buffer.concat([decipher.update(Buffer.from(bytes.data,'base64')),decipher.final()]).toString());
 }catch(error){if(error.code!=='ENOENT')throw Error('Cannot read bridge profile; credentials were not overwritten');}
 const save=async()=>{
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv),encrypted=Buffer.concat([cipher.update(JSON.stringify(data)),cipher.final()]);
  await writeFile(file+'.tmp',JSON.stringify({iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:encrypted.toString('base64')}),{mode:0o600});await rename(file+'.tmp',file);
 };
 return {data,save};
}
