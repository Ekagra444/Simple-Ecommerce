import OpenAI from "openai";

// Initialize OpenAI client only if API key exists
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Custom result type to handle quota issues
export type EmbeddingResult = {
  embedding: number[]|null;
  quotaExceeded: boolean;
};

// Function to generate embeddings using OpenAI
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    if (!openai) {
      console.warn("OpenAI API key not found, using mock embedding");
      return { 
        embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
        quotaExceeded: false
      };
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return { 
      embedding: response.data[0]?.embedding ?? [],
      quotaExceeded: false
    };
  } catch (error: any) {
    console.error("Error generating embedding:", error);
    
    // Check if the error is related to quota/billing
    const isQuotaError = 
      error?.status === 429 || // Too many requests
      (error?.message && (
        error.message.includes("quota") || 
        error.message.includes("rate limit") ||
        error.message.includes("billing") ||
        error.message.includes("capacity")
      ));
    
    if (isQuotaError) {
      console.warn("OpenAI quota exceeded, falling back to text search");
       return { 
      embedding:null,
      quotaExceeded: false
    };
    }
    
    // For other errors, return a mock embedding
    return { 
      embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
      quotaExceeded: false
    };
  }
}