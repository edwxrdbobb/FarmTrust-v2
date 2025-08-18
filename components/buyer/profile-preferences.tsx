"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"

export function ProfilePreferences() {
  const [preferences, setPreferences] = useState({
    notifications: {
      orderUpdates: true,
      promotions: true,
      farmerUpdates: false,
      smsNotifications: true,
    },
    language: "en",
    region: "western",
    currency: "leone",
    privacy: {
      profileVisibility: true,
      dataCollection: true,
      thirdPartyMarketing: false,
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const { user, loading, updatePreferences } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences)
    }
  }, [user])

  const handleNotificationChange = (key: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }))
  }

  const handlePrivacyChange = (key: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: checked,
      },
    }))
  }

  const handleSelectChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    const success = await updatePreferences(preferences)
    setIsLoading(false)
    
    if (success) {
      toast({
        title: "Success",
        description: "Preferences updated successfully!",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    }
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
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order_updates" className="font-medium">
                  Order Updates
                </Label>
                <p className="text-sm text-gray-500">Receive notifications about your order status</p>
              </div>
              <Switch 
                id="order_updates" 
                checked={preferences.notifications.orderUpdates}
                onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promotions" className="font-medium">
                  Promotions
                </Label>
                <p className="text-sm text-gray-500">Receive notifications about deals and discounts</p>
              </div>
              <Switch 
                id="promotions" 
                checked={preferences.notifications.promotions}
                onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="farmer_updates" className="font-medium">
                  Farmer Updates
                </Label>
                <p className="text-sm text-gray-500">Get notified when your favorite farmers add new products</p>
              </div>
              <Switch 
                id="farmer_updates" 
                checked={preferences.notifications.farmerUpdates}
                onCheckedChange={(checked) => handleNotificationChange('farmerUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_notifications" className="font-medium">
                  SMS Notifications
                </Label>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <Switch 
                id="sms_notifications" 
                checked={preferences.notifications.smsNotifications}
                onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>Customize your language and regional preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={preferences.language} onValueChange={(value) => handleSelectChange('language', value)}>
              <SelectTrigger id="language" className="rounded-xl">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="kri">Krio</SelectItem>
                <SelectItem value="tem">Temne</SelectItem>
                <SelectItem value="men">Mende</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={preferences.region} onValueChange={(value) => handleSelectChange('region', value)}>
              <SelectTrigger id="region" className="rounded-xl">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="western">Western Area</SelectItem>
                <SelectItem value="northern">Northern Province</SelectItem>
                <SelectItem value="eastern">Eastern Province</SelectItem>
                <SelectItem value="southern">Southern Province</SelectItem>
                <SelectItem value="northwest">North West Province</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Currency Display</Label>
            <RadioGroup value={preferences.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="leone" id="leone" />
                <Label htmlFor="leone">Leone (Le)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="usd" id="usd" />
                <Label htmlFor="usd">US Dollar ($)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="rounded-xl" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Manage your privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profile_visibility" className="font-medium">
                Profile Visibility
              </Label>
              <p className="text-sm text-gray-500">Allow vendors to see your profile information</p>
            </div>
            <Switch 
              id="profile_visibility" 
              checked={preferences.privacy.profileVisibility}
              onCheckedChange={(checked) => handlePrivacyChange('profileVisibility', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data_collection" className="font-medium">
                Data Collection
              </Label>
              <p className="text-sm text-gray-500">Allow us to collect data to improve your experience</p>
            </div>
            <Switch 
              id="data_collection" 
              checked={preferences.privacy.dataCollection}
              onCheckedChange={(checked) => handlePrivacyChange('dataCollection', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="third_party" className="font-medium">
                Third-Party Marketing
              </Label>
              <p className="text-sm text-gray-500">Allow third-party marketing communications</p>
            </div>
            <Switch 
              id="third_party" 
              checked={preferences.privacy.thirdPartyMarketing}
              onCheckedChange={(checked) => handlePrivacyChange('thirdPartyMarketing', checked)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="rounded-xl" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Privacy Settings"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
