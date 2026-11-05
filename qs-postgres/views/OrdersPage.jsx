'use client';
import { useEffect, useState } from 'react';
import { Link } from '../lib/router';
import { Package, ShoppingBag } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useShop } from '../context/ShopContext';

export default function OrdersPage() {
  const { user } = useShop();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api.get('/orders/mine').then(response => setOrders(response.data)).catch(requestError => setError(errorMessage(requestError))).finally(() => setLoading(false));
  }, [user]);

  return <div className="page-container orders-page"><div className="page-title-row"><div><span className="eyebrow">ORDER HISTORY</span><h1>Your orders</h1><p>Track deliveries and review your previous purchases.</p></div><Package size={44} color="#0b6dff" /></div>
    {!user ? <div className="surface empty-state"><h2>Sign in to see your orders</h2><Link className="primary-button" to="/login">Sign in</Link></div> : loading ? <p>Loading orders...</p> : error ? <p className="inline-error">{error}</p> : orders.length === 0 ? <div className="surface empty-state"><ShoppingBag size={42} /><h2>No orders yet</h2><p>Start with some QuickShop favorites.</p><Link className="primary-button" to="/shop">Shop now</Link></div> : <div className="order-list">{orders.map(order => <Link className="surface order-list-item" key={order._id} to={`/track/${order._id}`}><div><small>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</small><h2>#{order.orderNumber}</h2><p>{order.items.map(item => `${item.title} ×${item.quantity}`).join(', ')}</p></div><div className="order-list-end"><span className="order-status-badge">{order.orderStatus.replaceAll('_', ' ')}</span><strong>₹{order.totalAmount}</strong><small>Track order →</small></div></Link>)}</div>}
  </div>;
}
