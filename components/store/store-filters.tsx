"use client"

import { useState } from "react"
import type { ProductFilters, ProductCategory } from "../../types/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface StoreFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  onClearFilters: () => void
}

const categories: { value: ProductCategory; label: string }[] = [
  { value: "apparel", label: "Apparel" },
  { value: "education", label: "Education" },
  { value: "books", label: "Books" },
  { value: "accessories", label: "Accessories" },
  { value: "digital", label: "Digital" },
]

const popularTags = [
  "cotton",
  "logo",
  "online",
  "certificate",
  "eco-friendly",
  "branded",
  "virtual",
  "leadership",
  "recognition",
]

export function StoreFilters({ filters, onFiltersChange, onClearFilters }: StoreFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange || [0, 100])
  const [searchTerm, setSearchTerm] = useState(filters.search || "")

  const handleCategoryChange = (category: ProductCategory, checked: boolean) => {
    onFiltersChange({
      ...filters,
      category: checked ? category : undefined,
    })
  }

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]]
    setPriceRange(newRange)
    onFiltersChange({
      ...filters,
      priceRange: newRange,
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onFiltersChange({
      ...filters,
      search: value || undefined,
    })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    })
  }

  const handleStockFilterChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      inStock: checked ? true : undefined,
    })
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label>Categories</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={category.value}
                  checked={filters.category === category.value}
                  onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                />
                <Label htmlFor={category.value} className="text-sm font-normal">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>€{priceRange[0]}</span>
              <span>€{priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div className="space-y-3">
          <Label>Availability</Label>
          <div className="flex items-center space-x-2">
            <Checkbox id="inStock" checked={filters.inStock || false} onCheckedChange={handleStockFilterChange} />
            <Label htmlFor="inStock" className="text-sm font-normal">
              In Stock Only
            </Label>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags?.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
