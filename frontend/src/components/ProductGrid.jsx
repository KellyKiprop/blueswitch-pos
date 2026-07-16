import { useState, useMemo } from "react"
import ProductCard from "./ProductCard"

function ProductGrid({ products, onAdd }) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category))
    return ["all", ...Array.from(set)]
  }, [products])

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || p.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
        />
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                category === cat
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-muted hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted text-sm mt-8">No products found</p>
        )}
      </div>
    </div>
  )
}

export default ProductGrid
