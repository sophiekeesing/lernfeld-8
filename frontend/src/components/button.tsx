type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "primaryBtn",
  secondary: "secondaryBtn",
  danger: "dangerBtn",
  ghost: "ghostBtn",
};

export function Button({ label, variant = "primary" }: { label: string; variant?: ButtonVariant }) {
  return (
    <button className={variantStyles[variant]}>{label}</button>
  );
}
