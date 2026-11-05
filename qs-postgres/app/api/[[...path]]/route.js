import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { list,insert,update,readStore,mutateStore,storeMode } from '../../../lib/store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const send=(data,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail=(message,status=400)=>send({message},status);
const secret=()=>process.env.JWT_SECRET || (process.env.NODE_ENV==='production'?'':'quickshop-local-dev-only-secret-change-for-production');
const publicUser=u=>({id:String(u._id),name:u.name,email:u.email,role:u.role||'customer'});
async function authenticated(req){const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token||!secret())return null;try{const decoded=jwt.verify(token,secret());return (await list('users')).find(x=>String(x._id)===decoded.id)||null}catch{return null}}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
const id = item=>String(item._id);
async function handler(req,{params}){
 const parts=(await params).path||[];const route=parts.join('/');const method=req.method;
 try {
  if(route==='health' && method==='GET')return send({status:'ok',project:'QuickShop Next.js',storage:storeMode()});
  // The public storefront remains browseable even before a hosted database is connected.
  if(route==='products'&&method==='GET'){
   if(storeMode()==='unconfigured'){
    const {seedProducts}=await import('../../../lib/catalog');
    return send(seedProducts.map(p=>({...p,_id:p.sku,isActive:true})));
   }
   return send((await list('products')).filter(p=>p.isActive!==false).map(p=>({...p,_id:id(p)})));
  }
  if(parts[0]==='products'&&parts[1]&&method==='GET'){const product=(await list('products')).find(p=>id(p)===parts[1]||p.slug===parts[1]);return product?send(product):fail('Product not found.',404)}
  if(route==='auth/register'&&method==='POST'){
   const {name,email,password}=await req.json();const e=String(email||'').toLowerCase().trim();
   if(String(name||'').trim().length<2||!validEmail(e)||typeof password!=='string'||password.length<6)return fail('Enter a valid name, email and password (minimum 6 characters).');
   if((await list('users')).some(u=>u.email===e))return fail('This email is already registered.',409);
   const user=await insert('users',{name:String(name).trim(),email:e,password:await bcrypt.hash(password,10),role:'customer'});
   return send({token:jwt.sign({id:id(user)},secret(),{expiresIn:'7d'}),user:publicUser(user)},201);
  }
  if(route==='auth/login'&&method==='POST'){
   const {email,password}=await req.json();const user=(await list('users')).find(u=>u.email===String(email||'').toLowerCase().trim());
   if(!user||!await bcrypt.compare(String(password||''),user.password))return fail('Incorrect email or password.',401);
   return send({token:jwt.sign({id:id(user)},secret(),{expiresIn:'7d'}),user:publicUser(user)});
  }
  if(route==='subscribe'&&method==='POST'){
   const {email}=await req.json();const e=String(email||'').toLowerCase().trim();if(!validEmail(e))return fail('Please enter a valid email address.');
   if(!(await list('subscribers')).some(s=>s.email===e))await insert('subscribers',{email:e});return send({message:'You are subscribed. Thank you!'});
  }
  if(route==='stores/nearest'&&method==='GET'){
   const lat=Number(new URL(req.url).searchParams.get('lat'));const lng=Number(new URL(req.url).searchParams.get('lng'));
   if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return fail('Valid latitude and longitude are required.');
   const stores=await list('stores');const store=stores.find(s=>s.isActive&&distance(lat,lng,s.location.coordinates[1],s.location.coordinates[0])<=5)||null;return send({store,serviceable:!!store});
  }
  const user=await authenticated(req);if(!user)return fail('Please sign in to continue.',401);
  if(route==='auth/me'&&method==='GET')return send({user:publicUser(user)});
  if(route==='orders/mine'&&method==='GET')return send((await list('orders')).filter(o=>String(o.userId)===id(user)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,50));
  if(route==='orders'&&method==='POST'){
   const {items,deliveryAddress,paymentMethod}=await req.json();
   if(!Array.isArray(items)||!items.length||items.length>30)return fail('Your cart must contain 1 to 30 products.');
   if(paymentMethod!=='COD')return fail('Only Cash on Delivery is available.');
   if(!deliveryAddress||['name','phone','street','city','pincode'].some(k=>!String(deliveryAddress[k]||'').trim())||!/^[0-9]{6}$/.test(String(deliveryAddress.pincode)))return fail('Please complete the delivery address.');
   const quantities=new Map();for(const x of items){if(!x.productId||!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>20)return fail('Invalid product or quantity.');quantities.set(String(x.productId),(quantities.get(String(x.productId))||0)+x.quantity)}
   if([...quantities.values()].some(v=>v>20))return fail('Maximum 20 units of any product.');
   let order;
   order=await mutateStore(data=>{
    const lines=[];
    for(const [pid,quantity] of quantities){
     const product=data.products.find(p=>id(p)===pid&&p.isActive!==false);
     if(!product||product.stockCount<quantity){const e=new Error('An item is out of stock. Please review your cart.');e.statusCode=409;throw e}
     lines.push({product,quantity});
    }
    for(const {product,quantity} of lines) product.stockCount-=quantity;
    const result=makeOrder(user,lines,deliveryAddress);
    data.orders.push(result);
    return result;
   });
   return send(order,201);
  }
  if(parts[0]==='orders'&&parts[1]&&method==='GET'){
   const order=(await list('orders')).find(o=>id(o)===parts[1]&&(String(o.userId)===id(user)||user.role==='admin'));return order?send(order):fail('Order not found.',404);
  }
  if(parts[0]==='orders'&&parts[2]==='status'&&method==='PATCH'){
   if(user.role!=='admin')return fail('Not authorized.',403);
   const {status}=await req.json();if(!['PLACED','PACKING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].includes(status))return fail('Invalid status.');
   const old=(await list('orders')).find(o=>id(o)===parts[1]);if(!old)return fail('Order not found.',404);if(['DELIVERED','CANCELLED'].includes(old.orderStatus))return fail('This order is already closed.',409);
   const changed=await mutateStore(data=>{
    const found=data.orders.find(o=>id(o)===parts[1]);
    if(!found)throw Object.assign(new Error('Order not found.'),{statusCode:404});
    if(['DELIVERED','CANCELLED'].includes(found.orderStatus))throw Object.assign(new Error('This order is already closed.'),{statusCode:409});
    if(status==='CANCELLED')for(const item of found.items){const product=data.products.find(p=>id(p)===item.productId);if(product)product.stockCount+=item.quantity;}
    found.orderStatus=status;
    return found;
   });
   return send(changed);
  }
  return fail('Route not found.',404);
 }catch(error){console.error('API request failed:',route,error.message);return fail(error.statusCode?error.message:(error.message.includes('DATABASE_URL')?'Database not configured. Add DATABASE_URL from Neon Postgres in Vercel Environment Variables.':'Service temporarily unavailable. Check database configuration.'),error.statusCode||503)}
}
function makeOrder(user,lines,address){const orderItems=lines.map(({product:p,quantity})=>({ _id:randomUUID(),productId:id(p),title:p.title,image:p.image,quantity,priceAtPurchase:p.price,deliveryType:p.deliveryType}));const subtotal=orderItems.reduce((s,x)=>s+x.quantity*x.priceAtPurchase,0);return {_id:randomUUID(),orderNumber:'QS'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase(),userId:id(user),items:orderItems,deliveryAddress:address,subtotal,deliveryFee:subtotal>=499?0:25,totalAmount:subtotal+(subtotal>=499?0:25),paymentDetails:{provider:'COD',status:'PENDING'},orderStatus:'PLACED',createdAt:new Date().toISOString(),estimatedDeliveryTime:new Date(Date.now()+(orderItems.some(x=>x.deliveryType==='INSTANT_10MIN')?10:1440)*60000).toISOString()}}
function distance(a,b,c,d){const rad=Math.PI/180;const dl=(d-b)*rad,da=(c-a)*rad;const x=Math.sin(da/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(dl/2)**2;return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
export {handler as GET,handler as POST,handler as PATCH};
