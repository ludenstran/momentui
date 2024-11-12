"use client"

import * as React from "react"
import { useState, useCallback, useMemo, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PenLine, Check, Heart, Upload, Users, Plus, Trash2, GraduationCap, Briefcase, Trophy, PenSquare, X, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Types
interface FamilyMember {
  relationship: string
  name: string
  isDeceased: boolean
}

interface LifeStoryEvent {
  type: 'education' | 'career' | 'achievement' | 'marriage'
  details: {
    [key: string]: string
  }
}

interface FormState {
  option: 'create' | 'upload'
  importedText: string
  formData: {
    fullName: string
    preferredName: string
    gender: string
    dateOfBirth: string
    dateOfPassing: string
    birthPlace: string
    passingPlace: string
    description: string
  }
  selectedTraits: string[]
  familyMembers: FamilyMember[]
  events: LifeStoryEvent[]
}

// Constants
const TOTAL_STEPS = 5
const formCardTitleClass = "text-[32px] font-medium text-[#111] leading-[1.2] text-balance tracking-[-0.6px]"
const inputClass = "w-full h-11 placeholder:text-[#959595] border-[#E4E3F2]"
const labelClass = "text-sm font-medium text-gray-700"

// Context
const FormContext = createContext<{
  formState: FormState
  updateFormState: (updates: Partial<FormState>) => void
  updateFormData: (field: keyof FormState['formData'], value: string) => void
  toggleTrait: (trait: string) => void
  addFamilyMember: () => void
  updateFamilyMember: (index: number, field: keyof FamilyMember, value: any) => void
  removeFamilyMember: (index: number) => void
  addEvent: (event: LifeStoryEvent) => void
  updateEvent: (index: number, event: LifeStoryEvent) => void
  removeEvent: (index: number) => void
} | undefined>(undefined)

// Custom hook for using form context
const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider")
  }
  return context
}

// Components
const Header: React.FC<{ step: number; totalSteps: number }> = React.memo(({ step, totalSteps }) => (
  <header className="fixed top-0 left-0 right-0 bg-transparent border-b border-gray-200 z-50">
    <div className="h-20 flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <img 
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sparkle-xa4hhcyPWIcaNDx4Q6BedUyDubhDf4.svg" 
            alt="Sparkle" 
            width="27.6" 
            height="27.6" 
          />
          <span className="font-semibold text-gray-900">Storywriter</span>
        </div>
      </div>
      <div className="h-1 bg-gray-200">
        <div 
          className="h-full bg-[#1278F0] transition-all duration-300" 
          style={{ width: `${(step / totalSteps) * 100}%` }} 
        />
      </div>
    </div>
  </header>
))

const Footer: React.FC<{ 
  onBack: () => void
  onNext: () => void
  onSkip: () => void
  showSkip: boolean
  step: number
  totalSteps: number 
}> = React.memo(({ onBack, onNext, onSkip, showSkip, step, totalSteps }) => (
  <div className="fixed bottom-0 left-0 right-0">
    <div className="mx-auto p-4" style={{ maxWidth: '805px' }}>
      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-[32px] p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="text-[#1278F0] bg-white rounded-full px-8 h-14 text-base font-medium"
          disabled={step === 1}
        >
          Back
        </Button>
        {showSkip && (
          <Button variant="ghost" onClick={onSkip} className="text-gray-500 h-14 text-base font-medium">
            Skip this step
          </Button>
        )}
        <Button 
          onClick={onNext} 
          className="bg-[#1278F0] hover:bg-[#1278F0]/90 rounded-full px-8 h-14 text-base font-medium"
        >
          {step === totalSteps ? 'Finish' : 'Next step'}
        </Button>
      </div>
    </div>
  </div>
))

