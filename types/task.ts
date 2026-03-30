export interface Task {
  id: string
  content: string
  priority: number
  dueDate: string | null
  completed: boolean
  suggestions: string[]
  createdAt: string
}