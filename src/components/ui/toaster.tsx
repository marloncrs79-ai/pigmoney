import { useToast } from "@/hooks/use-toast";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import { PigNotify } from "@/components/PigNotify";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        // Map shadcn variant to PigNotify type
        let type: "error" | "success" | "info" = "info";

        if (variant === "destructive") {
          type = "error";
        } else if (title?.toString().toLowerCase().includes("sucesso") || description?.toString().toLowerCase().includes("sucesso")) {
          // Heuristic for success if not explicitly typed
          type = "success";
        } else {
          // Default to success for generic "done" actions, or info
          // For now, let's assume default toasts are usually neutral or success
          type = "success";
        }

        // Handle ReactNode content by converting to string if possible, or just passing.
        // PigNotify expects strings for 'message', but we can try to handle ReactNodes too in the component,
        // but for now let's cast or extract.
        // Since PigNotify is ours, let's assume message is description.

        return (
          <div key={id} className="mb-2 w-full flex justify-center sm:justify-end">
            <PigNotify
              type={type}
              title={typeof title === 'string' ? title : undefined}
              message={description ? (typeof description === 'string' ? description : String(description)) : ""}
              show={props.open ?? true}
              onClose={() => dismiss(id)}
              showMascot={true}
            />
          </div>
        );
      })}
      <ToastViewport className="gap-2 p-4" />
    </ToastProvider>
  );
}