const Step1: React.FC<{ stepNumber: number; totalSteps: number }> = React.memo(({ stepNumber, totalSteps }) => {
  const { formState, updateFormState } = useFormContext()
  const { option, importedText } = formState

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <PenLine className="w-8 h-8 mx-auto mb-4 text-[#1278F0]" />
        <span className="text-xs font-bold text-gray-500 uppercase block tracking-[1.5px]">STEP {stepNumber} OF {totalSteps}</span>
        <h2 className={formCardTitleClass}>
          Create a story to celebrate a life well lived.
        </h2>
        <p className="text-gray-500 mt-4 text-balance">
          We're here to help refine your current obituary, or simply answer a few quick questions, and we'll create a beautiful, personalized life story for your loved one.
        </p>
      </div>
      <div className="space-y-6 mt-10">
        {['create', 'upload'].map((opt) => (
          <button
            key={opt}
            onClick={() => updateFormState({ option: opt as 'create' | 'upload' })}
            className={cn(
              "w-full p-6 flex items-center justify-between rounded-lg border-2 transition-all",
              option === opt ? 'border-[#1278F0] bg-[#1278F0]/5' : 'border-gray-200 hover:border-[#1278F0]/50'
            )}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#1278F0]/10 flex items-center justify-center">
                {opt === 'create' ? <PenLine className="w-5 h-5 text-[#1278F0]" /> : <Upload className="w-5 h-5 text-[#1278F0]" />}
              </div>
              <span className="text-base font-medium text-[#111]">{opt === 'create' ? 'Create from scratch' : 'Upload existing obituary'}</span>
            </div>
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center",
              option === opt ? 'border-[#1278F0] bg-white' : 'border-gray-200'
            )}>
              {option === opt && <Check className="w-4 h-4 text-[#1278F0]" />}
            </div>
          </button>
        ))}

        {option === 'upload' && (
          <div className="space-y-2 pt-4">
            <Label htmlFor="uploadText" className="text-[#404040] font-medium">Upload your existing obituary</Label>
            <Textarea
              id="uploadText"
              placeholder="Paste the text of the existing obituary here..."
              value={importedText}
              onChange={(e) => updateFormState({ importedText: e.target.value })}
              className="min-h-[200px] placeholder:text-[#959595] border-[#E4E3F2]"
            />
          </div>
        )}
      </div>
    </div>
  )
})

