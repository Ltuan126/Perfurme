let quizAnswersMemory = null;

export function saveQuizAnswers(answers) {
  quizAnswersMemory = answers ? { ...answers } : {};
}

export function loadQuizAnswers() {
  return quizAnswersMemory ? { ...quizAnswersMemory } : null;
}

export function hasQuizAnswers() {
  return !!loadQuizAnswers();
}
