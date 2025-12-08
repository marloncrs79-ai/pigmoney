import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles with improved accessibility and micro-interactions
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "ring-offset-background transition-all duration-200 ease-out",
    // Focus styles for accessibility
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Disabled states
    "disabled:pointer-events-none disabled:opacity-50",
    // Icon sizing
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    // Active press effect
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-md hover:shadow-lg hover:shadow-primary/20",
          "hover:bg-primary-600 hover:scale-[1.02]",
          "rounded-full",
        ].join(" "),
        destructive: [
          "bg-danger text-danger-foreground",
          "shadow-md hover:shadow-lg hover:shadow-danger/20",
          "hover:bg-danger/90 hover:scale-[1.02]",
          "rounded-full",
        ].join(" "),
        outline: [
          "border-2 border-border bg-background text-foreground",
          "hover:bg-muted hover:border-primary hover:text-primary",
          "rounded-full",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-md hover:shadow-lg hover:shadow-secondary/20",
          "hover:bg-secondary-600 hover:scale-[1.02]",
          "rounded-full",
        ].join(" "),
        ghost: [
          "text-foreground",
          "hover:bg-muted hover:text-foreground",
          "rounded-xl",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
        accent: [
          "bg-accent text-accent-foreground",
          "shadow-md hover:shadow-lg hover:shadow-accent/20",
          "hover:bg-accent-600 hover:scale-[1.02]",
          "rounded-full",
        ].join(" "),
        info: [
          "bg-info text-info-foreground",
          "shadow-md hover:shadow-lg hover:shadow-info/20",
          "hover:bg-info-600 hover:scale-[1.02]",
          "rounded-full",
        ].join(" "),
        success: [
          "bg-success text-success-foreground",
          "shadow-md hover:shadow-lg hover:shadow-success/20",
          "hover:scale-[1.02]",
          "rounded-full",
        ].join(" "),
        warning: [
          "bg-warning text-warning-foreground",
          "shadow-md hover:shadow-lg hover:shadow-warning/20",
          "hover:scale-[1.02]",
          "rounded-full",
        ].join(" "),
      },
      size: {
        default: "h-11 sm:h-12 px-5 sm:px-6 py-2.5 text-sm [&_svg]:size-4",
        sm: "h-9 sm:h-10 px-3.5 sm:px-4 py-2 text-sm [&_svg]:size-4",
        lg: "h-12 sm:h-14 px-6 sm:px-8 py-3 text-base [&_svg]:size-5",
        xl: "h-14 sm:h-16 px-8 sm:px-10 py-4 text-lg [&_svg]:size-5",
        icon: "h-10 w-10 sm:h-11 sm:w-11 rounded-xl [&_svg]:size-5",
        "icon-sm": "h-8 w-8 sm:h-9 sm:w-9 rounded-lg [&_svg]:size-4",
        "icon-lg": "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Determine if button should be disabled
    const isDisabled = disabled || isLoading;
    
    // If asChild, pass through without modifications
    if (asChild) {
      return (
        <Comp 
          className={cn(buttonVariants({ variant, size, className }))} 
          ref={ref} 
          {...props} 
        />
      );
    }
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            <span>{loadingText || "Carregando..."}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
