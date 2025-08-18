import { Star, StarHalf, ThumbsUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"

export default function VendorReviewsPage() {
  // Mock data for reviews
  const reviews = [
    {
      id: "1",
      customer: "John Kamara",
      product: "Fresh Cassava",
      rating: 5,
      date: "May 15, 2025",
      comment: "The cassava was very fresh and delivered on time. Great quality product!",
      replied: false,
    },
    {
      id: "2",
      customer: "Aminata Sesay",
      product: "Plantains",
      rating: 4,
      date: "May 12, 2025",
      comment: "Good quality plantains, but some were a bit too ripe. Overall satisfied with the purchase.",
      replied: true,
      reply: "Thank you for your feedback, Aminata. We'll ensure better selection next time.",
    },
    {
      id: "3",
      customer: "Ibrahim Conteh",
      product: "Palm Oil",
      rating: 5,
      date: "May 10, 2025",
      comment: "Excellent quality palm oil. Very pure and tastes just like what my grandmother used to make.",
      replied: false,
    },
    {
      id: "4",
      customer: "Fatmata Koroma",
      product: "Rice (Local)",
      rating: 3,
      date: "May 5, 2025",
      comment: "The rice was okay, but had some small stones. Please improve the cleaning process.",
      replied: true,
      reply:
        "We apologize for the inconvenience. We've improved our cleaning process. Please contact us for a partial refund.",
    },
  ]

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  // Count ratings by star
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-[#F5C451] text-[#F5C451]" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-[#F5C451] text-[#F5C451]" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />)
    }

    return stars
  }

  return (
    <VendorSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Customer Reviews</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Summary Card */}
        <Card className="lg:col-span-4 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Review Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center my-2">{renderStars(averageRating)}</div>
              <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
            </div>

            <Separator />

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="w-12 text-sm text-gray-600">{stars} stars</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F5C451]"
                      style={{ width: `${(ratingCounts[stars as keyof typeof ratingCounts] / reviews.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm text-gray-600 text-right">
                    {ratingCounts[stars as keyof typeof ratingCounts]}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button className="w-full bg-[#227C4F] hover:bg-[#1b6a43]">Download Reviews</Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">All Reviews</TabsTrigger>
                <TabsTrigger value="pending">Pending Replies</TabsTrigger>
                <TabsTrigger value="replied">Replied</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-4 mt-2">
              {reviews.map((review) => (
                <Card key={review.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{review.customer}</h3>
                          <Badge variant="outline" className="text-xs">
                            {review.product}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                      <Badge className={review.replied ? "bg-[#227C4F]" : "bg-[#F5C451]"}>
                        {review.replied ? "Replied" : "Pending Reply"}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {review.replied ? (
                      <div className="bg-gray-50 p-4 rounded-lg mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#227C4F]">Your Reply</Badge>
                          <span className="text-xs text-gray-500">May 16, 2025</span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.reply}</p>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-gray-600">
                          <ThumbsUp className="h-4 w-4 mr-1" /> Thank
                        </Button>
                        <Button size="sm" className="bg-[#227C4F] hover:bg-[#1b6a43]">
                          Reply
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-2">
              {reviews
                .filter((r) => !r.replied)
                .map((review) => (
                  <Card key={review.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{review.customer}</h3>
                            <Badge variant="outline" className="text-xs">
                              {review.product}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                        <Badge className="bg-[#F5C451]">Pending Reply</Badge>
                      </div>

                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-gray-600">
                          <ThumbsUp className="h-4 w-4 mr-1" /> Thank
                        </Button>
                        <Button size="sm" className="bg-[#227C4F] hover:bg-[#1b6a43]">
                          Reply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="replied" className="space-y-4 mt-2">
              {reviews
                .filter((r) => r.replied)
                .map((review) => (
                  <Card key={review.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{review.customer}</h3>
                            <Badge variant="outline" className="text-xs">
                              {review.product}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                        <Badge className="bg-[#227C4F]">Replied</Badge>
                      </div>

                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      <div className="bg-gray-50 p-4 rounded-lg mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#227C4F]">Your Reply</Badge>
                          <span className="text-xs text-gray-500">May 16, 2025</span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.reply}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </div>
    </VendorSidebar>
  )
}
