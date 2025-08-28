export interface StoreProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  organizationId: string
  tags: string[]
  rating: number
  reviewCount: number
  isDigital: boolean
  downloadUrl?: string
  specifications?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  quantity: number
  selectedOptions?: Record<string, string>
}

export interface ShoppingCart {
  id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  selectedOptions?: Record<string, string>
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
}
