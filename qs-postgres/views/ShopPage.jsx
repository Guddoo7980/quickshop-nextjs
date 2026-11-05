'use client';
import { useMemo, useState } from 'react';
import { useSearchParams } from '../lib/router';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

const categories = ['All', 'Groceries', 'Fruits & Vegetables', 'Dairy & Bakery', 'Snacks & Beverages', 'Electronics', 'Fashion', 'Home & Kitchen'];

export default function ShopPage() {
  const { products, loading, catalogError } = useShop();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const category = params.get('category') || 'All';
  const search = params.get('search') || '';
  const delivery = params.get('delivery') || '';

  const visibleProducts = useMemo(() => {
    const result = products.filter(product => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
      const matchesDelivery = !delivery || product.deliveryType === delivery;
      return matchesCategory && matchesSearch && matchesDelivery;
    });

    if (sort === 'low') {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === 'high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, category, search, delivery, sort]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);

    if (!value || value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setParams(next);
  }

  return (
    <div className="page-container shop-page">
      <div className="page-title-row"><div><span className="eyebrow">EVERYDAY ESSENTIALS</span><h1>Shop all products</h1><p>Discover fresh groceries and great finds, all in one place.</p></div><ShoppingBag size={48} color="#086af6" /></div>
      <div className="shop-toolbar"><div className="shop-search"><Search size={19} /><input placeholder="Search the catalog" value={search} onChange={event => updateParam('search', event.target.value)} /></div><label><SlidersHorizontal size={18} /> Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></label></div>
      <div className="category-chips">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => updateParam('category', item)}>{item}</button>)}</div>
      <div className="delivery-filter"><button className={!delivery ? 'active' : ''} onClick={() => updateParam('delivery', '')}>All delivery types</button><button className={delivery === 'INSTANT_10MIN' ? 'active' : ''} onClick={() => updateParam('delivery', 'INSTANT_10MIN')}>⚡ 10-minute essentials</button><button className={delivery === 'STANDARD' ? 'active' : ''} onClick={() => updateParam('delivery', 'STANDARD')}>📦 Standard delivery</button></div>
      <p className="result-count">{visibleProducts.length} products</p>
      {catalogError && <p className="inline-error">{catalogError}</p>}
      {loading ? <p>Loading products...</p> : <div className="shop-grid">{visibleProducts.map(product => <ProductCard key={product._id} product={product} />)}</div>}
      {!loading && visibleProducts.length === 0 && <p className="muted-message">No products match your filters.</p>}
    </div>
  );
}
