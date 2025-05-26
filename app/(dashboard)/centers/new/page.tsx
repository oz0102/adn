"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Building, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"

// Form schema
const centerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Center name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
  description: z.string().optional(),
})

type CenterFormValues = z.infer<typeof centerFormSchema>

export default function NewCenterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default values for the form
  const defaultValues: Partial<CenterFormValues> = {
    name: "",
    location: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
  }

  const form = useForm<CenterFormValues>({
    resolver: zodResolver(centerFormSchema),
    defaultValues,
  })

  async function onSubmit(data: CenterFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/centers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create center")
      }

      const result = await response.json()
      
      toast({
        title: "Center Created",
        description: `${data.name} has been successfully created.`,
      })
      
      // Redirect to the new center's page
      router.push(`/centers/${result.center._id}`)
    } catch (error: Error) {
      console.error("Error creating center:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create center. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Center</h1>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            <CardTitle>Center Information</CardTitle>
          </div>
          <CardDescription>
            Enter the details for the new center. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Center Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter center name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The official name of the center.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormDescription>
                      The general location of the center (e.g., "Downtown", "North District").
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a description of the center" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the center, its mission, or other relevant information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/centers")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Center"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
