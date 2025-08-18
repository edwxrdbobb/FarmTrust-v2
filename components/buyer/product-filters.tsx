"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Filter, X, Loader2 } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    organic: boolean;
    featured: boolean;
    sortBy: string;
  };
}

export function ProductFilters({ onFilterChange, filters }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    category: filters.category,
    organic: filters.organic,
    featured: filters.featured,
  })

  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories(false)

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (range: number[]) => {
    setPriceRange(range);
    onFilterChange({
      ...localFilters,
      minPrice: range[0].toString(),
      maxPrice: range[1].toString(),
    });
  };

  const resetFilters = () => {
    setLocalFilters({
      category: "",
      organic: false,
      featured: false,
    });
    setPriceRange([0, 100000]);
    onFilterChange({
      category: "",
      minPrice: "",
      maxPrice: "",
      organic: false,
      featured: false,
    });
  };

  return (
    <>
      {/* Mobile filter dialog */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h2 className="text-lg text-gray-700 dark:text-gray-200 font-semibold">Filters</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 rounded-xl bg-green-300 text-white"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Mobile filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 overflow-auto md:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Mobile filter content */}
            <FilterContent
              categories={categories}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              localFilters={localFilters}
              handleFilterChange={handleFilterChange}
              handlePriceChange={handlePriceChange}
            />

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={resetFilters}>
                Reset
              </Button>
              <Button className="flex-1 rounded-xl bg-primary" onClick={() => setMobileFiltersOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop filters */}
      <div className="hidden md:block space-y-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <FilterContent
          categories={categories}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          localFilters={localFilters}
          handleFilterChange={handleFilterChange}
          handlePriceChange={handlePriceChange}
        />

        <Button className="w-full rounded-xl bg-primary" onClick={resetFilters}>
          Reset Filters
        </Button>
      </div>
    </>
  )
}

interface FilterContentProps {
  categories: { _id: string; name: string; slug: string }[]
  categoriesLoading: boolean
  categoriesError: string | null
  priceRange: number[]
  setPriceRange: (value: number[]) => void
  localFilters: any
  handleFilterChange: (filterType: string, value: any) => void
  handlePriceChange: (range: number[]) => void
}

function FilterContent({ categories, categoriesLoading, categoriesError, priceRange, setPriceRange, localFilters, handleFilterChange, handlePriceChange }: FilterContentProps) {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["categories", "price", "certifications"]}>
        <AccordionItem value="categories" className="border-b">
          <AccordionTrigger className="text-base font-medium">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading categories...</span>
                </div>
              ) : categoriesError ? (
                <div className="text-sm text-red-500 py-2">
                  Error loading categories: {categoriesError}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">
                  No categories available
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category._id}`}
                      checked={localFilters.category === category._id}
                      onCheckedChange={(checked) => 
                        handleFilterChange('category', checked ? category._id : '')
                      }
                    />
                    <Label htmlFor={`category-${category._id}`} className="text-sm font-normal cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b">
          <AccordionTrigger className="text-base font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                defaultValue={[0, 100000]}
                max={100000}
                step={1000}
                value={priceRange}
                onValueChange={handlePriceChange}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">Le {priceRange[0].toLocaleString()}</span>
                <span className="text-sm">Le {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certifications" className="border-b">
          <AccordionTrigger className="text-base font-medium">Certifications</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="organic"
                  checked={localFilters.organic}
                  onCheckedChange={(checked) => handleFilterChange('organic', checked)}
                />
                <Label htmlFor="organic" className="text-sm font-normal cursor-pointer">
                  Organic
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="featured"
                  checked={localFilters.featured}
                  onCheckedChange={(checked) => handleFilterChange('featured', checked)}
                />
                <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                  Featured Products
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
