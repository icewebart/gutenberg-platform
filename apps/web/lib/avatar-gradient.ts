// 10 purple/blue gradient variants for profile avatars
const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700",
  "from-purple-500 to-pink-600",
  "from-indigo-500 to-blue-700",
  "from-fuchsia-500 to-purple-700",
  "from-blue-600 to-violet-600",
  "from-purple-600 to-indigo-500",
  "from-violet-600 to-fuchsia-600",
  "from-indigo-600 to-purple-500",
  "from-sky-500 to-indigo-600",
]

/** Returns a Tailwind gradient className deterministically based on the user id */
export function getAvatarGradient(id?: string | null): string {
  if (!id) return GRADIENTS[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return GRADIENTS[hash % GRADIENTS.length]
}
