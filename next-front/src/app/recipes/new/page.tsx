"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useCompletion } from "@ai-sdk/react";
import { useAnimatedText } from "@/components/ui/smooth-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

const recipeSchema = z.object({
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
  servings: z.coerce.number().min(1, "At least one serving is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cuisine: z.string().min(1, "Cuisine type is required"),
  author: z.string().min(1, "Author name is required"),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

export default function NewRecipePage({}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState([
    { name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState([""]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const {
    completion,
    input,
    handleInputChange,
    handleSubmit: handleAiSubmit,
    complete,
    isLoading: isAiLoading,
  } = useCompletion({
    api: "/api/ai",
    streamProtocol: "text",
  });

  const animatedText = useAnimatedText(completion);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [{ name: "", amount: 0, unit: "" }],
      instructions: [""],
      cookingTime: 0,
      servings: 1,
      difficulty: "medium",
    },
  });

  const onSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      const transformedData = {
        ...data,
        ingredients: data.ingredients.map((ing) => ({
          ...ing,
          amount: Number(ing.amount),
        })),
        cookingTime: Number(data.cookingTime),
        servings: Number(data.servings),
      };

      await axios.post(API_ENDPOINTS.recipes.create, transformedData);
      router.push("/recipes");
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        transcribeAudio(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      });

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access your microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const speechRecognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      speechRecognition.lang = "en-US";
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      speechRecognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        setTranscript(currentTranscript);
        handleInputChange({
          target: { value: currentTranscript },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      };

      speechRecognition.start();
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio. Please try again.");
    }
  };
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(input);
    if (input.trim()) {
      console.log(input);
      complete(input);
    }
  };

  return (
    <Tabs defaultValue="Add Recipe" className="w-full">
      <div className="w-full flex items-center justify-center">
        <TabsList className="mt-5 w-[300px]">
          <TabsTrigger className="flex-1" value="Add Recipe">
            Add recipe
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="AI Recipe">
            AI recipe
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="AI Recipe" className="mt-6 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Generate Recipe with AI</CardTitle>
            <CardDescription>
              Describe your recipe in plain text and our AI will structure it
              for you. You can also use voice input to dictate your recipe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Describe your recipe in plain text... (e.g. My pasta recipe has tomatoes, basil, and garlic. Cook pasta for 10 minutes, then add sauce...)"
                  className="min-h-[200px] p-4 resize-y"
                  value={input}
                  onChange={handleInputChange}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isAiLoading || isProcessingAi || !input.trim()}
              >
                {isAiLoading || isProcessingAi ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isAiLoading
                      ? "Generating Recipe..."
                      : "Processing Recipe..."}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Recipe
                  </>
                )}
              </Button>
            </form>

            {isRecording && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                  <p className="text-sm font-medium text-gray-700">
                    Recording in progress...
                  </p>
                </div>
              </div>
            )}

            {completion && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  Generated Recipe:
                </h3>
                <div className="prose prose-sm">
                  <pre className="text-sm whitespace-pre-wrap">
                    {animatedText}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            Your recipe will be structured and saved automatically once
            generated.
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="Add Recipe">
        <div className="container mx-auto max-w-3xl px-4 py-8 bg-white m-10 rounded-lg text-neutral-600">
          <h1 className="mb-8 text-3xl font-bold">Add New Recipe</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Ingredients
                </label>
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
                <label className="text-sm font-medium text-gray-700">
                  Instructions
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Cooking Time (minutes)
                </label>
                <input
                  type="number"
                  {...register("cookingTime")}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Servings
                </label>
                <input
                  type="number"
                  {...register("servings")}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <select
                  {...register("difficulty")}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cuisine
                </label>
                <input
                  type="text"
                  {...register("cuisine")}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  {...register("author")}
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
                "Create Recipe"
              )}
            </button>
          </form>
        </div>
      </TabsContent>
    </Tabs>
  );
}
