import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const port=31099;
const base=`http://127.0.0.1:${port}`;
let server;
async function request(path,options={}){
 const res=await fetch(base+'/api'+path,{...options,headers:{'Content-Type':'application/json',...options.headers}});
 return {status:res.status,data:await res.json()};
}
const post=(path,data,token)=>request(path,{method:'POST',body:JSON.stringify(data),headers:token?{Authorization:`Bearer ${token}`}:{}});

test('end-to-end: catalog, registration, sign in, order, tracking ownership, newsletter', {timeout:150000},async()=>{
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','-p',String(port)],{cwd:process.cwd(),env:{...process.env,DATABASE_URL:'',POSTGRES_URL:'',NODE_ENV:'development'},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<100;i++){
   if(server.exitCode!==null)throw new Error('Next.js dev server exited before startup');
   try {const r=await fetch(base+'/api/health');if(r.ok){ready=true;break}}catch{}
   await sleep(800);
  }
  assert.ok(ready,'Development server should start');
  const health=await request('/health');assert.equal(health.status,200);assert.equal(health.data.storage,'local-json');
  const catalog=await request('/products');assert.equal(catalog.status,200);assert.ok(catalog.data.length>=12,'Seeded products should be available');
  const email=`test-${Date.now()}@example.test`,password='SafeTest123!';
  const registered=await post('/auth/register',{name:'Test Shopper',email,password});assert.equal(registered.status,201,JSON.stringify(registered.data));
  const token=registered.data.token;assert.ok(token);
  const duplicate=await post('/auth/register',{name:'Test Shopper',email,password});assert.equal(duplicate.status,409);
  const wrong=await post('/auth/login',{email,password:'incorrect'});assert.equal(wrong.status,401);
  const login=await post('/auth/login',{email,password});assert.equal(login.status,200);
  const me=await request('/auth/me',{headers:{Authorization:`Bearer ${token}`}});assert.equal(me.data.user.email,email);
  const unauth=await request('/orders/mine');assert.equal(unauth.status,401);
  const product=catalog.data.find(x=>x.stockCount>0);
  const order=await post('/orders',{items:[{productId:product._id,quantity:1}],deliveryAddress:{name:'Test Shopper',phone:'9876543210',street:'12 Test Street',city:'Kolkata',pincode:'700001'},paymentMethod:'COD'},token);
  assert.equal(order.status,201,JSON.stringify(order.data));assert.equal(order.data.orderStatus,'PLACED');
  const mine=await request('/orders/mine',{headers:{Authorization:`Bearer ${token}`}});assert.equal(mine.status,200);assert.ok(mine.data.some(x=>x._id===order.data._id));
  const tracking=await request(`/orders/${order.data._id}`,{headers:{Authorization:`Bearer ${token}`}});assert.equal(tracking.status,200);
  const newsletter=await post('/subscribe',{email});assert.equal(newsletter.status,200);
  const second=await post('/auth/register',{name:'Second Shopper',email:`second-${email}`,password});assert.equal(second.status,201);
  const forbidden=await request(`/orders/${order.data._id}`,{headers:{Authorization:`Bearer ${second.data.token}`}});assert.equal(forbidden.status,404);
 } finally {server.kill('SIGTERM')}
});
