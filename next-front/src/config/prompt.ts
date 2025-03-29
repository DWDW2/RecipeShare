const chooseTools = `
tools:
- add-recipe-to-db

User's prompt:
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
export { chooseTools, addToDbPrompt };
