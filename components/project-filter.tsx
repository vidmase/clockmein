import { useProjects } from "@/hooks/useProjects"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Briefcase, Clock } from "lucide-react"

interface ProjectFilterProps {
  selectedProject: string
  onProjectChange: (value: string) => void
  projectStats: {[key: string]: number}
}

export function ProjectFilter({ selectedProject, onProjectChange, projectStats }: ProjectFilterProps) {
  const { projects } = useProjects()

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedProject} onValueChange={onProjectChange}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-500" />
            <SelectValue placeholder="Filter by project" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: project.color }} 
                  />
                  <span>{project.name}</span>
                </div>
                {projectStats[project.id] && (
                  <span className="text-sm text-slate-500 ml-2">
                    {projectStats[project.id].toFixed(1)}h
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedProject !== 'all' && projectStats[selectedProject] && (
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
          <Clock className="h-4 w-4" />
          <span>{projectStats[selectedProject].toFixed(1)}h</span>
        </div>
      )}
    </div>
  )
} 