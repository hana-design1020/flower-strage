const questions = Array.isArray(window.QUESTION_BANK) ? window.QUESTION_BANK : [];
const glossary = Array.isArray(window.SALESFORCE_GLOSSARY) ? window.SALESFORCE_GLOSSARY : [];
const implementationRules = Array.isArray(window.IMPLEMENTATION_GUIDE_RULES)
  ? window.IMPLEMENTATION_GUIDE_RULES
  : [];
const implementationFallback = window.IMPLEMENTATION_GUIDE_FALLBACK ?? {
  title: "正答を設定へ反映する",
  steps: ["正答の機能を設定で検索し、問題文と同じ条件で設定して動作確認します。"]
};
const storageKey = "salesforce-admin-practice-loop:v1";

const dom = {
  answeredCount: document.querySelector("#answeredCount"),
  accuracy: document.querySelector("#accuracy"),
  streak: document.querySelector("#streak"),
  remainingCount: document.querySelector("#remainingCount"),
  progressBar: document.querySelector("#progressBar"),
  progressText: document.querySelector("#progressText"),
  segments: [...document.querySelectorAll(".segment")],
  sourceSegments: [...document.querySelectorAll(".source-segment")],
  unansweredFirst: document.querySelector("#unansweredFirst"),
  shuffleChoices: document.querySelector("#shuffleChoices"),
  autoExplain: document.querySelector("#autoExplain"),
  rangeStart: document.querySelector("#rangeStart"),
  rangeEnd: document.querySelector("#rangeEnd"),
  nextQuestion: document.querySelector("#nextQuestion"),
  bookmark: document.querySelector("#bookmark"),
  resetCurrent: document.querySelector("#resetCurrent"),
  resetAll: document.querySelector("#resetAll"),
  queueCount: document.querySelector("#queueCount"),
  queueList: document.querySelector("#queueList"),
  emptyState: document.querySelector("#emptyState"),
  questionCard: document.querySelector("#questionCard"),
  questionNumber: document.querySelector("#questionNumber"),
  questionTitle: document.querySelector("#questionTitle"),
  questionText: document.querySelector("#questionText"),
  summaryToggle: document.querySelector("#summaryToggle"),
  questionSummary: document.querySelector("#questionSummary"),
  questionSummaryText: document.querySelector("#questionSummaryText"),
  questionHint: document.querySelector("#questionHint"),
  selectionStatus: document.querySelector("#selectionStatus"),
  choiceList: document.querySelector("#choiceList"),
  submitAnswer: document.querySelector("#submitAnswer"),
  showAnswer: document.querySelector("#showAnswer"),
  mobileCommandBar: document.querySelector("#mobileCommandBar"),
  mobileSubmitAnswer: document.querySelector("#mobileSubmitAnswer"),
  mobileShowAnswer: document.querySelector("#mobileShowAnswer"),
  mobileNextQuestion: document.querySelector("#mobileNextQuestion"),
  mobileGlossaryOpen: document.querySelector("#mobileGlossaryOpen"),
  mobileBookmark: document.querySelector("#mobileBookmark"),
  glossaryOpen: document.querySelector("#glossaryOpen"),
  glossaryOverlay: document.querySelector("#glossaryOverlay"),
  glossaryClose: document.querySelector("#glossaryClose"),
  glossarySearch: document.querySelector("#glossarySearch"),
  glossaryFilters: document.querySelector("#glossaryFilters"),
  glossaryContext: document.querySelector("#glossaryContext"),
  glossaryList: document.querySelector("#glossaryList"),
  glossaryEmpty: document.querySelector("#glossaryEmpty"),
  resultPanel: document.querySelector("#resultPanel"),
  resultBadge: document.querySelector("#resultBadge"),
  answerSummary: document.querySelector("#answerSummary"),
  explanationList: document.querySelector("#explanationList"),
  implementationGuide: document.querySelector("#implementationGuide"),
  implementationSections: document.querySelector("#implementationSections")
};

const fallbackState = {
  activeFilter: "all",
  sourceFilter: "all",
  currentId: null,
  selected: [],
  answered: {},
  bookmarks: {},
  questionQueue: [],
  questionQueueSignature: "",
  streak: 0,
  settings: {
    unansweredFirst: true,
    shuffleChoices: true,
    autoExplain: true,
    rangeStart: 1,
    rangeEnd: 253
  }
};

