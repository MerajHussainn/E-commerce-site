// src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage on mount & when user changes
  useEffect(() => {
    const storageKey = user?.uid ? `orders_${user.uid}` : 'dairyOrders';
    const savedOrders = localStorage.getItem(storageKey);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    } else {
      // Check fallback key
      const fallback = localStorage.getItem('dairyOrders');
      if (fallback) {
        try {
          setOrders(JSON.parse(fallback));
        } catch (_) {}
      }
    }
  }, [user]);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    const storageKey = user?.uid ? `orders_${user.uid}` : 'dairyOrders';
    localStorage.setItem(storageKey, JSON.stringify(orders));
    // Also save to generic key for cross-session compatibility
    localStorage.setItem('dairyOrders', JSON.stringify(orders));
  }, [orders, user]);

  const addOrder = (orderData) => {
    const orderId = orderData.orderId || `ORD${Date.now()}`;
    const newOrder = {
      ...orderData,
      id: orderId,
      orderId: orderId,
      userId: user?.uid || 'guest',
      orderDate: orderData.orderDate || new Date().toISOString(),
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'Processing',
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'cash_on_delivery' ? 'Pending' : 'Paid'),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      tracking: {
        ordered: new Date().toISOString(),
        processing: new Date().toISOString(),
        shipped: null,
        delivered: null
      }
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    // Automatically trigger real backend-style business event notification
    notificationService.triggerOrderPlaced(newOrder, user).catch((err) => {
      console.warn('Failed to dispatch order placed notification:', err);
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId, status, extra = {}) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId || order.orderId === orderId) {
          const updatedTracking = { ...(order.tracking || {}) };
          const nowIso = new Date().toISOString();
          const sLower = (status || '').toLowerCase();

          if (sLower === 'shipped') updatedTracking.shipped = nowIso;
          if (sLower === 'delivered') updatedTracking.delivered = nowIso;

          return { 
            ...order, 
            status, 
            tracking: updatedTracking,
            ...(extra.paymentStatus ? { paymentStatus: extra.paymentStatus } : {})
          };
        }
        return order;
      })
    );

    // Trigger status update push notification
    notificationService.triggerOrderStatusUpdate(orderId, status, {
      userId: user?.uid,
      ...extra
    }).catch((err) => {
      console.warn('Failed to dispatch status update notification:', err);
    });
  };

  const cancelOrder = (orderId, reason = 'Customer request') => {
    updateOrderStatus(orderId, 'Cancelled', {
      paymentStatus: 'Refunded',
      reason,
      amount: orders.find(o => o.id === orderId || o.orderId === orderId)?.totalAmount
    });
  };

  const requestReturn = (orderId, reason = 'Product not as expected') => {
    updateOrderStatus(orderId, 'Return_Requested', { reason });
  };

  const getRecentOrders = (limit = 5) => {
    return orders.slice(0, limit);
  };

  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId || order.orderId === orderId);
  };

  const value = {
    orders,
    addOrder,
    updateOrderStatus,
    cancelOrder,
    requestReturn,
    getRecentOrders,
    getOrderById
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
