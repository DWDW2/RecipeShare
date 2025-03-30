'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar } from 'lucide-react';

interface Order {
  id: string;
  restaurant: string;
  recipe: string;
  date: string;
  time: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке заказов');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        У вас пока нет заказов
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow p-4 border border-gray-200"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{order.recipe}</h3>
            <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
              {order.status === 'pending' && 'Ожидает подтверждения'}
              {order.status === 'confirmed' && 'Подтвержден'}
              {order.status === 'completed' && 'Выполнен'}
              {order.status === 'cancelled' && 'Отменен'}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{order.restaurant}</span>
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{order.date}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{order.time}</span>
            </p>
            <p className="text-sm">
              Количество порций: {order.quantity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 