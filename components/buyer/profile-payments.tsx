"use client"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Phone, Plus, Trash } from "lucide-react"

export function ProfilePayments() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Payment Methods</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Choose your preferred payment method.</DialogDescription>
            </DialogHeader>
            <form>
              <div className="grid gap-4 py-4">
                <RadioGroup defaultValue="mobile_money" className="space-y-4">
                  <div className="flex items-center space-x-2 border rounded-xl p-4">
                    <RadioGroupItem value="mobile_money" id="add_mobile_money" />
                    <Label htmlFor="add_mobile_money" className="flex-1 cursor-pointer">
                      <div className="font-medium">Mobile Money</div>
                      <div className="text-sm text-gray-500">Orange Money or Africell Money</div>
                    </Label>
                    <div className="flex gap-2">
                      <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        OM
                      </div>
                      <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        AM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-xl p-4">
                    <RadioGroupItem value="bank_transfer" id="add_bank_transfer" />
                    <Label htmlFor="add_bank_transfer" className="flex-1 cursor-pointer">
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-gray-500">Direct bank transfer</div>
                    </Label>
                    <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      SL
                    </div>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="payment_name">Name</Label>
                  <Input id="payment_name" placeholder="Payment method name" className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_phone">Mobile Money Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="ml-2 text-sm text-gray-500">+232</span>
                    </div>
                    <Input
                      id="payment_phone"
                      type="tel"
                      placeholder="76 123456"
                      className="rounded-l-none rounded-r-xl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Save Payment Method
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Orange Money
                </CardTitle>
                <Badge className="mt-1 bg-primary text-white">Default</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-1 text-sm">
              <p className="font-medium">John Doe</p>
              <p>+232 76 123456</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Africell Money
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-1 text-sm">
              <p className="font-medium">John Doe</p>
              <p>+232 77 654321</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="rounded-xl">
              Set as Default
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
