import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateEmbedding } from "@/lib/embeddings"
import { v4 as uuidv4 } from 'uuid';
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
    let { embedding, quotaExceeded } = await generateEmbedding(content);

    // if(quotaExceeded) {
    //   console.warn("Quota exceeded, using mock embedding");
    //   //const vectorString = `'[${embedding.join(",")}]'`;

    // embedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    // const vectorString = `'[${embedding.join(",")}]'`;
    // const product = await prisma.$queryRawUnsafe(`
    //   INSERT INTO "Product" (name, price, description, "imageUrl", embedding, "createdAt", "updatedAt")
    //   VALUES ($1, $2, $3, $4, ${vectorString}::vector, NOW(), NOW())
    //   RETURNING *;
    // `, name, price, description, imageUrl);


    // return NextResponse.json(product, { status: 201 })
    // }
    
    if (!embedding) {
      let embedding1 = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
// Don't put quotes around the array string - they'll be added by the parameterized query
const vectorString1 = `[${embedding1.join(",")}]`;
const productId = uuidv4();
const now = new Date().toISOString();
const product = await prisma.$executeRawUnsafe(`
      INSERT INTO "Product" (id, name, price, description, "imageUrl", embedding, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6::vector, $7::timestamp, $8::timestamp)
      RETURNING *;
    `, productId, name, price, description, imageUrl, vectorString1, now, now);

// Handle the success case here instead of immediately returning an error
return NextResponse.json({ product }, { status: 200 });
    }
    const vectorString = `'[${embedding.join(",")}]'`;


    const product = await prisma.$queryRawUnsafe(`
      INSERT INTO "Product" (name, price, description, "imageUrl", embedding, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, ${vectorString}::vector, NOW(), NOW())
      RETURNING *;
    `, name, price, description, imageUrl);


    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
