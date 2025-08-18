"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileInfo } from "@/components/buyer/profile-info"
import { ProfileAddresses } from "@/components/buyer/profile-addresses"
import { ProfilePayments } from "@/components/buyer/profile-payments"
import { ProfilePreferences } from "@/components/buyer/profile-preferences"
import { User, MapPin, CreditCard, Settings } from "lucide-react"

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("personal")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
        <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          <User className="mr-2 h-4 w-4" />
          Personal Info
        </TabsTrigger>
        <TabsTrigger value="addresses" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          <MapPin className="mr-2 h-4 w-4" />
          Addresses
        </TabsTrigger>
        <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          <CreditCard className="mr-2 h-4 w-4" />
          Payment Methods
        </TabsTrigger>
        <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          <Settings className="mr-2 h-4 w-4" />
          Preferences
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <ProfileInfo />
      </TabsContent>

      <TabsContent value="addresses">
        <ProfileAddresses />
      </TabsContent>

      <TabsContent value="payments">
        <ProfilePayments />
      </TabsContent>

      <TabsContent value="preferences">
        <ProfilePreferences />
      </TabsContent>
    </Tabs>
  )
}
