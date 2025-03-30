import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Устанавливаем учетные данные
oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  expiry_date: Number(process.env.GOOGLE_TOKEN_EXPIRY)
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

function getDateFromRelative(relativeDate: string): Date {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  switch (relativeDate.toLowerCase()) {
    case 'сегодня':
      return today;
    case 'завтра':
      return tomorrow;
    case 'послезавтра':
      return dayAfterTomorrow;
    default:
      // Если это число дней (например, "через 3 дня")
      const daysMatch = relativeDate.match(/через (\d+) дня?/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1]);
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days);
        return futureDate;
      }
      throw new Error('Неподдерживаемый формат даты');
  }
}

export async function POST(request: Request) {
  try {
    const { restaurant, recipe, date, time, quantity } = await request.json();

    // Парсим время из строки HH:mm
    const [hours, minutes] = time.split(':').map(Number);

    // Определяем дату
    let startTime: Date;
    if (date.includes('-')) {
      // Если дата в формате YYYY-MM-DD
      const [year, month, day] = date.split('-').map(Number);
      startTime = new Date(Date.UTC(year, month - 1, day, hours - 6, minutes));
    } else {
      // Если дата относительная (сегодня, завтра и т.д.)
      const baseDate = getDateFromRelative(date);
      startTime = new Date(Date.UTC(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        hours - 6,
        minutes
      ));
    }

    // Проверяем валидность даты
    if (isNaN(startTime.getTime())) {
      throw new Error('Некорректная дата или время');
    }

    // Создаем время окончания (через 1 час)
    const endTime = new Date(startTime);
    endTime.setUTCHours(endTime.getUTCHours() + 1);

    const event = {
      summary: `Заказ: ${recipe} в ${restaurant}`,
      description: `Заказ ${quantity} порций ${recipe} в ресторане ${restaurant}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Almaty',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Almaty',
      },
    };

    // Проверяем и обновляем токен, если он истек
    const credentials = oauth2Client.credentials;
    if (credentials.expiry_date && credentials.expiry_date <= Date.now()) {
      const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(newCredentials);
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    });
  } catch (error: any) {
    console.error('Error:', error);

    // Добавляем более подробную информацию об ошибке
    const errorMessage = error.response?.data?.error?.message || error.message || 'Произошла ошибка при добавлении события в календарь';

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.response?.data || error
      },
      { status: error.response?.status || 500 }
    );
  }
} 