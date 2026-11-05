'use client';
import { useEffect, useState } from 'react';
import { Link, useParams } from '../lib/router';
import dynamic from 'next/dynamic';
const RiderMap = dynamic(() => import('../components/RiderMap'), { ssr: false });


import { CheckCircle2, Circle, MapPin, Package, Truck } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useShop } from '../context/ShopContext';

const steps = ['PLACED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];



export default function TrackPage() {
  const { orderId } = useParams();
  const { user, token } = useShop();
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api.get(`/orders/${orderId}`).then(response => {
      setOrder(response.data);
      const coords = response.data.assignedPartnerId?.currentLocation?.coordinates;

      if (coords && (coords[0] !== 0 || coords[1] !== 0)) {
        setLocation({ latitude: coords[1], longitude: coords[0] });
      }
    }).catch(requestError => setError(errorMessage(requestError))).finally(() => setLoading(false));
  }, [orderId, user]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const poll = setInterval(async () => { try { const response = await api.get(`/orders/${orderId}`); setOrder(response.data); const coords = response.data.assignedPartnerId?.currentLocation?.coordinates; if (coords && (coords[0] !== 0 || coords[1] !== 0)) setLocation({ latitude: coords[1], longitude: coords[0] }); } catch {} }, 12000);
    return () => clearInterval(poll);

  }, [token, user, orderId]);

  if (!user) {
    return <div className="page-container empty-state"><h1>Sign in to track your order</h1><Link to="/login" className="primary-button">Sign in</Link></div>;
  }

  if (loading) {
    return <div className="page-container"><p>Loading tracking information...</p></div>;
  }

  if (error || !order) {
    return <div className="page-container"><p className="inline-error">{error || 'Order not found.'}</p><Link to="/orders">Back to orders</Link></div>;
  }

  const currentStep = steps.indexOf(order.orderStatus);

  return <div className="page-container track-page"><Link to="/orders" className="back-link">← All orders</Link><div className="page-title-row"><div><span className="eyebrow">ORDER TRACKING</span><h1>Order #{order.orderNumber}</h1><p>Placed {new Date(order.createdAt).toLocaleString('en-IN')}</p></div><span className="order-status-badge large">{order.orderStatus.replaceAll('_', ' ')}</span></div>
    <div className="track-layout"><section className="surface track-details"><h2>Delivery progress</h2><div className="track-timeline">{steps.map((step, index) => <div className={`timeline-step ${index <= currentStep ? 'complete' : ''}`} key={step}>{index <= currentStep ? <CheckCircle2 size={24} /> : <Circle size={24} />}<span>{step.replaceAll('_', ' ')}</span></div>)}</div><h2>Shipping address</h2><p>{order.deliveryAddress.name}<br />{order.deliveryAddress.street}<br />{order.deliveryAddress.city} - {order.deliveryAddress.pincode}<br />{order.deliveryAddress.phone}</p><h2>Order items</h2>{order.items.map(item => <div className="checkout-item" key={item._id}><img src={item.image} alt="" /><span>{item.title}<small>{item.quantity} × ₹{item.priceAtPurchase}</small></span></div>)}<div className="summary-total"><b>Total</b><b>₹{order.totalAmount}</b></div></section>
    <section className="surface track-map-section"><h2><MapPin size={21} /> Delivery location</h2>{location ? <div className="live-map"><RiderMap location={location} /></div> : <div className="map-placeholder"><img src="/images/tracking-map.webp" alt="Illustrative route, not live location" /><div><Truck size={25} /><strong>No live rider GPS yet</strong><p>Live map will appear when an authorized rider sends location updates. This picture is only an illustration.</p></div></div>}<p className="muted-message">Order status refreshes automatically every 12 seconds. Live GPS requires an assigned rider and a connected fleet system.</p></section></div>
  </div>;
}
