import { Schema, model, Document } from 'mongoose';

export interface IRecipe extends Document {
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
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    ingredients: [{
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
    }],
    instructions: [{
      type: String,
      required: true,
    }],
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time is required'],
      min: [1, 'Cooking time must be at least 1 minute'],
    },
    servings: {
      type: Number,
      required: [true, 'Number of servings is required'],
      min: [1, 'Servings must be at least 1'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty level is required'],
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Recipe = model<IRecipe>('Recipe', RecipeSchema); 