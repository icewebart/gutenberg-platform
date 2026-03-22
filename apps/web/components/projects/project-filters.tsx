"use client"

import { useState } from "react"
import { Search, Filter, Calendar, MapPin, Users, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

import { projectTypes, projectStatuses } from "@/data/projects-data"
import { useMultiTenant } from "../multi-tenant-context"

interface ProjectFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
  locationFilter: string
  onLocationChange: (location: string) => void
  netzwerkFilter: string
  onNetzwerkChange: (netzwerk: string) => void
  dateRange: { from?: Date; to?: Date }
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void
  onClearFilters: () => void
  activeFiltersCount: number
}

export function ProjectFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  locationFilter,
  onLocationChange,
  netzwerkFilter,
  onNetzwerkChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  activeFiltersCount,
}: ProjectFiltersProps) {
  const { netzwerkCities } = useMultiTenant()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Basic Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {projectStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={onTypeChange}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {projectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="rounded-xl"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid gap-4 pt-4 border-t sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Netzwerk City</label>
              <Select value={netzwerkFilter} onValueChange={onNetzwerkChange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="main">Main Organization</SelectItem>
                  {netzwerkCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? dateRange.from.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => onDateRangeChange({ ...dateRange, from: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="w-full rounded-xl bg-transparent"
                disabled={activeFiltersCount === 0}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                Status: {projectStatuses.find((s) => s.value === statusFilter)?.label}
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                Type: {projectTypes.find((t) => t.value === typeFilter)?.label}
              </Badge>
            )}
            {locationFilter && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                Location: {locationFilter}
              </Badge>
            )}
            {netzwerkFilter !== "all" && netzwerkFilter !== "" && (
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {netzwerkFilter === "main" ? "Main Org" : netzwerkCities.find((c) => c.id === netzwerkFilter)?.name}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
