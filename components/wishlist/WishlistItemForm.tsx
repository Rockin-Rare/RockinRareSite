import {
  wishlistAlertThresholdOptions,
  wishlistCategoryOptions,
  wishlistConditionOptions,
  wishlistGameOptions,
  wishlistLanguageOptions
} from "@/lib/rare-radar/options";
import type { RareRadarWishlistItem } from "@/lib/rare-radar/wishlist";
import { Button } from "@/components/ui/Button";

type WishlistItemFormProps = {
  action: (formData: FormData) => Promise<void>;
  buttonLabel: string;
  item?: RareRadarWishlistItem;
};

export function WishlistItemForm({ action, buttonLabel, item }: WishlistItemFormProps) {
  return (
    <form action={action} className="grid gap-4">
      {item ? <input name="itemId" type="hidden" value={item.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Card or product name" name="productName" required value={item?.productName} />
        <SelectField label="Game" name="game" options={wishlistGameOptions} value={item?.game} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Type" name="category" options={wishlistCategoryOptions} value={item?.category} />
        <Field label="Set or version" name="setName" value={item?.setName} />
        <Field label="Card number" name="cardNumber" value={item?.cardNumber} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Language" name="language" options={wishlistLanguageOptions} value={item?.language} />
        <SelectField label="Condition" name="desiredCondition" options={wishlistConditionOptions} value={item?.desiredCondition} />
        <Field inputMode="decimal" label="Max price optional" name="maxPrice" placeholder="Example: 75" value={formatCentsForInput(item?.maxPriceCents)} />
      </div>
      <SelectField label="Alert threshold" name="alertThreshold" options={wishlistAlertThresholdOptions} value={item?.alertThreshold} />
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-vault-text">Notes optional</span>
        <textarea
          className="min-h-28 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
          defaultValue={item?.notes ?? ""}
          maxLength={800}
          name="notes"
          placeholder="Specific art, grading company, centering preference, or deal notes."
        />
      </label>
      <Button type="submit">{buttonLabel}</Button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  value?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <input
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        defaultValue={value ?? ""}
        maxLength={160}
        name={name}
        type="text"
        {...props}
      />
    </label>
  );
}

function SelectField({ label, name, options, value }: { label: string; name: string; options: string[]; value?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <select
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        defaultValue={value ?? options[0]}
        name={name}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatCentsForInput(value?: number) {
  return typeof value === "number" ? String(value / 100) : "";
}
