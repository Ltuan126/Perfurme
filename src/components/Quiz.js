import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { products as localProducts } from '../data/products';
import { allFamilies, allSeasons, allOccasions, allMoods, familyLabelsVN, intensityLabelsVN } from '../data/productMeta';
import ProductCard from './ProductCard';
import { saveQuizAnswers, loadQuizAnswers } from '../utils/quiz';
import API_BASE_URL from '../config/api';

const seasonLabelsVN = { any: 'Bất kỳ', spring: 'Mùa xuân', summer: 'Mùa hè', fall: 'Mùa thu', winter: 'Mùa đông' };
const occasionLabelsVN = { everyday: 'Hằng ngày', office: 'Công sở', casual: 'Dạo phố', 'date-night': 'Hẹn hò', party: 'Tiệc tùng', special: 'Dịp đặc biệt' };
const moodLabelsVN = {
  'fresh-energizing': 'Tươi mát', 'calm-clean': 'Điềm tĩnh', 'bold-confident': 'Tự tin',
  romantic: 'Lãng mạn', sophisticated: 'Tinh tế', 'bright-happy': 'Rạng rỡ',
  'modern-minimal': 'Hiện đại', atmospheric: 'Sâu lắng',
};

function scoreProduct(p, answers) {
  if (!p.families?.length) return 0;
  let score = 0;
  const famOverlap = (answers.families || []).filter(f => p.families.includes(f)).length;
  score += famOverlap * 5;
  if (answers.season && (answers.season === 'any' || (p.seasons || []).includes(answers.season))) score += 2;
  if (answers.occasion && (p.occasions || []).includes(answers.occasion)) score += 2;
  const moodOverlap = (answers.moods || []).filter(m => (p.moods || []).includes(m)).length;
  score += moodOverlap * 3;
  if (answers.intensity && answers.intensity === p.intensity) score += 1;
  return score;
}

function similarProducts(base, candidates, topN = 3) {
  if (!base.families?.length) return [];
  const baseId = base._id || base.id;
  return candidates
    .filter(p => (p._id || p.id) !== baseId)
    .map(p => {
      if (!p.families?.length) return { p, s: 0 };
      const fam = p.families.filter(f => base.families.includes(f)).length;
      const mood = (p.moods || []).filter(x => (base.moods || []).includes(x)).length;
      const s = fam * 2 + mood;
      return { p, s };
    })
    .sort((a, b) => b.s - a.s)
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

  const [products, setProducts] = useState(localProducts);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const list = Array.isArray(data?.data) ? data.data : null;
        if (list && list.length > 0) setProducts(list);
      })
      .catch(() => {});
  }, []);

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
      .sort((a, b) => b.s - a.s);
    const top = scored.filter(x => x.s > 0).slice(0, 5).map(x => x.p);
    if (top.length === 0) return [];
    const extra = similarProducts(top[0], products, 2).filter(p => !top.find(t => (t._id || t.id) === (p._id || p.id)));
    return [...top, ...extra].slice(0, 5);
  }, [done, answers, products]);

  const next = () => setStep(s => Math.min(3, s + 1));
  const prev = () => setStep(s => Math.max(1, s - 1));

  const optionBtn = (active) => `px-5 py-4 border text-left font-mono uppercase text-[12px] tracking-[0.1em] transition-colors ${active ? 'text-oncream2' : 'text-mutedDark border-hairlineDark hover:text-oncream2'}`;
  const optionStyle = (active) => active ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : {};

  if (done) {
    const [primary, ...rest] = results;
    const noteTag = primary?.families?.length
      ? [familyLabelsVN[primary.families[0]], intensityLabelsVN[primary.intensity]].filter(Boolean).join(' · ')
      : null;

    return (
      <div className="section">
        {!primary ? (
          <div className="text-center py-16">
            <div className="eyebrow mb-4">Chưa có gợi ý phù hợp</div>
            <p className="text-muted font-light mb-8">Hãy chọn nhóm hương hoặc mood khác nhé.</p>
            <button onClick={() => { setDone(false); setStep(1); }} className="btn-outline">Làm lại</button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            <div className="eyebrow mb-4">Hương của bạn</div>
            {noteTag && <div className="font-mono uppercase text-[11px] tracking-[0.14em] mb-3" style={{ color: 'var(--accent)' }}>{noteTag}</div>}
            <h1 className="font-serif font-light text-ink mb-6" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05 }}>
              {primary.name}
            </h1>
            <p className="text-muted font-light max-w-xl mx-auto mb-10" style={{ lineHeight: 1.8 }}>{primary.description}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={`/product/${primary._id || primary.id}`} className="btn-primary">Xem chi tiết</Link>
              <button onClick={() => { setDone(false); setStep(1); }} className="btn-outline">Làm lại</button>
            </div>

            {rest.length > 0 && (
              <div className="mt-20 pt-12 hairline-t text-left">
                <div className="eyebrow text-center mb-3">Gợi ý thêm</div>
                <h2 className="title">Có thể bạn cũng thích</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
                  {rest.map(p => (
                    <ProductCard key={`quiz-${p._id || p.id}`} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-charcoal text-oncream2 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="font-mono uppercase text-[11px] tracking-[0.28em] mb-6" style={{ color: 'var(--accent)' }}>
          Bước {step}/3
        </div>

        {step === 1 && (
          <div>
            <h1 className="font-serif font-light mb-10" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', lineHeight: 1.15, color: '#F2EFE9' }}>
              Bạn thích nhóm hương nào?
            </h1>
            <div className="grid grid-cols-2 gap-3">
              {allFamilies.map(f => (
                <button key={f} onClick={() => onToggle('families', f)} className={optionBtn(answers.families?.includes(f))} style={optionStyle(answers.families?.includes(f))}>
                  {familyLabelsVN[f] || f}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-serif font-light mb-10" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', lineHeight: 1.15, color: '#F2EFE9' }}>
              Bạn muốn dùng vào mùa nào?
            </h1>
            <div className="grid grid-cols-2 gap-3">
              {allSeasons.map(s => (
                <button key={s} onClick={() => setAnswers(a => ({ ...a, season: s }))} className={optionBtn(answers.season === s)} style={optionStyle(answers.season === s)}>
                  {seasonLabelsVN[s] || s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12">
            <div>
              <h1 className="font-serif font-light mb-6" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.15, color: '#F2EFE9' }}>
                Dịp sử dụng?
              </h1>
              <div className="grid grid-cols-2 gap-3">
                {allOccasions.map(o => (
                  <button key={o} onClick={() => setAnswers(a => ({ ...a, occasion: o }))} className={optionBtn(answers.occasion === o)} style={optionStyle(answers.occasion === o)}>
                    {occasionLabelsVN[o] || o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-serif font-light mb-6" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.15, color: '#F2EFE9' }}>
                Mood/cảm xúc?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {allMoods.map(m => (
                  <button key={m} onClick={() => onToggle('moods', m)} className={optionBtn(answers.moods?.includes(m))} style={optionStyle(answers.moods?.includes(m))}>
                    {moodLabelsVN[m] || m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-12 pt-8" style={{ borderTop: '1px solid #2C2D26' }}>
          <button onClick={prev} disabled={step === 1} className="font-mono uppercase text-[11px] tracking-[0.14em] text-mutedDark disabled:opacity-30">← Trước</button>
          {step < 3 ? (
            <button onClick={next} className="btn-outline btn-outline--light">Tiếp tục →</button>
          ) : (
            <button onClick={() => { setDone(true); saveQuizAnswers(answers); }} className="btn-outline btn-outline--light">Xem gợi ý</button>
          )}
        </div>
      </div>
    </div>
  );
}
