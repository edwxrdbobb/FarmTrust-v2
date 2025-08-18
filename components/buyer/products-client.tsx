"use client"

import { useState } from "react"
import { ProductCard } from "@/components/buyer/product-card"
import { ProductFilters } from "@/components/buyer/product-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useBuyerProducts } from "@/hooks/useProducts"
import { LoadingSpinner, ProductGridSkeleton } from "@/components/ui/loading-states"
import { EmptySearchResults } from "@/components/ui/empty-states"
import { ErrorState } from "@/components/ui/loading-states"

export function ProductsClient() {
  const { products, loading, error, pagination, fetchProducts } = useBuyerProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    organic: false,
    featured: false,
    sortBy: "newest",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, 12, {
      ...filters,
      search: searchTerm,
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    fetchProducts(1, 12, {
      ...filters,
      ...newFilters,
      search: searchTerm,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, 12, {
      ...filters,
      search: searchTerm,
    });
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
    fetchProducts(1, 12, {
      ...filters,
      sortBy,
      search: searchTerm,
    });
    setCurrentPage(1);
  };

  return (
    <main className="flex-1">
      {/* Search Header */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fresh Produce from Local Farmers
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover high-quality, fresh products directly from Sierra Leone's trusted farmers
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg rounded-xl border-gray-300 dark:border-gray-600"
                />
              </div>
              <Button 
                type="submit" 
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Section */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <ProductFilters onFilterChange={handleFilterChange} filters={filters} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {loading ? "Loading..." : `${pagination.total} Products`}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select 
                  className="text-sm border rounded-md px-2 py-1"
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : error ? (
              <ErrorState 
                title="Failed to load products"
                description={error}
                onRetry={() => fetchProducts(1, 12)}
              />
            ) : products.length === 0 ? (
              <EmptySearchResults searchTerm={searchTerm} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl" 
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="rounded-xl"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl"
                        disabled={currentPage === pagination.totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}