'use client';
import { Suspense } from 'react';
import View from '../../views/OrdersPage';
export default function Page(){return <Suspense fallback={<div className='page-container'>Loading...</div>}><View/></Suspense>}
