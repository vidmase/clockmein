import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/hooks/useProjects"
import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProjectSelectorProps {
  value?: string
  onSelect: (projectId: string) => void
  isTemporary?: boolean
}

export function ProjectSelector({ value, onSelect, isTemporary }: ProjectSelectorProps) {
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(value)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { getProjects } = useProjects()

  useEffect(() => {
    const loadProjects = async () => {
      const data = await getProjects()
      setProjects(data)
    }
    loadProjects()
  }, [getProjects])

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
    if (isTemporary) {
      setShowConfirmation(true)
    } else {
      onSelect(projectId)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
        <SelectTrigger className={cn(
          "w-[200px]",
          isTemporary && "border-dashed border-orange-300 bg-orange-50"
        )}>
          <SelectValue placeholder={isTemporary ? "Assign project to save" : "Select a project"} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: project.color || '#94a3b8' }}
                />
                <span>{project.name}</span>
                <span className="text-xs text-slate-400">- {project.client}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showConfirmation && (
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={async () => {
              try {
                await onSelect(selectedProjectId)
                toast.success("Time entry saved successfully")
                setShowConfirmation(false)
              } catch (error) {
                toast.error("Failed to save time entry")
              }
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              setSelectedProjectId(value)
              setShowConfirmation(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 