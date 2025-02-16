'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Search, Plus, Clock, ChefHat, Globe } from 'lucide-react';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  cookingTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      console.log(process.env.NEXT_PUBLIC_API_URL)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/recipes`);
      setRecipes(response.data.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <h1 className="text-4xl font-bold text-gray-900">Recipes</h1>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link
              href="/recipes/new"
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              Add Recipe
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <Link
                key={recipe._id}
                href={`/recipes/${recipe._id}`}
                className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <h2 className="mb-3 text-xl font-semibold text-gray-900 group-hover:text-orange-500">
                  {recipe.title}
                </h2>
                <p className="mb-6 text-gray-600 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    {recipe.cookingTime} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4 text-orange-500" />
                    {recipe.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4 text-orange-500" />
                    {recipe.cuisine}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredRecipes.length === 0 && (
          <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-2xl font-semibold text-gray-900">No recipes found</p>
            <p className="text-lg text-gray-600">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Start by adding your first recipe!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 