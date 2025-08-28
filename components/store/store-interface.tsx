"use client"

import { useState, useMemo } from "react"
import type { Product, ProductFilters, CartItem, ShoppingCart } from "../../types/store"
import { mockProducts } from "../../data/store-data"
import { ProductCard } from "./product-card"
import { StoreFilters } from "./store-filters"
import { ProductDetailModal } from "./product-detail-modal"
import { ShoppingCartComponent } from "./shopping-cart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Grid, List, SlidersHorizontal, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function StoreInterface() {
  const { toast } = useToast()
  const [filters, setFilters] = useState<ProductFilters>({})
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [cart, setCart] = useState<ShoppingCart>({ items: [], total: 0, itemCount: 0 })
  const [wishlist, setWishlist] = useState<string[]>([])

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      if (filters.category && product.category !== filters.category) return false
      if (filters.inStock && !product.inStock) return false
      if (
        filters.search &&
        !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !product.description.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false
      if (filters.priceRange && (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]))
        return false
      if (filters.tags && filters.tags.length > 0 && !filters.tags.some((tag) => product.tags.includes(tag)))
        return false
      return true
    })
  }, [filters])

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find((item) => item.product.id === product.id)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = prevCart.items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        newItems = [...prevCart.items, { product, quantity }]
      }

      const newTotal = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total: newTotal, itemCount: newItemCount }
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => (item.product.id === productId ? { ...item, quantity } : item))

      const newTotal = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total: newTotal, itemCount: newItemCount }
    })
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product.id !== productId)
      const newTotal = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total: newTotal, itemCount: newItemCount }
    })

    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    })
  }

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const isInWishlist = prev.includes(product.id)
      const newWishlist = isInWishlist ? prev.filter((id) => id !== product.id) : [...prev, product.id]

      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: `${product.name} has been ${isInWishlist ? "removed from" : "added to"} your wishlist.`,
      })

      return newWishlist
    })
  }

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Checkout functionality would be implemented here.",
    })
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-gray-600">Discover products and resources for your volunteer organization</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <div className="flex items-center border rounded-lg">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>

          <ShoppingCartComponent
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />

          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {wishlist.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
          <StoreFilters filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />
        </div>

        {/* Products */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {mockProducts.length} products
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="text-gray-400 text-6xl">🔍</div>
                  <h3 className="text-lg font-semibold">No products found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                  <Button onClick={handleClearFilters}>Clear Filters</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onViewDetails={setSelectedProduct}
                  isInWishlist={wishlist.includes(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isInWishlist={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
      />
    </div>
  )
}
