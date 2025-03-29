import { cn } from "@/lib/utils";

export function GridBackground() {
  return (
    <div
      className={cn(
        "absolute inset-0",
        "[background-size:40px_40px]",
        "[background-image:linear-gradient(to_right,rgba(255,137,51,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,137,51,0.1)_1px,transparent_1px)]"
      )}
    />
  );
}
