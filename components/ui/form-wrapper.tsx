"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-states"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormWrapperProps {
  children: ReactNode
  title?: string
  description?: string
  onSubmit?: (e: React.FormEvent) => void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  isLoading?: boolean
  error?: string
  success?: string
  className?: string
  cardClassName?: string
  disabled?: boolean
  showFooter?: boolean
}

export function FormWrapper({
  children,
  title,
  description,
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  isLoading = false,
  error,
  success,
  className,
  cardClassName,
  disabled = false,
  showFooter = true
}: FormWrapperProps) {
  return (
    <Card className={cn("w-full max-w-2xl", cardClassName)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {children}
          </div>

          {showFooter && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {cancelText}
                </Button>
              )}
              <Button
                type="submit"
                disabled={disabled || isLoading}
                className="w-full sm:w-auto bg-[#227C4F] hover:bg-[#1b6a43]"
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {submitText}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Specialized form wrappers for different contexts

interface LoginFormWrapperProps extends Omit<FormWrapperProps, 'title' | 'submitText'> {
  title?: string
  submitText?: string
}

export function LoginFormWrapper({ 
  title = "Sign In",
  submitText = "Sign In",
  ...props 
}: LoginFormWrapperProps) {
  return (
    <FormWrapper
      title={title}
      description="Enter your credentials to access your account"
      submitText={submitText}
      showFooter={true}
      {...props}
    />
  )
}

export function RegisterFormWrapper({ 
  title = "Create Account",
  submitText = "Create Account",
  ...props 
}: LoginFormWrapperProps) {
  return (
    <FormWrapper
      title={title}
      description="Fill in your information to get started"
      submitText={submitText}
      showFooter={true}
      {...props}
    />
  )
}

interface ProductFormWrapperProps extends Omit<FormWrapperProps, 'title' | 'submitText'> {
  isEdit?: boolean
}

export function ProductFormWrapper({ 
  isEdit = false,
  ...props 
}: ProductFormWrapperProps) {
  return (
    <FormWrapper
      title={isEdit ? "Edit Product" : "Add New Product"}
      description={isEdit ? "Update your product information" : "Add a new product to your catalog"}
      submitText={isEdit ? "Update Product" : "Create Product"}
      cancelText="Cancel"
      showFooter={true}
      {...props}
    />
  )
}

interface ProfileFormWrapperProps extends Omit<FormWrapperProps, 'title' | 'submitText'> {
  userType?: 'vendor' | 'buyer' | 'admin'
}

export function ProfileFormWrapper({ 
  userType = 'buyer',
  ...props 
}: ProfileFormWrapperProps) {
  const titles = {
    vendor: "Farm Profile",
    buyer: "Profile Settings", 
    admin: "Admin Profile"
  }

  const descriptions = {
    vendor: "Update your farm and business information",
    buyer: "Manage your account preferences",
    admin: "Update your admin account details"
  }

  return (
    <FormWrapper
      title={titles[userType]}
      description={descriptions[userType]}
      submitText="Save Changes"
      showFooter={true}
      {...props}
    />
  )
}

// Field wrapper for consistent field styling
interface FormFieldProps {
  children: ReactNode
  label?: string
  error?: string
  required?: boolean
  description?: string
  className?: string
}

export function FormField({
  children,
  label,
  error,
  required = false,
  description,
  className
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// Section wrapper for organizing forms into sections
interface FormSectionProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function FormSection({
  children,
  title,
  description,
  className
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}