const Step2: React.FC<{ stepNumber: number; totalSteps: number }> = React.memo(({ stepNumber, totalSteps }) => {
  const { formState, updateFormData, toggleTrait } = useFormContext()
  const { formData, selectedTraits } = formState
  const traits = ['Loving', 'Generous', 'Adventurous', 'Kind', 'Humble', 'Compassionate', 'Intelligent', 'Funny', 'Hardworking', 'Creative']

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" fill="currentColor" />
        <span className="text-xs font-bold text-gray-500 uppercase block tracking-[1.5px]">STEP {stepNumber} OF {totalSteps}</span>
        <h2 className={`${formCardTitleClass} mt-1`}>
          About the Deceased
        </h2>
      </div>
      <div className="space-y-4">
        {[
          { id: 'fullName', label: 'Full Name', placeholder: 'Enter full name...' },
          { id: 'preferredName', label: 'Preferred Name', placeholder: 'Nickname or preferred name...' },
          { id: 'gender', label: 'Pronouns', type: 'select', options: ['he/him', 'she/her', 'they/them'] },
          { id: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
          { id: 'dateOfPassing', label: 'Date of Passing', type: 'date' },
          { id: 'birthPlace', label: 'Place of Birth', placeholder: 'Enter city and state of birth...' },
          { id: 'passingPlace', label: 'Place of Passing', placeholder: 'Enter city and state of passing...' },
          { id: 'description', label: 'Brief Description', placeholder: 'Describe them in one sentence.' },
        ].map((field) => (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className={labelClass}>{field.label}</Label>
            {field.type === 'select' ? (
              <Select value={formData[field.id as keyof FormState['formData']]} onValueChange={(value) => updateFormData(field.id as keyof FormState['formData'], value)}>
                <SelectTrigger id={field.id} className={inputClass}>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'date' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData[field.id as keyof FormState['formData']] && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData[field.id as keyof FormState['formData']] ? (
                      format(new Date(formData[field.id as keyof FormState['formData']]), "PPP")
                    ) : (
                      <span>MM/DD/YYYY</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData[field.id as keyof FormState['formData']] ? new Date(formData[field.id as keyof FormState['formData']]) : undefined}
                    onSelect={(date) => updateFormData(field.id as keyof FormState['formData'], date ? date.toISOString() : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Input 
                id={field.id} 
                placeholder={field.placeholder} 
                type={field.type || 'text'}
                value={formData[field.id as keyof FormState['formData']]}
                onChange={(e) => updateFormData(field.id as keyof FormState['formData'], e.target.value)}
                className={inputClass}
              />
            )}
          </div>
        ))}
        <div className="space-y-4">
          <Label className="text-[#404040] font-medium">Select up to 5 traits that best describe them.</Label>
          <div className="flex flex-wrap gap-3">
            {traits.map((trait) => (
              <label
                key={trait}
                className={cn(
                  "flex items-center px-4 h-11 rounded-full text-sm font-medium transition-colors",
                  selectedTraits.includes(trait)
                    ? 'bg-[#1278F0]/20 text-[#1278F0] '
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <Checkbox
                  checked={selectedTraits.includes(trait)}
                  onCheckedChange={() => toggleTrait(trait)}
                  className="mr-2 h-4 w-4 rounded-sm border-[1.5px] border-gray-300 bg-white data-[state=checked]:bg-white data-[state=checked]:text-[#1278F0] data-[state=checked]:border-[#1278F0]"
                />
                {trait}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

const Step3: React.FC<{ stepNumber: number; totalSteps: number }> = React.memo(({ stepNumber, totalSteps }) => {
  const { formState, addFamilyMember, updateFamilyMember, removeFamilyMember } = useFormContext()
  const { familyMembers } = formState
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null)

  const getRelationshipEmoji = (relationship: string) => {
    const emojis: { [key: string]: string } = {
      mother: '👩', father: '👨', partner: '❤️', child: '👶', sibling: '🧑‍🤝‍🧑'
    }
    return emojis[relationship] || '👤'
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <Users className="w-8 h-8 mx-auto mb-2 text-[#1278F0]" />
        <span className="text-xs font-bold text-gray-500 uppercase block tracking-[1.5px]">STEP {stepNumber} OF {totalSteps}</span>
        <h2 className={`${formCardTitleClass} mt-1`}>
          Immediate Family
        </h2>
        <p className="text-gray-500 mt-2">
          Add family members, you can always add more later
        </p>
      </div>
      <div className="space-y-4">
        <Button
          onClick={addFamilyMember}
          variant="outline"
          className="w-full h-14 mt-6 mb-4 bg-[#E9F3FF] hover:bg-[#D6E8FF] text-[#1278F0] rounded-full flex justify-between items-center px-8 border-0"
        >
          <span className="text-base font-medium">Add a family member</span>
          <div className="bg-white rounded-full p-1">
            <Plus className="h-5 w-5 text-[#1278F0]" />
          </div>
        </Button>
        {familyMembers.map((member, index) => (
          <div key={index} className="group">
            <div className="flex items-center gap-2 py-2 flex-wrap">
              <div className="flex items-center gap-3 min-w-[200px]">
                <Select
                  value={member.relationship}
                  onValueChange={(value) => updateFamilyMember(index, 'relationship', value)}
                >
                  <SelectTrigger className="w-[200px] h-11 border-[#E4E3F2] text-base font-normal">
                    <SelectValue placeholder="Select relationship">
                      {member.relationship && (
                        <span className="mr-2">
                          {getRelationshipEmoji(member.relationship)}
                        </span>
                      )}
                      {member.relationship ? member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1) : 'Select relationship'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {['mother', 'father', 'partner', 'child', 'sibling'].map((rel) => (
                      <SelectItem key={rel} value={rel}>
                        {getRelationshipEmoji(rel)} {rel.charAt(0).toUpperCase() + rel.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Enter name"
                value={member.name}
                onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                className={cn(inputClass, "flex-1")}
              />
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`deceased-${index}`}
                    checked={member.isDeceased}
                    onCheckedChange={(checked) => updateFamilyMember(index, 'isDeceased', checked as boolean)}
                    className="h-5 w-5 rounded-[4px] border-2 border-gray-200 data-[state=checked]:bg-[#1278F0] data-[state=checked]:border-[#1278F0]"
                  />
                  <Label
                    htmlFor={`deceased-${index}`}
                    className="text-base text-gray-600"
                  >
                    Deceased
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (member.relationship || member.name) {
                      setMemberToDelete(member)
                      setIsDeleteDialogOpen(true)
                    } else {
                      removeFamilyMember(index)
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Remove family member</span>
                </Button>
              </div>
            </div>
            {index < familyMembers.length - 1 && <Separator className="mt-2" />}
          </div>
        ))}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) setMemberToDelete(null)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this family member?
                {memberToDelete && (
                  <p className="mt-2">
                    <strong>Relationship:</strong> {memberToDelete.relationship || 'Not specified'}<br />
                    <strong>Name:</strong> {memberToDelete.name || 'Not specified'}
                  </p>
                )}
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (memberToDelete) {
                    const index = familyMembers.findIndex(m => m === memberToDelete)
                    if (index !== -1) {
                      removeFamilyMember(index)
                    }
                    setIsDeleteDialogOpen(false)
                    setMemberToDelete(null)
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
})

const Step4: React.FC<{ stepNumber: number; totalSteps: number }> = React.memo(({ stepNumber, totalSteps }) => {
  const { formState, addEvent, updateEvent, removeEvent } = useFormContext()
  const [selectedType, setSelectedType] = useState<LifeStoryEvent['type']>('education')
  const [formData, setFormData] = useState<{ [key: string]: string }>({})
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const eventTypes = [
    { id: 'education', label: 'Education', emoji: '🎓' },
    { id: 'career', label: 'Careers', emoji: '💼' },
    { id: 'achievement', label: 'Achievement', emoji: '🏆' },
    { id: 'marriage', label: 'Marriage', emoji: '💍' },
  ] as const

  const getFields = (type: LifeStoryEvent['type']) => {
    const fields = {
      education: [
        { id: 'degree', label: 'Degree', placeholder: 'Bachelor of Arts in English' },
        { id: 'yearCompleted', label: 'Year Completed', placeholder: '1980' },
        { id: 'schoolName', label: 'School Name', placeholder: 'State University, San Francisco, CA, USA' },
      ],
      career: [
        { id: 'position', label: 'Position', placeholder: 'High School English Teacher' },
        { id: 'company', label: 'Company', placeholder: 'Lincoln High School' },
        { id: 'duration', label: 'Duration', placeholder: '1971 - 1993' },
      ],
      achievement: [
        { id: 'title', label: 'Achievement Title', placeholder: 'Nobel Prize in Literature' },
        { id: 'description', label: 'Description', placeholder: 'Brief description of the achievement' },
        { id: 'year', label: 'Year', placeholder: '1980' },
      ],
      marriage: [
        { id: 'spouse', label: 'Spouse Name', placeholder: 'John Smith' },
        { id: 'location', label: 'Location', placeholder: 'San Francisco, CA' },
        { id: 'date', label: 'Wedding Date', placeholder: '1980' },
      ],
    }
    return fields[type]
  }

  const handleAddEvent = () => {
    if (Object.values(formData).every(value => value.trim() !== '')) {
      if (editingIndex !== null) {
        updateEvent(editingIndex, { type: selectedType, details: formData })
        setEditingIndex(null)
      } else {
        addEvent({ type: selectedType, details: formData })
      }
      setFormData({})
      setIsDialogOpen(false)
    }
  }

  const renderForm = () => (
    <div className="space-y-4">
      <div className="flex justify-between space-x-2 mb-4">
        {eventTypes.map(({ id, label, emoji }) => (
          <Button
            key={id}
            onClick={() => setSelectedType(id as LifeStoryEvent['type'])}
            variant={selectedType === id ? "default" : "outline"}
            className={cn(
              "flex-1 h-10 px-4 text-[14px] rounded-full",
              selectedType === id
                ? "bg-[#F5F9FF] border-2 border-[#1278F0] text-[#1278F0]"
                : "border border-[#E5E5E5] text-[#404040]"
            )}
          >
            <span className="mr-2">{emoji}</span>
            {label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {getFields(selectedType).map(field => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
              {field.label}
            </Label>
            <Input
              id={field.id}
              value={formData[field.id] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full"
            />
          </div>
        ))}
      </div>
      <Button type="submit" onClick={handleAddEvent} className="w-full mt-4">Add event</Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-gray-500 uppercase block tracking-[1.5px]">STEP {stepNumber} OF {totalSteps}</span>
        <h2 className="text-[32px] font-medium text-[#111] leading-[1.2] tracking-[-0.6px]">
          Life Story
        </h2>
        <p className="text-gray-500 mt-2">
          Add their primary life events, you can add more later
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="flex items-center justify-center p-6">
              <Button
                variant="ghost"
                className="text-[#1278F0] text-lg font-medium"
                onClick={() => setIsDialogOpen(true)}
              >
                + Add life story
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Life Story Event</DialogTitle>
            <DialogDescription>
              Enter the details of the life story event.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {formState.events.length > 0 && (
        <div className="space-y-4">
          {formState.events.map((event, index) => {
            const fields = getFields(event.type)
            const yearField = fields.find(f => f.id === 'yearCompleted' || f.id === 'duration' || f.id === 'year' || f.id === 'date')
            const titleField = fields.find(f => f.id === 'degree' || f.id === 'position' || f.id === 'title' || f.id === 'spouse')
            const subtitleField = fields.find(f => f.id === 'schoolName' || f.id === 'company' || f.id === 'description' || f.id === 'location')

            return (
              <Card key={index} className="bg-gray-50">
                <CardContent className="flex items-start space-x-3 p-4">
                  <div className="mt-1 text-2xl">
                    {eventTypes.find(t => t.id === event.type)?.emoji || '📅'}
                  </div>
                  <div className="flex-grow">
                    <div className="text-xs text-gray-500">
                      {event.details[yearField?.id || '']}
                    </div>
                    <div className="font-medium">
                      {event.details[titleField?.id || '']}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.details[subtitleField?.id || '']}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setSelectedType(event.type)
                        setFormData(event.details)
                        setEditingIndex(index)
                        setIsDialogOpen(true)
                      }}
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => removeEvent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
})

const Step5: React.FC<{ stepNumber: number; totalSteps: number }> = React.memo(({ stepNumber, totalSteps }) => {
  const { formState } = useFormContext()
  const { formData, selectedTraits, familyMembers, events } = formState

  const generateObituary = () => {
    let obituary = ""

    if (formData.fullName) {
      obituary += `${formData.fullName}`
      if (formData.preferredName) {
        obituary += `, affectionately known as ${formData.preferredName},`
      }
      obituary += " has passed away"
      if (formData.dateOfPassing) {
        obituary += ` on ${format(new Date(formData.dateOfPassing), "MMMM d, yyyy")}`
      }
      if (formData.passingPlace) {
        obituary += ` in ${formData.passingPlace}`
      }
      obituary += ".\n\n"
    }

    if (formData.dateOfBirth) {
      obituary += `Born on ${format(new Date(formData.dateOfBirth), "MMMM d, yyyy")}`
      if (formData.birthPlace) {
        obituary += ` in ${formData.birthPlace}`
      }
      obituary += ", "
      if (formData.fullName) {
        obituary += `${formData.fullName.split(' ')[0]}`
      } else {
        obituary += "They"
      }
      obituary += " lived a life filled with "
      if (selectedTraits.length > 0) {
        obituary += selectedTraits.join(", ") + ".\n\n"
      } else {
        obituary += "love and purpose.\n\n"
      }
    }

    if (formData.description) {
      obituary += `${formData.description}\n\n`
    }

    if (events.length > 0) {
      obituary += "Throughout their life, they achieved many milestones:\n"
      events.forEach(event => {
        switch (event.type) {
          case 'education':
            obituary += `- Graduated with a ${event.details.degree} from ${event.details.schoolName} in ${event.details.yearCompleted}\n`
            break
          case 'career':
            obituary += `- Worked as a ${event.details.position} at ${event.details.company} from ${event.details.duration}\n`
            break
          case 'achievement':
            obituary += `- Received ${event.details.title} in ${event.details.year}: ${event.details.description}\n`
            break
          case 'marriage':
            obituary += `- Married ${event.details.spouse} in ${event.details.date} at ${event.details.location}\n`
            break
        }
      })
      obituary += "\n"
    }

    if (familyMembers.length > 0) {
      const livingMembers = familyMembers.filter(member => !member.isDeceased)
      const deceasedMembers = familyMembers.filter(member => member.isDeceased)

      if (livingMembers.length > 0) {
        obituary += "They are survived by their loving family:\n"
        livingMembers.forEach(member => {
          obituary += `- ${member.name} (${member.relationship})\n`
        })
        obituary += "\n"
      }

      if (deceasedMembers.