'use client';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from '../lib/router';
import { Bell, ChevronDown, Home, MapPin, Menu, Search, ShoppingBag, ShoppingCart, UserRound, X, Zap } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('Kolkata');
  const [locationOpen, setLocationOpen] = useState(false);
  const { cartCount, user } = useShop();
  const navigate = useNavigate();

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="QuickShop home">
          <span className="brand-icon"><ShoppingBag size={40} fill="#1177fb" strokeWidth={2.5} /><Zap size={21} fill="#061b48" /></span>
          <span><strong>QuickShop</strong><small>Shop Smart. Get Fast.</small></span>
        </Link>

        <form className="header-search" onSubmit={submitSearch}>
          <Search size={20} />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search for products..." aria-label="Search products" />
        </form>

        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          <NavLink to="/" onClick={() => setMenuOpen(false)}><Home size={18} fill="currentColor" /> Home</NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop <ChevronDown size={13} /></NavLink>
          <NavLink to="/shop?delivery=INSTANT_10MIN" onClick={() => setMenuOpen(false)}>Quick Delivery <ChevronDown size={13} /></NavLink>
          <NavLink to="/orders" onClick={() => setMenuOpen(false)}>Track Order</NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>More <ChevronDown size={13} /></NavLink>
        </nav>

        <div className="header-actions">
          <div className="location-control">
            <button type="button" className="location-button" onClick={() => setLocationOpen(!locationOpen)}><MapPin size={19} fill="currentColor" /> <span>{location}</span> <ChevronDown size={13} /></button>
            {locationOpen && (
              <div className="location-menu">
                <strong>Choose your city</strong>
                {['Kolkata', 'Bengaluru', 'Mumbai', 'Delhi'].map(city => (
                  <button type="button" key={city} onClick={() => { setLocation(city); setLocationOpen(false); }}>{city}</button>
                ))}
                <small>City selection is for display. Live serviceability is not enabled yet.</small>
              </div>
            )}
          </div>
          <Link to="/checkout" className="icon-action" aria-label={`Cart, ${cartCount} items`}><ShoppingCart size={22} /><span className="count-bubble">{cartCount}</span></Link>
          <Link to="/orders" className="icon-action bell" aria-label="My orders"><Bell size={23} /></Link>
          <Link to={user ? '/orders' : '/login'} className="user-avatar" title={user ? user.name : 'Sign in'}>{user ? <UserRound size={25} /> : <img src="/images/avatar.webp" alt="Profile" />}</Link>
          <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}