let state = loadState();
let visibleQuestions = [];
let current = null;
let renderedChoices = [];
let answerShown = false;
let explanationExpanded = false;
let summaryExpanded = false;
let glossaryFilter = "current";
let glossaryTrigger = null;

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

const sourceLabels = {
  tyson: "タイソン",
  jpn: "JPN",
  other: "その他"
};

function questionSource(question) {
  if (question.source) return question.source;
  if (/tysonblog/i.test(question.url ?? "")) return "tyson";
  if (/^(admin-extra|admin-jpn)-/.test(question.id ?? "")) return "jpn";
  return "other";
}

function questionSourceLabel(question) {
  return sourceLabels[questionSource(question)] ?? sourceLabels.other;
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

function splitSentences(value) {
  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^。！？!?]+[。！？!?]?/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
}

function stripCompanyName(value) {
  return value
    .replace(/^[A-Z][A-Za-z '&.-]+社(?:\([^)]*\))?(?:の|では|は|には)?、?/i, "")
    .replace(/^管理者(?:は|が|に)、?/, "")
    .trim();
}

function simplifyContext(value) {
  let context = stripCompanyName(value)
    .replace(/管理者(?:は|が)、?/g, "")
    .replace(/^[^、]{1,28}(?:は|が)、/, "")
    .replace(/と考えています[。.]?$/, "")
    .replace(/と考えています。/g, "。")
    .replace(/を知りたがっています[。.]?$/, "")
    .replace(/するよう依頼されました[。.]?$/, "する必要があります")
    .replace(/よう求められました[。.]?$/, "必要があります")
    .replace(/できるようにしたい[。.]?$/, "できるようにする必要があります")
    .replace(/するために何が実装できるか$/, "する必要があります")
    .replace(/[。.]$/, "")
    .trim();

  if (context.length > 86) {
    context = `${context.slice(0, 83).replace(/[、,\s]+$/, "")}…`;
  }

  return context;
}

function simplifyAsk(value) {
  return stripCompanyName(value)
    .replace(/管理者(?:は|が|に|を)、?/g, "")
    .replace(/どのように/g, "どう")
    .replace(/使用すべきでしょうか/g, "使うべきか")
    .replace(/活用すべきでしょうか/g, "活用すべきか")
    .replace(/行うべき手順はどれですか/g, "どの手順が必要か")
    .replace(/構成する必要がありますか/g, "設定する必要があるか")
    .replace(/有効にする必要がありますか/g, "有効にする必要がある機能は何か")
    .replace(/どこに行けばよいでしょうか/g, "どこで確認できるか")
    .replace(/何をすべきでしょうか/g, "何をするべきか")
    .replace(/必要がありますか/g, "必要があるか")
    .replace(/どうなりますか/g, "どうなるか")
    .replace(/できますか/g, "できるか")
    .replace(/されますか/g, "されるか")
    .replace(/すればよいですか/g, "すればよいか")
    .replace(/すべきですか/g, "すべきか")
    .replace(/何ですか/g, "何か")
    .replace(/でしょうか/g, "か")
    .replace(/ですか/g, "か")
    .replace(/[。？?]$/, "")
    .trim();
}

function summaryTarget(questionSentence) {
  if (/手順|ステップ/.test(questionSentence)) return "そのために必要な手順";
  if (/ツール/.test(questionSentence)) return "その要件を実現するために使うツール";
  if (/機能/.test(questionSentence)) return "そのために使うSalesforceの機能";
  if (/権限/.test(questionSentence)) return "そのために必要なユーザー権限";
  if (/どこ|場所/.test(questionSentence)) return "その情報を確認する場所";
  if (/なぜ|原因/.test(questionSentence)) return "その現象が起きる原因";
  if (/考慮事項|留意/.test(questionSentence)) return "設定時に注意すべき点";
  if (/構成|設定/.test(questionSentence)) return "そのために必要な設定";
  return "その要件を満たす方法";
}

function summarizeQuestion(question) {
  if (question.summary) return question.summary;

  const sentences = splitSentences(question.question);
  if (!sentences.length) return "この要件を満たすSalesforceの機能や設定を選ぶ問題です。";

  let questionIndex = -1;
  for (let index = sentences.length - 1; index >= 0; index -= 1) {
    if (/(どれ|どの|何|なぜ|どこ|どう|でしょうか|ですか|ますか|必要がありますか)/.test(sentences[index])) {
      questionIndex = index;
      break;
    }
  }

  if (questionIndex === -1) questionIndex = sentences.length - 1;

  const rawAsk = sentences[questionIndex];
  const ask = simplifyAsk(rawAsk);
  const needsContext = (
    /^(この|これ|上記|その)(要件|目標|問題|状況|目的|内容|実現)/.test(rawAsk) ||
    /(どのツール|どの機能|どのソリューション|どのオプション|どの手順|どのステップ|どのユーザー権限|何を(?:使用|設定|構成|すべき)|どうすれば|どのようにこれ)/.test(rawAsk)
  );

  if (needsContext && questionIndex > 0) {
    const context = simplifyContext(sentences.slice(0, questionIndex).join(""));
    if (context) {
      return `要するに、${context}。${summaryTarget(rawAsk)}を問う問題です。`;
    }
  }

  return `要するに、${ask}を問う問題です。`;
}

function normalizeGlossaryText(value) {
  return String(value ?? "")
    .toLocaleLowerCase("ja")
    .replace(/[\s・‐‑–—_-]+/g, "");
}

function glossaryAliases(entry) {
  return [entry.term, entry.english, ...(entry.aliases ?? [])].filter(Boolean);
}

function currentGlossaryEntries() {
  if (!current) return [];

  const source = normalizeGlossaryText([current.question, ...(current.choices ?? [])].join(" "));
  return glossary.filter((entry) => {
    const keywords = entry.keywords?.length ? entry.keywords : glossaryAliases(entry);
    return keywords.some((keyword) => source.includes(normalizeGlossaryText(keyword)));
  });
}

function glossaryCategories() {
  return [...new Set(glossary.map((entry) => entry.category).filter(Boolean))];
}

function createGlossaryFilter(value, label, count) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "glossary-filter";
  button.classList.toggle("active", glossaryFilter === value);
  button.setAttribute("aria-pressed", String(glossaryFilter === value));
  button.textContent = count == null ? label : `${label} ${count}`;
  button.addEventListener("click", () => {
    glossaryFilter = value;
    renderGlossary();
  });
  return button;
}

function renderGlossaryFilters() {
  const relatedCount = currentGlossaryEntries().length;
  dom.glossaryFilters.textContent = "";
  dom.glossaryFilters.append(
    createGlossaryFilter("current", "この問題", relatedCount),
    createGlossaryFilter("all", "すべて", glossary.length)
  );

  glossaryCategories().forEach((category) => {
    dom.glossaryFilters.append(createGlossaryFilter(category, category));
  });
}

function glossaryEntryMatchesSearch(entry, query) {
  if (!query) return true;
  const target = normalizeGlossaryText([
    ...glossaryAliases(entry),
    entry.category,
    entry.definition
  ].join(" "));
  return target.includes(query);
}

function renderGlossaryEntry(entry) {
  const article = document.createElement("article");
  article.className = "glossary-entry";

  const heading = document.createElement("div");
  heading.className = "glossary-entry-heading";

  const titleGroup = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = entry.term;
  titleGroup.append(title);

  if (entry.english) {
    const english = document.createElement("span");
    english.className = "glossary-english";
    english.textContent = entry.english;
    titleGroup.append(english);
  }

  const category = document.createElement("span");
  category.className = "glossary-category";
  category.textContent = entry.category;
  heading.append(titleGroup, category);

  const definition = document.createElement("p");
  definition.textContent = entry.definition;
  article.append(heading, definition);
  return article;
}

function renderGlossary() {
  if (!dom.glossaryList) return;

  const query = normalizeGlossaryText(dom.glossarySearch.value);
  const related = currentGlossaryEntries();
  let entries = glossary;

  if (glossaryFilter === "current") {
    entries = related;
  } else if (glossaryFilter !== "all") {
    entries = glossary.filter((entry) => entry.category === glossaryFilter);
  }

  entries = entries
    .filter((entry) => glossaryEntryMatchesSearch(entry, query))
    .sort((left, right) => left.term.localeCompare(right.term, "ja"));

  renderGlossaryFilters();
  dom.glossaryList.textContent = "";
  entries.forEach((entry) => dom.glossaryList.append(renderGlossaryEntry(entry)));
  dom.glossaryEmpty.hidden = entries.length > 0;

  if (glossaryFilter === "current") {
    dom.glossaryContext.textContent = related.length
      ? `第${current?.number ?? "?"}問に関係する用語を表示しています。`
      : "この問題に一致する用語はありません。「すべて」から検索できます。";
  } else {
    dom.glossaryContext.textContent = `${entries.length}件の用語を表示しています。`;
  }
}

function openGlossary(event) {
  glossaryTrigger = event?.currentTarget ?? document.activeElement;
  glossaryFilter = currentGlossaryEntries().length ? "current" : "all";
  dom.glossarySearch.value = "";
  dom.glossaryOverlay.hidden = false;
  document.body.classList.add("dialog-open");
  renderGlossary();
  requestAnimationFrame(() => dom.glossarySearch.focus());
}

function closeGlossary() {
  dom.glossaryOverlay.hidden = true;
  document.body.classList.remove("dialog-open");
  glossaryTrigger?.focus?.();
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

  dom.sourceSegments.forEach((segment) => {
    segment.classList.toggle("active", segment.dataset.sourceFilter === state.sourceFilter);
  });
}

function buildQuestionPool() {
  const start = Number(dom.rangeStart.value || state.settings.rangeStart || 1);
  const end = Number(dom.rangeEnd.value || state.settings.rangeEnd || 9999);
  const min = Math.min(start, end);
  const max = Math.max(start, end);

  let pool = questions.filter((question) => {
    const number = question.number ?? 0;
    return number >= min && number <= max;
  });

  if (state.sourceFilter && state.sourceFilter !== "all") {
    pool = pool.filter((question) => questionSource(question) === state.sourceFilter);
  }

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
    return [...unanswered, ...answered];
  }

  return pool;
}

