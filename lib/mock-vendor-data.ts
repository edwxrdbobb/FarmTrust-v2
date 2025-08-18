export interface Product {
  id: string
  name: string
  price: number
  unit: string
  category: string
  description: string
  image: string
  inStock: boolean
  quantity?: number
}

export interface Vendor {
  id: string
  name: string
  location: string
  verified: boolean
  rating: number
  reviewCount: number
  farmerType: string
  description: string
  image?: string
  joinDate: string
  products: Product[]
}

// Farm and agriculture related images from Unsplash
const FARM_IMAGES = {
  organicFarm: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&h=200&fit=crop&q=80", // Green organic field
  fishFarm: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop&q=80", // Fish farming ponds
  riceFarm: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop&q=80", // Rice paddy fields
  poultryFarm: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=300&h=200&fit=crop&q=80", // Free-range chickens
  fruitOrchard: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop&q=80", // Fruit trees
  palmPlantation: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&q=80", // Palm oil plantation
  urbanGarden: "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=300&h=200&fit=crop&q=80", // Urban farming
  cassavaFarm: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&h=200&fit=crop&q=80", // Cassava cultivation
  coastalFishing: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop&q=80", // Coastal fishing
  vegetableFarm: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=300&h=200&fit=crop&q=80", // Vegetable rows
  livestockFarm: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300&h=200&fit=crop&q=80", // Cows grazing
  aquaculture: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=300&h=200&fit=crop&q=80", // Modern aquaculture
}

const PRODUCT_IMAGES = {
  cassava: "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=200&h=150&fit=crop&q=80",
  plantains: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=150&fit=crop&q=80",
  vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=150&fit=crop&q=80",
  fish: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=150&fit=crop&q=80",
  rice: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=200&h=150&fit=crop&q=80",
  eggs: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=150&fit=crop&q=80",
  chicken: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&h=150&fit=crop&q=80",
  mangoes: "https://images.unsplash.com/photo-1553279935-5430e9bd7a0a?w=200&h=150&fit=crop&q=80",
  oranges: "https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=150&fit=crop&q=80",
  fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&h=150&fit=crop&q=80",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=150&fit=crop&q=80",
  herbs: "https://images.unsplash.com/photo-1469909191679-31af93be8b98?w=200&h=150&fit=crop&q=80",
  tomatoes: "https://images.unsplash.com/photo-1546470427-e212b9d3c749?w=200&h=150&fit=crop&q=80",
  beans: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=200&h=150&fit=crop&q=80",
  potatoes: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=150&fit=crop&q=80",
  meat: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=150&fit=crop&q=80",
  milk: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=150&fit=crop&q=80",
}

