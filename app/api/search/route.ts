import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateEmbedding } from "@/lib/embeddings"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      const products = await prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
      return NextResponse.json(products)
    }

    // Generate embedding for the search query
    const embeddingResult = await generateEmbedding(query)
    
    // If quota is exceeded, fall back to text search
    if (embeddingResult.quotaExceeded) {
      console.log("Using fallback text search for query:", query)
      
      // Perform text-based search using SQL LIKE
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
      
      return NextResponse.json(products)
    }
    
    // If we have valid embeddings, perform vector search
    if (embeddingResult.embedding) {
      function toPgVectorLiteral(arr: number[]): string {
        return `'[${arr.join(',')}]'::vector`
      }

      const pgVector = toPgVectorLiteral(embeddingResult.embedding)

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
        ORDER BY distance ASC
        LIMIT 20
      `)

      return NextResponse.json(products)
    }
    
    // Fallback if embeddings are null but not due to quota issues
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}