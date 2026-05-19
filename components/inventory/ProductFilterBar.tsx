"use client";

import { sortByFranchisePriority } from "@/lib/catalog-priority";
import type { Product } from "@/lib/types";

export type InventoryFilters = {
  search: string;
  category: string;
  franchise: string;
  language: string;
  condition: string;
  availability: string;
  sort: string;
};

export function ProductFilterBar({
  products,
  filters,
  onChange
}: {
  products: Product[];
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
}) {
  const categories = unique(products.map((product) => product.category));
  const franchises = sortByFranchisePriority(unique(products.map((product) => product.franchise)));
  const languages = unique(products.map((product) => product.language).filter(Boolean) as string[]);
  const conditions = unique(products.map((product) => product.condition).filter(Boolean) as string[]);

  function update(key: keyof InventoryFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-vault-border bg-vault-card p-4 shadow-vault md:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-2 lg:col-span-2">
        <span className="text-xs font-semibold uppercase text-vault-muted">Search</span>
        <input
          className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search name, set, franchise..."
          value={filters.search}
        />
      </label>
      <Select label="Category" value={filters.category} onChange={(value) => update("category", value)} options={categories} />
      <Select label="Franchise" value={filters.franchise} onChange={(value) => update("franchise", value)} options={franchises} />
      <Select label="Language" value={filters.language} onChange={(value) => update("language", value)} options={languages} />
      <Select label="Condition" value={filters.condition} onChange={(value) => update("condition", value)} options={conditions} />
      <Select
        label="Availability"
        value={filters.availability}
        onChange={(value) => update("availability", value)}
        options={["Available only", "Listed", "Sold", "Coming soon"]}
      />
      <Select
        label="Sort"
        value={filters.sort}
        onChange={(value) => update("sort", value)}
        options={["Featured", "Newest", "Price low to high", "Price high to low", "Name A-Z"]}
        includeAll={false}
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  includeAll = true
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  includeAll?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-vault-muted">{label}</span>
      <select
        className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {includeAll ? <option value="">All</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}
