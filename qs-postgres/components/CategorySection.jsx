'use client';
import { Link } from '../lib/router';

const categories = [
  { name: 'Groceries', image: 'groceries.webp' },
  { name: 'Fruits & Vegetables', image: 'apple.webp' },
  { name: 'Dairy & Bakery', image: 'dairy.webp' },
  { name: 'Snacks & Beverages', image: 'snacks.webp' },
  { name: 'Electronics', image: 'electronics.webp' },
  { name: 'Fashion', image: 'fashion.webp' },
  { name: 'Home & Kitchen', image: 'kitchen.webp' }
];

export default function CategorySection() {
  return (
    <section className="surface category-section">
      <div className="section-heading"><h2>Shop by Category</h2><Link to="/shop">View All →</Link></div>
      <div className="category-list">
        {categories.map(category => (
          <Link key={category.name} to={`/shop?category=${encodeURIComponent(category.name)}`} className="category-item">
            <span className="category-image"><img src={`/images/${category.image}`} alt="" /></span>
            <strong>{category.name}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
