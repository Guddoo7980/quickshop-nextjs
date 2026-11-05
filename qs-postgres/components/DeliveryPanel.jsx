'use client';
import { Bike, CheckCircle2, MapPin, Menu, Star, Zap } from 'lucide-react';

export default function DeliveryPanel() {
  return (
    <section className="delivery-panel">
      <div className="delivery-panel-header"><div className="delivery-mark"><Zap size={23} fill="white" /></div><span><strong>QuickShop</strong><small>Delivery Partner</small></span><Menu size={22} /></div>
      <div className="delivery-panel-body">
        <div className="on-duty"><CheckCircle2 size={18} fill="#14b978" color="white" /> On Duty</div>
        <div className="delivery-stats"><div><b>12</b><span>Deliveries</span></div><div><b>48 km</b><span>Today</span></div><div><b>4.9 <Star size={16} fill="#ffc400" color="#ffc400" /></b><span>Rating</span></div></div>
        <div className="delivery-note">Delivery partner dashboard illustration. Rider management is not activated for customers.</div>
        <div className="next-delivery"><strong>Sample delivery</strong><span>#QS784512</span><small><MapPin size={15} /> 2.0 km</small></div>
      </div>
    </section>
  );
}
