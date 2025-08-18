"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, CheckCircle, Download, ExternalLink, FileText, MapPin, Phone, XCircle } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function AdminFarmerRequestDetailsPage({ params }: { params: { requestId: string } }) {
  const { toast } = useToast()
  // Mock request data - in a real app, you would fetch this based on the requestId
  const request = {
    id: params.requestId,
    farmerName: "Aminata Sesay",
    email: "aminata.sesay@example.com",
    phone: "+232 76 123 4567",
    location: "Bo",
    district: "Southern Province",
    coordinates: "8.4167° N, 11.7833° W",
    submittedDate: "2023-05-15",
    status: "pending",
    farmSize: "5 acres",
    farmType: "Mixed Crops",
    crops: ["Cassava", "Plantain", "Rice"],
    bio: "Small-scale farmer specializing in cassava and plantain cultivation. Farming for over 10 years with sustainable practices.",
    avatar: "/abstract-geometric-shapes.png",
    documents: [
      { id: "doc1", name: "ID Card", type: "image/jpeg", size: "1.2 MB" },
      { id: "doc2", name: "Land Ownership Certificate", type: "application/pdf", size: "2.5 MB" },
      { id: "doc3", name: "Farming Certification", type: "application/pdf", size: "1.8 MB" },
    ],
    farmPhotos: [
      { id: "photo1", url: "/sierra-leone-farm.png", caption: "Main farm area" },
      { id: "photo2", url: "/sierra-leone-farm-produce.png", caption: "Harvested produce" },
    ],
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/farmer-requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Farmer Verification Request</h1>
          <Badge
            className={
              request.status === "approved"
                ? "bg-green-500"
                : request.status === "pending"
                  ? "bg-[#F5C451]"
                  : "bg-red-500"
            }
          >
            {request.status}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.farmerName} />
                  <AvatarFallback>{request.farmerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-bold">{request.farmerName}</h2>
                <p className="mt-2 text-sm text-gray-500">{request.email}</p>
                <p className="flex items-center text-sm text-gray-500">
                  <Phone className="mr-1 h-4 w-4" />
                  {request.phone}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  {request.location}, {request.district}
                </p>

                <div className="mt-6 w-full">
                  <Separator className="my-4" />
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Request ID:</span>
                      <span className="text-sm font-medium">{request.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Submitted:</span>
                      <span className="text-sm font-medium">
                        {new Date(request.submittedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Farm Size:</span>
                      <span className="text-sm font-medium">{request.farmSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Farm Type:</span>
                      <span className="text-sm font-medium">{request.farmType}</span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                </div>

                <div className="mt-4 flex w-full gap-2">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      toast({
                        title: "Request approved",
                        description: `${request.farmerName}'s verification request has been approved.`,
                      })
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-500"
                    onClick={() => {
                      toast({
                        title: "Request rejected",
                        description: `${request.farmerName}'s verification request has been rejected.`,
                      })
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 md:col-span-2">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="photos">Farm Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Farmer Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{request.bio}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Crops & Produce</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {request.crops.map((crop) => (
                        <Badge key={crop} variant="outline" className="bg-[#227C4F] bg-opacity-10 text-[#227C4F]">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Farm Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Coordinates</span>
                        <span>{request.coordinates}</span>
                      </div>
                      <div className="h-[200px] rounded-md bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-500">Map view would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Documents</CardTitle>
                    <CardDescription>Documents submitted by the farmer for verification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {request.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-md bg-[#227C4F] bg-opacity-10 p-2 text-[#227C4F]">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                {doc.type} • {doc.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Farm Photos</CardTitle>
                    <CardDescription>Photos of the farm submitted by the farmer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {request.farmPhotos.map((photo) => (
                        <div key={photo.id} className="overflow-hidden rounded-lg border">
                          <div className="relative h-48 w-full">
                            <Image
                              src={photo.url || "/placeholder.svg"}
                              alt={photo.caption}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium">{photo.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
