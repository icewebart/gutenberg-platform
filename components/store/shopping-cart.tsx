"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { storeProducts } from "@/data/store-data"
import type { CartItem } from "@/types/store"

interface ShoppingCartProps {
  cartItems: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
}

export function ShoppingCartComponent({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false)

  const cartItemsWithProducts = cartItems
    .map((item) => {
      const product = storeProducts.find((p) => p.id === item.productId)
      return { ...item, product }
    })
    .filter((item) => item.product)

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItemsWithProducts.reduce((sum, item) => {
    return sum + item.product!.price * item.quantity
  }, 0)

  const shippingCost = totalPrice >= 25 ? 0 : 4.99
  const finalTotal = totalPrice + shippingCost

  const handleQuantityChange = (productId: string, delta: number) => {
    const currentItem = cartItems.find((item) => item.productId === productId)
    if (currentItem) {
      const newQuantity = Math.max(0, currentItem.quantity + delta)
      if (newQuantity === 0) {
        onRemoveItem(productId)
      } else {
        onUpdateQuantity(productId, newQuantity)
      }
    }
  }

  const handleCheckout = () => {
    onCheckout()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative bg-transparent">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({totalItems} items)
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cartItemsWithProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some products to get started!</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cartItemsWithProducts.map(({ product, quantity, productId }) => (
                  <div key={productId} className="flex gap-3 p-3 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={product!.images[0] || "/placeholder.svg"}
                        alt={product!.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{product!.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">€{product!.price.toFixed(2)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => handleQuantityChange(productId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => handleQuantityChange(productId, 1)}
                          disabled={quantity >= product!.stockQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                        onClick={() => onRemoveItem(productId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="font-medium text-sm">€{(product!.price * quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className={shippingCost === 0 ? "text-green-600" : ""}>
                      {shippingCost === 0 ? "FREE" : `€${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {totalPrice < 25 && totalPrice > 0 && (
                    <p className="text-xs text-gray-600">Add €{(25 - totalPrice).toFixed(2)} more for free shipping</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>

                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
