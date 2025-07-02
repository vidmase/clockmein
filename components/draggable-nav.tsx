import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { useState } from "react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  id: string
  href: string
  title: string
  icon: React.ReactNode
}

function DraggableNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={item.href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            pathname === item.href && "bg-muted"
          )}
        >
          {item.icon}
          {item.title}
        </Button>
      </Link>
    </div>
  )
}

export function DraggableNav({ items: initialItems }: { items: NavItem[] }) {
  const [items, setItems] = useState(initialItems)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const newItems = [...items]
      const [removed] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, removed)

      // Save order to localStorage
      localStorage.setItem('navOrder', JSON.stringify(newItems))
      
      return newItems
    })
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <nav className="space-y-1">
          {items.map((item) => (
            <DraggableNavItem key={item.id} item={item} />
          ))}
        </nav>
      </SortableContext>
    </DndContext>
  )
} 