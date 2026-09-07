import { SearchIcon, XIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Search field with icon + clear button. Pair with `useDebounce`:
 *
 * const [query, setQuery] = useState("")
 * const debounced = useDebounce(query, 400)
 */
export function SearchInput({
  className,
  value,
  onChange,
  placeholder = "Search…",
  ...props
}: Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <SearchIcon
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        type="search"
        className="pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => onChange("")}
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
