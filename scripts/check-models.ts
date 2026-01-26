
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyCjdqsYkIJEcQEi9LRV4H0v_GwXtjUeNSg";

async function list() {
  console.log("Checking models for key ending in:", key.slice(-4));
  try {
      // Use fetch directly to avoid SDK abstraction hiding raw list
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await res.json();
      
      if (data.models) {
          console.log("AVAILABLE MODELS:");
          data.models.forEach((m: any) => {
             console.log(`- ${m.name}`);
             console.log(`  Methods: ${m.supportedGenerationMethods}`);
          });
      } else {
          console.error("No models found:", data);
      }

  } catch(e) {
      console.error("Error:", e);
  }
}

list();
