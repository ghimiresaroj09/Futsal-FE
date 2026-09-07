import { Label } from "@/components/ui/label";

/** Label with the required-field asterisk, shared by the auth forms. */
export function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {children}
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    </Label>
  );
}
