import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateEmbedding } from "@/lib/embeddings"

const prisma = new PrismaClient() //need to change this to a global variable in production

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description, imageUrl } = body

    // Validate required fields
    if (!name || price === undefined || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate embedding for the product
    const content = `${name} ${description}`
    const embedding = await generateEmbedding(content)
    //console.log("Generated embedding:", embedding)
    //console.log(typeof embedding);
    // Create product with embedding
     const product = await prisma.$queryRaw`
      INSERT INTO "Product" (name, price, description, "imageUrl", embedding, "createdAt", "updatedAt")
      VALUES (${name}, ${price}, ${description}, ${imageUrl}, ${embedding}::vector, NOW(), NOW())
      RETURNING *;
    `;

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
