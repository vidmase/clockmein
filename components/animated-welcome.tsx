import { motion } from "framer-motion"
import { Sun, Star, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"

interface AnimatedWelcomeProps {
  username: string
}

export function AnimatedWelcome({ username }: AnimatedWelcomeProps) {
  const [greeting, setGreeting] = useState("")
  const { user } = useAuth()
  
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const emailName = user?.email?.split('@')[0] || 'Guest'

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const emojis = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌙"
  }

  const getTimeEmoji = () => {
    const hour = new Date().getHours()
    if (hour < 12) return emojis.morning
    if (hour < 18) return emojis.afternoon
    return emojis.evening
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-3"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-3xl"
        >
          {getTimeEmoji()}
        </motion.div>
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.02 }}
        >
          Welcome back, {emailName}! ✨
        </motion.h1>
      </motion.div>
    </motion.div>
  )
} 