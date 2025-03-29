"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Loader2,
  Clock,
  Users,
  ChefHat,
  Globe,
  Pencil,
  Trash2,
} from "lucide-react";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  cuisine: string;
  author: string;
  createdAt: string;
}

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = use(params);
  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes/${id}`
      );
      setRecipe(response.data.data);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      router.push("/recipes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    setIsDeleting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/recipes/${id}`);
      router.push("/recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Recipe not found
        </h1>
        <button
          onClick={() => router.push("/recipes")}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
        >
          ← Back to Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">{recipe.title}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/recipes/${id}/edit`)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-700 shadow-sm transition-all hover:border-orange-500 hover:text-orange-500"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-medium text-white shadow-sm transition-all hover:bg-red-600 disabled:bg-red-300"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-12">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="text-lg leading-relaxed text-gray-600">
              {recipe.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex items-start gap-3 rounded-xl bg-white p-6 shadow-sm">
              <Clock className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Cooking Time
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {recipe.cookingTime} mins
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white p-6 shadow-sm">
              <Users className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Servings</p>
                <p className="text-lg font-semibold text-gray-900">
                  {recipe.servings}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white p-6 shadow-sm">
              <ChefHat className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Difficulty</p>
                <p className="text-lg font-semibold capitalize text-gray-900">
                  {recipe.difficulty}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white p-6 shadow-sm">
              <Globe className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Cuisine</p>
                <p className="text-lg font-semibold text-gray-900">
                  {recipe.cuisine}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Ingredients
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                    •
                  </span>
                  <span className="text-lg text-gray-700">
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Instructions
            </h2>
            <ol className="space-y-6">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-500">
                    {index + 1}
                  </span>
                  <p className="text-lg leading-relaxed text-gray-700">
                    {instruction}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="space-y-2 text-sm text-gray-500">
              <p className="font-medium">
                Created by{" "}
                <span className="text-gray-900">{recipe.author}</span>
              </p>
              <p>
                Posted on{" "}
                {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
