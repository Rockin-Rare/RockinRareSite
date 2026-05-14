import { Card } from "@/components/ui/Card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="mx-auto max-w-2xl border-vault-gold/20 text-center">
      <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-vault-gold" />
      <h3 className="text-xl font-bold text-vault-text">{title}</h3>
      <p className="mt-2 text-sm text-vault-secondaryText">{message}</p>
    </Card>
  );
}
