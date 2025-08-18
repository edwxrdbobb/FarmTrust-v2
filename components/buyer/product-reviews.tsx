"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsDown, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"

interface Review {
  _id: string
  user: {
    name: string
    avatar?: string
  }
  rating: number
  date: string
  content: string
  helpful: number
  unhelpful: number
}

interface RatingSummary {
  average: number
  total: number
  distribution: Array<{
    rating: number
    count: number
  }>
}

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    average: 0,
    total: 0,
    distribution: []
  })
  const [loading, setLoading] = useState(true)
  const [helpfulClicks, setHelpfulClicks] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reviews?productId=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setRatingSummary(data.summary || {
          average: 0,
          total: 0,
          distribution: []
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHelpfulClick = (reviewId: string, type: "helpful" | "unhelpful") => {
    setHelpfulClicks((prev) => {
      // If already clicked the same button, remove the vote
      if (prev[reviewId] === type) {
        const newState = { ...prev }
        delete newState[reviewId]
        return newState
      }

      // Otherwise set or change the vote
      return { ...prev, [reviewId]: type }
    })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rating Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800">{ratingSummary.average}</div>
              <div className="flex items-center justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(ratingSummary.average) ? "text-[#F5C451] fill-[#F5C451]" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-1">{ratingSummary.total} reviews</div>
            </div>

            <div className="flex-1">
              {ratingSummary.distribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-2 mb-1">
                  <div className="text-sm text-gray-600 w-3">{item.rating}</div>
                  <Progress value={(item.count / ratingSummary.total) * 100} className="h-2 flex-1" />
                  <div className="text-sm text-gray-600 w-8">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full bg-[#227C4F] hover:bg-[#1b6a43] text-white rounded-xl">Write a Review</Button>
        </div>

        {/* Review Form - Hidden by default, would be shown when "Write a Review" is clicked */}
        <div className="hidden bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} className="text-gray-300 hover:text-[#F5C451]">
                    <Star className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                Your Review
              </label>
              <Textarea
                id="review"
                placeholder="Share your experience with this product..."
                className="min-h-[120px]"
              />
            </div>

            <Button className="bg-[#227C4F] hover:bg-[#1b6a43] text-white rounded-xl">Submit Review</Button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                    <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.user.name}</div>
                    <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
                  </div>
                </div>

                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "text-[#F5C451] fill-[#F5C451]" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-4 text-gray-700">{review.content}</p>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-sm text-gray-500">Was this review helpful?</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                                    className={`text-xs flex items-center gap-1 ${helpfulClicks[review._id] === "helpful" ? "text-[#227C4F]" : "text-gray-500"}`}
                onClick={() => handleHelpfulClick(review._id, "helpful")}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{helpfulClicks[review._id] === "helpful" ? review.helpful + 1 : review.helpful}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                                    className={`text-xs flex items-center gap-1 ${helpfulClicks[review._id] === "unhelpful" ? "text-red-500" : "text-gray-500"}`}
                onClick={() => handleHelpfulClick(review._id, "unhelpful")}
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span>{helpfulClicks[review._id] === "unhelpful" ? review.unhelpful + 1 : review.unhelpful}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length > 3 && (
          <div className="text-center">
            <Button variant="outline" className="border-[#227C4F] text-[#227C4F] hover:bg-[#227C4F]/10 rounded-xl">
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
