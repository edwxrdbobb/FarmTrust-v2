"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Globe, 
  Users, 
  AlertTriangle,
  Save,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    siteName: "FarmTrust",
    siteDescription: "Sierra Leone's Premier Agricultural Marketplace",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxFileUploadSize: "10MB",
    sessionTimeout: "24",
    maxLoginAttempts: "5"
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordMinLength: "8",
    passwordRequireSpecialChar: true,
    passwordRequireNumbers: true,
    sessionTimeout: "24",
    maxLoginAttempts: "5",
    enableRateLimiting: true,
    enableCSRFProtection: true
  })

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@farmtrust.sl",
    fromName: "FarmTrust Support",
    enableEmailNotifications: true
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderNotifications: true,
    disputeNotifications: true,
    systemNotifications: true,
    marketingEmails: false
  })

  const handleSaveSettings = async (category: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings Saved",
        description: `${category} settings have been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    setLoading(true)
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Email Test Successful",
        description: "Test email sent successfully. Please check your inbox.",
      })
    } catch (error) {
      toast({
        title: "Email Test Failed",
        description: "Failed to send test email. Please check your settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-500">Configure system-wide settings and preferences</p>
        </div>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="system">
              <Settings className="mr-2 h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Database className="mr-2 h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input
                      id="siteDescription"
                      value={systemSettings.siteDescription}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-gray-500">Temporarily disable the site for maintenance</p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registrationEnabled">User Registration</Label>
                      <p className="text-sm text-gray-500">Allow new users to register</p>
                    </div>
                    <Switch
                      id="registrationEnabled"
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, registrationEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailVerificationRequired">Email Verification Required</Label>
                      <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      id="emailVerificationRequired"
                      checked={systemSettings.emailVerificationRequired}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, emailVerificationRequired: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxFileUploadSize">Max File Upload Size</Label>
                    <Input
                      id="maxFileUploadSize"
                      value={systemSettings.maxFileUploadSize}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maxFileUploadSize: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maxLoginAttempts: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("System")} disabled={loading}>
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableRateLimiting">Rate Limiting</Label>
                      <p className="text-sm text-gray-500">Enable API rate limiting</p>
                    </div>
                    <Switch
                      id="enableRateLimiting"
                      checked={securitySettings.enableRateLimiting}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableRateLimiting: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableCSRFProtection">CSRF Protection</Label>
                      <p className="text-sm text-gray-500">Enable CSRF token protection</p>
                    </div>
                    <Switch
                      id="enableCSRFProtection"
                      checked={securitySettings.enableCSRFProtection}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enableCSRFProtection: checked })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="passwordRequireSpecialChar">Require Special Characters</Label>
                      <p className="text-sm text-gray-500">Passwords must contain special characters</p>
                    </div>
                    <Switch
                      id="passwordRequireSpecialChar"
                      checked={securitySettings.passwordRequireSpecialChar}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, passwordRequireSpecialChar: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                      <p className="text-sm text-gray-500">Passwords must contain numbers</p>
                    </div>
                    <Switch
                      id="passwordRequireNumbers"
                      checked={securitySettings.passwordRequireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, passwordRequireNumbers: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Security")} disabled={loading}>
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send system notifications via email</p>
                  </div>
                  <Switch
                    id="enableEmailNotifications"
                    checked={emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, enableEmailNotifications: checked })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleSaveSettings("Email")} disabled={loading}>
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Email Settings
                  </Button>
                  <Button variant="outline" onClick={handleTestEmail} disabled={loading}>
                    <Mail className="mr-2 h-4 w-4" />
                    Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderNotifications">Order Notifications</Label>
                      <p className="text-sm text-gray-500">Notifications for order updates</p>
                    </div>
                    <Switch
                      id="orderNotifications"
                      checked={notificationSettings.orderNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, orderNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="disputeNotifications">Dispute Notifications</Label>
                      <p className="text-sm text-gray-500">Notifications for dispute updates</p>
                    </div>
                    <Switch
                      id="disputeNotifications"
                      checked={notificationSettings.disputeNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, disputeNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemNotifications">System Notifications</Label>
                      <p className="text-sm text-gray-500">Important system announcements</p>
                    </div>
                    <Switch
                      id="systemNotifications"
                      checked={notificationSettings.systemNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, systemNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Receive promotional emails</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, marketingEmails: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings("Notification")} disabled={loading}>
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="systemLogs">System Logs</Label>
                    <Textarea
                      id="systemLogs"
                      placeholder="Recent system logs will appear here..."
                      rows={10}
                      className="font-mono text-sm"
                      readOnly
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Logs
                    </Button>
                    <Button variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Clear Logs
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Health</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>Database Status</span>
                      <Badge className="bg-green-500">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>Email Service</span>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>File Storage</span>
                      <Badge className="bg-green-500">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span>API Status</span>
                      <Badge className="bg-green-500">Healthy</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
