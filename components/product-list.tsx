"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string | null
  createdAt: string
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }
const [loading, setLoading] = useState(false);
  const handleSearch = async () => {
    setLoading(true)
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setFilteredProducts(data)
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      })
      console.error("Error searching products:", error)
    }
    finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="h-48 w-full rounded-none" />
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col">
              {product.imageUrl ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={product.imageUrl || "https://imgs.search.brave.com/I34MU8qUdS0k1YpHuGPpvx9aFBRgzDLVhaw4kej1HIo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE0LzM2LzEwLzUy/LzM2MF9GXzE0MzYx/MDUyODVfNExtbE5E/b3JzdzhSTkl4dE5w/M28xY0Q0ajhaY3M2/R2EuanBn"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "https://imgs.search.brave.com/I34MU8qUdS0k1YpHuGPpvx9aFBRgzDLVhaw4kej1HIo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE0LzM2LzEwLzUy/LzM2MF9GXzE0MzYx/MDUyODVfNExtbE5E/b3JzdzhSTkl4dE5w/M28xY0Q0ajhaY3M2/R2EuanBn"
                    }}
                  />
                </div>
              ) : (
                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Image
                    src="https://imgs.search.brave.com/I34MU8qUdS0k1YpHuGPpvx9aFBRgzDLVhaw4kej1HIo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE0LzM2LzEwLzUy/LzM2MF9GXzE0MzYx/MDUyODVfNExtbE5E/b3JzdzhSTkl4dE5w/M28xY0Q0ajhaY3M2/R2EuanBn"
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "https://imgs.search.brave.com/I34MU8qUdS0k1YpHuGPpvx9aFBRgzDLVhaw4kej1HIo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzE0LzM2LzEwLzUy/LzM2MF9GXzE0MzYx/MDUyODVfNExtbE5E/b3JzdzhSTkl4dE5w/M28xY0Q0ajhaY3M2/R2EuanBn"
                    }}
                  />
                </div>
              )}

              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-gray-500 dark:text-gray-400 mb-4">{product.description}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-4">
                <p className="font-bold">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Added on {new Date(product.createdAt).toLocaleDateString()}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
