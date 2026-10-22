import fs from 'node:fs';
import crypto from 'node:crypto';
const file=new URL('./.env',import.meta.url);
const example=fs.readFileSync(new URL('./.env.example',import.meta.url),'utf8');
const content=fs.existsSync(file)?fs.readFileSync(file,'utf8'):example;
const match=content.match(/^JWT_SECRET=(.*)$/m);
if(match?.[1]?.trim()?.length>=32) console.log('JWT secret already configured; no changes made.');
else {fs.writeFileSync(file,content.replace(/^JWT_SECRET=.*$/m,`JWT_SECRET=${crypto.randomBytes(48).toString('hex')}`),{mode:0o600});console.log('Generated unique JWT secret in server/.env. Keep this file private.');}
