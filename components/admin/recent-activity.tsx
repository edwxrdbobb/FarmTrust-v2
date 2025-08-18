"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ActivityItem {
  id: string
  type: 'user_registration' | 'order_completed' | 'dispute_created' | 'farmer_request' | 'product_added'
  user: {
    name: string
    avatar?: string
  }
  description: string
  timestamp: string
  status: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        // Combine recent orders, users, and disputes into activity feed
        const combinedActivities: ActivityItem[] = []
        
        // Add recent orders
        if (data.data.recent?.orders) {
          data.data.recent.orders.forEach((order: any) => {
            combinedActivities.push({
              id: order._id,
              type: 'order_completed',
              user: { name: order.customer?.name || 'Unknown Customer' },
              description: `Order #${order.orderNumber} completed`,
              timestamp: order.updatedAt,
              status: order.status
            })
          })
        }
        
        // Add recent users
        if (data.data.recent?.users) {
          data.data.recent.users.forEach((user: any) => {
            combinedActivities.push({
              id: user._id,
              type: 'user_registration',
              user: { name: user.name || user.email },
              description: `${user.role} registered`,
              timestamp: user.createdAt,
              status: 'completed'
            })
          })
        }
        
        // Add recent disputes
        if (data.data.recent?.disputes) {
          data.data.recent.disputes.forEach((dispute: any) => {
            combinedActivities.push({
              id: dispute._id,
              type: 'dispute_created',
              user: { name: dispute.complainantName || 'Unknown User' },
              description: `Dispute created for order #${dispute.orderId}`,
              timestamp: dispute.createdAt,
              status: dispute.status
            })
          })
        }
        
        // Sort by timestamp and take the most recent 5
        combinedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setActivities(combinedActivities.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string, type: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <Badge className="bg-[#227C4F]">Completed</Badge>
      case 'pending':
        return <Badge className="bg-[#F5C451]">Pending</Badge>
      case 'disputed':
      case 'open':
        return <Badge className="bg-red-500 text-white">Issue</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="ml-4 space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-8">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.user.avatar || "/abstract-geometric-shapes.png"} alt="Avatar" />
                  <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(activity.status, activity.type)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
