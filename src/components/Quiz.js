import React, { useEffect, useMemo, useState } from 'react';
import { products as localProducts } from '../data/products';
import { productMeta, allFamilies, allSeasons, allOccasions, allMoods } from '../data/productMeta';
import ProductCard from './ProductCard';
import { saveQuizAnswers, loadQuizAnswers } from '../utils/quiz';

function scoreProduct(p, answers) {
  const meta = productMeta[p.id];
  if (!meta) return 0;
  let score = 0;
  // Rule-based weights
  // Families highest priority
  const famOverlap = (answers.families || []).filter(f => meta.families.includes(f)).length;
  score += famOverlap * 5;
  // Season
  if (answers.season && (answers.season === 'any' || meta.seasons.includes(answers.season))) score += 2;
  // Occasion
  if (answers.occasion && meta.occasions.includes(answers.occasion)) score += 2;
  // Mood
  const moodOverlap = (answers.moods || []).filter(m => meta.moods.includes(m)).length;
  score += moodOverlap * 3;
  // Intensity preference (optional)
  if (answers.intensity && answers.intensity === meta.intensity) score += 1;
  return score;
}

function similarProducts(base, candidates, topN = 3) {
  const baseMeta = productMeta[base.id];
  if (!baseMeta) return [];
  return candidates
    .filter(p => p.id !== base.id)
    .map(p => {
      const m = productMeta[p.id];
      if (!m) return { p, s: 0 };
      const fam = m.families.filter(f => baseMeta.families.includes(f)).length;
      const mood = m.moods.filter(x => baseMeta.moods.includes(x)).length;
      const s = fam * 2 + mood; // simple content-based
      return { p, s };
    })
    .sort((a,b) => b.s - a.s)
    .slice(0, topN)
    .map(x => x.p);
}

export default function Quiz() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ families: [], moods: [] });
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prev = loadQuizAnswers();
    if (prev) setAnswers(prev);
  }, []);

  const products = localProducts; // can replace with API list if available

  const onToggle = (k, v) => {
    setAnswers(prev => {
      const arr = new Set(prev[k] || []);
      if (arr.has(v)) arr.delete(v); else arr.add(v);
      return { ...prev, [k]: Array.from(arr) };
    });
  };

  const results = useMemo(() => {
    if (!done) return [];
    const scored = products.map(p => ({ p, s: scoreProduct(p, answers) }))
      .sort((a,b) => b.s - a.s);
    const top = scored.filter(x => x.s > 0).slice(0, 5).map(x => x.p);
    if (top.length === 0) return [];
    // expand with similar products to diversify
    const extra = similarProducts(top[0], products, 2).filter(p => !top.find(t => t.id === p.id));
    return [...top, ...extra].slice(0, 5);
  }, [done, answers, products]);

  const next = () => setStep(s => Math.min(4, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="section max-w-3xl">
      <h1 className="title text-blue-700">Perfume Quiz</h1>
      {!done ? (
        <div className="glass p-6 space-y-6">
          {step === 1 && (
            <div>
              <div className="font-semibold mb-2">Bạn thích nhóm hương nào? (chọn 1-3)</div>
              <div className="flex flex-wrap gap-2">
                {allFamilies.map(f => (
                  <button key={f} onClick={() => onToggle('families', f)} className={`px-3 py-1 rounded-full border ${answers.families?.includes(f) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>{f}</button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="font-semibold mb-2">Bạn muốn dùng vào mùa nào?</div>
              <div className="flex flex-wrap gap-2">
                {['any', ...allSeasons.filter(s=>s!=='any')].map(s => (
                  <button key={s} onClick={() => setAnswers(a=>({ ...a, season: s }))} className={`px-3 py-1 rounded-full border ${answers.season===s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-6">
              <div>
                <div className="font-semibold mb-2">Dịp sử dụng?</div>
                <div className="flex flex-wrap gap-2">
                  {allOccasions.map(o => (
                    <button key={o} onClick={() => setAnswers(a=>({ ...a, occasion: o }))} className={`px-3 py-1 rounded-full border ${answers.occasion===o ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>{o}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Mood/cảm xúc?</div>
                <div className="flex flex-wrap gap-2">
                  {allMoods.map(m => (
                    <button key={m} onClick={() => onToggle('moods', m)} className={`px-3 py-1 rounded-full border ${answers.moods?.includes(m) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={prev} disabled={step===1} className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 disabled:opacity-50">← Trước</button>
            {step < 3 ? (
              <button onClick={next} className="btn-primary">Tiếp tục →</button>
            ) : (
              <button onClick={() => { setDone(true); saveQuizAnswers(answers); }} className="btn-primary">Xem gợi ý</button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-700">Gợi ý cho bạn</h2>
            <button onClick={() => { setDone(false); setStep(1); }} className="px-3 py-1 rounded-full border">Làm lại</button>
          </div>
          {results.length === 0 ? (
            <div className="glass p-6 text-slate-600">Chưa có gợi ý phù hợp. Hãy chọn nhóm hương/mood khác nhé.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map(p => (
                <ProductCard key={`quiz-${p.id}`} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-6 text-sm text-slate-500">
        Gợi ý dựa trên rule-based (ưu tiên nhóm hương, mùa, mood) + content-based theo nhóm hương tương tự. Có thể mở rộng collaborative filtering khi đủ dữ liệu hành vi.
      </div>
    </div>
  );
}
