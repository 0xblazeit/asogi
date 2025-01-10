import { NextResponse } from "next/server";
import { Ollama } from "ollama";

// Create a singleton instance outside the handler
const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

export async function GET() {
  try {
    // Reuse the existing ollama instance
    const response = await ollama.chat({
      model: "llama3.2",
      messages: [{ role: "user", content: "hello who are you, what is your model name ?" }],
      options: {
        temperature: 0.8, // Controls randomness 0.0 (deterministic/factual) to 1.0 (creative/story telling)
        top_k: 60, // 20 = Very focused vocabulary 100 = Very creative vocabulary
        top_p: 0.9, // Controls the cumulative probability threshold for top tokens
        repeat_penalty: 1.1, // Controls the penalty for repeating tokens
        seed: 42, // Controls the random seed for generation
        num_predict: 100, // Controls the number of tokens to predict
      },
    });

    return NextResponse.json(
      {
        message: response.message.content,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
