import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductSubmissionForm from "@/components/product-submission-form"
import ProductList from "@/components/product-list"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Mini E-Commerce Platform</h1>

      <Tabs defaultValue="submit" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="submit">Product Submission</TabsTrigger>
          <TabsTrigger value="products">My Products</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Submit a New Product</h2>
            <ProductSubmissionForm />
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">My Products</h2>
            <ProductList />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
