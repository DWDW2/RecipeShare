import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photo = formData.get("photo") as File;

    if (!photo) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 });
    }

    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const dataURI = `data:${photo.type};base64,${base64Image}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional chef that specializes in analyzing food images and creating recipes. When given an image of food, provide a detailed recipe with ingredients, amounts, instructions, cooking time, and difficulty level. Format your response as a JSON object with the following structure: { title: string, description: string, ingredients: Array<{name: string, amount: number, unit: string}>, instructions: string[], cookingTime: number, servings: number, difficulty: 'easy' | 'medium' | 'hard', cuisine: string, author: string }.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Create a recipe based on this food image. Return the recipe as a JSON object with the structure provided in the system message.",
            },
            {
              type: "image_url",
              image_url: { url: dataURI },
            },
          ],
        },
      ],
      max_tokens: 2048,
    });

    return NextResponse.json(completion.choices[0].message);
  } catch (error) {
    console.error("Error generating recipe from photo:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe from photo" },
      { status: 500 }
    );
  }
}
