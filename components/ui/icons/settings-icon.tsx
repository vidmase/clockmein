"use client"

import { motion } from 'framer-motion'

export const Settings = ({ ...props }: React.SVGProps<SVGSVGElement>) => ( //Define Settings component with typed props
  <motion.svg
    xmlns="http://www.w3.org/2000/svg" //Define SVG namespace
    width="1em" //Set width to 1em
    height="1em" //Set height to 1em
    viewBox="0 0 40 40"
    whileHover={{ rotate: 90 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    <path
      fill="currentColor"
      d="M21.467 38.585h-2.948a2.505 2.505 0 0 1-2.504-2.499v-3.237a13.596 13.596 0 0 1-2.582-1.108l-2.057 2.044c-.961.943-2.589.934-3.536-.011l-2.084-2.097a2.502 2.502 0 0 1 .013-3.534l2.175-2.16a13.704 13.704 0 0 1-.803-2.003H3.909a2.512 2.512 0 0 1-2.5-2.507v-2.949a2.504 2.504 0 0 1 2.5-2.502h3.237a13.48 13.48 0 0 1 1.108-2.577l-2.41"
    />
  </motion.svg>
) 