function queueSignature(pool) {
  const ids = [...pool].sort(byNumber).map((question) => question.id);
  return [
    state.activeFilter,
    state.sourceFilter,
    state.settings.unansweredFirst ? "unanswered-first" : "balanced",
    Number(dom.rangeStart.value || state.settings.rangeStart || 1),
    Number(dom.rangeEnd.value || state.settings.rangeEnd || 9999),
    ids.join("|")
  ].join("::");
}

function queueIdsForPool(pool) {
  if (state.settings.unansweredFirst) {
    const unanswered = pool.filter((question) => !getRecord(question));
    const answered = pool.filter((question) => getRecord(question));
    return [...shuffle(unanswered), ...shuffle(answered)].map((question) => question.id);
  }

  return shuffle(pool).map((question) => question.id);
}

function rebuildQuestionQueue(pool) {
  const ids = queueIdsForPool(pool);
  if (current && ids.length > 1 && ids[0] === current.id) {
    ids.push(ids.shift());
  }

  state.questionQueue = ids;
  state.questionQueueSignature = queueSignature(pool);
}

function ensureQuestionQueue(pool) {
  const signature = queueSignature(pool);
  const validIds = new Set(pool.map((question) => question.id));

  if (state.questionQueueSignature !== signature || !Array.isArray(state.questionQueue)) {
    rebuildQuestionQueue(pool);
    return;
  }

  state.questionQueue = state.questionQueue.filter((id) => validIds.has(id));

  if (!state.questionQueue.length) {
    rebuildQuestionQueue(pool);
  }
}

