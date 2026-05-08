const questions = Array.isArray(window.QUESTION_BANK) ? window.QUESTION_BANK : [];
const storageKey = "salesforce-admin-practice-loop:v1";

const dom = {
  answeredCount: document.querySelector("#answeredCount"),
  accuracy: document.querySelector("#accuracy"),
  streak: document.querySelector("#streak"),
  segments: [...document.querySelectorAll(".segment")],
  unansweredFirst: document.querySelector("#unansweredFirst"),
  shuffleChoices: document.querySelector("#shuffleChoices"),
  autoExplain: document.querySelector("#autoExplain"),
  rangeStart: document.querySelector("#rangeStart"),
  rangeEnd: document.querySelector("#rangeEnd"),
  nextQuestion: document.querySelector("#nextQuestion"),
  bookmark: document.querySelector("#bookmark"),
  resetCurrent: document.querySelector("#resetCurrent"),
  resetAll: document.querySelector("#resetAll"),
  queueList: document.querySelector("#queueList"),
  emptyState: document.querySelector("#emptyState"),
  questionCard: document.querySelector("#questionCard"),
  questionNumber: document.querySelector("#questionNumber"),
  questionTitle: document.querySelector("#questionTitle"),
  sourceLink: document.querySelector("#sourceLink"),
  questionText: document.querySelector("#questionText"),
  choiceList: document.querySelector("#choiceList"),
  submitAnswer: document.querySelector("#submitAnswer"),
  showAnswer: document.querySelector("#showAnswer"),
  mobileCommandBar: document.querySelector("#mobileCommandBar"),
  mobileSubmitAnswer: document.querySelector("#mobileSubmitAnswer"),
  mobileShowAnswer: document.querySelector("#mobileShowAnswer"),
  mobileNextQuestion: document.querySelector("#mobileNextQuestion"),
  mobileBookmark: document.querySelector("#mobileBookmark"),
  resultPanel: document.querySelector("#resultPanel"),
  resultBadge: document.querySelector("#resultBadge"),
  answerSummary: document.querySelector("#answerSummary"),
  explanationList: document.querySelector("#explanationList")
};

const fallbackState = {
  activeFilter: "all",
  currentId: null,
  selected: [],
  answered: {},
  bookmarks: {},
  streak: 0,
  settings: {
    unansweredFirst: true,
    shuffleChoices: true,
    autoExplain: true,
    rangeStart: 1,
    rangeEnd: 181
  }
};

