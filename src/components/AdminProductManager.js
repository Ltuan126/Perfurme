import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { allFamilies, allSeasons, allOccasions, allMoods, allIntensities, familyLabelsVN, intensityLabelsVN } from '../data/productMeta';

const EMPTY_FORM = {
  name: '', price: '', stock: '', description: '', image: '',
  families: [], seasons: [], occasions: [], moods: [], intensity: '',
};

const seasonLabelsVN = { spring: 'Xuân', summer: 'Hạ', fall: 'Thu', winter: 'Đông' };
const occasionLabelsVN = { everyday: 'Hằng ngày', office: 'Công sở', casual: 'Dạo phố', 'date-night': 'Hẹn hò', party: 'Tiệc tùng', special: 'Dịp đặc biệt' };
const moodLabelsVN = {
  'fresh-energizing': 'Tươi mát', 'calm-clean': 'Điềm tĩnh', 'bold-confident': 'Tự tin',
  romantic: 'Lãng mạn', sophisticated: 'Tinh tế', 'bright-happy': 'Rạng rỡ',
  'modern-minimal': 'Hiện đại', atmospheric: 'Sâu lắng',
};

export default function AdminProductManager() {
  const { authFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setError('Không thể tải sản phẩm!'));
  }, [authFetch]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price) return setError('Tên và giá là bắt buộc!');
    setError('');
    const body = { ...form, price: Number(form.price) || 0, stock: Number(form.stock) || 0 };
    try {
      if (editingId) {
        const res = await authFetch(`${API_BASE_URL}/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const { data: updated } = await res.json();
        setProducts(products.map(p => (p._id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        const res = await authFetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const { data: added } = await res.json();
        setProducts([...products, added]);
      }
      setForm(EMPTY_FORM);
    } catch {
      setError('Có lỗi khi lưu sản phẩm!');
    }
  };

  const handleEdit = p => {
    setForm({
      name: p.name, price: p.price, stock: p.stock ?? 0, description: p.description || '', image: p.image || '',
      families: p.families || [], seasons: p.seasons || [], occasions: p.occasions || [], moods: p.moods || [],
      intensity: p.intensity || '',
    });
    setEditingId(p._id);
  };

  const tagPill = (active) => `font-mono uppercase text-[10.5px] tracking-[0.1em] px-3 py-1.5 border transition-colors ${active ? 'bg-ink text-cream border-ink' : 'bg-transparent text-ink border-hairline hover:border-ink'}`;

  const toggleTag = (field, value) => {
    setForm(prev => {
      const set = new Set(prev[field] || []);
      if (set.has(value)) set.delete(value); else set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) return;
    try {
      await authFetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p._id !== id));
    } catch {
      setError('Không thể xóa sản phẩm!');
    }
  };

  return (
    <div className="section max-w-5xl animate-fade-in">
      <div className="eyebrow mb-2">Quản trị</div>
      <h1 className="title text-left">Quản lý sản phẩm</h1>

      <form onSubmit={handleSubmit} className="border border-hairline p-8 mb-12 flex flex-col gap-6">
        <div className="grid sm:grid-cols-3 gap-x-6 gap-y-6">
          <div className="sm:col-span-2">
            <label className="field-label">Tên sản phẩm</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nhập tên sản phẩm" className="field-underline" />
          </div>
          <div>
            <label className="field-label">Giá</label>
            <input name="price" value={form.price} onChange={handleChange} placeholder="0" type="number" min="0" className="field-underline" />
          </div>
          <div>
            <label className="field-label">Tồn kho</label>
            <input name="stock" value={form.stock} onChange={handleChange} placeholder="0" type="number" min="0" className="field-underline" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Link ảnh</label>
            <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className="field-underline" />
          </div>
        </div>
        <div>
          <label className="field-label">Mô tả</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả sản phẩm" rows={3} className="field-underline resize-none" />
        </div>

        {/* Quiz metadata — dùng để gợi ý sản phẩm này trong trang Quiz */}
        <div className="border-t border-hairline pt-6">
          <div className="eyebrow mb-4">Metadata cho Quiz gợi ý</div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="field-label mb-2 block">Nhóm hương</label>
              <div className="flex flex-wrap gap-2">
                {allFamilies.map(f => (
                  <button key={f} type="button" onClick={() => toggleTag('families', f)} className={tagPill(form.families.includes(f))}>
                    {familyLabelsVN[f] || f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label mb-2 block">Độ lưu hương</label>
              <div className="flex flex-wrap gap-2">
                {allIntensities.map(i => (
                  <button key={i} type="button" onClick={() => setForm(prev => ({ ...prev, intensity: prev.intensity === i ? '' : i }))} className={tagPill(form.intensity === i)}>
                    {intensityLabelsVN[i] || i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label mb-2 block">Mùa phù hợp</label>
              <div className="flex flex-wrap gap-2">
                {allSeasons.filter(s => s !== 'any').map(s => (
                  <button key={s} type="button" onClick={() => toggleTag('seasons', s)} className={tagPill(form.seasons.includes(s))}>
                    {seasonLabelsVN[s] || s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label mb-2 block">Dịp sử dụng</label>
              <div className="flex flex-wrap gap-2">
                {allOccasions.map(o => (
                  <button key={o} type="button" onClick={() => toggleTag('occasions', o)} className={tagPill(form.occasions.includes(o))}>
                    {occasionLabelsVN[o] || o}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label mb-2 block">Mood/cảm xúc</label>
              <div className="flex flex-wrap gap-2">
                {allMoods.map(m => (
                  <button key={m} type="button" onClick={() => toggleTag('moods', m)} className={tagPill(form.moods.includes(m))}>
                    {moodLabelsVN[m] || m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="font-mono text-[11px] uppercase tracking-wider text-red-600">{error}</div>}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="btn-outline">
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Ảnh</th>
              <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Tên</th>
              <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Giá</th>
              <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Tồn kho</th>
              <th className="text-left py-3 pr-4 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Metadata</th>
              <th className="text-left py-3 font-mono uppercase text-[10.5px] tracking-[0.14em] text-label font-normal">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {products.map(p => (
              <tr key={p._id} className="hover:bg-surface transition-colors duration-300">
                <td className="py-4 pr-4">
                  <img src={p.image} alt={p.name} className="w-14 h-14 object-cover border border-hairline" />
                </td>
                <td className="py-4 pr-4 font-serif text-lg text-ink">{p.name}</td>
                <td className="py-4 pr-4 font-mono text-sm text-ink">{Number(p.price).toLocaleString('vi-VN')}₫</td>
                <td className="py-4 pr-4 font-mono text-sm" style={(p.stock ?? 0) <= 0 ? { color: '#B42318' } : { color: '#1A1A17' }}>
                  {p.stock ?? 0}
                </td>
                <td className="py-4 pr-4 font-mono text-[10.5px] uppercase tracking-wider">
                  {p.families?.length > 0
                    ? <span style={{ color: 'var(--accent)' }}>{familyLabelsVN[p.families[0]] || p.families[0]}{p.families.length > 1 ? ` +${p.families.length - 1}` : ''}</span>
                    : <span className="text-label">Chưa gán</span>}
                </td>
                <td className="py-4">
                  <button onClick={() => handleEdit(p)} className="font-mono text-[10px] uppercase tracking-wider text-ink hover:opacity-70 transition mr-4">Sửa</button>
                  <button onClick={() => handleDelete(p._id)} className="btn-danger btn-danger--sm">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
