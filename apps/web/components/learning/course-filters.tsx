"use client"

import { useState } from "react"
import { Search, Filter, X, ChevronDown, BookOpen, Star, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { courseCategories, courseDifficulties } from "@/data/courses-data"

interface CourseFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  selectedDifficulties: string[]
  onDifficultiesChange: (difficulties: string[]) => void
  enrollmentFilter: string
  onEnrollmentFilterChange: (filter: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onClearFilters: () => void
}

export function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  selectedDifficulties,
  onDifficultiesChange,
  enrollmentFilter,
  onEnrollmentFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
}: CourseFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    selectedDifficulties.length +
    (enrollmentFilter !== "all" ? 1 : 0)

  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    if (checked) {
      onCategoriesChange([...selectedCategories, categoryValue])
    } else {
      onCategoriesChange(selectedCategories.filter((c) => c !== categoryValue))
    }
  }

  const handleDifficultyChange = (difficultyValue: string, checked: boolean) => {
    if (checked) {
      onDifficultiesChange([...selectedDifficulties, difficultyValue])
    } else {
      onDifficultiesChange(selectedDifficulties.filter((d) => d !== difficultyValue))
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="space-y-4">
          {/* Search and Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="created">Newest First</SelectItem>
                  <SelectItem value="created-desc">Oldest First</SelectItem>
                  <SelectItem value="enrolled">Most Enrolled</SelectItem>
                </SelectContent>
              </Select>

              <CollapsibleTrigger asChild>
                <Button variant="outline" className="rounded-xl bg-transparent">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && !isAdvancedOpen && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Active filters:</span>

              {selectedCategories.map((category) => {
                const categoryData = courseCategories.find((c) => c.value === category)
                return (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {categoryData?.icon} {categoryData?.label}
                    <button onClick={() => handleCategoryChange(category, false)} className="ml-1 hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}

              {selectedDifficulties.map((difficulty) => {
                const difficultyData = courseDifficulties.find((d) => d.value === difficulty)
                return (
                  <Badge key={difficulty} variant="secondary" className="gap-1">
                    {difficultyData?.label}
                    <button
                      onClick={() => handleDifficultyChange(difficulty, false)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}

              {enrollmentFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {enrollmentFilter === "enrolled"
                    ? "Enrolled"
                    : enrollmentFilter === "completed"
                      ? "Completed"
                      : "Available"}
                  <button onClick={() => onEnrollmentFilterChange("all")} className="ml-1 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Advanced Filters */}
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Categories */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Categories
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {courseCategories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                      />
                      <label
                        htmlFor={`category-${category.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        <span>{category.icon}</span>
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Difficulty
                </h4>
                <div className="space-y-2">
                  {courseDifficulties.map((difficulty) => (
                    <div key={difficulty.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${difficulty.value}`}
                        checked={selectedDifficulties.includes(difficulty.value)}
                        onCheckedChange={(checked) => handleDifficultyChange(difficulty.value, checked as boolean)}
                      />
                      <label
                        htmlFor={`difficulty-${difficulty.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {difficulty.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrollment Status */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Enrollment
                </h4>
                <Select value={enrollmentFilter} onValueChange={onEnrollmentFilterChange}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="available">Available to Enroll</SelectItem>
                    <SelectItem value="enrolled">Currently Enrolled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear all filters
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
