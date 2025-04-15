// components/members/spiritual-growth-tab.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface SpiritualGrowthStage {
  stage: string
  date: string
  notes?: string
}

const stageLabels = {
  newConvert: "New Convert",
  waterBaptism: "Water Baptism",
  holyGhostBaptism: "Holy Ghost Baptism",
  worker: "Worker",
  minister: "Minister",
  ordainedMinister: "Ordained Minister"
}

export function MemberSpiritualGrowthTab({ memberId }: { memberId: string }) {
  const { toast } = useToast()
  const [stages, setStages] = useState<SpiritualGrowthStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    stage: "",
    date: "",
    notes: ""
  })

  useEffect(() => {
    fetchSpiritualGrowth()
  }, [memberId, fetchSpiritualGrowth])

  const fetchSpiritualGrowth = async () => {
    try {
      setIsLoading(true)
      
      // In a real implementation, fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const mockStages: SpiritualGrowthStage[] = [
        {
          stage: "newConvert",
          date: "2020-01-15T00:00:00.000Z",
          notes: "Accepted Christ during Sunday service"
        },
        {
          stage: "waterBaptism",
          date: "2020-03-22T00:00:00.000Z",
          notes: "Baptized during Easter service"
        },
        {
          stage: "holyGhostBaptism",
          date: "2020-06-10T00:00:00.000Z",
          notes: "Received during prayer meeting"
        }
      ]
      
      setStages(mockStages)
    } catch (error) {
      console.error("Error fetching spiritual growth:", error)
      toast({
        title: "Error",
        description: "Failed to load spiritual growth data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.stage || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // In a real implementation, submit to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Fake submission delay
      
      // Simulate successful update
      const newStage: SpiritualGrowthStage = {
        stage: formData.stage,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes
      }
      
      setStages(prev => [...prev, newStage])
      
      toast({
        title: "Stage added",
        description: `${stageLabels[formData.stage as keyof typeof stageLabels]} stage has been recorded.`,
      })
      
      setIsDialogOpen(false)
      setFormData({
        stage: "",
        date: "",
        notes: ""
      })
    } catch (error) {
      console.error("Error adding spiritual growth stage:", error)
      toast({
        title: "Error",
        description: "Failed to add spiritual growth stage. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spiritual Growth Journey</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Stage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Spiritual Growth Stage</DialogTitle>
              <DialogDescription>
                Add a new spiritual growth milestone for this member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleFormChange("stage", value)}
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stageLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any relevant notes about this milestone"
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center">Loading spiritual growth data...</div>
        ) : stages.length === 0 ? (
          <div className="py-10 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Spiritual Growth Stages Recorded</h3>
            <p className="text-gray-500 mb-4">
              Add the first spiritual growth stage for this member.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Stage
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-8 relative pl-12">
              {stages.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-12 top-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {stageLabels[stage.stage as keyof typeof stageLabels]}
                    </h3>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(new Date(stage.date))}
                    </time>
                    {stage.notes && (
                      <p className="mt-1">{stage.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}