let state = loadState();
let visibleQuestions = [];
let current = null;
let renderedChoices = [];
let answerShown = false;
let explanationExpanded = false;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return {
      ...structuredClone(fallbackState),
      ...saved,
      settings: {
        ...fallbackState.settings,
        ...saved?.settings
      }
    };
  } catch {
    return structuredClone(fallbackState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function byNumber(a, b) {
  return (a.number ?? 0) - (b.number ?? 0);
}

function getRecord(question) {
  return state.answered[question.id] ?? null;
}

function isWeak(question) {
  const record = getRecord(question);
  if (!record) return false;
  return record.wrong > 0 && record.correct / Math.max(record.total, 1) < 0.75;
}

function correctIndexesFor(question) {
  return Array.isArray(question.correctIndexes) ? question.correctIndexes : [];
}

function syncControls() {
  dom.unansweredFirst.checked = state.settings.unansweredFirst;
  dom.shuffleChoices.checked = state.settings.shuffleChoices;
  dom.autoExplain.checked = state.settings.autoExplain;
  dom.rangeStart.value = state.settings.rangeStart;
  dom.rangeEnd.value = state.settings.rangeEnd;

  dom.segments.forEach((segment) => {
    segment.classList.toggle("active", segment.dataset.filter === state.activeFilter);
  });
}

function buildVisibleQuestions() {
  const start = Number(dom.rangeStart.value || state.settings.rangeStart || 1);
  const end = Number(dom.rangeEnd.value || state.settings.rangeEnd || 9999);
  const min = Math.min(start, end);
  const max = Math.max(start, end);

  let pool = questions.filter((question) => {
    const number = question.number ?? 0;
    return number >= min && number <= max;
  });

  if (state.activeFilter === "missed") {
    pool = pool.filter((question) => getRecord(question)?.lastCorrect === false);
  } else if (state.activeFilter === "bookmarked") {
    pool = pool.filter((question) => state.bookmarks[question.id]);
  } else if (state.activeFilter === "weak") {
    pool = pool.filter(isWeak);
  }

  pool = pool.sort(byNumber);

  if (state.settings.unansweredFirst) {
    const unanswered = pool.filter((question) => !getRecord(question));
    const answered = pool.filter((question) => getRecord(question));
    return [...shuffle(unanswered), ...shuffle(answered)];
  }

  return shuffle(pool);
}

function setCurrent(question) {
  if (!question) {
    current = null;
    renderedChoices = [];
    state.currentId = null;
    saveState();
    render();
    return;
  }

  current = question;
  state.currentId = question.id;
  state.selected = [];
  answerShown = false;
  explanationExpanded = false;
  const choiceEntries = question.choices.map((text, index) => ({ text, index }));
  renderedChoices = state.settings.shuffleChoices ? shuffle(choiceEntries) : choiceEntries;
  saveState();
  render();
}

function chooseNext() {
  visibleQuestions = buildVisibleQuestions();
  if (!visibleQuestions.length) {
    setCurrent(null);
    return;
  }

  const currentIndex = visibleQuestions.findIndex((question) => question.id === state.currentId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % visibleQuestions.length : 0;
  setCurrent(visibleQuestions[nextIndex]);
}

function arraysEqualAsSet(first, second) {
  if (first.length !== second.length) return false;
  const right = new Set(second);
  return first.every((item) => right.has(item));
}

function submitAnswer() {
  if (!current || !state.selected.length) return;

  const correctIndexes = correctIndexesFor(current);
  const selected = [...state.selected].sort((a, b) => a - b);
  const isCorrect = arraysEqualAsSet(selected, correctIndexes);
  const record = state.answered[current.id] ?? {
    total: 0,
    correct: 0,
    wrong: 0,
    lastCorrect: null,
    lastSelected: []
  };

  record.total += 1;
  record.correct += isCorrect ? 1 : 0;
  record.wrong += isCorrect ? 0 : 1;
  record.lastCorrect = isCorrect;
  record.lastSelected = selected;
  record.updatedAt = new Date().toISOString();

  state.answered[current.id] = record;
  state.streak = isCorrect ? state.streak + 1 : 0;
  answerShown = true;
  explanationExpanded = state.settings.autoExplain;
  saveState();
  render();
}

function toggleSelection(index) {
  if (!current || answerShown) return;

  const correctCount = correctIndexesFor(current).length || 1;
  const selected = new Set(state.selected);

  if (correctCount <= 1) {
    state.selected = selected.has(index) ? [] : [index];
  } else if (selected.has(index)) {
    selected.delete(index);
    state.selected = [...selected];
  } else {
    selected.add(index);
    state.selected = [...selected];
  }

  saveState();
  renderChoices();
}

function showAnswer() {
  if (!current) return;
  answerShown = true;
  explanationExpanded = true;
  render();
}

function resetCurrent() {
  if (!current) return;
  delete state.answered[current.id];
  state.selected = [];
  answerShown = false;
  explanationExpanded = false;
  saveState();
  render();
}

function resetAll() {
  if (!confirm("全履歴をリセットしますか？")) return;
  const settings = state.settings;
  state = {
    ...structuredClone(fallbackState),
    settings
  };
  syncControls();
  chooseNext();
}

function toggleBookmark() {
  if (!current) return;
  if (state.bookmarks[current.id]) {
    delete state.bookmarks[current.id];
  } else {
    state.bookmarks[current.id] = true;
  }
  saveState();
  render();
}

function stats() {
  const records = Object.values(state.answered);
  const answered = records.reduce((sum, record) => sum + record.total, 0);
  const correct = records.reduce((sum, record) => sum + record.correct, 0);
  return {
    answered,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0
  };
}

function renderStats() {
  const currentStats = stats();
  dom.answeredCount.textContent = String(currentStats.answered);
  dom.accuracy.textContent = `${currentStats.accuracy}%`;
  dom.streak.textContent = String(state.streak || 0);
}

function renderQueue() {
  visibleQuestions = buildVisibleQuestions();
  dom.queueList.textContent = "";

  const items = visibleQuestions.slice(0, 80);
  for (const question of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "queue-item";
    button.classList.toggle("current", question.id === current?.id);
    button.innerHTML = `
      <span>Q${question.number ?? "?"}</span>
      <small>${queueStatus(question)}</small>
    `;
    button.addEventListener("click", () => setCurrent(question));
    dom.queueList.append(button);
  }
}

function queueStatus(question) {
  if (state.bookmarks[question.id]) return "保存";
  const record = getRecord(question);
  if (!record) return "未";
  return record.lastCorrect ? "正" : "誤";
}

function renderQuestion() {
  if (!current) return;

  dom.questionNumber.textContent = current.number ? `Question ${current.number}` : "Question";
  dom.questionTitle.textContent = current.title || "Salesforce Admin";
  dom.sourceLink.href = current.url;
  dom.questionText.textContent = current.question;
  dom.bookmark.classList.toggle("active", Boolean(state.bookmarks[current.id]));
  dom.mobileBookmark.classList.toggle("active", Boolean(state.bookmarks[current.id]));
  dom.submitAnswer.disabled = answerShown || !state.selected.length;
  dom.mobileSubmitAnswer.disabled = answerShown || !state.selected.length;

  renderChoices();
  renderResult();
}

function renderChoices() {
  if (!current) return;

  const selected = new Set(state.selected);
  const correct = new Set(correctIndexesFor(current));
  dom.choiceList.textContent = "";

  for (const item of renderedChoices) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.classList.toggle("selected", selected.has(item.index));

    if (answerShown) {
      button.classList.toggle("correct", correct.has(item.index));
      button.classList.toggle("incorrect", selected.has(item.index) && !correct.has(item.index));
    }

    const marker = answerShown
      ? correct.has(item.index) ? "✓" : selected.has(item.index) ? "×" : ""
      : selected.has(item.index) ? "●" : "";

    button.innerHTML = `
      <span class="choice-marker" aria-hidden="true">${marker}</span>
      <span>${escapeHtml(item.text)}</span>
    `;
    button.addEventListener("click", () => toggleSelection(item.index));
    dom.choiceList.append(button);
  }

  dom.submitAnswer.disabled = answerShown || !state.selected.length;
  dom.mobileSubmitAnswer.disabled = answerShown || !state.selected.length;
}

function renderResult() {
  if (!current) return;

  dom.resultPanel.hidden = !answerShown;
  if (!answerShown) return;

  const correctIndexes = correctIndexesFor(current);
  const selected = state.selected.length
    ? [...state.selected].sort((a, b) => a - b)
    : getRecord(current)?.lastSelected ?? [];
  const isCorrect = arraysEqualAsSet(selected, correctIndexes);
  const correctLabels = correctIndexes.map((index) => current.choices[index]).join(" / ");

  dom.resultBadge.className = `result-badge ${isCorrect ? "correct" : "incorrect"}`;
  dom.resultBadge.textContent = isCorrect ? "正解" : "不正解";
  dom.answerSummary.textContent = `正答: ${correctLabels || "未検出"}`;
  dom.explanationList.textContent = "";
  dom.explanationList.hidden = !explanationExpanded;

  if (!explanationExpanded) return;

  current.choices.forEach((choice, index) => {
    const explanation = current.explanations?.[index];
    if (!explanation) return;

    const block = document.createElement("section");
    block.className = "explanation";
    block.classList.toggle("correct", correctIndexes.includes(index));
    block.innerHTML = `
      <h3>${escapeHtml(choice)}</h3>
      <p>${escapeHtml(explanation)}</p>
    `;
    dom.explanationList.append(block);
  });
}

function renderEmptyState() {
  const empty = !questions.length;
  dom.emptyState.hidden = !empty;
  dom.questionCard.hidden = empty;
  dom.mobileCommandBar.hidden = empty;
}

function render() {
  renderEmptyState();
  syncControls();
  renderStats();

  if (!questions.length) return;

  if (!current) {
    current = questions.find((question) => question.id === state.currentId) ?? questions[0];
    const choiceEntries = current.choices.map((text, index) => ({ text, index }));
    renderedChoices = state.settings.shuffleChoices ? shuffle(choiceEntries) : choiceEntries;
  }

  renderQuestion();
  renderQueue();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function onSettingChange() {
  state.settings.unansweredFirst = dom.unansweredFirst.checked;
  state.settings.shuffleChoices = dom.shuffleChoices.checked;
  state.settings.autoExplain = dom.autoExplain.checked;
  state.settings.rangeStart = Number(dom.rangeStart.value || 1);
  state.settings.rangeEnd = Number(dom.rangeEnd.value || questions.length || 181);
  saveState();
  chooseNext();
}

function init() {
  if (questions.length) {
    const numbers = questions.map((question) => question.number).filter(Number.isFinite);
    if (numbers.length) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      state.settings.rangeStart = state.settings.rangeStart || min;
      state.settings.rangeEnd = state.settings.rangeEnd || max;
      dom.rangeStart.min = String(min);
      dom.rangeStart.max = String(max);
      dom.rangeEnd.min = String(min);
      dom.rangeEnd.max = String(max);
      if (!localStorage.getItem(storageKey)) {
        state.settings.rangeStart = min;
        state.settings.rangeEnd = max;
      }
    }
  }

  dom.segments.forEach((segment) => {
    segment.addEventListener("click", () => {
      state.activeFilter = segment.dataset.filter;
      saveState();
      chooseNext();
    });
  });

  dom.unansweredFirst.addEventListener("change", onSettingChange);
  dom.shuffleChoices.addEventListener("change", onSettingChange);
  dom.autoExplain.addEventListener("change", onSettingChange);
  dom.rangeStart.addEventListener("change", onSettingChange);
  dom.rangeEnd.addEventListener("change", onSettingChange);
  dom.nextQuestion.addEventListener("click", chooseNext);
  dom.bookmark.addEventListener("click", toggleBookmark);
  dom.resetCurrent.addEventListener("click", resetCurrent);
  dom.resetAll.addEventListener("click", resetAll);
  dom.submitAnswer.addEventListener("click", submitAnswer);
  dom.showAnswer.addEventListener("click", showAnswer);
  dom.mobileNextQuestion.addEventListener("click", chooseNext);
  dom.mobileBookmark.addEventListener("click", toggleBookmark);
  dom.mobileSubmitAnswer.addEventListener("click", submitAnswer);
  dom.mobileShowAnswer.addEventListener("click", showAnswer);

  syncControls();
  chooseNext();
}

init();

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
