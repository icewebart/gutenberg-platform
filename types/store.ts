export interface StoreProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  images: string[]
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  isDigital: boolean
  specifications?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface StoreOrder {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}
