import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recipe Sharing Platform',
  description: 'Share and discover amazing recipes from food lovers around the world',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b border-gray-200 bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold text-orange-500">
              RecipeShare
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/recipes"
                className="text-gray-600 transition-colors hover:text-orange-500"
              >
                Recipes
              </Link>
              <Link
                href="/recipes/new"
                className="rounded-full bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600"
              >
                Share Recipe
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-200 bg-white py-8 bottom-0">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2024 RecipeShare. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
