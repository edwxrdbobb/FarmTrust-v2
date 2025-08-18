"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Camera, Phone, User, Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"

export function ProfileInfo() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  
  const { user, loading, error, updateProfile, updatePassword } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = await updateProfile(formData)
    
    if (success) {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      setIsEditing(false)
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)
    const success = await updatePassword(passwordData.currentPassword, passwordData.newPassword)
    setIsUpdatingPassword(false)
    
    if (success) {
      toast({
        title: "Success",
        description: "Password updated successfully!",
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } else {
      toast({
        title: "Error",
        description: error || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit}>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="rounded-xl" type="button">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing} 
                    className="rounded-xl" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-xl">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="ml-2 text-sm text-gray-500">+232</span>
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone?.replace('+232 ', '') || ''}
                      onChange={(e) => handleInputChange({
                        target: { name: 'phone', value: `+232 ${e.target.value}` }
                      } as any)}
                      disabled={!isEditing}
                      className="rounded-l-none rounded-r-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="rounded-xl"
                    placeholder="Your address"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="rounded-xl" 
                    onClick={() => {
                      setIsEditing(false)
                      // Reset form data
                      if (user) {
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          address: user.address || "",
                        })
                      }
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </>
              ) : (
                <Button type="button" className="rounded-xl" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                name="currentPassword"
                type="password" 
                placeholder="••••••••" 
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="rounded-xl" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  name="newPassword"
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="rounded-xl" 
                />
                <p className="text-sm text-gray-500">Must be at least 8 characters long</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="rounded-xl" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="rounded-xl" 
              disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
