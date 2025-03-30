import { NextResponse } from 'next/server';

let orders = [
  {
    id: '1',
    restaurant: 'Ресторан Хаяо Миодзаки',
    recipe: 'Блины',
    date: '2024-03-30',
    time: '19:00',
    quantity: 2,
    status: 'pending' as const
  },
  {
    id: '2',
    restaurant: 'Итальянский ресторан',
    recipe: 'Паста Карбонара',
    date: '2024-03-31',
    time: '20:00',
    quantity: 1,
    status: 'confirmed' as const
  }
];

export async function GET() {
  try {
    // В реальном приложении здесь будет запрос к базе данных
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при получении заказов' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const order = await request.json();

    const newOrder = {
      id: Date.now().toString(),
      ...order,
      status: 'pending' as const
    };

    orders.push(newOrder);

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при создании заказа' },
      { status: 500 }
    );
  }
} 