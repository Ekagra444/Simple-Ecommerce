import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateEmbedding } from "@/lib/embeddings"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    
    // Log to help with debugging
    console.log("Search API received query:", query)

    if (!query) {
      console.log("No query provided, returning recent products")
      const products = await prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 20
      })
      return NextResponse.json(products)
    }

    // Generate embedding for the search query
    console.log("Generating embedding for:", query)
    const embeddingResult = await generateEmbedding(query)
    
    // If quota is exceeded, fall back to text search
    if (embeddingResult.quotaExceeded) {
      console.log("Embedding quota exceeded, using fallback text search")
      
      // Use the improved text search with word splitting
      const queryWords = query.toLowerCase().trim().split(/\s+/)
      let whereConditions

      if (queryWords.length === 1) {
        // For single word queries
        whereConditions = {
          OR: [
            { name: { contains: queryWords[0], mode: 'insensitive' } },
            { description: { contains: queryWords[0], mode: 'insensitive' } }
          ]
        }
      } else {
        // For multi-word queries, try to match all words
        const wordConditions = queryWords.map(word => ({
          OR: [
            { name: { contains: word, mode: 'insensitive' } },
            { description: { contains: word, mode: 'insensitive' } }
          ]
        }))
        
        whereConditions = {
          AND: wordConditions
        }
      }
      
      const products = await prisma.product.findMany({
      //@ts-ignore
        where: whereConditions,
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      })
      
      console.log(`Text search found ${products.length} results`)
      return NextResponse.json(products)
    }
    
    // If we have valid embeddings, perform vector search
    if (embeddingResult.embedding) {
      console.log("Using vector search with valid embedding")
      
      function toPgVectorLiteral(arr: number[]): string {
        return `'[${arr.join(',')}]'::vector`
      }

      const pgVector = toPgVectorLiteral(embeddingResult.embedding)
      const SIMILARITY_THRESHOLD = 0.75 // Adjust this threshold based on testing

      // Enhanced query with proper threshold and better error handling
      try {
        const products = await prisma.$queryRawUnsafe(`
          SELECT 
            id, 
            name, 
            price, 
            description, 
            "imageUrl", 
            "createdAt",
            embedding <=> ${pgVector}::vector AS distance
          FROM "Product"
          WHERE embedding <=> ${pgVector}::vector < ${SIMILARITY_THRESHOLD}
          ORDER BY distance ASC
          LIMIT 20
        `)
        //@ts-ignore
        console.log(`Vector search found ${products.length} results`)
        
        // If vector search returns no results, fall back to text search
        //@ts-ignore
        if (products.length === 0) {
          console.log("Vector search found no results, falling back to text search")
          return await performTextSearch(query)
        }
        
        return NextResponse.json(products)
      } catch (error) {
        console.error("Vector search failed:", error)
        console.log("Falling back to text search due to vector search error")
        return await performTextSearch(query)
      }
    }
    
    // Fallback if embeddings are null but not due to quota issues
    console.log("No valid embedding returned, using text search fallback")
    return await performTextSearch(query)
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function for text-based search
async function performTextSearch(query: string) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 20
  })
  
  console.log(`Text search fallback found ${products.length} results`)
  return NextResponse.json(products)
}