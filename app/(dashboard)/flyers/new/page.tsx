//app\(dashboard)\flyers\new\page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/lib/client/components/ui/card"
import { Button } from "@/lib/client/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/client/components/ui/form"
import { Input } from "@/lib/client/components/ui/input"
import { Textarea } from "@/lib/client/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/client/components/ui/select"
import { useToast } from "@/lib/client/hooks/use-toast"
import { ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Flyer title must be at least 2 characters.",
  }),
  eventId: z.string().optional(),
  templateId: z.string().min(1, {
    message: "Please select a template.",
  }),
  contentTitle: z.string().min(2, {
    message: "Content title must be at least 2 characters.",
  }),
  contentSubtitle: z.string().optional(),
  date: z.string().min(1, {
    message: "Please select a date.",
  }),
  time: z.string().min(1, {
    message: "Please enter a time.",
  }),
  venue: z.string().min(2, {
    message: "Venue must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  contactInfo: z.string().optional(),
  status: z.enum(["Draft", "Published", "Archived"], {
    required_error: "Please select a status.",
  }),
})

export default function CreateFlyerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Mock data for dropdowns
  const events = [
    { _id: "event1", title: "Sunday Service" },
    { _id: "event2", title: "Midweek Prayer Meeting" },
    { _id: "event3", title: "Youth Conference" },
    { _id: "event4", title: "Christmas Concert" },
  ]
  
  const templates = [
    { _id: "template1", name: "Sunday Service Template", category: "Sunday Service" },
    { _id: "template2", name: "Conference Template", category: "Conference" },
    { _id: "template3", name: "Special Event Template", category: "Special Event" },
    { _id: "template4", name: "Midweek Service Template", category: "Midweek Service" },
  ]
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      eventId: "",
      templateId: "",
      contentTitle: "",
      contentSubtitle: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      contactInfo: "",
      status: "Draft",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // In a real implementation, you would send this data to your API
      console.log("Form values:", values)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Flyer created",
        description: "The flyer has been created successfully.",
      })
      
      // Redirect to flyers list
      router.push("/dashboard/flyers")
    } catch (error) {
      console.error("Error creating flyer:", error)
      toast({
        title: "Error",
        description: "Failed to create flyer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create Flyer</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/flyers">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Flyers
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Flyer Information</CardTitle>
          <CardDescription>
            Enter the details for the new flyer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flyer Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter flyer title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Event</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {events.map((event) => (
                            <SelectItem key={event._id} value={event._id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optional: Link this flyer to an event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template._id} value={template._id}>
                              {template.name} ({template.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Flyer Content</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="contentTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter content title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contentSubtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter content subtitle (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter venue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact information (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter flyer description" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <FormLabel>Flyer Image</FormLabel>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Upload Image
                      </Button>
                      <Input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                      <p className="text-sm text-gray-500">
                        Optional: Upload an image for the flyer
                      </p>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Image Preview:</p>
                        <div className="relative w-full max-w-md h-48 border rounded-md overflow-hidden">
                          <Image 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            width={300}
                            height={200}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImagePreview(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Create Flyer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
