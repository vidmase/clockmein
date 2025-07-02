import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, ...props }, ref) => (
    <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
      <input
        type="checkbox"
        ref={ref}
        style={{ width: 16, height: 16, accentColor: '#6366f1', marginRight: label ? 8 : 0 }}
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  )
);
Checkbox.displayName = "Checkbox";
