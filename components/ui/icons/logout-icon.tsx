"use client"

import { motion } from 'framer-motion'
export const LogoutIcon = ({ ...props }: React.ComponentProps<typeof motion.svg>) => ( // Type props to match motion.svg component props
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em" 
    height="1em"
    viewBox="0 0 24 24"
    whileHover={{ x: 3 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    <path
      fill="currentColor"
      d="M5 21q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h7v2H5v14h7v2H5Zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5l-5 5Z"
    />
  </motion.svg>
) 