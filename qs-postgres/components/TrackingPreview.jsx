'use client';
import { Link } from '../lib/router';
import { Check, CircleDot, Headphones, MapPin, MessageCircle, Phone, Store, Truck } from 'lucide-react';

const steps = [
  { name: 'Order Placed', time: '10:20 AM', state: 'done' },
  { name: 'Preparing Your Order', time: '10:22 AM', state: 'done' },
  { name: 'Out for Delivery', time: '10:28 AM', state: 'active' },
  { name: 'Delivered', time: 'Soon...', state: 'future' }
];

export default function TrackingPreview({ order }) {
  const actualSteps = order ? [
    { name: 'Order Placed', state: 'done' },
    { name: 'Preparing Your Order', state: ['PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'done' : 'future' },
    { name: 'Out for Delivery', state: order.orderStatus === 'OUT_FOR_DELIVERY' ? 'active' : order.orderStatus === 'DELIVERED' ? 'done' : 'future' },
    { name: 'Delivered', state: order.orderStatus === 'DELIVERED' ? 'done' : 'future' }
  ] : steps;

  return (
    <section className="surface tracking-preview">
      <div className="section-heading"><h2><MapPin size={25} fill="#1176ff" color="#1176ff" /> Live Order Tracking</h2><span className="status-pill">{order ? `Order #${order.orderNumber}` : 'Sample order #QS784512'} <Check size={15} /></span></div>
      <div className="tracking-grid">
        <div className="tracking-steps">
          {actualSteps.map((step, index) => (
            <div key={step.name} className={`tracking-step ${step.state}`}>
              <span className="step-dot">{step.state === 'done' ? <Check size={17} /> : <CircleDot size={15} />}</span>
              <div><strong>{step.name}</strong><small>{step.time || (step.state === 'future' ? 'Upcoming' : 'Updated')}</small></div>
            </div>
          ))}
        </div>
        <div className="tracking-map-preview">
          <img src="/images/tracking-map.webp" alt="Illustrative delivery route map" />
          <div className="map-eta">{order ? 'Track your order' : 'Sample: Rider in 2 min · 0.5 km'}</div>
          {order && <Link to={`/track/${order._id}`} className="map-action">View live status →</Link>}
        </div>
        <div className="rider-card">
          <img src="/images/rider-avatar.webp" alt="Illustrative rider avatar" className="rider-avatar" />
          <strong>{order?.assignedPartnerId?.fullName || 'Rohit Kumar'}</strong>
          <span className="rider-rating">★★★★★ <small>4.9 (sample profile)</small></span>
          <div className="rider-actions"><button type="button" title="Available after rider assignment" disabled><Phone size={14} /> Call</button><button type="button" title="Available after rider assignment" disabled><MessageCircle size={14} /> Chat</button></div>
          <div className="rider-location"><span>●</span> {order ? 'See tracking page for updates' : 'Demo preview — not live GPS'}</div>
        </div>
      </div>
    </section>
  );
}
