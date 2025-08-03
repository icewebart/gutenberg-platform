import { Badge } from "@/components/ui/badge"

interface RoleBadgeProps {
  role: string
  department?: string
  className?: string
}

export function RoleBadge({ role, department, className }: RoleBadgeProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "board_member":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "volunteer":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "participant":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "HR":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "PR":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "FR":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "AB":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "Board":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Alumni":
        return "bg-teal-100 text-teal-800 border-teal-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatRole = (role: string) => {
    switch (role) {
      case "board_member":
        return "Board Member"
      case "volunteer":
        return "Volunteer"
      case "participant":
        return "Participant"
      case "admin":
        return "Admin"
      default:
        return role
    }
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      <Badge variant="outline" className={getRoleColor(role)}>
        {formatRole(role)}
      </Badge>
      {department && department !== "None" && (
        <Badge variant="outline" className={getDepartmentColor(department)}>
          {department}
        </Badge>
      )}
    </div>
  )
}
