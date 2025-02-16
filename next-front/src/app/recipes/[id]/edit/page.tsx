'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, 'Ingredient name is required'),
      amount: z.coerce.number().min(0, 'Amount must be positive'),
      unit: z.string().min(1, 'Unit is required'),
    })
  ).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1, 'Instruction is required')).min(1, 'At least one instruction is required'),
  cookingTime: z.coerce.number().min(1, 'Cooking time must be at least 1 minute'),
  servings: z.coerce.number().min(1, 'At least one serving is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  cuisine: z.string().min(1, 'Cuisine type is required'),
  author: z.string().min(1, 'Author name is required'),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [instructions, setInstructions] = useState(['']);
  const {id} = use(params)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
  });

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.recipes.detail(id));
      const recipe = response.data.data;
      
      // Pre-fill the form with existing data
      reset({
        ...recipe,
        ingredients: recipe.ingredients.map(ing => ({
          ...ing,
          amount: Number(ing.amount),
        })),
      });

      setIngredients(recipe.ingredients);
      setInstructions(recipe.instructions);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      router.push('/recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      const transformedData = {
        ...data,
        ingredients: data.ingredients.map(ing => ({
          ...ing,
          amount: Number(ing.amount),
        })),
        cookingTime: Number(data.cookingTime),
        servings: Number(data.servings),
      };

      await axios.put(API_ENDPOINTS.recipes.update(id), transformedData);
      router.push(`/recipes/${id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  {...register('title')}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Ingredients</label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  + Add Ingredient
                </button>
              </div>
              {ingredients.map((_, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    {...register(`ingredients.${index}.name`)}
                    className="w-full rounded-lg border border-gray-300 p-2"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    {...register(`ingredients.${index}.amount`)}
                    className="w-24 rounded-lg border border-gray-300 p-2"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    {...register(`ingredients.${index}.unit`)}
                    className="w-24 rounded-lg border border-gray-300 p-2"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Instructions</label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  + Add Step
                </button>
              </div>
              {instructions.map((_, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <span className="mt-2 text-gray-500">#{index + 1}</span>
                  <input
                    type="text"
                    {...register(`instructions.${index}`)}
                    className="w-full rounded-lg border border-gray-300 p-2"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cooking Time (minutes)</label>
                <input
                  type="number"
                  {...register('cookingTime')}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Servings</label>
                <input
                  type="number"
                  {...register('servings')}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <select
                  {...register('difficulty')}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                <input
                  type="text"
                  {...register('cuisine')}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  {...register('author')}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:bg-orange-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Recipe...
                </>
              ) : (
                'Update Recipe'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 