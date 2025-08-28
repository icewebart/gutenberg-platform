"use client"

import type React from "react"

import { useState } from "react"
import { ShoppingCart, Heart, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { StoreProduct } from "@/types/store"

interface ProductCardProps {
  product: StoreProduct
  onViewDetails: (product: StoreProduct) => void
  onAddToCart: (productId: string, quantity?: number) => void
}

export function ProductCard({ product, onViewDetails, onAddToCart }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart(product.id)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const handleViewDetails = () => {
    onViewDetails(product)
  }

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 relative">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
          {product.isDigital && (
            <Badge variant="secondary" className="text-xs">
              Digital
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="outline" className="text-xs bg-white">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleWishlist}>
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleViewDetails}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Add to Cart Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-green-600">€{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">€{product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Stock Info */}
          <div className="text-xs text-gray-500">
            {product.inStock ? (
              product.stockQuantity < 10 ? (
                <span className="text-orange-600">Only {product.stockQuantity} left</span>
              ) : (
                <span>In Stock</span>
              )
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
