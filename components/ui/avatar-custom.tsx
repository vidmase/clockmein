"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { Root, Image, Fallback } from "@radix-ui/react-avatar"

export const Avatar = React.forwardRef<React.ElementRef<typeof Root>, React.ComponentPropsWithoutRef<typeof Root>>(
  ({ className, ...props }, ref) => {
    return (
      <Root
        ref={ref}
        className={cx("block h-10 w-10 flex-none overflow-hidden rounded-full relative select-none", className)}
        {...props}
      />
    )
  }
)
Avatar.displayName = "Avatar"

export const AvatarImage = React.forwardRef<React.ElementRef<typeof Image>, React.ComponentPropsWithoutRef<typeof Image>>(
  ({ className, ...props }, ref) => {
    return (
      <Image
        ref={ref}
        className={cx("h-full w-full object-cover object-center absolute", className)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

export const AvatarFallback = React.forwardRef<React.ElementRef<typeof Fallback>, React.ComponentPropsWithoutRef<typeof Fallback>>(
  ({ className, ...props }, ref) => {
    return (
      <Fallback
        ref={ref}
        className={cx("flex h-full w-full items-center justify-center bg-amber-800 text-white text-sm font-semibold absolute dark:bg-amber-300 dark:text-black", className)}
        {...props}
      />
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"