'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
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

export default function NewRecipePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
  const [instructions, setInstructions] = useState(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [{ name: '', amount: 0, unit: '' }],
      instructions: [''],
      cookingTime: 0,
      servings: 1,
      difficulty: 'medium',
    },
  });

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      // Transform the data to ensure numbers are properly converted
      const transformedData = {
        ...data,
        ingredients: data.ingredients.map(ing => ({
          ...ing,
          amount: Number(ing.amount),
        })),
        cookingTime: Number(data.cookingTime),
        servings: Number(data.servings),
      };

      await axios.post(API_ENDPOINTS.recipes.create, transformedData);
      router.push('/recipes');
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe. Please try again.');
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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 bg-white m-10 rounded-lg text-neutral-600">
      <h1 className="mb-8 text-3xl font-bold">Add New Recipe</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
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
              className="mt-1 w-full rounded-lg border border-gray-300 p-2"
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
          {ingredients.map((ingredient, index) => (
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
          {instructions.map((instruction, index) => (
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
          className="flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-600 disabled:bg-orange-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Recipe...
            </>
          ) : (
            'Create Recipe'
          )}
        </button>
      </form>
    </div>
  );
} 