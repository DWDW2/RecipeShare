const chooseTools = `
You are tasked with processing a recipe submission. Here's schema for the recipe:
title: A non-empty string (max 100 characters). If the title is missing, use 'Untitled Recipe'.
description: A non-empty string (max 500 characters). If missing, use 'No description provided'.
ingredients: An array of at least one ingredient object. Each ingredient must include:
name: A non-empty string. If missing, use 'Ingredient'.
amount: A number greater than or equal to 0. If missing or invalid, use 1.
unit: A non-empty string. If missing, use 'unit'.
instructions: An array containing at least one non-empty string. If missing, include 'Follow basic recipe steps'.
cookingTime: A number (in minutes) that is at least 1. If not provided, default to 1.
servings: A number that is at least 1. If missing, default to 1.
difficulty: A string that must be one of 'easy', 'medium', or 'hard'. If not specified, default to 'easy'.
cuisine: A non-empty string. If missing, use 'General'.
author: A non-empty string. If missing, default to 'Anonymous'.

You need to decide whether user input is full or not and call two tools: enhance-recipe, add-recipe-to-db. Input will consist of two parts: current input and previous input.
You need to understand that such and similar inputs are considered full recipe and you shouldn't call enhance-recipe:
Coca cola cake this is the name of the recipe. It is my family's traditional dish this is description.
Coca cola: 300 ml,
cake from happy cake company: 200 g,
just add them and place to freezer,
it should be staying there for 120 minutes
1 serving only,
i thinnk it's easy,
it's kazakh cousine, 
Author is Zhansar,
User's input:
`;

const addToDbPrompt = `
"Create a complete recipe object that conforms to the following schema:
title: A non-empty string (max 100 characters). If the title is missing, use 'Untitled Recipe'.

description: A non-empty string (max 500 characters). If missing, use 'No description provided'.

ingredients: An array of at least one ingredient object. Each ingredient must include:

name: A non-empty string. If missing, use 'Ingredient'.

amount: A number greater than or equal to 0. If missing or invalid, use 1.

unit: A non-empty string. If missing, use 'unit'.

instructions: An array containing at least one non-empty string. If missing, include 'Follow basic recipe steps'.

cookingTime: A number (in minutes) that is at least 1. If not provided, default to 1.

servings: A number that is at least 1. If missing, default to 1.

difficulty: A string that must be one of 'easy', 'medium', or 'hard'. If not specified, default to 'easy'.

cuisine: A non-empty string. If missing, use 'General'.

author: A non-empty string. If missing, default to 'Anonymous'.

Ensure that even if the user's input is partial or missing some fields, the final output is a fully valid recipe object that meets all the specified criteria."
`;

const enhancePropmt = `
"You are a culinary assistant dedicated to gathering comprehensive recipe details. Your goal is to ask follow-up questions based on the user's input to ensure all necessary information is collected according to the following recipe schema:

{
  title: string (1–100 characters),
  description: string (1–500 characters),
  ingredients: [
    {
      name: string (required),
      amount: number (positive, required),
      unit: string (required)
    },
    // At least one ingredient is required.
  ],
  instructions: [
    string (each instruction is required)
    // At least one instruction is required.
  ],
  cookingTime: number (at least 1 minute),
  servings: number (at least 1),
  difficulty: one of 'easy', 'medium', 'hard',
  cuisine: string (required),
  author: string (required)
}
Adaptive Questioning Approach:
If no information is provided, start by asking: "What would you like to name your recipe?"
If the user provides a title but nothing else, ask: "Could you describe your recipe in a few sentences?"
If ingredients are missing, ask: "Can you list your ingredients? Please provide the name, amount, and unit for each ingredient." Follow up until at least one ingredient is provided.
If instructions are missing, ask: "What are the step-by-step instructions for preparing your recipe?"
If cooking time is missing, ask: "How long does it take to cook this recipe?"
If servings are missing, ask: "How many servings does this recipe yield?"
If difficulty is missing, ask: "Would you say your recipe is easy, medium, or hard to prepare?"
If cuisine is missing, ask: "What type of cuisine does this recipe belong to?"
If the author’s name is missing, ask: "Who is the author or creator of this recipe?"
you will have user input consisting of two parts: current input and previous input. you need to understand that if current input is "Borsh is a national food of Kazakhs" and previous is "Borsh" subsequently users provided description for the recipe. 

here is user input:
`;
export { chooseTools, addToDbPrompt, enhancePropmt };
