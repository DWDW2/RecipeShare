import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, streamText } from "ai";
import z from "zod";
import { addToDbPrompt, chooseTools, enhancePropmt } from "@/config/prompt";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const result = generateObject({
    model: openai("gpt-4o"),
    prompt: chooseTools + prompt,
    schema: z.object({
      tool: z.string(),
    }),
  });

  return multiToolCalling((await result).object.tool, prompt);
}

const multiToolCalling = async (tool: string, input: string) => {
  switch (tool) {
    case "add-recipe-to-db":
      const recipe = generateObject({
        model: openai("gpt-4o"),
        prompt: addToDbPrompt + input,
        schema: z.object({
          title: z.string().min(1, "Title is required").max(100),
          description: z.string().min(1, "Description is required").max(500),
          ingredients: z
            .array(
              z.object({
                name: z.string().min(1, "Ingredient name is required"),
                amount: z.coerce.number().min(0, "Amount must be positive"),
                unit: z.string().min(1, "Unit is required"),
              })
            )
            .min(1, "At least one ingredient is required"),
          instructions: z
            .array(z.string().min(1, "Instruction is required"))
            .min(1, "At least one instruction is required"),
          cookingTime: z.coerce
            .number()
            .min(1, "Cooking time must be at least 1 minute"),
          servings: z.coerce
            .number()
            .min(1, "At least one serving is required"),
          difficulty: z.enum(["easy", "medium", "hard"]),
          cuisine: z.string().min(1, "Cuisine type is required"),
          author: z.string().min(1, "Author name is required"),
        }),
      });
      console.log((await recipe).object);
      const recipeData = await (await recipe).object;

      const response = await fetch(`${process.env.API_BASE_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      return (await recipe).toJsonResponse();
    case "enhance-recipe":
      const questionToEnhance = streamText({
        model: openai("gpt-4o"),
        prompt: enhancePropmt + input,
      });

      return questionToEnhance.toTextStreamResponse();
  }
};
