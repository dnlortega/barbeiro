"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AlertPopoverProps {
    trigger: React.ReactNode
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
    variant?: "danger" | "info" | "success"
}

export function AlertPopover({
    trigger,
    title,
    description,
    onConfirm,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "info"
}: AlertPopoverProps) {
    const [open, setOpen] = React.useState(false)

    const icons = {
        danger: <AlertTriangle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    }

    const borderColors = {
        danger: "border-red-100",
        info: "border-blue-100",
        success: "border-emerald-100"
    }

    return (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>
                {trigger}
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    align="end"
                    sideOffset={8}
                    className={cn(
                        "z-50 w-80 bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border animate-in fade-in zoom-in-95 duration-200",
                        borderColors[variant]
                    )}
                >
                    <div className="flex gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                            variant === "danger" ? "bg-red-50" : variant === "success" ? "bg-emerald-50" : "bg-blue-50"
                        )}>
                            {icons[variant]}
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-sm uppercase tracking-tighter text-slate-900">{title}</h4>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed">{description}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600"
                            onClick={() => setOpen(false)}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant === "danger" ? "destructive" : "default"}
                            size="sm"
                            className={cn(
                                "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                variant === "danger" ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200" : "bg-slate-900 hover:bg-black shadow-lg shadow-slate-200"
                            )}
                            onClick={() => {
                                onConfirm()
                                setOpen(false)
                            }}
                        >
                            {confirmText}
                        </Button>
                    </div>
                    <PopoverPrimitive.Arrow className="fill-white" />
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    )
}
