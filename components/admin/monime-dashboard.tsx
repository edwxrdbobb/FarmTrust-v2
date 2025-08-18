"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  RefreshCw, 
  Phone,
  CreditCard,
  Activity
} from "lucide-react"
import { monimeService } from "@/services/monime_service"

interface PaymentMethod {
  id: string
  name: string
  type: 'mobile_money' | 'card' | 'bank_transfer'
  provider?: string
  description: string
  icon?: string
}

interface ConfigStatus {
  configured: boolean
  missing: string[]
}

export function MonimeDashboard() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Get configuration status
      const status = monimeService.getConfigStatus()
      setConfigStatus(status)

      // Get available payment methods
      const methods = monimeService.getAvailablePaymentMethods()
      setPaymentMethods(methods)

      setLastChecked(new Date())
    } catch (error) {
      console.error('Error loading Monime dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (configured: boolean) => {
    return configured ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Configured
      </Badge>
    ) : (
      <Badge variant="destructive">
        Not Configured
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading Monime configuration...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monime Payment Integration</h2>
          <p className="text-muted-foreground">
            Monitor and manage your Monime payment configuration
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Status
          </CardTitle>
          <CardDescription>
            Current status of your Monime integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(configStatus?.configured || false)}
              <span className="font-medium">Integration Status</span>
            </div>
            {getStatusBadge(configStatus?.configured || false)}
          </div>

          {!configStatus?.configured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Missing Configuration:</div>
                <ul className="list-disc list-inside space-y-1">
                  {configStatus?.missing.map((item) => (
                    <li key={item} className="text-sm">
                      {item} - Add to your .env.local file
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {configStatus?.configured && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All required environment variables are configured. Your Monime integration is ready to use.
              </AlertDescription>
            </Alert>
          )}

          {lastChecked && (
            <p className="text-xs text-muted-foreground">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Supported Payment Methods
          </CardTitle>
          <CardDescription>
            Available mobile money providers in Sierra Leone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl">{method.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {method.description}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {method.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Environment Information
          </CardTitle>
          <CardDescription>
            Current environment and API configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Environment</div>
              <div className="text-lg font-semibold">
                {process.env.NEXT_PUBLIC_MONIME_ENVIRONMENT || 'sandbox'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">API Base URL</div>
              <div className="text-lg font-semibold">
                {process.env.NEXT_PUBLIC_MONIME_BASE_URL || 'https://api.monime.io'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Webhook URL</div>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/monime/webhook
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Currency</div>
              <div className="text-lg font-semibold">SLE (Sierra Leone Leone)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing your Monime integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Test Payment
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              View Logs
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Monitor Webhooks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
