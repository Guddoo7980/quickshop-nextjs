'use client';
import { useState } from 'react';
import { Link, useNavigate } from '../lib/router';
import { CreditCard, MapPin, PackageCheck, ShoppingCart, Truck, Zap } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useShop } from '../context/ShopContext';

export default function CheckoutPage() {
  const { cart, instantItems, standardItems, subtotal, deliveryFee, user, clearCart } = useShop();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState({ name: user?.name || '', phone: '', street: '', city: 'Kolkata', pincode: '' });

  function updateAddress(event) {
    setAddress(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function placeOrder(event) {
    event.preventDefault();
    setError('');

    if (!user) {
      navigate('/login?from=/checkout');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/orders', {
        items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
        deliveryAddress: address,
        paymentMethod: 'COD'
      });

      clearCart();
      navigate(`/track/${response.data._id}`, { state: { justPlaced: true } });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return <div className="page-container empty-checkout"><ShoppingCart size={45} /><h1>Your cart is empty</h1><p>Add some products before checking out.</p><Link to="/shop" className="primary-button">Continue shopping</Link></div>;
  }

  return (
    <div className="page-container checkout-page"><h1>Secure checkout</h1><p className="page-intro">Review your cart, enter your address and place an order.</p>
      <form onSubmit={placeOrder} className="checkout-layout">
        <div className="checkout-main">
          <section className="surface checkout-block"><h2><MapPin size={21} /> Delivery address</h2><div className="address-grid"><label>Full name<input name="name" value={address.name} onChange={updateAddress} required /></label><label>Phone number<input name="phone" value={address.phone} onChange={updateAddress} required pattern="[0-9+ -]{10,15}" placeholder="10-digit mobile number" /></label><label className="wide-field">Street address<input name="street" value={address.street} onChange={updateAddress} required placeholder="House / building / street" /></label><label>City<input name="city" value={address.city} onChange={updateAddress} required /></label><label>PIN code<input name="pincode" value={address.pincode} onChange={updateAddress} required pattern="[0-9]{6}" placeholder="6-digit PIN code" /></label></div></section>
          <section className="surface checkout-block"><h2><PackageCheck size={21} /> Your items</h2>
            {instantItems.length > 0 && <OrderGroup title="10-minute essentials" items={instantItems} icon={<Zap size={18} />} />}
            {standardItems.length > 0 && <OrderGroup title="Standard delivery products" items={standardItems} icon={<Truck size={18} />} />}
            {instantItems.length > 0 && standardItems.length > 0 && <p className="info-note">This cart contains both delivery types. They appear in one order here, but may be fulfilled separately in a production deployment.</p>}
          </section>
          <section className="surface checkout-block"><h2><CreditCard size={21} /> Payment method</h2><label className="payment-choice"><input type="radio" name="payment" checked readOnly /> Cash on Delivery (COD)</label><p className="muted-message">Online payments are not connected in this demo. No card information is collected.</p></section>
        </div>
        <aside className="surface checkout-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>₹{subtotal}</strong></div><div><span>Delivery fee</span><strong>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</strong></div><hr /><div className="summary-total"><b>Total</b><b>₹{subtotal + deliveryFee}</b></div>{subtotal < 499 && <small>Add ₹{499 - subtotal} more for free delivery.</small>}{error && <p className="inline-error">{error}</p>}<button className="primary-button full-width" disabled={submitting}>{submitting ? 'Placing order...' : user ? 'Place COD Order →' : 'Sign in to place order →'}</button></aside>
      </form>
    </div>
  );
}

function OrderGroup({ title, items, icon }) {
  return <div className="checkout-order-group"><h3>{icon} {title}</h3>{items.map(item => <div className="checkout-item" key={item._id}><img src={item.image} alt="" /><span>{item.title}<small>{item.quantity} × ₹{item.price}</small></span><strong>₹{item.price * item.quantity}</strong></div>)}</div>;
}
