import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipe.controller';

const router = Router();

const recipeValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('ingredients').isArray().withMessage('Ingredients must be an array'),
  body('instructions').isArray().withMessage('Instructions must be an array'),
  body('cookingTime').isInt({ min: 1 }).withMessage('Valid cooking time is required'),
  body('servings').isInt({ min: 1 }).withMessage('Valid number of servings is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Valid difficulty level is required'),
  body('cuisine').trim().notEmpty().withMessage('Cuisine type is required'),
  body('author').trim().notEmpty().withMessage('Author name is required'),
];


router.route('/')
  .get(getAllRecipes)
  .post(recipeValidation, createRecipe);

router.route('/:id')
  .get(getRecipe)
  .put(recipeValidation, updateRecipe)
  .delete(deleteRecipe);

export default router; 