function scrollToTopAfterQuestionChange() {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  });
}

function buildVisibleQuestions() {
  return buildQuestionPool();
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
  state.questionQueue = Array.isArray(state.questionQueue)
    ? state.questionQueue.filter((id) => id !== question.id)
    : [];
  state.selected = [];
  answerShown = false;
  explanationExpanded = false;
  summaryExpanded = false;
  const choiceEntries = question.choices.map((text, index) => ({ text, index }));
  renderedChoices = state.settings.shuffleChoices ? shuffle(choiceEntries) : choiceEntries;
  saveState();
  render();
}

function chooseNext(options = {}) {
  visibleQuestions = buildQuestionPool();
  if (!visibleQuestions.length) {
    setCurrent(null);
    if (options.scrollToTop) scrollToTopAfterQuestionChange();
    return;
  }

  ensureQuestionQueue(visibleQuestions);

  const nextId = state.questionQueue.shift();
  const nextQuestion = visibleQuestions.find((question) => question.id === nextId) ?? visibleQuestions[0];
  setCurrent(nextQuestion);
  if (options.scrollToTop) scrollToTopAfterQuestionChange();
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

function toggleSummary() {
  if (!current) return;
  summaryExpanded = !summaryExpanded;
  renderSummary();
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

  const pool = buildQuestionPool();
  const remaining = Math.min(
    pool.length,
    (Array.isArray(state.questionQueue) ? state.questionQueue.length : 0) + (current ? 1 : 0)
  );
  const completed = Math.max(pool.length - remaining, 0);
  const percentage = pool.length ? Math.round((completed / pool.length) * 100) : 0;

  dom.remainingCount.textContent = `${remaining}問`;
  dom.progressText.textContent = `${completed} / ${pool.length}問 完了`;
  dom.progressBar.style.width = `${percentage}%`;
}

function renderQueue() {
  visibleQuestions = buildVisibleQuestions();
  dom.queueList.textContent = "";

  const byId = new Map(visibleQuestions.map((question) => [question.id, question]));
  const upcoming = (Array.isArray(state.questionQueue) ? state.questionQueue : [])
    .map((id) => byId.get(id))
    .filter(Boolean);
  const seen = new Set();
  const items = [current, ...upcoming, ...visibleQuestions]
    .filter(Boolean)
    .filter((question) => {
      if (seen.has(question.id)) return false;
      seen.add(question.id);
      return true;
    })
    .slice(0, 80);

  dom.queueCount.textContent = `${visibleQuestions.length}問`;

  for (const question of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "queue-item";
    button.classList.toggle("current", question.id === current?.id);
    button.innerHTML = `
      <span>Q${question.number ?? "?"}</span>
      <small>${escapeHtml(questionSourceLabel(question))} / ${queueStatus(question)}</small>
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

  const requiredCount = Math.max(correctIndexesFor(current).length, 1);
  dom.questionNumber.textContent = `${questionSourceLabel(current)} / Salesforce Administrator`;
  dom.questionTitle.textContent = current.number ? `第${current.number}問` : "練習問題";
  dom.questionText.textContent = current.question;
  dom.questionHint.textContent = requiredCount > 1 ? `${requiredCount}つ選択` : "1つ選択";
  dom.selectionStatus.textContent = `選択中 ${state.selected.length} / ${requiredCount}`;
  dom.bookmark.classList.toggle("active", Boolean(state.bookmarks[current.id]));
  dom.mobileBookmark.classList.toggle("active", Boolean(state.bookmarks[current.id]));
  dom.submitAnswer.disabled = answerShown || !state.selected.length;
  dom.mobileSubmitAnswer.disabled = answerShown || !state.selected.length;

  renderSummary();
  renderChoices();
  renderResult();
}

function renderSummary() {
  if (!current) return;

  dom.questionSummaryText.textContent = summarizeQuestion(current);
  dom.questionSummary.hidden = !summaryExpanded;
  dom.summaryToggle.setAttribute("aria-expanded", String(summaryExpanded));
  dom.summaryToggle.classList.toggle("active", summaryExpanded);
  dom.summaryToggle.querySelector("span:first-child").textContent = summaryExpanded ? "要点を閉じる" : "要点を見る";
}

function renderChoices() {
  if (!current) return;

  const selected = new Set(state.selected);
  const correct = new Set(correctIndexesFor(current));
  dom.choiceList.textContent = "";

  renderedChoices.forEach((item, displayIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.classList.toggle("selected", selected.has(item.index));
    button.setAttribute("aria-pressed", String(selected.has(item.index)));

    if (answerShown) {
      button.classList.toggle("correct", correct.has(item.index));
      button.classList.toggle("incorrect", selected.has(item.index) && !correct.has(item.index));
    }

    const marker = answerShown
      ? correct.has(item.index) ? "✓" : selected.has(item.index) ? "×" : String.fromCharCode(65 + displayIndex)
      : selected.has(item.index) ? "✓" : String.fromCharCode(65 + displayIndex);

    button.innerHTML = `
      <span class="choice-marker" aria-hidden="true">${marker}</span>
      <span class="choice-text">${escapeHtml(item.text)}</span>
    `;
    button.addEventListener("click", () => toggleSelection(item.index));
    dom.choiceList.append(button);
  });

  dom.submitAnswer.disabled = answerShown || !state.selected.length;
  dom.mobileSubmitAnswer.disabled = answerShown || !state.selected.length;
  dom.selectionStatus.textContent = `選択中 ${state.selected.length} / ${Math.max(correctIndexesFor(current).length, 1)}`;
}

function implementationObjectName(question) {
  const source = [question.question, ...question.choices].join(" ");
  const objectNames = [
    "キャンペーンメンバー",
    "取引先責任者",
    "個人取引先",
    "カスタムオブジェクト",
    "取引先",
    "商談",
    "リード",
    "ケース",
    "キャンペーン",
    "契約",
    "商品",
    "ユーザー",
    "ToDo"
  ];
  return objectNames.find((name) => source.includes(name)) ?? "対象オブジェクト";
}

function replaceImplementationTokens(value, context) {
  return String(value)
    .replaceAll("{object}", context.object)
    .replaceAll("{answer}", context.answer);
}

function implementationStepTitle(index) {
  return [
    "設定画面を開く",
    "基本設定を入力する",
    "関連設定を仕上げる",
    "保存して機能を確認する"
  ][index] ?? `設定作業 ${index + 1}`;
}

function implementationPracticeTarget(guide, context) {
  const targets = {
    access: "テストユーザーと権限",
    security: "テストユーザーとログイン条件",
    "user-admin": "テストユーザー",
    reporting: "テストレポートと集計元データ",
    chatter: "テストグループまたは投稿",
    organization: "変更した組織設定",
    "data-governance": "エクスポートしたテストデータと設定",
    deployment: "検証用の変更内容",
    package: "検証用のパッケージまたはアプリ"
  };
  return targets[guide.group] ?? `${context.object}のテストデータ`;
}

function detailedImplementationSteps(guide, context, question) {
  const practiceName = `Q${question.number}_HandsOn`;
  const requirement = summarizeQuestion(question).replace(/^要するに、/, "");
  const practiceTarget = implementationPracticeTarget(guide, context);
  const configuredSteps = guide.steps.map((step, index) => ({
    title: implementationStepTitle(index),
    detail: replaceImplementationTokens(step, context)
  }));

  return [
    {
      title: "完成条件を確認する",
      detail: `${requirement} 正答「${context.answer}」を使って再現できれば完成です。`
    },
    {
      title: "練習環境と名前を準備する",
      detail: `本番組織ではなく、Trailhead Playground、Developer Edition、またはSandboxへシステム管理者でログインします。作成する設定やテストデータには「${practiceName}」を含め、後から見分けられるようにします。`
    },
    ...configuredSteps,
    {
      title: "正常系をテストする",
      detail: `${practiceTarget}「${practiceName}」を使い、問題文の条件をすべて満たす操作を行います。正答どおりの表示、権限、更新、通知、または集計結果になることを確認します。`
    },
    {
      title: "条件違いと権限違いをテストする",
      detail: "問題文の条件を1つだけ外したデータでも試します。必要に応じて一般ユーザーへログインを切り替え、許可される操作と拒否される操作が要件どおりに分かれることを確認します。"
    },
    {
      title: "結果を記録して後片付けする",
      detail: `期待結果と実際の結果、使用したテストユーザーをメモします。練習後は「${practiceName}」で検索し、不要なテストデータを削除して、作成した自動化や設定を無効化または削除します。`
    }
  ];
}

function implementationGuidesFor(question) {
  const correctAnswers = correctIndexesFor(question)
    .map((index) => question.choices[index])
    .filter(Boolean);
  const answerText = correctAnswers.join(" / ");
  const usedGroups = new Set();
  const matches = [];

  for (const rule of implementationRules) {
    const matched = rule.patterns?.some((pattern) => {
      try {
        return new RegExp(pattern, "i").test(answerText);
      } catch {
        return answerText.includes(pattern);
      }
    });

    if (!matched || (rule.group && usedGroups.has(rule.group))) continue;
    matches.push(rule);
    if (rule.group) usedGroups.add(rule.group);
    if (matches.length >= 3) break;
  }

  const shortenedAnswer = answerText.length > 110
    ? `${answerText.slice(0, 107).replace(/[、,\s]+$/, "")}…`
    : answerText;
  const context = {
    object: implementationObjectName(question),
    answer: shortenedAnswer || "正答の内容"
  };
  const guides = matches.length ? matches : [implementationFallback];

  return guides.map((guide) => ({
    title: replaceImplementationTokens(guide.title, context),
    steps: detailedImplementationSteps(guide, context, question)
  }));
}

function renderImplementationGuide() {
  dom.implementationGuide.hidden = !explanationExpanded;
  dom.implementationSections.textContent = "";
  if (!explanationExpanded || !current) return;

  implementationGuidesFor(current).forEach((guide) => {
    const section = document.createElement("section");
    section.className = "implementation-section";

    const heading = document.createElement("h4");
    heading.textContent = guide.title;

    const list = document.createElement("ol");
    guide.steps.forEach((step) => {
      const item = document.createElement("li");

      const title = document.createElement("strong");
      title.className = "implementation-step-title";
      title.textContent = step.title;

      const detail = document.createElement("p");
      detail.textContent = step.detail;

      item.append(title, detail);
      list.append(item);
    });

    section.append(heading, list);
    dom.implementationSections.append(section);
  });
}

function renderResult() {
  if (!current) return;

  dom.resultPanel.hidden = !answerShown;
  if (!answerShown) {
    dom.implementationGuide.hidden = true;
    return;
  }

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
  renderImplementationGuide();

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
  if (!dom.glossaryOverlay.hidden) renderGlossary();
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
  const savedStateExists = Boolean(localStorage.getItem(storageKey));

  if (questions.length) {
    const numbers = questions.map((question) => question.number).filter(Number.isFinite);
    if (numbers.length) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      const oldFullRangeEnds = new Set([181, 201]);
      state.settings.rangeStart = state.settings.rangeStart || min;
      state.settings.rangeEnd = state.settings.rangeEnd || max;
      dom.rangeStart.min = String(min);
      dom.rangeStart.max = String(max);
      dom.rangeEnd.min = String(min);
      dom.rangeEnd.max = String(max);
      if (!savedStateExists) {
        state.settings.rangeStart = min;
        state.settings.rangeEnd = max;
      } else if (oldFullRangeEnds.has(Number(state.settings.rangeEnd)) || Number(state.settings.rangeEnd) > max) {
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

  dom.sourceSegments.forEach((segment) => {
    segment.addEventListener("click", () => {
      state.sourceFilter = segment.dataset.sourceFilter;
      saveState();
      chooseNext();
    });
  });

  dom.unansweredFirst.addEventListener("change", onSettingChange);
  dom.shuffleChoices.addEventListener("change", onSettingChange);
  dom.autoExplain.addEventListener("change", onSettingChange);
  dom.rangeStart.addEventListener("change", onSettingChange);
  dom.rangeEnd.addEventListener("change", onSettingChange);
  dom.nextQuestion.addEventListener("click", () => chooseNext({ scrollToTop: true }));
  dom.bookmark.addEventListener("click", toggleBookmark);
  dom.resetCurrent.addEventListener("click", resetCurrent);
  dom.resetAll.addEventListener("click", resetAll);
  dom.submitAnswer.addEventListener("click", submitAnswer);
  dom.showAnswer.addEventListener("click", showAnswer);
  dom.summaryToggle.addEventListener("click", toggleSummary);
  dom.mobileNextQuestion.addEventListener("click", () => chooseNext({ scrollToTop: true }));
  dom.mobileGlossaryOpen.addEventListener("click", openGlossary);
  dom.mobileBookmark.addEventListener("click", toggleBookmark);
  dom.mobileSubmitAnswer.addEventListener("click", submitAnswer);
  dom.mobileShowAnswer.addEventListener("click", showAnswer);
  dom.glossaryOpen.addEventListener("click", openGlossary);
  dom.glossaryClose.addEventListener("click", closeGlossary);
  dom.glossarySearch.addEventListener("input", renderGlossary);
  dom.glossaryOverlay.addEventListener("click", (event) => {
    if (event.target === dom.glossaryOverlay) closeGlossary();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.glossaryOverlay.hidden) closeGlossary();
  });

  syncControls();
  chooseNext();
}

init();

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
