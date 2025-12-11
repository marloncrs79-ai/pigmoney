import * as React from "react"
import { cn } from "@/lib/utils"

const ResponsiveTableContainer = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("w-full overflow-auto scroll-smooth-mobile", className)}
        {...props}
    />
))
ResponsiveTableContainer.displayName = "ResponsiveTableContainer"

export { ResponsiveTableContainer }
