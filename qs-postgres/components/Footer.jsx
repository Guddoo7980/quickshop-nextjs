'use client';
import { Link } from '../lib/router';
import { ShoppingBag, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-logo"><span><ShoppingBag size={38} fill="#1177fb" /><Zap size={19} fill="#0c1e44" /></span><div><strong>QuickShop</strong><small>Shop Smart. Get Fast.</small></div></div>
      <p>Find groceries, essentials, electronics and more in one place.</p>
      <div className="footer-links"><Link to="/shop">Shop</Link><Link to="/orders">Orders</Link><Link to="/login">Account</Link></div>
      <small>© {new Date().getFullYear()} QuickShop. Educational MERN demo project.</small>
    </footer>
  );
}
