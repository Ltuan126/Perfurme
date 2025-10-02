const QUIZ_KEY = 'perfume_quiz_answers';

export function saveQuizAnswers(answers) {
  try {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(answers || {}));
  } catch {}
}

export function loadQuizAnswers() {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasQuizAnswers() {
  return !!loadQuizAnswers();
}
