import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '../../features/categories/categoriesSlice'
import api from '../../services/api'

const needsLicenceReview = category => {
  const text = `${category.name || ''} ${category.description || ''}`.toLowerCase()
  return ['wine', 'spirit', 'alcohol', 'liquor', 'jewellery', 'jewelry', 'diamond', 'gold'].some(word => text.includes(word))
}

export default function AdminCategoriesPage() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.categories)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchCategories()) }, [])

  const onSubmit = async e => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await api.post('/categories', { name: name.trim(), description: description.trim() })
      setName('')
      setDescription('')
      dispatch(fetchCategories())
    } catch (err) {
      setError(err.message || 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async id => {
    if (!window.confirm('Delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      dispatch(fetchCategories())
    } catch (err) {
      setError(err.message || 'Failed to delete category')
    }
  }

  const cls = 'w-full bg-white border border-taupe/30 text-charcoal placeholder-taupe/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-1 bg-emerald rounded-full" />
        <div>
          <h2 className="font-display text-charcoal text-2xl font-semibold">Categories</h2>
          <p className="text-taupe text-xs mt-1">Use categories for auction grouping only. Restricted goods may require licensing review before listing.</p>
        </div>
      </div>

      {/* Add form */}
      <div className="bg-white border border-taupe/15 rounded-xl p-5 mb-6 max-w-md">
        <h3 className="text-charcoal text-sm font-medium mb-4">Add Category</h3>
        {error && <div className="bg-burgundy/10 border border-burgundy/30 text-burgundy text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-taupe text-xs mb-1">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className={cls} placeholder="e.g. Watches" />
          </div>
          <div>
            <label className="block text-taupe text-xs mb-1">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className={cls} placeholder="Optional" />
          </div>
          <div className="rounded-lg border border-gold/25 bg-gold/8 px-3 py-2 text-[11px] text-taupe">
            Categories such as jewellery, gold, wine, spirits, or other regulated goods should be reviewed for UAE licensing and compliance before publishing products.
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !name.trim()}
              className="bg-gold text-almost-black font-semibold px-5 py-2 rounded-lg text-sm hover:bg-gold/90 disabled:opacity-50 transition-colors">
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-taupe/15 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-taupe text-sm text-center py-10">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-taupe text-sm text-center py-10">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-taupe/5 border-b border-taupe/15 text-left">
                <th className="px-4 py-3 text-taupe font-medium">Name</th>
                <th className="px-4 py-3 text-taupe font-medium hidden sm:table-cell">Description</th>
                <th className="px-4 py-3 text-taupe font-medium hidden md:table-cell">Compliance</th>
                <th className="px-4 py-3 text-taupe font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-b border-taupe/10 last:border-0 hover:bg-taupe/10 transition-colors">
                  <td className="px-4 py-3 text-charcoal">{c.name}</td>
                  <td className="px-4 py-3 text-taupe hidden sm:table-cell">{c.description || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {needsLicenceReview(c) ? (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">Licence review</span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald/10 text-emerald border border-emerald/15">Standard</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDelete(c.id)} className="text-xs text-burgundy hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
