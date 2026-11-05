'use client';
import {useShop} from '../context/ShopContext';
export default function Toast(){const {toast}=useShop();return toast ? <div className='toast' role='status'>{toast}</div>:null}
