export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: ProductCategory
  images: string[]
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  tags: string[]
  specifications?: Record<string, string>
  isDigital: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ShoppingCart {
  items: CartItem[]
  total: number
  itemCount: number
}

export type ProductCategory = "apparel" | "education" | "books" | "accessories" | "digital"

export interface ProductFilters {
  category?: ProductCategory
  priceRange?: [number, number]
  inStock?: boolean
  tags?: string[]
  search?: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}
