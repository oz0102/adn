// app/(dashboard)/discipleship-goals/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3,
  Target,
  Plus,
  TrendingUp,
  User,
  Users,
  Droplet,
  Flame,
  School,
  UserCog,
  LucideLayoutGrid
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DiscipleshipGoalChart } from "@/components/discipleship-goals/goal-chart"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

interface DiscipleshipGoal {
  _id: string
  year: number
  month?: number
  quarter?: number
  goalType: 'Monthly' | 'Quarterly' | 'Annual'
  targets: {
    newConverts: number
    waterBaptism: number
    holyGhostBaptism: number
    discipleshipTraining: number
    leadership: number
    churchAttendance: number
  }
  current: {
    newConverts: number
    waterBaptism: number
    holyGhostBaptism: number
    discipleshipTraining: number
    leadership: number
    churchAttendance: number
  }
  progress: {
    newConverts: number
    waterBaptism: number
    holyGhostBaptism: number
    discipleshipTraining: number
    leadership: number
    churchAttendance: number
  }
}

export default function DiscipleshipGoalsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [goals, setGoals] = useState<DiscipleshipGoal[]>([])
  const [currentGoal, setCurrentGoal] = useState<DiscipleshipGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<'Monthly' | 'Quarterly' | 'Annual'>('Annual')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1")
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [newGoalData, setNewGoalData] = useState({
    goalType: 'Annual',
    year: new Date().getFullYear(),
    period: '1',
    newConverts: '100',
    waterBaptism: '80',
    holyGhostBaptism: '60',
    discipleshipTraining: '50',
    leadership: '20',
    churchAttendance: '150'
  })
  
  useEffect(() => {
    fetchGoals()
  }, [])

  useEffect(() => {
    // Find the appropriate goal to display based on selected filters
    updateCurrentGoal()
  }, [goals, viewType, selectedYear, selectedPeriod])

  const fetchGoals = async () => {
    try {
      setIsLoading(true)
      
      // In a real implementation, you would fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const mockGoals: DiscipleshipGoal[] = [
        {
          _id: 'annual2023',
          year: 2023,
          goalType: 'Annual',
          targets: {
            newConverts: 500,
            waterBaptism: 400,
            holyGhostBaptism: 300,
            discipleshipTraining: 250,
            leadership: 100,
            churchAttendance: 800
          },
          current: {
            newConverts: 520,
            waterBaptism: 390,
            holyGhostBaptism: 310,
            discipleshipTraining: 240,
            leadership: 95,
            churchAttendance: 820
          },
          progress: {
            newConverts: 104,
            waterBaptism: 97.5,
            holyGhostBaptism: 103.3,
            discipleshipTraining: 96,
            leadership: 95,
            churchAttendance: 102.5
          }
        },
        {
          _id: 'annual2024',
          year: 2024,
          goalType: 'Annual',
          targets: {
            newConverts: 600,
            waterBaptism: 500,
            holyGhostBaptism: 350,
            discipleshipTraining: 300,
            leadership: 120,
            churchAttendance: 900
          },
          current: {
            newConverts: 200,
            waterBaptism: 150,
            holyGhostBaptism: 100,
            discipleshipTraining: 80,
            leadership: 30,
            churchAttendance: 600
          },
          progress: {
            newConverts: 33.3,
            waterBaptism: 30,
            holyGhostBaptism: 28.6,
            discipleshipTraining: 26.7,
            leadership: 25,
            churchAttendance: 66.7
          }
        },
        {
          _id: 'q12024',
          year: 2024,
          quarter: 1,
          goalType: 'Quarterly',
          targets: {
            newConverts: 150,
            waterBaptism: 120,
            holyGhostBaptism: 90,
            discipleshipTraining: 75,
            leadership: 30,
            churchAttendance: 800
          },
          current: {
            newConverts: 145,
            waterBaptism: 110,
            holyGhostBaptism: 85,
            discipleshipTraining: 70,
            leadership: 25,
            churchAttendance: 780
          },
          progress: {
            newConverts: 96.7,
            waterBaptism: 91.7,
            holyGhostBaptism: 94.4,
            discipleshipTraining: 93.3,
            leadership: 83.3,
            churchAttendance: 97.5
          }
        },
        {
          _id: 'q22024',
          year: 2024,
          quarter: 2,
          goalType: 'Quarterly',
          targets: {
            newConverts: 150,
            waterBaptism: 120,
            holyGhostBaptism: 90,
            discipleshipTraining: 75,
            leadership: 30,
            churchAttendance: 800
          },
          current: {
            newConverts: 55,
            waterBaptism: 40,
            holyGhostBaptism: 15,
            discipleshipTraining: 10,
            leadership: 5,
            churchAttendance: 620
          },
          progress: {
            newConverts: 36.7,
            waterBaptism: 33.3,
            holyGhostBaptism: 16.7,
            discipleshipTraining: 13.3,
            leadership: 16.7,
            churchAttendance: 77.5
          }
        },
        {
          _id: 'apr2024',
          year: 2024,
          month: 4,
          goalType: 'Monthly',
          targets: {
            newConverts: 50,
            waterBaptism: 40,
            holyGhostBaptism: 30,
            discipleshipTraining: 25,
            leadership: 10,
            churchAttendance: 800
          },
          current: {
            newConverts: 55,
            waterBaptism: 35,
            holyGhostBaptism: 15,
            discipleshipTraining: 10,
            leadership: 5,
            churchAttendance: 620
          },
          progress: {
            newConverts: 110,
            waterBaptism: 87.5,
            holyGhostBaptism: 50,
            discipleshipTraining: 40,
            leadership: 50,
            churchAttendance: 77.5
          }
        }
      ]
      
      setGoals(mockGoals)
    } catch (error) {
      console.error("Error fetching discipleship goals:", error)
      toast({
        title: "Error",
        description: "Failed to load discipleship goals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateCurrentGoal = () => {
    if (goals.length === 0) return
    
    let matchingGoal: DiscipleshipGoal | undefined
    
    if (viewType === 'Annual') {
      matchingGoal = goals.find(goal => goal.goalType === 'Annual' && goal.year === selectedYear)
    } else if (viewType === 'Quarterly') {
      matchingGoal = goals.find(goal => 
        goal.goalType === 'Quarterly' && 
        goal.year === selectedYear && 
        goal.quarter === parseInt(selectedPeriod)
      )
    } else if (viewType === 'Monthly') {
      matchingGoal = goals.find(goal => 
        goal.goalType === 'Monthly' && 
        goal.year === selectedYear && 
        goal.month === parseInt(selectedPeriod)
      )
    }
    
    setCurrentGoal(matchingGoal || null)
  }

  const handleAddGoal = () => {
    // In a real implementation, you would submit this to your API
    toast({
      title: "Success",
      description: "Discipleship goal has been created successfully.",
    })
    
    setIsAddingGoal(false)
    
    // Simulate adding the new goal to our local state
    const newGoal: DiscipleshipGoal = {
      _id: `goal-${Date.now()}`,
      year: parseInt(newGoalData.year.toString()),
      goalType: newGoalData.goalType as 'Monthly' | 'Quarterly' | 'Annual',
      ...(newGoalData.goalType === 'Monthly' && { month: parseInt(newGoalData.period) }),
      ...(newGoalData.goalType === 'Quarterly' && { quarter: parseInt(newGoalData.period) }),
      targets: {
        newConverts: parseInt(newGoalData.newConverts),
        waterBaptism: parseInt(newGoalData.waterBaptism),
        holyGhostBaptism: parseInt(newGoalData.holyGhostBaptism),
        discipleshipTraining: parseInt(newGoalData.discipleshipTraining),
        leadership: parseInt(newGoalData.leadership),
        churchAttendance: parseInt(newGoalData.churchAttendance)
      },
      current: {
        newConverts: 0,
        waterBaptism: 0,
        holyGhostBaptism: 0,
        discipleshipTraining: 0,
        leadership: 0,
        churchAttendance: 0
      },
      progress: {
        newConverts: 0,
        waterBaptism: 0,
        holyGhostBaptism: 0,
        discipleshipTraining: 0,
        leadership: 0,
        churchAttendance: 0
      }
    }
    
    setGoals([...goals, newGoal])
    
    // Set the view to match the new goal
    setViewType(newGoal.goalType)
    setSelectedYear(newGoal.year)
    setSelectedPeriod(
      newGoal.goalType === 'Monthly' ? newGoal.month?.toString() || "1" :
      newGoal.goalType === 'Quarterly' ? newGoal.quarter?.toString() || "1" : "1"
    )
  }

  const getMonthLabel = (monthNumber: number) => {
    return new Date(2000, monthNumber - 1).toLocaleString('default', { month: 'long' })
  }

  const renderPeriodSelector = () => {
    if (viewType === 'Annual') {
      return null
    } else if (viewType === 'Quarterly') {
      return (
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Q1</SelectItem>
            <SelectItem value="2">Q2</SelectItem>
            <SelectItem value="3">Q3</SelectItem>
            <SelectItem value="4">Q4</SelectItem>
          </SelectContent>
        </Select>
      )
    } else if (viewType === 'Monthly') {
      return (
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }).map((_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {getMonthLabel(i + 1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
  }

  const renderGoalCard = () => {
    if (isLoading) {
      return (
        <Card className="animate-pulse">
          <CardHeader className="h-20 bg-gray-100 dark:bg-gray-800"></CardHeader>
          <CardContent className="pt-4">
            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
          </CardContent>
        </Card>
      )
    }
    
    if (!currentGoal) {
      return (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goal Found</h3>
            <p className="text-gray-500 mb-4">
              There is no {viewType.toLowerCase()} goal for the selected period.
            </p>
            <Button onClick={() => setIsAddingGoal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Goal
            </Button>
          </CardContent>
        </Card>
      )
    }
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {viewType === 'Annual' && `${currentGoal.year} Annual Goals`}
              {viewType === 'Quarterly' && `Q${currentGoal.quarter} ${currentGoal.year} Goals`}
              {viewType === 'Monthly' && `${getMonthLabel(currentGoal.month!)} ${currentGoal.year} Goals`}
            </CardTitle>
            <Badge variant="outline">
              {viewType === 'Annual' && 'Annual Goals'}
              {viewType === 'Quarterly' && 'Quarterly Goals'}
              {viewType === 'Monthly' && 'Monthly Goals'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">New Converts</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="text-2xl font-bold">{currentGoal.targets.newConverts}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold">{currentGoal.current.newConverts}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-blue-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(currentGoal.progress.newConverts, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm mt-1">
                  {Math.round(currentGoal.progress.newConverts)}%
                </p>
              </div>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold">Water Baptism</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="text-2xl font-bold">{currentGoal.targets.waterBaptism}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold">{currentGoal.current.waterBaptism}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-indigo-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(currentGoal.progress.waterBaptism, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm mt-1">
                  {Math.round(currentGoal.progress.waterBaptism)}%
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Holy Ghost Baptism</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="text-2xl font-bold">{currentGoal.targets.holyGhostBaptism}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold">{currentGoal.current.holyGhostBaptism}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-red-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(currentGoal.progress.holyGhostBaptism, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm mt-1">
                  {Math.round(currentGoal.progress.holyGhostBaptism)}%
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <School className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Discipleship Training</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="text-2xl font-bold">{currentGoal.targets.discipleshipTraining}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold">{currentGoal.current.discipleshipTraining}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(currentGoal.progress.discipleshipTraining, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm mt-1">
                  {Math.round(currentGoal.progress.discipleshipTraining)}%
                </p>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCog className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Leadership</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="text-2xl font-bold">{currentGoal.targets.leadership}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold">{currentGoal.current.leadership}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-purple-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(currentGoal.progress.leadership, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm mt-1">
                  {Math.round(currentGoal.progress.leadership)}%
                </p>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Church Attendance</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="text-2xl font-bold">{currentGoal.targets.churchAttendance}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-2xl font-bold">{currentGoal.current.churchAttendance}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-amber-200 rounded-full h-2.5">
                  <div 
                    className="bg-amber-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(currentGoal.progress.churchAttendance, 100)}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm mt-1">
                  {Math.round(currentGoal.progress.churchAttendance)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Discipleship Goals</h1>
        <Button onClick={() => setIsAddingGoal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Set New Goal
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Overview</CardTitle>
          <CardDescription>
            Track your discipleship goals progress over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="pb-6 space-y-4">
            <Tabs defaultValue="targets" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="targets">
                  <Target className="mr-2 h-4 w-4" /> Target Metrics
                </TabsTrigger>
                <TabsTrigger value="progress">
                  <TrendingUp className="mr-2 h-4 w-4" /> Progress Trends
                </TabsTrigger>
              </TabsList>
              <TabsContent value="targets" className="pt-4">
                <DiscipleshipGoalChart 
                  data={goals.filter(goal => goal.goalType === 'Annual')} 
                  type="targets"
                />
              </TabsContent>
              <TabsContent value="progress" className="pt-4">
                <DiscipleshipGoalChart 
                  data={goals.filter(goal => goal.goalType === 'Annual')} 
                  type="progress"
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Current Goals</h2>
            <p className="text-sm text-gray-500">View and track your discipleship goals</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="View type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            
            {renderPeriodSelector()}
          </div>
        </div>
        
        {renderGoalCard()}
      </div>
      
      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set New Discipleship Goal</DialogTitle>
            <DialogDescription>
              Define your targets for each discipleship area
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select 
                  value={newGoalData.goalType} 
                  onValueChange={(value) => setNewGoalData({...newGoalData, goalType: value})}
                >
                  <SelectTrigger id="goalType">
                    <SelectValue placeholder="Goal Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select 
                  value={newGoalData.year.toString()} 
                  onValueChange={(value) => setNewGoalData({...newGoalData, year: parseInt(value)})}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newGoalData.goalType !== 'Annual' && (
              <div className="space-y-2">
                <Label htmlFor="period">
                  {newGoalData.goalType === 'Quarterly' ? 'Quarter' : 'Month'}
                </Label>
                {newGoalData.goalType === 'Quarterly' ? (
                  <Select 
                    value={newGoalData.period} 
                    onValueChange={(value) => setNewGoalData({...newGoalData, period: value})}
                  >
                    <SelectTrigger id="period">
                      <SelectValue placeholder="Select Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select 
                    value={newGoalData.period} 
                    onValueChange={(value) => setNewGoalData({...newGoalData, period: value})}
                  >
                                       <SelectTrigger id="period">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">May</SelectItem>
                      <SelectItem value="6">June</SelectItem>
                      <SelectItem value="7">July</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            
            <div className="space-y-4 pt-2">
              <h3 className="font-medium">Target Values</h3>
              
              <div className="space-y-2">
                <Label htmlFor="newConverts" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" /> New Converts
                </Label>
                <Input
                  id="newConverts"
                  type="number"
                  value={newGoalData.newConverts}
                  onChange={(e) => setNewGoalData({...newGoalData, newConverts: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="waterBaptism" className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-indigo-500" /> Water Baptism
                </Label>
                <Input
                  id="waterBaptism"
                  type="number"
                  value={newGoalData.waterBaptism}
                  onChange={(e) => setNewGoalData({...newGoalData, waterBaptism: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="holyGhostBaptism" className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-500" /> Holy Ghost Baptism
                </Label>
                <Input
                  id="holyGhostBaptism"
                  type="number"
                  value={newGoalData.holyGhostBaptism}
                  onChange={(e) => setNewGoalData({...newGoalData, holyGhostBaptism: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discipleshipTraining" className="flex items-center gap-2">
                  <School className="h-4 w-4 text-green-500" /> Discipleship Training
                </Label>
                <Input
                  id="discipleshipTraining"
                  type="number"
                  value={newGoalData.discipleshipTraining}
                  onChange={(e) => setNewGoalData({...newGoalData, discipleshipTraining: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leadership" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-purple-500" /> Leadership
                </Label>
                <Input
                  id="leadership"
                  type="number"
                  value={newGoalData.leadership}
                  onChange={(e) => setNewGoalData({...newGoalData, leadership: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="churchAttendance" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" /> Church Attendance
                </Label>
                <Input
                  id="churchAttendance"
                  type="number"
                  value={newGoalData.churchAttendance}
                  onChange={(e) => setNewGoalData({...newGoalData, churchAttendance: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              Set Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}