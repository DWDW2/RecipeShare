import { Request, Response } from 'express';
import { Recipe, IRecipe } from '../models/Recipe';

export async function getAllRecipes(req: Request, res: Response) {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
}


export async function getRecipe(req: Request, res: Response) {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
      });
    }
    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
}

export async function createRecipe(req: Request, res: Response) {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
}

export async function updateRecipe(req: Request, res: Response) {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
}

export async function deleteRecipe(req: Request, res: Response) {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: 'Recipe not found',
      });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
} 