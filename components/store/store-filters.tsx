"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { storeCategories } from "@/data/store-data"

interface StoreFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  showInStockOnly: boolean
  onInStockChange: (inStock: boolean) => void
  showDigitalOnly: boolean
  onDigitalOnlyChange: (digital: boolean) => void
}

const availableTags = [
  "volunteer",
  "apparel",
  "cotton",
  "logo",
  "course",
  "digital",
  "project-management",
  "certificate",
  "handbook",
  "guide",
  "policies",
  "water-bottle",
  "eco-friendly",
  "workshop",
  "leadership",
  "pins",
]

export function StoreFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedTags,
  onTagsChange,
  showInStockOnly,
  onInStockChange,
  showDigitalOnly,
  onDigitalOnlyChange,
}: StoreFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAllFilters = () => {
    onSearchChange("")
    onCategoryChange("all")
    onPriceRangeChange([0, 100])
    onTagsChange([])
    onInStockChange(false)
    onDigitalOnlyChange(false)
  }

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (showInStockOnly ? 1 : 0) +
    (showDigitalOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {storeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center justify-between w-full p-2 rounded-lg text-left transition-colors ${
                selectedCategory === category.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              }`}
            >
              <span className="text-sm">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>€{priceRange[0]}</span>
            <span>€{priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Product Type */}
      <div>
        <h3 className="font-semibold mb-3">Product Type</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="in-stock" checked={showInStockOnly} onCheckedChange={onInStockChange} />
            <Label htmlFor="in-stock" className="text-sm">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="digital" checked={showDigitalOnly} onCheckedChange={onDigitalOnlyChange} />
            <Label htmlFor="digital" className="text-sm">
              Digital Products Only
            </Label>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="font-semibold mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile Filter Button */}
      <div className="flex items-center justify-between lg:hidden">
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your product search</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {storeCategories.find((c) => c.id === selectedCategory)?.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onCategoryChange("all")} />
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
            </Badge>
          ))}
          {showInStockOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              In Stock
              <X className="h-3 w-3 cursor-pointer" onClick={() => onInStockChange(false)} />
            </Badge>
          )}
          {showDigitalOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Digital
              <X className="h-3 w-3 cursor-pointer" onClick={() => onDigitalOnlyChange(false)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
