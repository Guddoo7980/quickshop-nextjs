'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const ShopContext = createContext(null);

function readSavedCart() {
  try {
    return typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem('quickshop_cart') || '[]');
  } catch (error) {
    return [];
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(readSavedCart);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      return null;
    } catch (error) {
      return null;
    }
  });
  const [toast, setToast] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const savedCart = readSavedCart();
    setCart(savedCart);
    const storedToken = localStorage.getItem('quickshop_token');
    if (storedToken) setToken(storedToken);
    else setLoadingAuth(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('quickshop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        setCatalogError(error.response?.data?.message || 'Could not load the catalog. Please check the API and database configuration.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    api.get('/auth/me').then(response => {
      setLoadingAuth(false);
      setUser(response.data.user);
      localStorage.setItem('quickshop_user', JSON.stringify(response.data.user));
    }).catch(() => {
      setLoadingAuth(false);
      logout();
    });
  }, [token]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  function showToast(message) {
    setToast(message);
  }

  function addToCart(product) {
    if (product.stockCount < 1) {
      showToast('This product is currently out of stock.');
      return;
    }

    setCart(current => {
      const existing = current.find(item => item._id === product._id);

      if (existing) {
        return current.map(item => {
          if (item._id !== product._id) {
            return item;
          }

          return { ...item, quantity: Math.min(item.quantity + 1, product.stockCount, 20) };
        });
      }

      return [...current, { ...product, quantity: 1 }];
    });

    showToast(`${product.title} added to cart`);
  }

  function changeQuantity(productId, change) {
    setCart(current => current.map(item => {
      if (item._id !== productId) {
        return item;
      }

      return { ...item, quantity: Math.min(item.stockCount, 20, item.quantity + change) };
    }).filter(item => item.quantity > 0));
  }

  function removeFromCart(productId) {
    setCart(current => current.filter(item => item._id !== productId));
  }

  function signIn(data) {
    localStorage.setItem('quickshop_token', data.token);
    localStorage.setItem('quickshop_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setLoadingAuth(false);
  }

  function logout() {
    localStorage.removeItem('quickshop_token');
    localStorage.removeItem('quickshop_user');
    setToken(null);
    setUser(null);
    setLoadingAuth(false);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 25;
  const instantItems = cart.filter(item => item.deliveryType === 'INSTANT_10MIN');
  const standardItems = cart.filter(item => item.deliveryType === 'STANDARD');

  return (
    <ShopContext.Provider value={{
      cart,
      products,
      loading,
      catalogError,
      token,
      user,
      loadingAuth,
      toast,
      subtotal,
      cartCount,
      deliveryFee,
      instantItems,
      standardItems,
      addToCart,
      changeQuantity,
      removeFromCart,
      clearCart: () => setCart([]),
      signIn,
      logout,
      showToast
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
