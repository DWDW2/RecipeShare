import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bookingPrompt = `
Ты - система анализа заказов. Твоя задача - извлечь из сообщения пользователя информацию о заказе.
Извлеки следующую информацию:
1. Название блюда/рецепта
2. Дату заказа (если указана)
3. Время заказа (если указано)
4. Количество порций (если указано)

Правила обработки времени:
1. Если указано "сегодня" - используй "сегодня"
2. Если указано "завтра" - используй "завтра"
3. Если указано "послезавтра" - используй "послезавтра"
4. Если указано "через X дней" - используй "через X дней"
5. Если указано конкретное время (например, "в 19:00" или "в 7 вечера") - используй его
6. Если время не указано, используй текущее время в формате "HH:mm"

Примеры:
- "Я хочу сегодня заказать блины в 19:00" -> { recipe: "блины", date: "сегодня", time: "19:00" }
- "Завтра в 7 вечера закажу пасту" -> { recipe: "паста", date: "завтра", time: "19:00" }
- "Через 2 дня хочу заказать суши" -> { recipe: "суши", date: "через 2 дня", time: "текущее время в формате HH:mm" }

Ресторан: {restaurant}

Ответ должен быть в формате JSON с полями: recipe, date, time, quantity
`;

export async function POST(request: Request) {
  try {
    const { restaurant, message } = await request.json();

    console.log('Получен запрос на анализ заказа:', { restaurant, message });

    const prompt = bookingPrompt.replace('{restaurant}', restaurant);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt
        },
        { role: "user", content: message }
      ],
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    console.log('Результат анализа:', analysis);

    // Получаем текущее время в формате HH:mm
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Если время не указано или указано как "текущее время", используем текущее время
    if (!analysis.time || analysis.time.includes('текущее время')) {
      analysis.time = currentTime;
    }

    // Если дата не указана, используем "сегодня"
    if (!analysis.date) {
      analysis.date = "сегодня";
    }

    // Если количество не указано, используем 1
    if (!analysis.quantity) {
      analysis.quantity = 1;
    }

    // Добавляем информацию о ресторане
    analysis.restaurant = restaurant;

    // Добавляем статус заказа
    analysis.status = 'pending';

    // Добавляем timestamp создания заказа
    analysis.createdAt = new Date().toISOString();

    console.log('Финальные данные заказа:', analysis);

    // Здесь можно добавить сохранение в базу данных
    // Например:
    // await db.orders.create(analysis);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при анализе заказа' },
      { status: 500 }
    );
  }
} 