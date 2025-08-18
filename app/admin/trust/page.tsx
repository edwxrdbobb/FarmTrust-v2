"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function AdminTrustPage() {
  // Sample data for the trust score distribution chart
  const trustScoreData = {
    labels: ["1", "2", "3", "4", "5"],
    datasets: [
      {
        label: "Farmers",
        data: [5, 10, 25, 40, 20],
        backgroundColor: "#227C4F",
      },
      {
        label: "Buyers",
        data: [3, 7, 20, 45, 25],
        backgroundColor: "#438DBB",
      },
    ],
  }

  const trustScoreOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Users",
        },
      },
      x: {
        title: {
          display: true,
          text: "Trust Score",
        },
      },
    },
  }

  // Sample data for the dispute rate chart
  const disputeRateData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Dispute Rate (%)",
        data: [3.2, 2.8, 2.5, 2.2, 1.9, 1.7],
        borderColor: "#F5C451",
        backgroundColor: "rgba(245, 196, 81, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const disputeRateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Dispute Rate (%)",
        },
      },
    },
  }

  // Sample data for top trusted users
  const topTrustedUsers = [
    {
      name: "Aminata Sesay",
      role: "farmer",
      location: "Bo",
      trustScore: 4.9,
      transactions: 156,
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      name: "James Koroma",
      role: "buyer",
      location: "Freetown",
      trustScore: 4.8,
      transactions: 78,
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      name: "Fatmata Kamara",
      role: "farmer",
      location: "Kenema",
      trustScore: 4.8,
      transactions: 124,
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      name: "Mohamed Bangura",
      role: "buyer",
      location: "Makeni",
      trustScore: 4.7,
      transactions: 62,
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      name: "Ibrahim Conteh",
      role: "farmer",
      location: "Freetown",
      trustScore: 4.7,
      transactions: 98,
      avatar: "/abstract-geometric-shapes.png",
    },
  ]

  // Sample data for flagged users
  const flaggedUsers = [
    {
      name: "Abdul Kargbo",
      role: "farmer",
      location: "Makeni",
      trustScore: 2.1,
      flags: 5,
      reason: "Product quality issues",
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      name: "Mariama Jalloh",
      role: "buyer",
      location: "Bo",
      trustScore: 2.3,
      flags: 4,
      reason: "Payment disputes",
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      name: "Isatu Turay",
      role: "farmer",
      location: "Kenema",
      trustScore: 2.5,
      flags: 3,
      reason: "Delivery issues",
      avatar: "/abstract-geometric-shapes.png",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trust Management</h1>
          <p className="text-gray-500">Monitor and manage trust scores across the platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Trust Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.3/5</div>
              <div className="mt-1 flex items-center">
                <Star className="h-4 w-4 fill-[#F5C451] text-[#F5C451]" />
                <Star className="h-4 w-4 fill-[#F5C451] text-[#F5C451]" />
                <Star className="h-4 w-4 fill-[#F5C451] text-[#F5C451]" />
                <Star className="h-4 w-4 fill-[#F5C451] text-[#F5C451]" />
                <Star className="h-4 w-4 fill-gray-200 text-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
