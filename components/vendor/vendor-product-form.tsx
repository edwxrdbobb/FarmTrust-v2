"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Check, ChevronsUpDown, Loader2, Trash, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { MultipleImageUpload } from "./multiple-image-upload"



// Product categories for Sierra Leone agriculture
const categories = [
  { label: "Vegetables", value: "vegetables" },
  { label: "Fruits", value: "fruits" },
  { label: "Grains", value: "grains" },
  { label: "Tubers", value: "tubers" },
  { label: "Legumes", value: "legumes" },
  { label: "Herbs & Spices", value: "herbs-spices" },
  { label: "Nuts & Seeds", value: "nuts-seeds" },
  { label: "Dairy & Eggs", value: "dairy-eggs" },
  { label: "Meat & Fish", value: "meat-fish" },
  { label: "Processed Foods", value: "processed-foods" },
]

// Units of measurement common in Sierra Leone
const units = [
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Gram (g)", value: "g" },
  { label: "Bunch", value: "bunch" },
  { label: "Bag", value: "bag" },
  { label: "Basket", value: "basket" },
  { label: "Liter (L)", value: "l" },
  { label: "Piece", value: "piece" },
  { label: "Cup", value: "cup" },
]

// Districts in Sierra Leone
const locations = [
  { label: "Bo District", value: "Bo District" },
  { label: "Bombali District", value: "Bombali District" },
  { label: "Bonthe District", value: "Bonthe District" },
  { label: "Falaba District", value: "Falaba District" },
  { label: "Kailahun District", value: "Kailahun District" },
  { label: "Kambia District", value: "Kambia District" },
  { label: "Karene District", value: "Karene District" },
  { label: "Kenema District", value: "Kenema District" },
  { label: "Koinadugu District", value: "Koinadugu District" },
  { label: "Kono District", value: "Kono District" },
  { label: "Moyamba District", value: "Moyamba District" },
  { label: "Port Loko District", value: "Port Loko District" },
  { label: "Pujehun District", value: "Pujehun District" },
  { label: "Tonkolili District", value: "Tonkolili District" },
  { label: "Western Area Rural District", value: "Western Area Rural District" },
  { label: "Western Area Urban District", value: "Western Area Urban District" },
]

type ProductFormProps = {
  initialData?: any
  isEditing?: boolean
  productId?: string
}

export function ProductForm({ initialData, isEditing = false, productId }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(
    initialData?.harvestDate ? new Date(initialData.harvestDate) : undefined,
  )

  // Form values
  const [formValues, setFormValues] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    stock: initialData?.quantity || "",
    unit: initialData?.unit || "",
    category: initialData?.categoryId?.slug || initialData?.categoryId || initialData?.category || "",
    featured: initialData?.featured || false,
    organic: initialData?.organic || false,
    location: initialData?.location || "",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      const requiredFields = {
        name: formValues.name?.trim(),
        description: formValues.description?.trim(), 
        price: formValues.price?.toString().trim(),
        stock: formValues.stock?.toString().trim(),
        unit: formValues.unit?.trim(),
        category: formValues.category?.trim()
      }
      
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value === '')
        .map(([key]) => key)
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields)
        console.error('Current form values:', formValues)
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate numeric fields
      const price = parseFloat(formValues.price)
      const stock = parseInt(formValues.stock)
      
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price greater than 0');
      }
      
      if (isNaN(stock) || stock < 0) {
        throw new Error('Please enter a valid stock quantity (0 or greater)');
      }

      // Prepare product data
      const productData = {
        name: formValues.name,
        description: formValues.description,
        price: parseFloat(formValues.price),
        quantity: parseInt(formValues.stock),
        stock: parseInt(formValues.stock), // Add stock field for POST route compatibility
        unit: formValues.unit,
        category: formValues.category,
        images: images,
        harvestDate: harvestDate?.toISOString(),
        location: formValues.location,
        organic: formValues.organic,
        featured: formValues.featured,
        isActive: true
      }

      // Send to API - use PUT for editing, POST for creating
      const url = isEditing && productId ? `/api/products/${productId}` : '/api/products'
      const method = isEditing ? 'PUT' : 'POST'
      
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create product')
      }

      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: isEditing
          ? "Your product has been updated successfully."
          : "Your product has been added to your inventory.",
        variant: "default",
      })

      // Redirect to products page
      router.push("/vendor/products")
    } catch (error) {
      console.error('Product creation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Fresh Cassava"
                    value={formValues.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product, including quality, origin, and usage suggestions"
                    value={formValues.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (Leones)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g. 25000"
                      value={formValues.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="e.g. 100"
                      value={formValues.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unit of Measurement</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between mt-1">
                          {formValues.unit
                            ? units.find((unit) => unit.value === formValues.unit)?.label
                            : "Select unit..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search units..." />
                          <CommandList>
                            <CommandEmpty>No unit found.</CommandEmpty>
                            <CommandGroup>
                              {units.map((unit) => (
                                <CommandItem
                                  key={unit.value}
                                  value={unit.value}
                                  onSelect={() => handleInputChange("unit", unit.value)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formValues.unit === unit.value ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {unit.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between mt-1">
                          {formValues.category
                            ? categories.find((category) => category.value === formValues.category)?.label
                            : "Select category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search categories..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  key={category.value}
                                  value={category.value}
                                  onSelect={() => handleInputChange("category", category.value)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formValues.category === category.value ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {category.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Product Images</h3>
              <MultipleImageUpload
                value={images}
                onChange={setImages}
                onRemove={(url) => {
                  const newImages = images.filter((image) => image !== url);
                  setImages(newImages);
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Additional Details</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        {harvestDate ? harvestDate.toLocaleDateString() : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={harvestDate} onSelect={setHarvestDate} />
                    </PopoverContent>
                  </Popover>
                  <div className="text-xs mt-1 text-muted-foreground">When was this product harvested?</div>
                </div>

                <div>
                  <Label htmlFor="location">Growing Location</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between mt-1">
                        {formValues.location
                          ? locations.find((location) => location.value === formValues.location)?.label
                          : "Select location..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search locations..." />
                        <CommandList>
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup>
                            {locations.map((location) => (
                              <CommandItem
                                key={location.value}
                                value={location.value}
                                onSelect={() => handleInputChange("location", location.value)}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formValues.location === location.value ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {location.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="text-xs mt-1 text-muted-foreground">Where was this product grown?</div>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="organic"
                    checked={formValues.organic}
                    onCheckedChange={(checked) => handleInputChange("organic", checked)}
                  />
                  <label
                    htmlFor="organic"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Organic Product
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formValues.featured}
                    onCheckedChange={(checked) => handleInputChange("featured", checked)}
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Feature this product
                  </label>
                </div>

                <div className="text-xs text-muted-foreground">
                  Featured products appear on the homepage and get more visibility.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Product Status</h3>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>

              <div className="space-y-4">
                <Button type="submit" className="w-full bg-[#227C4F] hover:bg-[#1b6a43]" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Product" : "Create Product"}
                </Button>

                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Delete Product
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/vendor/products")}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
