import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bookingSchema = z.object({
  restaurant: z.string().nullable(),
  recipe: z.string().nullable(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  guests: z.number().nullable(),
});

const bookingPrompt = `
Ты - ассистент для бронирования ресторанов. Твоя задача - помочь пользователю забронировать ресторан и выбрать рецепт.

Доступные рестораны: {restaurants}

Текущие данные бронирования:
- Ресторан: {restaurant}
- Рецепт: {recipe}
- Дата: {date}
- Время: {time}
- Количество гостей: {guests}

Правила:
1. Проверяй, существует ли упомянутый ресторан в списке доступных
2. Если ресторан не найден, сообщи об этом и предложи выбрать из доступных
3. После выбора ресторана, помоги выбрать рецепт
4. Собирай информацию по одной: сначала ресторан, потом рецепт, потом дату, время и количество гостей
5. Используй естественный язык и будь дружелюбным

Примеры ответов:
- "Я не нашел ресторан 'Хаяо Миодзаки' в списке доступных. Вот ближайшие рестораны: [список]"
- "Отлично! Вы выбрали ресторан [название]. Теперь давайте выберем рецепт. Какое блюдо вы хотели бы заказать?"
- "Хорошо, вы выбрали рецепт [название]. На какое время вы хотели бы забронировать столик?"
`;

export async function POST(request: Request) {
  try {
    const { message, bookingData, restaurants } = await request.json();

    const prompt = bookingPrompt
      .replace('{restaurants}', restaurants.join(', '))
      .replace('{restaurant}', bookingData.restaurant || 'не выбран')
      .replace('{recipe}', bookingData.recipe || 'не выбран')
      .replace('{date}', bookingData.date || 'не выбрана')
      .replace('{time}', bookingData.time || 'не выбрано')
      .replace('{guests}', bookingData.guests?.toString() || 'не выбрано');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message }
      ],
    });

    const response = completion.choices[0].message.content;

    // Парсим ответ для обновления данных бронирования
    let updatedBookingData = { ...bookingData };

    // Проверяем, содержит ли ответ информацию о ресторане
    if (response?.toLowerCase().includes('ресторан') && !bookingData.restaurant) {
      const restaurantMatch = restaurants.find(r =>
        response.toLowerCase().includes(r.toLowerCase())
      );
      if (restaurantMatch) {
        updatedBookingData.restaurant = restaurantMatch;
      }
    }

    // Проверяем, содержит ли ответ информацию о рецепте
    if (response?.toLowerCase().includes('рецепт') && !bookingData.recipe) {
      // Здесь можно добавить логику поиска рецепта в базе данных
      const recipeMatch = response.match(/рецепт "([^"]+)"/i);
      if (recipeMatch) {
        updatedBookingData.recipe = recipeMatch[1];
      }
    }

    // Проверяем, содержит ли ответ информацию о дате
    if (response?.toLowerCase().includes('дата') && !bookingData.date) {
      const dateMatch = response.match(/(\d{1,2}\.\d{1,2}\.\d{4})/);
      if (dateMatch) {
        updatedBookingData.date = dateMatch[1];
      }
    }

    // Проверяем, содержит ли ответ информацию о времени
    if (response?.toLowerCase().includes('время') && !bookingData.time) {
      const timeMatch = response.match(/(\d{1,2}:\d{2})/);
      if (timeMatch) {
        updatedBookingData.time = timeMatch[1];
      }
    }

    // Проверяем, содержит ли ответ информацию о количестве гостей
    if (response?.toLowerCase().includes('гост') && !bookingData.guests) {
      const guestsMatch = response.match(/(\d+)\s*(?:гост|человек)/i);
      if (guestsMatch) {
        updatedBookingData.guests = parseInt(guestsMatch[1]);
      }
    }

    return NextResponse.json({
      message: response,
      bookingData: updatedBookingData
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при обработке запроса' },
      { status: 500 }
    );
  }
} 