import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ShortcutItem {
  key: string;
  description: string;
  category?: string;
}

interface KeyboardShortcutsOverlayProps {
  shortcuts: ShortcutItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || "Geral";
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <div 
      className="fixed inset-0 z-modal-backdrop bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-2xl z-modal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-bold">Atalhos de teclado</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Use estes atalhos para navegar mais rápido
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shortcuts grid */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {category}
                  </h3>
                  <div className="grid gap-2">
                    {items.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <kbd className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-card border border-border rounded-lg shadow-sm">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/30 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Pressione <kbd className="px-1.5 py-0.5 text-xs bg-card border border-border rounded">?</kbd> a qualquer momento para ver esta ajuda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    // Show help overlay
    if (e.key === "?") {
      e.preventDefault();
      setShowOverlay(true);
      return;
    }

    // Build key string
    const keyParts = [];
    if (e.ctrlKey || e.metaKey) keyParts.push("Ctrl");
    if (e.altKey) keyParts.push("Alt");
    if (e.shiftKey) keyParts.push("Shift");
    keyParts.push(e.key.toUpperCase());
    const keyString = keyParts.join("+");

    // Check if shortcut exists
    if (shortcuts[keyString]) {
      e.preventDefault();
      shortcuts[keyString]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    showOverlay,
    setShowOverlay,
  };
}

// Common keyboard key component
interface KeyboardKeyProps {
  children: React.ReactNode;
  className?: string;
}

export function KeyboardKey({ children, className }: KeyboardKeyProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5",
        "text-xs font-mono font-medium",
        "bg-muted border border-border rounded-md shadow-sm",
        className
      )}
    >
      {children}
    </kbd>
  );
}
