'use client';

import { useState } from 'react';
import { Send, Calendar } from 'lucide-react';

interface BookingFormProps {
  selectedRestaurant: {
    name: string;
    position: google.maps.LatLngLiteral;
    address: string;
  } | null;
}

export function BookingForm({ selectedRestaurant }: BookingFormProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedRestaurant) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setCalendarLink(null);

    try {
      console.log('Отправка заказа:', {
        restaurant: selectedRestaurant.name,
        message: message
      });

      // Анализируем сообщение
      const analysisResponse = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant: selectedRestaurant.name,
          message: message,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Ошибка при анализе заказа');
      }

      const analysisData = await analysisResponse.json();
      console.log('Результат анализа:', analysisData);

      if (!analysisData.success) {
        throw new Error(analysisData.error || 'Ошибка при анализе заказа');
      }

      // Добавляем заказ в календарь
      const calendarResponse = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant: selectedRestaurant.name,
          recipe: analysisData.analysis.recipe,
          date: analysisData.analysis.date,
          time: analysisData.analysis.time,
          quantity: analysisData.analysis.quantity,
        }),
      });

      if (!calendarResponse.ok) {
        const errorData = await calendarResponse.json();
        throw new Error(errorData.error || 'Ошибка при добавлении в календарь');
      }

      const calendarData = await calendarResponse.json();
      console.log('Результат добавления в календарь:', calendarData);

      setCalendarLink(calendarData.htmlLink);
      setSuccess(true);
      setMessage('');
    } catch (err) {
      console.error('Ошибка при обработке заказа:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обработке заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">Заказать блюдо</h2>
      {selectedRestaurant ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Выбранный ресторан: {selectedRestaurant.name}</p>
          <p className="text-sm text-gray-600">Адрес: {selectedRestaurant.address}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-4">Выберите ресторан на карте</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Например: Я хочу сегодня заказать блины в 19:00"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={!selectedRestaurant || isSubmitting}
        />
        <button
          type="submit"
          disabled={!selectedRestaurant || isSubmitting || !message.trim()}
          className="bg-orange-500 text-white rounded-lg px-4 py-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {calendarLink && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Событие добавлено в календарь</span>
          </div>
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 hover:text-green-800 underline"
          >
            Открыть в Google Calendar
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
} 