export const mockVendors: Vendor[] = [
  {
    id: "v1",
    name: "Kamara Family Farm",
    location: "Bo District",
    verified: true,
    rating: 4.8,
    reviewCount: 124,
    farmerType: "organic",
    description: "Third-generation organic farm specializing in cassava, plantains, and vegetables.",
    image: FARM_IMAGES.organicFarm,
    joinDate: "2023-03-15",
    products: [
      {
        id: "p1",
        name: "Fresh Cassava",
        price: 15000,
        unit: "per bag (50kg)",
        category: "Root Vegetables",
        description: "Premium quality fresh cassava, harvested within 24 hours. Perfect for gari, fufu, or cooking.",
        image: "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 25
      },
      {
        id: "p2",
        name: "Sweet Plantains",
        price: 8000,
        unit: "per bunch",
        category: "Fruits",
        description: "Naturally sweet plantains, perfect ripeness for cooking or eating fresh.",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 40
      },
      {
        id: "p3",
        name: "Mixed Vegetables",
        price: 5000,
        unit: "per basket",
        category: "Vegetables",
        description: "Fresh mixed vegetables including okra, spinach, and peppers.",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 15
      }
    ]
  },
  {
    id: "v2",
    name: "Koroma Fish Farm",
    location: "Freetown",
    verified: true,
    rating: 4.6,
    reviewCount: 87,
    farmerType: "fish",
    description: "Sustainable fish farm raising tilapia and catfish without antibiotics or chemicals.",
    image: FARM_IMAGES.fishFarm,
    joinDate: "2023-01-20",
    products: [
      {
        id: "p4",
        name: "Fresh Tilapia",
        price: 25000,
        unit: "per kg",
        category: "Fresh Fish",
        description: "Farm-raised tilapia, fresh and cleaned. Raised without antibiotics in clean ponds.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 50
      },
      {
        id: "p5",
        name: "Catfish Fillets",
        price: 30000,
        unit: "per kg",
        category: "Fresh Fish",
        description: "Premium catfish fillets, boneless and ready to cook. Fresh from our sustainable farm.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 20
      },
      {
        id: "p6",
        name: "Smoked Fish",
        price: 35000,
        unit: "per kg",
        category: "Processed Fish",
        description: "Traditional smoked fish, preserved using natural smoking methods.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: false,
        quantity: 0
      }
    ]
  },
  {
    id: "v3",
    name: "Bangura Rice Cooperative",
    location: "Makeni",
    verified: true,
    rating: 4.7,
    reviewCount: 92,
    farmerType: "organic",
    description: "Community cooperative growing traditional rice varieties using sustainable methods.",
    image: FARM_IMAGES.riceFarm,
    joinDate: "2022-11-10",
    products: [
      {
        id: "p7",
        name: "Premium White Rice",
        price: 120000,
        unit: "per bag (50kg)",
        category: "Grains",
        description: "High-quality white rice from traditional varieties. Grown without chemicals.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 30
      },
      {
        id: "p8",
        name: "Brown Rice",
        price: 130000,
        unit: "per bag (50kg)",
        category: "Grains",
        description: "Nutritious brown rice, minimally processed to retain nutrients.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 20
      },
      {
        id: "p9",
        name: "Parboiled Rice",
        price: 125000,
        unit: "per bag (50kg)",
        category: "Grains",
        description: "Traditional parboiled rice with enhanced nutritional value.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 25
      }
    ]
  },
  {
    id: "v4",
    name: "Sesay Poultry Farm",
    location: "Kenema",
    verified: false,
    rating: 4.3,
    reviewCount: 45,
    farmerType: "poultry",
    description: "Family-run poultry farm providing fresh eggs and free-range chickens.",
    image: FARM_IMAGES.poultryFarm,
    joinDate: "2023-06-01",
    products: [
      {
        id: "p10",
        name: "Fresh Eggs",
        price: 2000,
        unit: "per dozen",
        category: "Poultry",
        description: "Farm-fresh eggs from free-range chickens. Collected daily.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 100
      },
      {
        id: "p11",
        name: "Whole Chicken",
        price: 45000,
        unit: "per chicken (2-3kg)",
        category: "Poultry",
        description: "Free-range whole chicken, naturally raised without growth hormones.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 15
      },
      {
        id: "p12",
        name: "Chicken Parts",
        price: 18000,
        unit: "per kg",
        category: "Poultry",
        description: "Fresh chicken parts - wings, thighs, and drumsticks.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 30
      }
    ]
  },
  {
    id: "v5",
    name: "Kargbo Fruit Orchard",
    location: "Bo District",
    verified: true,
    rating: 4.9,
    reviewCount: 156,
    farmerType: "organic",
    description: "Organic fruit orchard growing mangoes, oranges, and other tropical fruits.",
    image: FARM_IMAGES.fruitOrchard,
    joinDate: "2022-08-20",
    products: [
      {
        id: "p13",
        name: "Ripe Mangoes",
        price: 12000,
        unit: "per box (20 pieces)",
        category: "Fruits",
        description: "Sweet, juicy mangoes at perfect ripeness. Organically grown.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 35
      },
      {
        id: "p14",
        name: "Fresh Oranges",
        price: 15000,
        unit: "per box (30 pieces)",
        category: "Fruits",
        description: "Vitamin C-rich oranges, perfect for juice or eating fresh.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 40
      },
      {
        id: "p15",
        name: "Mixed Tropical Fruits",
        price: 20000,
        unit: "per basket",
        category: "Fruits",
        description: "Seasonal mix of tropical fruits including pawpaw, pineapple, and citrus.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 20
      }
    ]
  },
  {
    id: "v6",
    name: "Turay Palm Oil Production",
    location: "Bonthe",
    verified: true,
    rating: 4.5,
    reviewCount: 78,
    farmerType: "organic",
    description: "Traditional palm oil production using sustainable harvesting methods.",
    image: FARM_IMAGES.palmPlantation,
    joinDate: "2023-02-14",
    products: [
      {
        id: "p16",
        name: "Pure Palm Oil",
        price: 18000,
        unit: "per liter",
        category: "Oils",
        description: "100% pure red palm oil, traditionally extracted from fresh palm fruits.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 50
      },
      {
        id: "p17",
        name: "Palm Kernel Oil",
        price: 25000,
        unit: "per liter",
        category: "Oils",
        description: "Premium palm kernel oil, ideal for cooking and cosmetic use.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 30
      },
      {
        id: "p18",
        name: "Palm Wine",
        price: 3000,
        unit: "per bottle",
        category: "Beverages",
        description: "Fresh palm wine, naturally fermented. Best consumed within 2 days.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: false,
        quantity: 0
      }
    ]
  },
  {
    id: "v7",
    name: "Freetown Urban Gardens",
    location: "Freetown",
    verified: false,
    rating: 3.9,
    reviewCount: 32,
    farmerType: "organic",
    description: "Urban farming initiative growing fresh vegetables and herbs in the heart of Freetown.",
    image: FARM_IMAGES.urbanGarden,
    joinDate: "2023-08-05",
    products: [
      {
        id: "p19",
        name: "Leafy Greens",
        price: 3000,
        unit: "per bunch",
        category: "Vegetables",
        description: "Fresh lettuce, spinach, and kale grown using hydroponic methods.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 60
      },
      {
        id: "p20",
        name: "Fresh Herbs",
        price: 2000,
        unit: "per pack",
        category: "Herbs",
        description: "Mixed herbs including basil, cilantro, and parsley. Pesticide-free.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 40
      },
      {
        id: "p21",
        name: "Cherry Tomatoes",
        price: 8000,
        unit: "per kg",
        category: "Vegetables",
        description: "Sweet cherry tomatoes, perfect for salads. Grown in controlled environment.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 25
      }
    ]
  },
  {
    id: "v8",
    name: "Kailahun Cassava Collective",
    location: "Kailahun",
    verified: true,
    rating: 4.4,
    reviewCount: 67,
    farmerType: "organic",
    description: "Cooperative of smallholder farmers specializing in high-quality cassava production.",
    image: FARM_IMAGES.cassavaFarm,
    joinDate: "2023-04-12",
    products: [
      {
        id: "p22",
        name: "Fresh Cassava Tubers",
        price: 14000,
        unit: "per bag (40kg)",
        category: "Root Vegetables",
        description: "Premium cassava tubers, freshly harvested. Ideal for processing.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 45
      },
      {
        id: "p23",
        name: "Gari (Processed Cassava)",
        price: 20000,
        unit: "per bag (25kg)",
        category: "Processed Foods",
        description: "High-quality gari, traditionally processed from fresh cassava.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 30
      },
      {
        id: "p24",
        name: "Cassava Flour",
        price: 22000,
        unit: "per bag (25kg)",
        category: "Processed Foods",
        description: "Fine cassava flour, gluten-free and perfect for baking.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 20
      }
    ]
  },
  {
    id: "v9",
    name: "Port Loko Fish Traders",
    location: "Port Loko",
    verified: false,
    rating: 4.1,
    reviewCount: 28,
    farmerType: "fish",
    description: "Fresh and smoked fish from the coastal waters, delivered daily to markets.",
    image: FARM_IMAGES.coastalFishing,
    joinDate: "2023-07-18",
    products: [
      {
        id: "p25",
        name: "Fresh Sea Fish",
        price: 28000,
        unit: "per kg",
        category: "Fresh Fish",
        description: "Daily catch of sea fish including snapper, grouper, and mackerel.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 35
      },
      {
        id: "p26",
        name: "Smoked Bonga Fish",
        price: 40000,
        unit: "per kg",
        category: "Processed Fish",
        description: "Traditional smoked bonga fish, popular for soups and stews.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 20
      },
      {
        id: "p27",
        name: "Dried Fish",
        price: 45000,
        unit: "per kg",
        category: "Processed Fish",
        description: "Sun-dried fish, perfect for long-term storage and flavoring dishes.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: false,
        quantity: 0
      }
    ]
  },
  {
    id: "v10",
    name: "Moyamba Vegetable Growers",
    location: "Moyamba",
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    farmerType: "organic",
    description: "Sustainable vegetable farming with focus on leafy greens and root vegetables.",
    image: FARM_IMAGES.vegetableFarm,
    joinDate: "2022-12-03",
    products: [
      {
        id: "p28",
        name: "Sweet Potatoes",
        price: 12000,
        unit: "per bag (30kg)",
        category: "Root Vegetables",
        description: "Nutritious orange-fleshed sweet potatoes, rich in vitamins.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 40
      },
      {
        id: "p29",
        name: "Green Beans",
        price: 6000,
        unit: "per kg",
        category: "Vegetables",
        description: "Fresh green beans, crisp and tender. Perfect for cooking.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 25
      },
      {
        id: "p30",
        name: "Local Spinach",
        price: 2500,
        unit: "per bunch",
        category: "Leafy Greens",
        description: "Traditional local spinach, rich in iron and nutrients.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 50
      }
    ]
  },
  {
    id: "v11",
    name: "Tonkolili Livestock Farm",
    location: "Tonkolili",
    verified: false,
    rating: 3.8,
    reviewCount: 21,
    farmerType: "poultry",
    description: "Mixed livestock farm raising goats, sheep, and chickens for meat and dairy.",
    image: FARM_IMAGES.livestockFarm,
    joinDate: "2023-09-10",
    products: [
      {
        id: "p31",
        name: "Goat Meat",
        price: 35000,
        unit: "per kg",
        category: "Meat",
        description: "Fresh goat meat, lean and flavorful. Raised on natural pasture.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 15
      },
      {
        id: "p32",
        name: "Fresh Goat Milk",
        price: 8000,
        unit: "per liter",
        category: "Dairy",
        description: "Fresh goat milk, rich in nutrients and easier to digest than cow milk.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 20
      },
      {
        id: "p33",
        name: "Local Chicken",
        price: 40000,
        unit: "per chicken (1.5-2kg)",
        category: "Poultry",
        description: "Free-range local chicken, naturally tough and flavorful.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: false,
        quantity: 0
      }
    ]
  },
  {
    id: "v12",
    name: "Western Area Aquaculture",
    location: "Freetown",
    verified: true,
    rating: 4.7,
    reviewCount: 103,
    farmerType: "fish",
    description: "Modern aquaculture facility producing premium fish using sustainable practices.",
    image: FARM_IMAGES.aquaculture,
    joinDate: "2022-10-15",
    products: [
      {
        id: "p34",
        name: "Premium Tilapia",
        price: 32000,
        unit: "per kg",
        category: "Fresh Fish",
        description: "Large, premium tilapia from modern aquaculture systems. Consistently high quality.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 60
      },
      {
        id: "p35",
        name: "African Catfish",
        price: 28000,
        unit: "per kg",
        category: "Fresh Fish",
        description: "African catfish raised in controlled conditions. Fast-growing and tasty.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 40
      },
      {
        id: "p36",
        name: "Fish Fingerlings",
        price: 200,
        unit: "per piece",
        category: "Fish Stock",
        description: "Healthy fish fingerlings for stocking ponds. Various species available.",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150&fit=crop&q=80",
        inStock: true,
        quantity: 1000
      }
    ]
  }
]

export const getVendorById = (id: string): Vendor | undefined => {
  return mockVendors.find(vendor => vendor.id === id)
}

export const getVendorsByLocation = (location: string): Vendor[] => {
  if (location === "all") return mockVendors
  return mockVendors.filter(vendor => 
    vendor.location.toLowerCase().includes(location.toLowerCase())
  )
}

export const getVendorsByType = (farmerType: string): Vendor[] => {
  return mockVendors.filter(vendor => vendor.farmerType === farmerType)
}

export const searchVendors = (query: string): Vendor[] => {
  const searchTerm = query.toLowerCase()
  return mockVendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm) ||
    vendor.description.toLowerCase().includes(searchTerm) ||
    vendor.location.toLowerCase().includes(searchTerm)
  )
}
