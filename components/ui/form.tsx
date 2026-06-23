"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Form({ className, ...props }: React.ComponentProps<"form">) {
  return <form className={cn(className)} {...props} />
}

function FormField({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-3", className)} {...props} />
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(className)} {...props} />
}

function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("form-label", className)} {...props} />
}

function FormControl({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(className)} {...props} />
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-red-600", className)} {...props} />
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage }
