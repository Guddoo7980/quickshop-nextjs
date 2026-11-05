'use client';
import { Link } from '../lib/router';
import { Clock3, Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ product }) {
  const { addToCart } = useShop();
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <article className="product-card">
      <div className="product-image"><img src={product.image} alt={product.title} /></div>
      <h3>{product.title}</h3>
      <p className="product-unit">({product.unit})</p>
      <p className="product-price">₹{product.price} <del>₹{product.originalPrice}</del></p>
      <span className="discount-label">{discount}% OFF</span>
      <button className="add-button" type="button" onClick={() => addToCart(product)} disabled={product.stockCount === 0}>
        {product.stockCount ? <>Add <Plus size={14} /></> : 'Sold out'}
      </button>
    </article>
  );
}
