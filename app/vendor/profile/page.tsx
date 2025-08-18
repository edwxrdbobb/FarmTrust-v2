import type { Metadata } from "next"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Camera, Check, Save } from "lucide-react"

export const metadata: Metadata = {
  title: "Vendor Profile | FarmTrust",
  description: "Manage your vendor profile",
}

export default function VendorProfilePage() {
  return (
    <VendorSidebar>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Profile</h1>
          <p className="text-gray-500">Manage your farm profile and settings</p>
        </div>
        <Badge className="bg-[#227C4F] text-white">Verified Farmer</Badge>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="relative h-48 p-0">
                <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200&query=sierra+leone+farm')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-black/30"></div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Button variant="outline" size="sm" className="rounded-lg bg-white/80 backdrop-blur-sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Cover
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center -mt-12 sm:-mt-16 sm:flex-row sm:items-end sm:gap-4">
                  <div className="relative">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white sm:h-32 sm:w-32">
                      <img
                        src="/placeholder.svg?height=200&width=200&query=farmer+portrait"
                        alt="Ibrahim Kamara"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change avatar</span>
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-col items-center text-center sm:items-start sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900">Ibrahim Kamara</h2>
                    <p className="text-sm text-gray-500">Joined September 2022</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className="bg-[#F5C451] text-gray-800">4.8 Rating</Badge>
                      <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">
                        56 Reviews
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <Input id="fullName" defaultValue="Ibrahim Kamara" className="rounded-lg" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <Input id="email" type="email" defaultValue="ibrahim@example.com" className="rounded-lg" />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input id="phone" defaultValue="+232 76 123456" className="rounded-lg" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <Textarea
                        id="bio"
                        defaultValue="I am a third-generation farmer from Bo District, specializing in cassava and sweet potatoes. My farm uses sustainable practices to ensure the highest quality produce."
                        className="min-h-[120px] rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <div className="flex gap-2">
                        <Select defaultValue="bo">
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="freetown">Freetown</SelectItem>
                            <SelectItem value="bo">Bo District</SelectItem>
                            <SelectItem value="kenema">Kenema</SelectItem>
                            <SelectItem value="makeni">Makeni</SelectItem>
                            <SelectItem value="koidu">Koidu</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Village/Town" defaultValue="Baoma" className="rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t bg-gray-50 px-6 py-4">
                <Button className="rounded-lg bg-[#227C4F] hover:bg-[#1b6a43]">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farm Details</CardTitle>
                <CardDescription>Information about your farm business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="farmName" className="text-sm font-medium text-gray-700">
                    Farm Name
                  </label>
                  <Input id="farmName" defaultValue="Bo District Farm" className="rounded-lg" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="farmDescription" className="text-sm font-medium text-gray-700">
                    Farm Description
                  </label>
                  <Textarea
                    id="farmDescription"
                    defaultValue="We are a family-owned farm in Bo District, Sierra Leone. We specialize in growing cassava, sweet potatoes, and plantains using traditional and sustainable farming methods. Our produce is fresh, organic, and of the highest quality."
                    className="min-h-[120px] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="farmType" className="text-sm font-medium text-gray-700">
                      Farm Type
                    </label>
                    <Select defaultValue="organic">
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select farm type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organic">Organic Farm</SelectItem>
                        <SelectItem value="traditional">Traditional Farm</SelectItem>
                        <SelectItem value="mixed">Mixed Farming</SelectItem>
                        <SelectItem value="livestock">Livestock Farm</SelectItem>
                        <SelectItem value="fishery">Fishery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="farmSize" className="text-sm font-medium text-gray-700">
                      Farm Size (acres)
                    </label>
                    <Input id="farmSize" type="number" defaultValue="5" className="rounded-lg" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[#227C4F]/10 text-[#227C4F]">
                      Cassava
                      <button className="ml-1 rounded-full hover:bg-[#227C4F]/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </Badge>
                    <Badge className="bg-[#227C4F]/10 text-[#227C4F]">
                      Sweet Potatoes
                      <button className="ml-1 rounded-full hover:bg-[#227C4F]/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </Badge>
                    <Badge className="bg-[#227C4F]/10 text-[#227C4F]">
                      Plantains
                      <button className="ml-1 rounded-full hover:bg-[#227C4F]/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </Badge>
                    <Button variant="outline" size="sm" className="rounded-full border-dashed">
                      + Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Certifications</label>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Organic Certification</p>
                          <p className="text-sm text-gray-500">Verified on Sep 10, 2023</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-blue-600"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Sustainable Farming Practices</p>
                          <p className="text-sm text-gray-500">Verified on Aug 15, 2023</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <Separator className="my-4" />
                    <Button variant="outline" className="w-full rounded-lg border-dashed">
                      + Add New Certification
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t bg-gray-50 px-6 py-4">
                <Button className="rounded-lg bg-[#227C4F] hover:bg-[#1b6a43]">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <Input id="currentPassword" type="password" className="rounded-lg" />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <Input id="newPassword" type="password" className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <Input id="confirmPassword" type="password" className="rounded-lg" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="rounded-lg text-[#227C4F]">
                      Change Password
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications for new orders</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="orderNotifications"
                          className="relative inline-flex cursor-pointer items-center"
                        >
                          <input type="checkbox" id="orderNotifications" className="peer sr-only" defaultChecked />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#227C4F] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-[#227C4F]/20"></div>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Message Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications for new messages</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="messageNotifications"
                          className="relative inline-flex cursor-pointer items-center"
                        >
                          <input type="checkbox" id="messageNotifications" className="peer sr-only" defaultChecked />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#227C4F] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-[#227C4F]/20"></div>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-500">Receive emails about promotions and news</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label htmlFor="marketingEmails" className="relative inline-flex cursor-pointer items-center">
                          <input type="checkbox" id="marketingEmails" className="peer sr-only" />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#227C4F] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-[#227C4F]/20"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Account Actions</h3>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 9 6 6" />
                        <path d="m15 9-6 6" />
                      </svg>
                      Deactivate Account
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </VendorSidebar>
  )
}
