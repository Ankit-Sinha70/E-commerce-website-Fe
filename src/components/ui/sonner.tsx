import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      classNames={{
        toast:
          "group toast rounded-xl font-semibold shadow-2xl",
        loader: "!bg-black",
        description: "group-[.toast]:text-muted-foreground",
        actionButton:
          "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton:
          "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        success:
          "!bg-emerald-500 !text-white !shadow-[0_20px_40px_-12px_rgba(16,185,129,0.7)] !ring-1 !ring-emerald-300",
        warning:
          "!bg-amber-500 !text-white !shadow-[0_20px_40px_-12px_rgba(245,158,11,0.7)] !ring-1 !ring-amber-300",
        info:
          "!bg-cyan-500 !text-white !shadow-[0_20px_40px_-12px_rgba(6,182,212,0.7)] !ring-1 !ring-cyan-300",
        error:
          "!bg-red-500 !text-white !shadow-[0_20px_40px_-12px_rgba(239,68,68,0.7)] !ring-1 !ring-red-300",
      }}
      {...props}
    />
  )
}

export { Toaster }
