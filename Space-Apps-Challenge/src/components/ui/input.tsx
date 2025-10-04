import * as React from "react"
import SearchIcon from "@mui/icons-material/Search"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <span
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          width: "100%",
          transform: "translateY(-50%)",
          color: "#888",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <SearchIcon fontSize="small" />
      </span>
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-9 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
        style={{ paddingLeft: 36, ...props.style }}
      />
    </div>
  )
}

export { Input }
