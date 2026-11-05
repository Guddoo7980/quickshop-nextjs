'use client';
import { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { BadgeCheck, Clock3, Headphones, Mail, ShieldCheck, ShoppingBag, Star, Truck, Zap } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import api, { errorMessage } from '../lib/api';
import CartPanel from '../components/CartPanel';
import CategorySection from '../components/CategorySection';
import ProductCard from '../components/ProductCard';
import TrackingPreview from '../components/TrackingPreview';
import DeliveryPanel from '../components/DeliveryPanel';

export default function HomePage() {
  const { products, loading, catalogError, user } = useShop();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const [latestOrder, setLatestOrder] = useState(null);
  const [dealSeconds, setDealSeconds] = useState(12 * 60 + 45);

  useEffect(() => {
    const interval = setInterval(() => setDealSeconds(current => current > 0 ? current - 1 : 12 * 60 + 45), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) {
      setLatestOrder(null);
      return;
    }

    api.get('/orders/mine').then(response => setLatestOrder(response.data[0] || null)).catch(() => {});
  }, [user]);

  async function handleSubscribe(event) {
    event.preventDefault();

    try {
      const response = await api.post('/subscribe', { email });
      setSubscribeStatus(response.data.message);
      setEmail('');
    } catch (error) {
      setSubscribeStatus(errorMessage(error));
    }
  }

  const minutes = String(Math.floor(dealSeconds / 60)).padStart(2, '0');
  const seconds = String(dealSeconds % 60).padStart(2, '0');

  return (
    <div className="home-dashboard">
      <div className="dashboard-left">
        <section className="hero-banner">
          <img className="hero-rider-image" src="/images/hero-rider.webp" alt="QuickShop delivery partner on a scooter" />
          <div className="hero-copy">
            <h1>Everything You Need<br />in Just <span>10 Minutes!</span></h1>
            <p>Groceries & More <b>·</b> Instant Delivery <b>·</b> All in One Place</p>
            <div className="hero-benefits"><span><Zap size={30} fill="#ffd21c" color="#ffd21c" /> <small>10-Min<br />Delivery</small></span><span><Truck size={30} color="#69bdff" /> <small>Free Delivery<br /><em>on Orders &gt; ₹499</em></small></span><span><ShieldCheck size={31} color="#20cf94" /> <small>Secure<br />Payments</small></span></div>
            <Link className="primary-button hero-cta" to="/shop">Start Shopping →</Link>
          </div>
          <div className="hero-sticker">10 Min<br />Delivery <span>〰</span></div>
        </section>

        <CategorySection />
        <TrackingPreview order={latestOrder} />

        <div className="left-bottom-row">
          <section className="surface order-mini-card">
            <div className="section-heading"><h2><ShoppingBag size={18} fill="#1678ff" color="#1678ff" /> Your Orders</h2><Link to="/orders">View All →</Link></div>
            <Link to={latestOrder ? `/track/${latestOrder._id}` : '/orders'} className="mini-order">
              <img src={latestOrder?.items?.[0]?.image || '/images/headphones.webp'} alt="Last order" />
              <span><strong>{latestOrder?.items?.[0]?.title || 'boAt Headphones'}</strong><small>{latestOrder ? `#${latestOrder.orderNumber}` : 'Sample order #QS784510'}</small></span>
              <b className="delivered-badge">{latestOrder?.orderStatus || 'Sample'}</b><span>›</span>
            </Link>
          </section>
          <section className="surface why-card"><h2>Why Choose QuickShop?</h2><div className="why-list"><div><Zap size={23} fill="#0c6fff" /> <strong>10 Min</strong><span>Delivery*</span></div><div><ShieldCheck size={23} fill="#0c6fff" /><strong>Secure</strong><span>Checkout</span></div><div><Headphones size={23} /><strong>Friendly</strong><span>Support</span></div><div><Star size={23} fill="#0c6fff" /><strong>Best</strong><span>Deals</span></div></div></section>
        </div>
      </div>

      <div className="dashboard-middle">
        <section className="surface deals-panel">
          <div className="deals-heading"><h2>❤️Hot Deals 🔥</h2><div className="deal-timer"><span>00</span><b>:</b><span>{minutes}</span><b>:</b><span>{seconds}</span><small>Demo timer</small></div><Link to="/shop">View All →</Link></div>
          {catalogError && <p className="inline-error">{catalogError}</p>}
          {loading && <p className="muted-message">Loading deals...</p>}
          <div className="deals-grid">{products.slice(0, 4).map(product => <ProductCard key={product._id} product={product} />)}</div>
          <p className="deals-disclaimer">Offer countdown is illustrative; product stock and prices are managed by QuickShop.</p>
        </section>
        <Link to="/shop" className="offer-panel" aria-label="Explore special offers"><img src="/images/offer-banner.webp" alt="Special offers — up to 50% off" /></Link>
        <section className="surface newsletter-panel"><Mail size={27} color="#0667ef" /><div><h2>Stay Updated</h2><p>Get exclusive offers and updates</p></div><form onSubmit={handleSubscribe}><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email address" required /><button className="primary-button" type="submit">Subscribe</button></form>{subscribeStatus && <small className="subscribe-feedback">{subscribeStatus}</small>}</section>
      </div>

      <div className="dashboard-right">
        <CartPanel />
        <DeliveryPanel />
      </div>
    </div>
  );
}
