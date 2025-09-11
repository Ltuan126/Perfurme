
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', description: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(() => setError('Không thể tải sản phẩm!'));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.price) return setError('Tên và giá là bắt buộc!');
    setError('');
    try {
      if (editingId) {
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setProducts(products.map(p => (p._id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const added = await res.json();
        setProducts([...products, added]);
      }
      setForm({ name: '', price: '', description: '', image: '' });
    } catch {
      setError('Có lỗi khi lưu sản phẩm!');
    }
  };

  const handleEdit = p => {
    setForm({ name: p.name, price: p.price, description: p.description, image: p.image });
    setEditingId(p._id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p._id !== id));
    } catch {
      setError('Không thể xóa sản phẩm!');
    }
  };

  return (
    <div className="admin-product-manager max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
  <h2 className="text-2xl font-bold mb-6 text-blue-600 flex items-center gap-2">
  <FaPlus className="text-blue-400" /> Quản lý sản phẩm
      </h2>
  <form onSubmit={handleSubmit} className="mb-8 p-4 bg-blue-50 rounded-2xl shadow flex flex-col gap-3">
        <div className="flex gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Tên sản phẩm" className="flex-1 px-3 py-2 border rounded-full focus:ring-2 focus:ring-blue-300 outline-none" />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Giá" type="number" className="w-32 px-3 py-2 border rounded-full focus:ring-2 focus:ring-blue-300 outline-none" />
        </div>
  <input name="image" value={form.image} onChange={handleChange} placeholder="Link ảnh" className="px-3 py-2 border rounded-full focus:ring-2 focus:ring-blue-300 outline-none" />
  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" className="px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-300 outline-none resize-none" />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" className="flex items-center gap-2 bg-blue-500 hover:bg-cyan-500 text-white px-4 py-2 rounded-full shadow transition">
            {editingId ? <FaSave /> : <FaPlus />} {editingId ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', price: '', description: '', image: '' }); }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100">
              <FaTimes /> Hủy
            </button>
          )}
        </div>
      </form>
      <div className="overflow-x-auto">
  <table className="w-full border rounded-2xl overflow-hidden shadow">
          <thead>
            <tr className="bg-blue-100 text-blue-700">
              <th className="p-3 border">Tên</th>
              <th className="p-3 border">Giá</th>
              <th className="p-3 border">Ảnh</th>
              <th className="p-3 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="hover:bg-blue-50 transition">
                <td className="p-3 border font-semibold">{p.name}</td>
                <td className="p-3 border">{p.price}</td>
                <td className="p-3 border"><img src={p.image} alt={p.name} className="h-14 rounded shadow" /></td>
                <td className="p-3 border">
                  <button onClick={() => handleEdit(p)} className="mr-2 text-blue-600 hover:text-blue-800 transition"><FaEdit /></button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-800 transition"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
