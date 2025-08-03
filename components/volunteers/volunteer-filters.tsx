"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VolunteerFiltersProps {
  filters: {
    search: string
    year: string
    department: string
    status: string
    sort: string
  }
  onFilterChange: (filterName: string, value: string) => void
  onClearFilters: () => void
  years: number[]
  departments: string[]
  activeFiltersCount: number
}

export function VolunteerFilters({
  filters,
  onFilterChange,
  onClearFilters,
  years,
  departments,
  activeFiltersCount,
}: VolunteerFiltersProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative lg:col-span-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select value={filters.year} onValueChange={(v) => onFilterChange("year", v)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Year of Activity" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.department} onValueChange={(v) => onFilterChange("department", v)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dep) => (
              <SelectItem key={dep} value={dep}>
                {dep}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(v) => onFilterChange("sort", v)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="most_points">Most Points</SelectItem>
            <SelectItem value="most_active">Most Activities</SelectItem>
            <SelectItem value="join_date_desc">Newest Members</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {activeFiltersCount > 0 && (
        <div className="pt-2 flex justify-end">
          <Button variant="ghost" onClick={onClearFilters} className="text-sm text-gray-600 hover:bg-gray-200">
            <X className="mr-2 h-4 w-4" />
            Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  )
}
