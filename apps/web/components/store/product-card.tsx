"use client"

import { useState } from "react"
import type { Product } from "../../types/store"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Eye } from "lucide-react"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onToggleWishlist: (product: Product) => void
  onViewDetails: (product: Product) => void
  isInWishlist: boolean
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, onViewDetails, isInWishlist }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <div className="relative overflow-hidden">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className={`w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}

        {discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">-{discountPercentage}%</Badge>
        )}

        {product.isDigital && <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">Digital</Badge>}

        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg">
              Out of Stock
            </Badge>
          </div>
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 hover:bg-white"
            onClick={() => onToggleWishlist(product)}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-green-600">€{product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">€{product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        <div className="flex space-x-2 w-full">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onViewDetails(product)}>
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onAddToCart(product)} disabled={!product.inStock}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>

        {product.inStock && product.stockQuantity <= 5 && (
          <p className="text-xs text-orange-600 text-center">Only {product.stockQuantity} left in stock!</p>
        )}
      </CardFooter>
    </Card>
  )
}
