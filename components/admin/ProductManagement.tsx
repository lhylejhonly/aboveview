"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, Plus, Search, Trash2, X } from "lucide-react";
import { Product } from "@/types";
import { useAdmin } from "@/context/AdminContext";
import { fetchProductById, uploadProductImage } from "@/lib/db";

const emptyProduct = (category: string): Omit<Product, "id"> => ({
  name: "",
  code: "",
  category: category as Product["category"],
  price: 0,
  currency: "₱",
  description: "",
  frontImage: "",
  backImage: "",
  fabricDetails: "",
  gsm: 0,
  fitType: "",
  colors: [],
  sizes: [],
  tags: [],
  tiktokShopUrl: "",
  stockCount: 0,
  rating: 5,
  reviewCount: 0,
});
const input =
  "mt-2 w-full rounded-lg border border-[#d9dad4] bg-[#fbfbf8] px-3 py-2.5 text-sm outline-none focus:border-[#74784f]";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_OPTIONS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#ffffff" },
  { name: "Gray", hex: "#9ca3af" },
  { name: "Olive", hex: "#74784f" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Brown", hex: "#795548" },
  { name: "Beige", hex: "#d8c3a5" },
  { name: "Red", hex: "#b54b4b" },
];

function ProductEditor({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const { categories, addProduct, updateProduct } = useAdmin();
  const [form, setForm] = useState<Omit<Product, "id">>(
    product ? { ...product } : emptyProduct(categories[0]?.id ?? ""),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState(product?.frontImage ?? "");
  const [backPreview, setBackPreview] = useState(product?.backImage ?? "");
  const set = (key: keyof Omit<Product, "id">, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const frontImage = frontFile
        ? await uploadProductImage(frontFile)
        : form.frontImage;
      const backImage = backFile
        ? await uploadProductImage(backFile)
        : form.backImage;
      if (!frontImage || !backImage) throw new Error("images required");
      const payload = {
        ...form,
        frontImage,
        backImage,
        colors: form.colors.map((color) => ({
          ...color,
          hex:
            COLOR_OPTIONS.find(
              (option) => option.name.toLowerCase() === color.name.toLowerCase(),
            )?.hex ?? color.hex,
        })),
        id: product?.id ?? `apprl-${Date.now()}`,
      };
      if (product) await updateProduct(payload);
      else await addProduct(payload);
      onClose();
    } catch {
      setSaveError(
        "Unable to save this product or upload its images. Check Supabase Storage and try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#11151a]/60 p-0 sm:items-center sm:p-5">
      <form
        onSubmit={save}
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {product ? "Edit product" : "Add product"}
            </h2>
            <p className="mt-1 text-sm text-[#85898a]">
              Product information is saved to the existing database.
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-[#777b80]" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Product name
            <input
              required
              className={input}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold">
            SKU / code
            <input
              required
              className={input}
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold">
            Price
            <input
              required
              type="number"
              step="0.01"
              className={input}
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </label>
          <label className="text-xs font-semibold">
            Stock quantity
            <input
              required
              type="number"
              className={input}
              value={form.stockCount}
              onChange={(e) => set("stockCount", Number(e.target.value))}
            />
          </label>
          <label className="text-xs font-semibold">
            Category
            <select
              className={input}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Status
            <select
              className={input}
              value={form.stockCount > 0 ? "active" : "out"}
              onChange={(e) =>
                set(
                  "stockCount",
                  e.target.value === "out" ? 0 : Math.max(1, form.stockCount),
                )
              }
            >
              <option value="active">Active</option>
              <option value="out">Out of stock</option>
            </select>
          </label>
          <label className="text-xs font-semibold">
            Available colors
            <span className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-[#d9dad4] bg-[#fbfbf8] p-3 sm:grid-cols-4">
              {COLOR_OPTIONS.map((color) => {
                const checked = form.colors.some(
                  (selected) => selected.name.toLowerCase() === color.name.toLowerCase(),
                );
                return (
                  <label key={color.name} className="flex items-center gap-2 text-sm font-normal">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        set(
                          "colors",
                          checked
                            ? form.colors.filter(
                                (selected) => selected.name.toLowerCase() !== color.name.toLowerCase(),
                              )
                            : [...form.colors, color],
                        )
                      }
                      className="h-4 w-4 accent-[#74784f]"
                    />
                    <span>{color.name}</span>
                  </label>
                );
              })}
            </span>
          </label>
          <label className="text-xs font-semibold">
            Available sizes
            <span className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-[#d9dad4] bg-[#fbfbf8] p-3 sm:grid-cols-6">
              {SIZE_OPTIONS.map((size) => {
                const checked = form.sizes.includes(size);
                return (
                  <label key={size} className="flex items-center gap-2 text-sm font-normal">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        set(
                          "sizes",
                          checked
                            ? form.sizes.filter((selected) => selected !== size)
                            : [...form.sizes, size],
                        )
                      }
                      className="h-4 w-4 accent-[#74784f]"
                    />
                    <span>{size}</span>
                  </label>
                );
              })}
            </span>
          </label>
          <label className="text-xs font-semibold">
            Fabric quality / details
            <input
              className={input}
              placeholder="Premium cotton, 240 GSM"
              value={form.fabricDetails}
              onChange={(e) => set("fabricDetails", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold">
            Fit type
            <input
              className={input}
              placeholder="Regular fit, oversized"
              value={form.fitType}
              onChange={(e) => set("fitType", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold sm:col-span-2">
            Product image
            <input
              required={!form.frontImage && !frontFile}
              type="file"
              accept="image/*"
              className={input}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFrontFile(file);
                  setFrontPreview(URL.createObjectURL(file));
                }
              }}
            />
            {frontPreview && (
              <img
                src={frontPreview}
                alt="Product preview"
                className="mt-2 h-24 w-20 rounded-md object-cover"
              />
            )}
          </label>
          <label className="text-xs font-semibold sm:col-span-2">
            Back image
            <input
              required={!form.backImage && !backFile}
              type="file"
              accept="image/*"
              className={input}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setBackFile(file);
                  setBackPreview(URL.createObjectURL(file));
                }
              }}
            />
            {backPreview && (
              <img
                src={backPreview}
                alt="Back product preview"
                className="mt-2 h-24 w-20 rounded-md object-cover"
              />
            )}
          </label>
          <label className="text-xs font-semibold sm:col-span-2">
            Description
            <textarea
              required
              rows={3}
              className={input}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
        </div>
        {saveError && (
          <p className="mt-4 rounded-lg bg-[#f8e8e2] p-3 text-xs text-[#a5523b]">
            {saveError}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#d9dad4] px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="rounded-lg bg-[#74784f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProductDetails({
  productId,
  category,
  onClose,
  onEdit,
  onDelete,
}: {
  productId: string;
  category: string;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchProductById(productId);
      if (!result) throw new Error("not found");
      setProduct(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [productId]);
  const date = (value?: string) =>
    value
      ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
          new Date(value),
        )
      : "Not available";
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-[#11151a]/60 p-5">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {loading ? "Product details" : product?.name}
            </h2>
            {product && (
              <p className="mt-1 text-sm text-[#85898a]">SKU: {product.code}</p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close product details">
            <X className="h-5 w-5 text-[#777b80]" />
          </button>
        </div>
        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-[#85898a]">
            Loading product details…
          </div>
        ) : error || !product ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <p className="font-semibold">Unable to load product details.</p>
            <button
              onClick={load}
              className="mt-4 rounded-lg bg-[#74784f] px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
              <div>
                {product.frontImage ? (
                  <img
                    src={product.frontImage}
                    alt={product.name}
                    className="h-56 w-full rounded-lg bg-[#ecece7] object-cover"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-lg bg-[#ecece7] text-xs text-[#85898a]">
                    No image available
                  </div>
                )}
              </div>
              <div className="space-y-4 text-sm">
                <p>
                  <span className="text-[#85898a]">Category</span>
                  <br />
                  <strong>{category}</strong>
                </p>
                <p>
                  <span className="text-[#85898a]">Price</span>
                  <br />
                  <strong>
                    {product.currency}
                    {product.price.toFixed(2)}
                  </strong>
                </p>
                <p>
                  <span className="text-[#85898a]">Stock</span>
                  <br />
                  <strong>
                    {product.stockCount}{" "}
                    {product.stockCount === 0 && (
                      <span className="font-normal text-[#ad6250]">
                        — Out of Stock
                      </span>
                    )}
                  </strong>
                </p>
                <p>
                  <span className="text-[#85898a]">Status</span>
                  <br />
                  <strong
                    className={
                      product.stockCount ? "text-[#626741]" : "text-[#ad6250]"
                    }
                  >
                    {product.stockCount ? "Active" : "Inactive"}
                  </strong>
                </p>
                <p>
                  <span className="text-[#85898a]">Description</span>
                  <br />
                  {product.description || "No description available."}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-2 border-t border-[#ededE8] pt-4 text-xs text-[#85898a] sm:grid-cols-2">
              <p>
                <strong className="text-[#62676a]">Created:</strong>{" "}
                {date(product.createdAt)}
              </p>
              <p>
                <strong className="text-[#62676a]">Last updated:</strong>{" "}
                {date(product.updatedAt)}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => onDelete(product.id)}
                className="rounded-lg border border-[#e6cfc7] px-4 py-2.5 text-sm font-semibold text-[#ad6250]"
              >
                Delete product
              </button>
              <button
                onClick={() => onEdit(product)}
                className="rounded-lg bg-[#74784f] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Edit product
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ProductManagement() {
  const { products, categories, loading, error, refresh, deleteProduct } =
    useAdmin();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<Product | "new" | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const pageSize = 10;
  const active = products.filter((p) => p.stockCount > 0).length;
  const out = products.filter((p) => p.stockCount === 0).length;
  const filtered = useMemo(
    () =>
      products
        .filter((p) => {
          const text = `${p.name} ${p.code} ${p.category}`.toLowerCase();
          return (
            (category === "all" || p.category === category) &&
            (status === "all" ||
              (status === "active" ? p.stockCount > 0 : p.stockCount === 0)) &&
            text.includes(query.toLowerCase())
          );
        })
        .sort((a, b) =>
          sort === "price-low"
            ? a.price - b.price
            : sort === "price-high"
              ? b.price - a.price
              : sort === "name-az"
                ? a.name.localeCompare(b.name)
                : sort === "name-za"
                  ? b.name.localeCompare(a.name)
                  : sort === "oldest"
                    ? a.id.localeCompare(b.id)
                    : b.id.localeCompare(a.id),
        ),
    [products, query, category, status, sort],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const setFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };
  if (loading)
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-[#e8e8e2]"
            />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-[#e8e8e2]" />
      </div>
    );
  if (error && products.length === 0)
    return (
      <div className="rounded-xl border border-[#ecd6ce] bg-white p-12 text-center">
        <h2 className="text-lg font-semibold">Unable to load products</h2>
        <p className="mt-2 text-sm text-[#85898a]">
          Something went wrong while loading your products.
        </p>
        <button
          onClick={refresh}
          className="mt-5 rounded-lg bg-[#74784f] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  return (
    <div className="space-y-6">
      {actionError && (
        <div className="rounded-lg bg-[#f8e8e2] p-3 text-xs text-[#a5523b]">
          {actionError}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#deded8] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#85898a]">
            Total products
          </p>
          <p className="mt-4 text-3xl font-semibold">{products.length}</p>
        </div>
        <div className="rounded-xl border border-[#deded8] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#85898a]">
            Active products
          </p>
          <p className="mt-4 text-3xl font-semibold text-[#626741]">{active}</p>
        </div>
        <div className="rounded-xl border border-[#deded8] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#85898a]">
            Out of stock
          </p>
          <p className="mt-4 text-3xl font-semibold text-[#ad6250]">{out}</p>
        </div>
        <div className="rounded-xl border border-[#deded8] bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-[#85898a]">
            Categories
          </p>
          <p className="mt-4 text-3xl font-semibold">{categories.length}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-[#deded8] bg-white p-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d918f]" />
          <input
            value={query}
            onChange={(e) => setFilter(setQuery, e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-[#deded8] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#74784f]"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setFilter(setCategory, e.target.value)}
          className="rounded-lg border border-[#deded8] px-3 py-2.5 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setFilter(setStatus, e.target.value)}
          className="rounded-lg border border-[#deded8] px-3 py-2.5 text-sm"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="out">Out of stock</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setFilter(setSort, e.target.value)}
          className="rounded-lg border border-[#deded8] px-3 py-2.5 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="name-az">Name: A–Z</option>
          <option value="name-za">Name: Z–A</option>
        </select>
      </div>
      <div className="flex items-center justify-between text-sm text-[#777b80]">
        Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–
        {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
        products
        <button
          onClick={() => setEditor("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-[#74784f] px-4 py-2.5 font-semibold text-white hover:bg-[#626741]"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#deded8] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="border-b border-[#e8e8e2] bg-[#fafaf7]">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#777b80]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ededE8]">
              {visible.map((product) => (
                <tr key={product.id} className="hover:bg-[#fbfbf8]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.frontImage}
                        alt=""
                        className="h-12 w-10 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="mt-1 text-xs text-[#85898a]">
                          SKU: {product.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#62676a]">
                    {categories.find((c) => c.id === product.category)?.label ??
                      product.category}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold">
                    {product.currency}
                    {product.price.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-sm">{product.stockCount}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.stockCount ? "bg-[#e7eadb] text-[#58603c]" : "bg-[#f5e2dc] text-[#a5523b]"}`}
                    >
                      {product.stockCount ? "Active" : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setDetails(product.id)}
                        title="View"
                        className="rounded-md p-2 text-[#62676a] hover:bg-[#eef0eb]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditor(product)}
                        title="Edit"
                        className="rounded-md p-2 text-[#74784f] hover:bg-[#edf0e3]"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(product.id)}
                        title="Delete"
                        className="rounded-md p-2 text-[#ad6250] hover:bg-[#f7e9e4]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-14 text-center">
            <h2 className="font-semibold">No products yet</h2>
            <p className="mt-2 text-sm text-[#85898a]">
              Start building your catalog by adding your first product.
            </p>
            <button
              onClick={() => setEditor("new")}
              className="mt-5 rounded-lg bg-[#74784f] px-4 py-2.5 text-sm font-semibold text-white"
            >
              + Add your first product
            </button>
          </div>
        )}
      </div>
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-9 w-9 rounded-lg text-sm ${page === n ? "bg-[#74784f] text-white" : "border border-[#deded8] bg-white"}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
      {editor && (
        <ProductEditor
          product={editor === "new" ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}
      {details && (
        <ProductDetails
          productId={details}
          category={
            categories.find(
              (c) => c.id === products.find((p) => p.id === details)?.category,
            )?.label ?? "Unknown category"
          }
          onClose={() => setDetails(null)}
          onEdit={(product) => {
            setDetails(null);
            setEditor(product);
          }}
          onDelete={(id) => {
            setDetails(null);
            setDeleting(id);
          }}
        />
      )}
      {deleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#11151a]/60 p-5">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="font-semibold">
              Are you sure you want to delete this product?
            </h2>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-lg border border-[#d9dad4] px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleting)
                    .then(() => setDeleting(null))
                    .catch(() =>
                      setActionError(
                        "Unable to delete this product. Check the database connection and try again.",
                      ),
                    );
                }}
                className="rounded-lg bg-[#ad6250] px-4 py-2 text-sm font-semibold text-white"
              >
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
