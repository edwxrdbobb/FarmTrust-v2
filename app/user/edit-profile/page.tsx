import type { Metadata } from "next"
import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"
import { ProfileTabs } from "@/components/buyer/profile-tabs"

export const metadata: Metadata = {
  title: "Edit Profile | FarmTrust",
  description: "Manage your FarmTrust profile and preferences",
}

export default function EditProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-500">Manage your account and preferences</p>
        </div>

        <ProfileTabs />
      </main>
    </div>
  )
}
