'use client';
import { Link } from '../lib/router';

export default function NotFoundPage() {
  return <div className="page-container empty-state"><h1>Page not found</h1><p>We couldn't find that page.</p><Link className="primary-button" to="/">Return home</Link></div>;
}
