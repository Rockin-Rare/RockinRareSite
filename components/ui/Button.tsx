import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-vault-gold text-[#111318] hover:bg-vault-highlight border border-vault-highlight/20 shadow-gold",
  secondary:
    "bg-vault-secondary/80 text-vault-text border border-vault-border hover:border-vault-gold hover:bg-vault-elevated hover:text-vault-highlight",
  ghost: "text-vault-secondaryText hover:bg-vault-elevated hover:text-vault-highlight",
  danger:
    "bg-vault-secondary/80 text-vault-error border border-vault-error/35 hover:border-vault-error hover:bg-vault-error/10 hover:text-vault-error"
};

const base =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vault-highlight disabled:cursor-not-allowed disabled:opacity-60";

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type LinkButtonProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export function Button({ children, variant = "primary", className, ...props }: LinkButtonProps | NativeButtonProps) {
  const classes = cn(base, variants[variant], className);

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link className={classes} href={href} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as NativeButtonProps;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
