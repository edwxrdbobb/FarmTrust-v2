"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Edit, MapPin, Plus, Trash } from "lucide-react"

export function ProfileAddresses() {
  const [addresses, setAddresses] = useState([
    {
      id: "1",
      name: "Home",
      recipient: "John Doe",
      street: "123 Main Street",
      city: "Freetown",
      district: "Western Area Urban",
      phone: "+232 76 123456",
      isDefault: true,
    },
    {
      id: "2",
      name: "Work",
      recipient: "John Doe",
      street: "45 Commerce Street",
      city: "Freetown",
      district: "Western Area Urban",
      phone: "+232 76 123456",
      isDefault: false,
    },
  ])

  const [isAddingAddress, setIsAddingAddress] = useState(false)

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would add a new address
    setIsAddingAddress(false)
  }

  const handleDeleteAddress = (id: string) => {
    // In a real app, this would delete the address
    setAddresses(addresses.filter((address) => address.id !== id))
  }

  const handleSetDefault = (id: string) => {
    // In a real app, this would set the address as default
    setAddresses(
      addresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Addresses</h2>
        <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>Enter the details for your new delivery address.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAddress}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="addressName">Address Name</Label>
                  <Input id="addressName" placeholder="Home, Work, etc." className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Name</Label>
                  <Input id="recipient" placeholder="Full Name" className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea id="street" placeholder="Street address, house number" className="rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City/Town</Label>
                    <Input id="city" placeholder="City" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" placeholder="District" className="rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+232 76 123456" className="rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsAddingAddress(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Save Address
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <Card key={address.id} className={address.isDefault ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {address.name}
                  </CardTitle>
                  {address.isDefault && <Badge className="mt-1 bg-primary text-white">Default</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={address.isDefault}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{address.recipient}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.district}
                </p>
                <p>{address.phone}</p>
              </div>
            </CardContent>
            <CardFooter>
              {!address.isDefault && (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleSetDefault(address.id)}>
                  Set as Default
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
