"use client"

import { useState, useMemo } from "react"
import { Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard } from "./product-card"
import { StoreFilters } from "./store-filters"
import { ProductDetailModal } from "./product-detail-modal"
import { ShoppingCartComponent } from "./shopping-cart"
import { storeProducts } from "@/data/store-data"
import type { StoreProduct, CartItem } from "@/types/store"

export function StoreInterface() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [showDigitalOnly, setShowDigitalOnly] = useState(false)

  // View states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")

  // Modal and cart states
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = storeProducts.filter((product) => {
      // Search query
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Category
      if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory) {
        return false
      }

      // Price range
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false
      }

      // Tags
      if (selectedTags.length > 0 && !selectedTags.some((tag) => product.tags.includes(tag))) {
        return false
      }

      // In stock only
      if (showInStockOnly && !product.inStock) {
        return false
      }

      // Digital only
      if (showDigitalOnly && !product.isDigital) {
        return false
      }

      return true
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, priceRange, selectedTags, showInStockOnly, showDigitalOnly, sortBy])

  const handleAddToCart = (productId: string, quantity = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === productId)
      if (existingItem) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        return [...prev, { productId, quantity }]
      }
    })
  }

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleCheckout = () => {
    // TODO: Implement checkout flow
    alert("Checkout functionality would be implemented here!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store</h1>
          <p className="text-gray-600 mt-1">Discover products and resources for volunteers</p>
        </div>
        <ShoppingCartComponent
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <StoreFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              showInStockOnly={showInStockOnly}
              onInStockChange={setShowInStockOnly}
              showDigitalOnly={showDigitalOnly}
              onDigitalOnlyChange={setShowDigitalOnly}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {storeProducts.length} products
            </p>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Grid className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                  onAddToCart={handleAddToCart}
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
      />
    </div>
  )
}
