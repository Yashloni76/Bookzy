"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{ value: string; onValueChange: (v: string) => void }>({
  value: "",
  onValueChange: () => {},
})

export const Tabs = ({ value, onValueChange, children, className }: any) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ children, className }: any) => {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-900 p-1 text-slate-500 dark:text-slate-400", className)}>
      {children}
    </div>
  )
}

export const TabsTrigger = ({ value, children, className }: any) => {
  const context = React.useContext(TabsContext)
  const isSelected = context.value === value
  
  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-sm" : "hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
        className
      )}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, children, className }: any) => {
  const context = React.useContext(TabsContext)
  if (context.value !== value) return null
  
  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  )
}
