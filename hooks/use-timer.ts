"use client"

import { useState, useEffect, useCallback } from "react"

export function useTimer() {
  const [time, setTime] = useState("00:00:00")
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  useEffect(() => {
    setTime(formatTime(seconds))
  }, [seconds, formatTime])

  const startTimer = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
    setSeconds(0)
    setTime("00:00:00")
  }, [])

  return {
    time,
    isRunning,
    startTimer,
    stopTimer,
  }
}

