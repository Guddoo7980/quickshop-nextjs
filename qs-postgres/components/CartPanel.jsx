'use client';
import { Link } from '../lib/router';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CartPanel() {
  const { cart, cartCount, subtotal, changeQuantity, removeFromCart } = useShop();

  return (
    <section className="surface cart-panel">
      <h2><ShoppingCart size={21} fill="#1170f9" color="#1170f9" /> Your Cart ({cartCount})</h2>
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">Your cart is empty.<br />Add something delicious!</div>
        ) : cart.map(item => (
          <div className="cart-item" key={item._id}>
            <div className="cart-item-image"><img src={item.image} alt={item.title} /></div>
            <div className="cart-item-detail"><strong>{item.title}</strong><small>{item.unit}</small>
              <div className="quantity-control">
                <button onClick={() => changeQuantity(item._id, -1)} aria-label={`Remove one ${item.title}`}><Minus size={14} /></button>
                <b>{item.quantity}</b>
                <button onClick={() => changeQuantity(item._id, 1)} aria-label={`Add one ${item.title}`}><Plus size={14} /></button>
              </div>
            </div>
            <div className="cart-item-end"><strong>₹{item.price * item.quantity}</strong><button className="trash-button" onClick={() => removeFromCart(item._id)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div>
          </div>
        ))}
      </div>
      <div className="cart-total"><strong>Subtotal</strong><strong>₹{subtotal}</strong></div>
      <Link to="/checkout" className={`primary-button checkout-link ${cart.length === 0 ? 'disabled-link' : ''}`}>Proceed to Checkout <span>→</span></Link>
    </section>
  );
}
