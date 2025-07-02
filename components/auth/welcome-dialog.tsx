import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedWelcome } from '@/components/animated-welcome'

interface WelcomeDialogProps {
  username: string
  onClose: () => void
}

export function WelcomeDialog({ username, onClose }: WelcomeDialogProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
      router.push('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose, router])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ 
            duration: 0.4,
            ease: "easeOut"
          }}
          className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl"
        >
          <AnimatedWelcome username={username} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 