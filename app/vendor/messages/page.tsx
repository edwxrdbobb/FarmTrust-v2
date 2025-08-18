"use client"

import { useState } from "react"
import { Search, Send, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"

export default function VendorMessagesPage() {
  const [activeChat, setActiveChat] = useState<string | null>("1")

  // Mock data for conversations
  const conversations = [
    { id: "1", name: "John Kamara", lastMessage: "When will the cassava be available?", time: "10:30 AM", unread: 2 },
    {
      id: "2",
      name: "Aminata Sesay",
      lastMessage: "I'd like to order 20kg of plantains",
      time: "Yesterday",
      unread: 0,
    },
    { id: "3", name: "Ibrahim Conteh", lastMessage: "Is the palm oil still available?", time: "Monday", unread: 0 },
    { id: "4", name: "Fatmata Koroma", lastMessage: "Thank you for the quick delivery!", time: "Last week", unread: 0 },
  ]

  // Mock data for messages in active conversation
  const messages = [
    { id: "1", sender: "buyer", text: "Hello, I'm interested in your cassava.", time: "10:15 AM" },
    {
      id: "2",
      sender: "vendor",
      text: "Hello! Yes, we have fresh cassava available. How much would you like?",
      time: "10:20 AM",
    },
    { id: "3", sender: "buyer", text: "I need about 10kg. When will it be available?", time: "10:25 AM" },
    { id: "4", sender: "buyer", text: "Also, do you deliver to Freetown?", time: "10:30 AM" },
  ]

  return (
    <VendorSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-4 border border-gray-200">
            <CardHeader className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Conversations</CardTitle>
                <Tabs defaultValue="all" className="w-[160px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search messages..." className="pl-8" />
              </div>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-15rem)]">
              <CardContent className="p-0">
                {conversations.map((conversation) => (
                  <div key={conversation.id}>
                    <button
                      className={`w-full flex items-start p-4 gap-3 hover:bg-gray-50 transition-colors ${
                        activeChat === conversation.id ? "bg-[#227C4F]/5" : ""
                      }`}
                      onClick={() => setActiveChat(conversation.id)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F5C451] flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-800">{conversation.name}</p>
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread > 0 && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#227C4F] flex items-center justify-center text-white text-xs">
                          {conversation.unread}
                        </div>
                      )}
                    </button>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-8 border border-gray-200 flex flex-col">
            {activeChat ? (
              <>
                <CardHeader className="px-6 py-4 border-b flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5C451] flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {conversations.find((c) => c.id === activeChat)?.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-6 h-[calc(100vh-22rem)]">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "vendor" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.sender === "vendor" ? "bg-[#227C4F] text-white" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${message.sender === "vendor" ? "text-white/70" : "text-gray-500"}`}
                          >
                            {message.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t mt-auto">
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button className="bg-[#227C4F] hover:bg-[#1b6a43]">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">No conversation selected</h3>
                  <p className="text-gray-500 mt-1">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </VendorSidebar>
  )
}
