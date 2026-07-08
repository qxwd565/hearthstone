const classes = [
  "죽음의 기사",
  "악마사냥꾼",
  "드루이드",
  "사냥꾼",
  "마법사",
  "성기사",
  "사제",
  "도적",
  "주술사",
  "흑마법사",
  "전사",
  "중립",
];

const sampleCards = [
  { id: "dk-1", name: "부정의 일격", className: "죽음의 기사", cost: 1, type: "주문", rarity: "rare", text: "하수인에게 피해를 주고 시체를 얻습니다." },
  { id: "dk-2", name: "서리 여왕 신드라고사", className: "죽음의 기사", cost: 7, type: "하수인", rarity: "legendary", text: "전장에 냉기 압박을 만듭니다." },
  { id: "dh-1", name: "혼돈의 일격", className: "악마사냥꾼", cost: 2, type: "주문", rarity: "common", text: "공격력을 얻고 카드를 뽑습니다." },
  { id: "dh-2", name: "심연의 추적자", className: "악마사냥꾼", cost: 4, type: "하수인", rarity: "epic", text: "내 영웅이 공격한 후 비용이 줄어듭니다." },
  { id: "druid-1", name: "정신 자극", className: "드루이드", cost: 0, type: "주문", rarity: "common", text: "이번 턴에 마나를 더 얻습니다." },
  { id: "druid-2", name: "꿈의 메리스라", className: "드루이드", cost: 8, type: "하수인", rarity: "legendary", text: "용족 시너지를 강화합니다." },
  { id: "hunter-1", name: "빠른 사격", className: "사냥꾼", cost: 2, type: "주문", rarity: "common", text: "피해를 줍니다. 손이 비었다면 카드를 뽑습니다." },
  { id: "hunter-2", name: "동료 부르기", className: "사냥꾼", cost: 3, type: "주문", rarity: "rare", text: "야수 동료를 소환합니다." },
  { id: "mage-1", name: "신비한 화살", className: "마법사", cost: 1, type: "주문", rarity: "common", text: "무작위 적들에게 피해를 나누어 줍니다." },
  { id: "mage-2", name: "불기둥", className: "마법사", cost: 7, type: "주문", rarity: "rare", text: "모든 적 하수인에게 피해를 줍니다." },
  { id: "paladin-1", name: "보호막 기사단", className: "성기사", cost: 3, type: "하수인", rarity: "rare", text: "천상의 보호막을 가진 하수인을 강화합니다." },
  { id: "paladin-2", name: "은빛 성전사", className: "성기사", cost: 5, type: "하수인", rarity: "epic", text: "신병을 소환하고 강화합니다." },
  { id: "priest-1", name: "신의 권능: 보호막", className: "사제", cost: 1, type: "주문", rarity: "common", text: "하수인에게 생명력을 부여하고 카드를 뽑습니다." },
  { id: "priest-2", name: "정신 지배", className: "사제", cost: 10, type: "주문", rarity: "epic", text: "상대 하수인을 가져옵니다." },
  { id: "rogue-1", name: "기습", className: "도적", cost: 0, type: "주문", rarity: "common", text: "피해를 받은 적에게 피해를 줍니다." },
  { id: "rogue-2", name: "그림자 연마자", className: "도적", cost: 4, type: "하수인", rarity: "legendary", text: "연계 카드를 사용할 때마다 손패를 정리합니다." },
  { id: "shaman-1", name: "번개 화살", className: "주술사", cost: 1, type: "주문", rarity: "common", text: "피해를 주고 과부하됩니다." },
  { id: "shaman-2", name: "예고의 토템", className: "주술사", cost: 3, type: "하수인", rarity: "rare", text: "다음 주문의 비용을 줄입니다." },
  { id: "warlock-1", name: "영혼의 불꽃", className: "흑마법사", cost: 1, type: "주문", rarity: "common", text: "피해를 주고 카드를 버립니다." },
  { id: "warlock-2", name: "라팜의 계략", className: "흑마법사", cost: 6, type: "주문", rarity: "legendary", text: "악마와 손패 자원을 폭발시킵니다." },
  { id: "warrior-1", name: "방패 올리기", className: "전사", cost: 1, type: "주문", rarity: "common", text: "방어도를 얻습니다." },
  { id: "warrior-2", name: "용의 포효", className: "전사", cost: 2, type: "주문", rarity: "rare", text: "용족 카드를 발견합니다." },
  { id: "neutral-1", name: "고블린 경매인", className: "중립", cost: 6, type: "하수인", rarity: "rare", text: "주문을 시전한 후 카드를 뽑습니다." },
  { id: "neutral-2", name: "해적 패치스", className: "중립", cost: 1, type: "하수인", rarity: "legendary", text: "해적을 낼 때 덱에서 뛰쳐나옵니다." },
];

const state = {
  cards: loadCards(),
  metadata: loadMetadata(),
  currentDeck: [],
  viewMode: "cardSet",
  activeDetailCardId: "",
  activeModeFilter: "",
  activeSetSlug: "",
  activeSetName: "",
  activeDetailSearch: "",
  cardPatches: {},
  setReleaseDates: {},
  hearthstoneYears: {},
  editingPatch: null,
  pendingCardSlug: cardSlugFromLocation(),
};

const isFileMode = window.location.protocol === "file:";
if (isFileMode) document.body.classList.add("is-file-mode");
let isSyncingCards = false;
let shouldSyncCardsAgain = false;
let isCheckingDbVersion = false;
const deckNameCollator = new Intl.Collator("ko-KR", { sensitivity: "base", numeric: true });
const hangulInitials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const qwertyConsonants = {
  r: "ㄱ",
  R: "ㄲ",
  s: "ㄴ",
  e: "ㄷ",
  E: "ㄸ",
  f: "ㄹ",
  a: "ㅁ",
  q: "ㅂ",
  Q: "ㅃ",
  t: "ㅅ",
  T: "ㅆ",
  d: "ㅇ",
  w: "ㅈ",
  W: "ㅉ",
  c: "ㅊ",
  z: "ㅋ",
  x: "ㅌ",
  v: "ㅍ",
  g: "ㅎ",
};
const qwertyVowels = {
  k: 0,
  o: 1,
  i: 2,
  O: 3,
  j: 4,
  p: 5,
  u: 6,
  P: 7,
  h: 8,
  y: 12,
  n: 13,
  b: 17,
  m: 18,
  l: 20,
};
const compoundVowels = {
  hk: 9,
  ho: 10,
  hl: 11,
  nj: 14,
  np: 15,
  nl: 16,
  ml: 19,
};
const standaloneVowelJamo = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
const choseongIndexes = {
  "ㄱ": 0,
  "ㄲ": 1,
  "ㄴ": 2,
  "ㄷ": 3,
  "ㄸ": 4,
  "ㄹ": 5,
  "ㅁ": 6,
  "ㅂ": 7,
  "ㅃ": 8,
  "ㅅ": 9,
  "ㅆ": 10,
  "ㅇ": 11,
  "ㅈ": 12,
  "ㅉ": 13,
  "ㅊ": 14,
  "ㅋ": 15,
  "ㅌ": 16,
  "ㅍ": 17,
  "ㅎ": 18,
};
const jongseongIndexes = {
  "ㄱ": 1,
  "ㄲ": 2,
  "ㄴ": 4,
  "ㄷ": 7,
  "ㄹ": 8,
  "ㅁ": 16,
  "ㅂ": 17,
  "ㅅ": 19,
  "ㅆ": 20,
  "ㅇ": 21,
  "ㅈ": 22,
  "ㅊ": 23,
  "ㅋ": 24,
  "ㅌ": 25,
  "ㅍ": 26,
  "ㅎ": 27,
};
const compoundJongseong = {
  "ㄱㅅ": 3,
  "ㄴㅈ": 5,
  "ㄴㅎ": 6,
  "ㄹㄱ": 9,
  "ㄹㅁ": 10,
  "ㄹㅂ": 11,
  "ㄹㅅ": 12,
  "ㄹㅌ": 13,
  "ㄹㅍ": 14,
  "ㄹㅎ": 15,
  "ㅂㅅ": 18,
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  appShell: $("#appShell"),
  pageEyebrow: $("#pageEyebrow"),
  pageTitle: $("#pageTitle"),
  deckBuildToggle: $("#deckBuildToggle"),
  cardList: $("#cardList"),
  cardLoading: $("#cardLoading"),
  cardTemplate: $("#cardTemplate"),
  classFilter: $("#classFilter"),
  activeFilterChips: $("#activeFilterChips"),
  cardSearch: $("#cardSearch"),
  detailSearchToggle: $("#detailSearchToggle"),
  detailSearchPanel: $("#detailSearchPanel"),
  detailSearch: $("#detailSearch"),
  deckClass: $("#deckClass"),
  modeButtons: document.querySelectorAll(".mode-button"),
  deckSize: $("#deckSize"),
  deckList: $("#deckList"),
  exportPngButton: $("#exportPngButton"),
  clearDeckButton: $("#clearDeckButton"),
  syncDbButton: $("#syncDbButton"),
  syncStatus: $("#syncStatus"),
  deckCodeInput: $("#deckCodeInput"),
  loadDeckCodeButton: $("#loadDeckCodeButton"),
  deckCodeStatus: $("#deckCodeStatus"),
  cardPreview: $("#cardPreview"),
  cardPreviewImage: $("#cardPreviewImage"),
  cardDetailModal: $("#cardDetailModal"),
  cardDetailClose: $("#cardDetailClose"),
  cardDetailImage: $("#cardDetailImage"),
  cardDetailName: $("#cardDetailName"),
  cardDetailFlavor: $("#cardDetailFlavor"),
  addPatchButton: $("#addPatchButton"),
  cardPatchList: $("#cardPatchList"),
  cardPatchForm: $("#cardPatchForm"),
  cardPatchDate: $("#cardPatchDate"),
  cardPatchText: $("#cardPatchText"),
  cancelPatchButton: $("#cancelPatchButton"),
  submitPatchButton: $("#submitPatchButton"),
  cardPatchStatus: $("#cardPatchStatus"),
  saveCardImageButton: $("#saveCardImageButton"),
  modalDeckBuilderButton: $("#modalDeckBuilderButton"),
};

function disableServerOnlyControls() {
  [
    elements.syncDbButton,
    elements.loadDeckCodeButton,
    elements.exportPngButton,
    elements.addPatchButton,
    elements.submitPatchButton,
    elements.saveCardImageButton,
  ].forEach((element) => {
    if (element) element.disabled = true;
  });
}

function loadCards() {
  try {
    const cached = JSON.parse(localStorage.getItem("hsCardDb") || "null");
    return Array.isArray(cached) && cached.length ? normalizeStoredCards(cached) : [];
  } catch {
    return [];
  }
}

function nullableNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeStoredCards(cards) {
  return cards.map((card) => {
    const cropImage = card.cropImage || card.art || "";
    const image = card.image || "";
    const keywords = Array.isArray(card.keywords)
      ? card.keywords.map((keyword) => (typeof keyword === "string" ? keyword : keyword?.name || keyword?.slug || "")).filter(Boolean)
      : [];
    return {
      ...card,
      image,
      cropImage,
      art: cropImage || card.art || "",
      keywords,
      attack: nullableNumber(card.attack),
      health: nullableNumber(card.health),
      durability: nullableNumber(card.durability),
      armor: nullableNumber(card.armor),
      setName: card.setName || "",
      setSlug: card.setSlug || "",
      spellSchoolName: card.spellSchoolName || "",
      minionTypeName: card.minionTypeName || "",
      flavorText: card.flavorText || "",
      artistName: card.artistName || "",
      collectible: card.collectible === undefined ? true : Boolean(card.collectible),
    };
  });
}

function loadMetadata() {
  try {
    const cached = JSON.parse(localStorage.getItem("hsCardMetadata") || "null");
    return cached && typeof cached === "object" ? cached : {};
  } catch {
    return {};
  }
}

function saveCardDb(cards, meta = {}, metadata = state.metadata) {
  state.cards = normalizeStoredCards(cards);
  state.metadata = metadata || {};
  validateActiveFilters();
  const storedMeta = { ...meta, syncedAt: meta?.syncedAt || new Date().toISOString() };
  localStorage.setItem("hsCardDb", JSON.stringify(state.cards));
  localStorage.setItem("hsCardMetadata", JSON.stringify(state.metadata));
  localStorage.setItem("hsCardDbMeta", JSON.stringify(storedMeta));
}

function cardById(cardId) {
  return state.cards.find((card) => card.id === cardId);
}

function copyCount(cardId) {
  return state.currentDeck.filter((id) => id === cardId).length;
}

function deckCards() {
  return state.currentDeck.map(cardById).filter(Boolean);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isDeckBuilderMode() {
  return state.viewMode === "deckBuilder";
}

function renderViewMode() {
  const isBuilder = isDeckBuilderMode();
  elements.appShell.classList.toggle("deck-builder-page", isBuilder);
  elements.appShell.classList.toggle("card-set-page", !isBuilder);
  elements.pageEyebrow.textContent = isBuilder ? "Deck Builder" : "Card Set";
  elements.pageTitle.textContent = isBuilder ? "덱 빌더" : "카드 세트";
  elements.deckBuildToggle.textContent = isBuilder ? "취소" : "덱 만들기";
  elements.deckBuildToggle.classList.toggle("ghost-button", isBuilder);
  elements.deckBuildToggle.classList.toggle("primary-button", !isBuilder);
  if (!isBuilder) hideCardPreview();
}

function setViewMode(mode) {
  state.viewMode = mode === "deckBuilder" ? "deckBuilder" : "cardSet";
  renderAll();
}

function cardArtHtml(card) {
  const image = escapeHtml(cardArtSource(card));
  const alt = escapeHtml(`${card.name} 원화`);
  return `
    <span class="art-frame${image ? "" : " no-art"}">
      ${image ? `<img class="card-art" src="${image}" alt="${alt}" loading="lazy" />` : ""}
    </span>
  `;
}

function deckTileArtHtml(card) {
  const image = deckTileArtSource(card);
  const alt = escapeHtml(`${card.name} 원화`);
  return image
    ? `<span class="deck-tile-art-slot"><img class="deck-tile-art" src="${escapeHtml(image)}" alt="${alt}" loading="lazy" /></span>`
    : "";
}

function deckTileStateClass(card, count) {
  if (card.rarity === "legendary") return "is-legendary";
  if (count > 1) return "has-two-copies";
  return "has-one-copy";
}

function deckTileInnerHtml(card, count) {
  return `
    ${deckTileArtHtml(card)}
    <span class="deck-tile-fade"></span>
    <span class="deck-tile-cost">${card.cost}</span>
    <span class="deck-tile-name">${escapeHtml(card.name)}</span>
  `;
}

function cardArtSource(card) {
  return card.cropImage || card.art || "";
}

function deckTileArtSource(card) {
  return card.cropImage || card.art || "";
}

function cardPreviewSource(card) {
  return card.image || "";
}

function cardGridImageSource(card) {
  return cardPreviewSource(card) || cardArtSource(card);
}

function markBrokenArt(image) {
  image.closest(".art-frame")?.classList.add("no-art");
}

function markBrokenDeckTile(image) {
  image.closest(".deck-card-row")?.classList.add("no-art");
  image.closest(".deck-tile-art-slot")?.remove();
}

function compareDeckCards(a, b) {
  return a.cost - b.cost || deckNameCollator.compare(a.name, b.name);
}

function cardsNeedArtRefresh() {
  const apiCards = state.cards.filter((card) => card.id && card.image);
  const cardsWithArt = apiCards.filter(cardArtSource).length;
  return apiCards.length > 0 && cardsWithArt / apiCards.length < 0.25;
}

function positionCardPreview(x, y) {
  const gap = 18;
  const margin = 12;
  const rect = elements.cardPreview.getBoundingClientRect();
  const width = rect.width || 300;
  const height = rect.height || 420;
  let left = x + gap;
  let top = y - height / 2;

  if (left + width + margin > window.innerWidth) {
    left = x - width - gap;
  }

  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
  elements.cardPreview.style.setProperty("--preview-x", `${left}px`);
  elements.cardPreview.style.setProperty("--preview-y", `${top}px`);
}

function showCardPreview(card, x, y) {
  const image = cardPreviewSource(card);
  if (!image) return;

  if (elements.cardPreviewImage.src !== image) {
    elements.cardPreviewImage.src = image;
    elements.cardPreviewImage.alt = `${card.name} 카드 이미지`;
  }

  elements.cardPreview.classList.add("is-visible");
  elements.cardPreview.setAttribute("aria-hidden", "false");
  positionCardPreview(x, y);
}

function hideCardPreview() {
  elements.cardPreview.classList.remove("is-visible");
  elements.cardPreview.setAttribute("aria-hidden", "true");
}

function cardSlugFromLocation() {
  const match = window.location.pathname.match(/^\/cards\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function cardDetailPath(card) {
  return `/cards/${encodeURIComponent(card.slug || card.id)}`;
}

function cardPatchKey(card) {
  return String(card?.slug || card?.id || "");
}

function todayDateValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function setPatchStatus(message = "") {
  elements.cardPatchStatus.textContent = message;
}

function cardSetLabel(card) {
  return card.setName || card.setSlug || "확장팩 정보 없음";
}

function snapshotSyncedDate() {
  try {
    const meta = JSON.parse(localStorage.getItem("hsCardDbMeta") || "null");
    const syncedAt = meta?.syncedAt || meta?.checkedAt;
    return typeof syncedAt === "string" && syncedAt.length >= 10 ? syncedAt.slice(0, 10) : todayDateValue();
  } catch {
    return todayDateValue();
  }
}

function validateActiveFilters() {
  if (state.activeModeFilter && state.activeModeFilter !== deckMode()) {
    state.activeModeFilter = "";
    state.activeSetSlug = "";
    state.activeSetName = "";
  }

  if (state.activeSetSlug) {
    const matchingCard = state.cards.find((card) => card.setSlug === state.activeSetSlug);
    if (!matchingCard) {
      state.activeModeFilter = "";
      state.activeSetSlug = "";
      state.activeSetName = "";
    } else {
      state.activeSetName = state.activeSetName || cardSetLabel(matchingCard);
    }
  }
}

function applySetFilterFromCard(card) {
  if (!card?.setSlug) return;
  state.activeModeFilter = deckMode();
  state.activeSetSlug = card.setSlug;
  state.activeSetName = cardSetLabel(card);
  closeCardDetail();
  setViewMode("cardSet");
  renderAll();
}

function clearActiveFilter(type = "set") {
  if (type === "detail") {
    state.activeDetailSearch = "";
  } else {
    state.activeModeFilter = "";
    state.activeSetSlug = "";
    state.activeSetName = "";
  }
  renderAll();
}

function activeFilterChip(label, value, type) {
  return `
    <span class="active-filter-chip">
      <span>${escapeHtml(label)}: ${escapeHtml(value)}</span>
      <button type="button" data-filter-type="${escapeHtml(type)}" aria-label="${escapeHtml(label)} 필터 해제">×</button>
    </span>
  `;
}

function renderActiveFilters() {
  validateActiveFilters();
  const chips = [];
  if (state.activeSetSlug) {
    chips.push(activeFilterChip("확장팩", state.activeSetName || state.activeSetSlug, "set"));
  }
  if (state.activeDetailSearch) {
    chips.push(activeFilterChip("상세검색", state.activeDetailSearch, "detail"));
  }
  elements.activeFilterChips.hidden = chips.length === 0;
  elements.activeFilterChips.innerHTML = chips.join("");
}

function patchEntriesForCard(card) {
  const patches = state.cardPatches || {};
  const entries = patches[card.slug] || patches[card.id] || [];
  return Array.isArray(entries) ? entries : [];
}

function formatPatchDate(value) {
  const rawDate = String(value || "").trim();
  const match = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return rawDate;
  return `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`;
}

function setReleaseInfo(card) {
  const info = state.setReleaseDates?.[card?.setSlug] || {};
  return {
    date: info.date || snapshotSyncedDate(),
    name: info.name || cardSetLabel(card),
  };
}

function hearthstoneYearNameForDate(date) {
  const match = String(date || "").match(/^(\d{4})/);
  return match ? state.hearthstoneYears?.[match[1]] || "" : "";
}

function releaseEntryTemplate(card) {
  const release = setReleaseInfo(card);
  const setName = release.name || cardSetLabel(card);
  const linkedSetName = card?.setSlug
    ? `<button class="patch-set-link" type="button" data-card-set-link="true">${escapeHtml(setName)}</button>`
    : `<span>${escapeHtml(setName)}</span>`;
  const yearName = card?.setSlug === "core" ? hearthstoneYearNameForDate(release.date) : "";
  const releaseText = yearName
    ? `<span>${escapeHtml(yearName)} </span>${linkedSetName}`
    : linkedSetName;
  return `
    <article class="card-patch-entry card-release-entry">
      <div>
        <div class="patch-entry-meta"><time>${escapeHtml(formatPatchDate(release.date))}</time></div>
        <p>${releaseText}으로 추가됨.</p>
      </div>
    </article>
  `;
}

function patchEditTemplate(entry, index, field) {
  const date = typeof entry === "object" ? entry.date || "" : "";
  const text = typeof entry === "object" ? entry.text || "" : String(entry || "");
  const control =
    field === "date"
      ? `<input name="date" type="text" value="${escapeHtml(date)}" placeholder="YYYY-MM-DD" aria-label="패치 날짜 수정" />`
      : `<textarea name="text" rows="3" aria-label="패치 내용 수정">${escapeHtml(text)}</textarea>`;
  return `
    <form class="patch-edit-form" data-patch-index="${index}" data-patch-field="${escapeHtml(field)}">
      ${control}
      <div class="patch-edit-actions">
        <button class="ghost-button compact-button" type="button" data-cancel-patch-edit="true">취소</button>
        <button class="primary-button compact-button" type="submit">저장</button>
      </div>
    </form>
  `;
}

function patchEntryTemplate(entry, index) {
  const date = typeof entry === "object" ? entry.date || "" : "";
  const text = typeof entry === "object" ? entry.text || "" : String(entry || "");
  const editing = state.editingPatch?.index === index ? state.editingPatch.field : "";
  return `
    <article class="card-patch-entry">
      <div>
        ${
          editing
            ? patchEditTemplate(entry, index, editing)
            : `
              ${date ? `<div class="patch-entry-meta"><time>${escapeHtml(formatPatchDate(date))}</time></div>` : ""}
              <p>${escapeHtml(text)}</p>
            `
        }
      </div>
      <div class="patch-entry-actions">
        <button class="patch-edit-button" type="button" data-patch-edit-field="date" data-patch-index="${index}">날짜 수정</button>
        <button class="patch-edit-button" type="button" data-patch-edit-field="text" data-patch-index="${index}">내용 수정</button>
        <button class="patch-delete-button" type="button" data-patch-index="${index}" aria-label="패치내역 삭제">삭제</button>
      </div>
    </article>
  `;
}

function renderCardPatches(card) {
  const entries = patchEntriesForCard(card);
  elements.cardPatchList.innerHTML = [releaseEntryTemplate(card), ...entries.map(patchEntryTemplate)].join("");
}

function setPatchFormOpen(isOpen) {
  elements.cardPatchForm.hidden = !isOpen;
  elements.addPatchButton.hidden = isOpen;
  elements.cardDetailModal.classList.toggle("is-editing-patch", isOpen);
}

function resetPatchForm({ clearStatus = true } = {}) {
  elements.cardPatchDate.value = snapshotSyncedDate();
  elements.cardPatchText.value = "";
  if (clearStatus) setPatchStatus("");
}

function openPatchForm() {
  resetPatchForm();
  setPatchFormOpen(true);
  elements.cardPatchText.focus();
}

function closePatchForm({ clearStatus = true } = {}) {
  resetPatchForm({ clearStatus });
  setPatchFormOpen(false);
}

function syncCardDetailUrl(card, updateUrl) {
  if (!updateUrl) return;
  const nextPath = cardDetailPath(card);
  if (window.location.pathname !== nextPath) {
    window.history.pushState({ cardSlug: card.slug || card.id }, "", nextPath);
  }
}

function openCardDetail(card, { updateUrl = true } = {}) {
  if (!card) return;
  state.activeDetailCardId = card.id;
  hideCardPreview();

  const image = cardPreviewSource(card);
  elements.cardDetailName.textContent = card.name;
  elements.cardDetailFlavor.textContent = card.flavorText || "";
  elements.cardDetailFlavor.hidden = !card.flavorText;
  elements.saveCardImageButton.disabled = !cardPreviewSource(card);
  elements.cardPatchDate.value = snapshotSyncedDate();
  elements.cardPatchText.value = "";
  state.editingPatch = null;
  setPatchStatus("");
  setPatchFormOpen(false);

  if (image) {
    elements.cardDetailImage.src = image;
    elements.cardDetailImage.alt = `${card.name} 카드 이미지`;
    elements.cardDetailImage.hidden = false;
  } else {
    elements.cardDetailImage.removeAttribute("src");
    elements.cardDetailImage.alt = "";
    elements.cardDetailImage.hidden = true;
  }

  renderCardPatches(card);
  elements.cardDetailModal.hidden = false;
  document.body.classList.add("has-card-modal");
  syncCardDetailUrl(card, updateUrl);
}

function closeCardDetail({ updateUrl = true } = {}) {
  state.activeDetailCardId = "";
  state.pendingCardSlug = "";
  elements.cardDetailModal.hidden = true;
  document.body.classList.remove("has-card-modal");
  setPatchFormOpen(false);
  setPatchStatus("");
  if (updateUrl && window.location.pathname.startsWith("/cards/")) {
    window.history.pushState(null, "", "/");
  }
}

function attachCardPreview(target, card) {
  let longPressTimer = 0;
  let startX = 0;
  let startY = 0;

  target.addEventListener("mouseenter", (event) => {
    showCardPreview(card, event.clientX, event.clientY);
  });
  target.addEventListener("mousemove", (event) => {
    if (elements.cardPreview.classList.contains("is-visible")) {
      positionCardPreview(event.clientX, event.clientY);
    }
  });
  target.addEventListener("mouseleave", hideCardPreview);
  target.addEventListener("focus", () => {
    if (!target.matches(":focus-visible")) return;
    const rect = target.getBoundingClientRect();
    showCardPreview(card, rect.right, rect.top + rect.height / 2);
  });
  target.addEventListener("blur", hideCardPreview);

  target.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || !cardPreviewSource(card)) return;
    startX = event.clientX;
    startY = event.clientY;
    window.clearTimeout(longPressTimer);
    longPressTimer = window.setTimeout(() => {
      target.dataset.suppressClick = "true";
      showCardPreview(card, event.clientX, event.clientY);
    }, 520);
  });

  target.addEventListener("pointermove", (event) => {
    if (!longPressTimer) return;
    const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
    if (distance > 12) {
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
    }
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    target.addEventListener(eventName, () => {
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
      if (target.dataset.suppressClick === "true") {
        window.setTimeout(hideCardPreview, 180);
      }
    });
  });

  target.addEventListener("contextmenu", (event) => {
    if (target.dataset.suppressClick === "true") {
      event.preventDefault();
    }
  });
}

function populateSelects() {
  const currentClassFilter = elements.classFilter.value || "all";
  const currentDeckClass = elements.deckClass.value || "";
  const classNames = state.metadata.classes?.length ? state.metadata.classes.map((item) => item.name) : classes;
  elements.classFilter.replaceChildren(new Option("전체 직업", "all"));
  elements.deckClass.replaceChildren(new Option("직업 선택", ""));

  classNames.forEach((className) => {
    const filterOption = new Option(className, className);
    const deckOption = new Option(className, className);
    elements.classFilter.append(filterOption);
    if (className !== "중립") elements.deckClass.append(deckOption);
  });

  if ([...elements.classFilter.options].some((option) => option.value === currentClassFilter)) {
    elements.classFilter.value = currentClassFilter;
  }
  if ([...elements.deckClass.options].some((option) => option.value === currentDeckClass)) {
    elements.deckClass.value = currentDeckClass;
  }
  if (elements.deckClass.value) syncClassFilterToDeckClass();
}

function normalizeDeckMode(mode) {
  return mode === "wild" ? "wild" : "standard";
}

function deckMode() {
  return normalizeDeckMode(document.querySelector(".mode-button.is-active")?.dataset.mode);
}

function deckModeName(mode) {
  return normalizeDeckMode(mode) === "wild" ? "야생" : "정규전";
}

function setDeckMode(mode) {
  const nextMode = normalizeDeckMode(mode);
  elements.modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === nextMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function isNeutralCard(card) {
  const slug = String(card.classSlug || "").toLowerCase();
  if (slug) return slug === "neutral";
  return card.className === "중립";
}

function normalizeSearchValue(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function compactSearchValue(value) {
  return normalizeSearchValue(value).replace(/\s+/g, "");
}

function readQwertyVowel(chars, index) {
  const key = chars[index];
  if (!key || qwertyVowels[key] === undefined) return null;

  const compound = compoundVowels[`${key}${chars[index + 1] || ""}`];
  if (compound !== undefined) return { index: compound, length: 2 };
  return { index: qwertyVowels[key], length: 1 };
}

function qwertyToHangul(value) {
  const chars = Array.from(String(value || ""));
  let result = "";

  for (let i = 0; i < chars.length; ) {
    const initial = qwertyConsonants[chars[i]];
    const vowel = initial ? readQwertyVowel(chars, i + 1) : null;

    if (initial && vowel) {
      const nextIndex = i + 1 + vowel.length;
      let finalIndex = 0;
      let finalLength = 0;
      const finalOne = qwertyConsonants[chars[nextIndex]];

      if (finalOne && jongseongIndexes[finalOne] && !readQwertyVowel(chars, nextIndex + 1)) {
        const finalTwo = qwertyConsonants[chars[nextIndex + 1]];
        const compoundFinal = finalTwo ? compoundJongseong[`${finalOne}${finalTwo}`] : undefined;
        if (compoundFinal && !readQwertyVowel(chars, nextIndex + 2)) {
          finalIndex = compoundFinal;
          finalLength = 2;
        } else {
          finalIndex = jongseongIndexes[finalOne];
          finalLength = 1;
        }
      }

      result += String.fromCharCode(0xac00 + (choseongIndexes[initial] * 21 + vowel.index) * 28 + finalIndex);
      i = nextIndex + finalLength;
      continue;
    }

    if (initial) {
      result += initial;
      i += 1;
      continue;
    }

    const standaloneVowel = readQwertyVowel(chars, i);
    if (standaloneVowel) {
      result += standaloneVowelJamo[standaloneVowel.index] || chars[i];
      i += standaloneVowel.length;
      continue;
    }

    result += chars[i];
    i += 1;
  }

  return result;
}

function searchQueryCandidates(query) {
  return [...new Set([query, qwertyToHangul(query)].map(normalizeSearchValue).filter(Boolean))];
}

function getHangulInitials(value) {
  return Array.from(String(value || ""))
    .map((char) => {
      const code = char.charCodeAt(0) - 0xac00;
      if (code < 0 || code > 11171) return char;
      return hangulInitials[Math.floor(code / 588)];
    })
    .join("");
}

function matchesNameSearch(card, query) {
  const candidates = searchQueryCandidates(query);
  if (!candidates.length) return true;

  const name = normalizeSearchValue(card.name);
  const compactName = compactSearchValue(card.name);
  const initials = compactSearchValue(getHangulInitials(card.name));
  return candidates.some((candidate) => {
    const compactQuery = compactSearchValue(candidate);
    return name.includes(candidate) || compactName.includes(compactQuery) || initials.includes(compactQuery);
  });
}

function matchesDetailSearch(card, query) {
  const candidates = searchQueryCandidates(query);
  if (!candidates.length) return true;

  const detailText = normalizeSearchValue(
    [
      card.text,
      card.spellSchoolName,
      card.minionTypeName,
      card.setName,
      card.setSlug,
    ].filter(Boolean).join(" ")
  );
  return candidates.some((candidate) => detailText.includes(candidate));
}

function classFilterMatches(card, className, deckClass) {
  if (className === "all") return true;
  if (deckClass && className === deckClass) return isNeutralCard(card) || card.className === className;
  return card.className === className;
}

function selectOptionValue(select, value, fallback = "") {
  select.value = [...select.options].some((option) => option.value === value) ? value : fallback;
}

function syncClassFilterToDeckClass() {
  const deckClass = elements.deckClass.value;
  selectOptionValue(elements.classFilter, deckClass || "all", "all");
}

function deckHasClassCards() {
  return state.currentDeck.map(cardById).some((card) => card && !isNeutralCard(card));
}

function releaseDeckClassIfNoClassCards() {
  if (!deckHasClassCards()) {
    elements.deckClass.value = "";
    syncClassFilterToDeckClass();
  }
}

function filteredCards() {
  const nameQuery = elements.cardSearch.value;
  const detailQuery = state.activeDetailSearch;
  const className = isDeckBuilderMode() ? elements.classFilter.value : "all";
  const deckClass = isDeckBuilderMode() ? elements.deckClass.value : "";

  return state.cards.filter((card) => {
    const matchesSet = !state.activeSetSlug || card.setSlug === state.activeSetSlug;
    const matchesDeckClass = !deckClass || isNeutralCard(card) || card.className === deckClass;
    const matchesName = matchesNameSearch(card, nameQuery);
    const matchesDetail = matchesDetailSearch(card, detailQuery);
    const matchesClass = classFilterMatches(card, className, deckClass);
    return matchesSet && matchesDeckClass && matchesName && matchesDetail && matchesClass;
  });
}

function canAddCard(card) {
  if (state.currentDeck.length >= 30) return false;
  if (copyCount(card.id) >= (card.rarity === "legendary" ? 1 : 2)) return false;
  const deckClass = elements.deckClass.value;
  if (deckClass && !isNeutralCard(card) && card.className !== deckClass) return false;
  return true;
}

function addCard(cardId) {
  const card = cardById(cardId);
  if (!card || !canAddCard(card)) return;
  if (!elements.deckClass.value && !isNeutralCard(card)) {
    elements.deckClass.value = card.className;
    syncClassFilterToDeckClass();
  }
  state.currentDeck.push(cardId);
  renderAll();
}

function removeCard(cardId) {
  const index = state.currentDeck.indexOf(cardId);
  if (index >= 0) {
    state.currentDeck.splice(index, 1);
    releaseDeckClassIfNoClassCards();
  }
  renderAll();
}

function removeAllCopies(cardId) {
  const before = state.currentDeck.length;
  state.currentDeck = state.currentDeck.filter((id) => id !== cardId);
  if (state.currentDeck.length !== before) {
    releaseDeckClassIfNoClassCards();
    renderAll();
  }
}

function renderCards() {
  const list = filteredCards().sort(compareDeckCards);
  elements.cardList.innerHTML = "";
  elements.cardList.classList.toggle("is-tile-list", isDeckBuilderMode());

  list.forEach((card) => {
    if (isDeckBuilderMode()) {
      const poolTileState = card.rarity === "legendary" ? "is-legendary" : "has-one-copy";
      const row = document.createElement("button");
      row.type = "button";
      row.className = `card-row deck-card-row card-pool-tile ${poolTileState}`;
      row.setAttribute("aria-label", `${card.name} 추가`);
      row.title = `${card.name} 추가`;
      row.classList.toggle("is-unavailable", !canAddCard(card));
      row.innerHTML = deckTileInnerHtml(card);
      row.querySelectorAll(".deck-tile-art").forEach((image) => {
        image.addEventListener("error", () => markBrokenDeckTile(image));
      });
      attachCardPreview(row, card);
      row.addEventListener("click", (event) => {
        if (row.dataset.suppressClick === "true") {
          event.preventDefault();
          row.dataset.suppressClick = "";
          return;
        }
        addCard(card.id);
      });
      row.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        hideCardPreview();
        removeCard(card.id);
      });
      elements.cardList.append(row);
      return;
    }

    const row = elements.cardTemplate.content.firstElementChild.cloneNode(true);
    const artFrame = row.querySelector(".art-frame");
    const art = row.querySelector(".card-art");
    const artSource = cardGridImageSource(card);
    row.setAttribute("aria-label", `${card.name} 상세 보기`);
    row.title = `${card.name} 상세 보기`;
    row.disabled = false;
    row.querySelector(".mana").textContent = card.cost;
    if (artSource) {
      art.src = artSource;
      art.alt = `${card.name} 카드 이미지`;
      art.addEventListener("error", () => markBrokenArt(art), { once: true });
    } else {
      artFrame.classList.add("no-art");
      art.removeAttribute("src");
    }
    row.querySelector(".card-copy").textContent = copyCount(card.id) ? `x${copyCount(card.id)}` : "";
    row.querySelector("strong").textContent = card.name;
    row.querySelector("small").textContent = `${card.className} · ${card.type} · ${card.text}`;
    row.querySelector(".rarity-dot").classList.add(card.rarity);
    row.addEventListener("click", () => openCardDetail(card));
    elements.cardList.append(row);
  });
}

function renderCurrentDeck() {
  const items = deckCards().sort(compareDeckCards);
  elements.deckSize.textContent = `${state.currentDeck.length} / 30`;
  elements.deckList.classList.toggle("empty-state", items.length === 0);

  if (!items.length) {
    elements.deckList.textContent = "카드를 추가하면 여기 덱 리스트가 쌓입니다.";
    return;
  }

  const grouped = currentDeckGroups();

  elements.deckList.innerHTML = grouped
    .map(
      ({ card, count }) => `
        <div class="deck-card-entry">
          <div class="deck-card-row ${deckTileStateClass(card, count)}" data-card-row-id="${escapeHtml(card.id)}" role="button" tabindex="0" aria-label="${escapeHtml(card.name)} 한 장 제거">
            ${deckTileInnerHtml(card, count)}
          </div>
          <button class="remove-card" type="button" data-card-id="${escapeHtml(card.id)}" aria-label="${escapeHtml(card.name)} 제거">×</button>
        </div>
      `
    )
    .join("");

  elements.deckList.querySelectorAll(".deck-tile-art").forEach((image) => {
    image.addEventListener("error", () => markBrokenDeckTile(image));
  });

  const rows = Array.from(elements.deckList.querySelectorAll(".deck-card-row"));
  grouped.forEach(({ card }, index) => {
    const row = rows[index];
    if (!row) return;
    attachCardPreview(row, card);
    row.addEventListener("click", (event) => {
      if (row.dataset.suppressClick === "true") {
        event.preventDefault();
        row.dataset.suppressClick = "";
        return;
      }
      hideCardPreview();
      removeCard(card.id);
    });
    row.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      hideCardPreview();
      removeCard(card.id);
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      hideCardPreview();
      removeCard(card.id);
    });
  });

  elements.deckList.querySelectorAll(".remove-card").forEach((button) => {
    button.addEventListener("click", () => removeAllCopies(button.dataset.cardId));
  });
}

function setCardLoading(isLoading) {
  elements.cardLoading.hidden = !isLoading;
  elements.cardList.classList.toggle("is-loading", isLoading);
}

function currentDeckGroups() {
  return Object.values(
    deckCards()
      .sort(compareDeckCards)
      .reduce((acc, card) => {
        acc[card.id] ||= { card, count: 0 };
        acc[card.id].count += 1;
        return acc;
      }, {})
  ).sort((a, b) => compareDeckCards(a.card, b.card));
}

function proxiedImageUrl(source) {
  if (!source || !/^https?:\/\//i.test(source)) return source || "";
  return `/api/image?url=${encodeURIComponent(source)}`;
}

function loadCanvasImage(source) {
  if (!source) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    if (/^https?:\/\//i.test(source)) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function drawImageCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) * 0.35;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function downloadCanvas(canvas, fileName) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}

function cardFileName(card, prefix) {
  return `${prefix}-${String(card?.slug || card?.id || "card").replace(/[^a-z0-9_-]+/gi, "-")}.png`;
}

async function downloadRemoteImage(source, fileName) {
  if (!source) throw new Error("저장할 이미지가 없습니다.");
  const response = await fetch(proxiedImageUrl(source));
  if (!response.ok) throw new Error("이미지 저장 실패");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadActiveCardImage() {
  if (isFileMode) {
    setPatchStatus("HTML 파일로 직접 열면 이미지 저장은 로컬 서버에서만 동작합니다.");
    return;
  }

  const card = cardById(state.activeDetailCardId);
  if (!card) return;
  const button = elements.saveCardImageButton;
  const source = cardPreviewSource(card);
  const fileName = cardFileName(card, "card");

  button.disabled = true;
  setPatchStatus("이미지 저장 중...");
  try {
    await downloadRemoteImage(source, fileName);
    setPatchStatus("이미지 저장 완료");
  } catch (error) {
    setPatchStatus(error.message || "이미지 저장 실패");
  } finally {
    button.disabled = !source;
  }
}

function openDeckBuilderFromModal() {
  const card = cardById(state.activeDetailCardId);
  closeCardDetail();
  state.viewMode = "deckBuilder";
  if (card && canAddCard(card)) {
    addCard(card.id);
  } else {
    renderAll();
  }
}

function pngFileName() {
  const className = elements.deckClass.value || "neutral";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `hearthstone-deck-${className}-${deckMode()}-${stamp}.png`;
}

async function waitForDeckFonts() {
  if (!document.fonts?.load) return;
  const timeout = new Promise((resolve) => window.setTimeout(resolve, 1500));
  const fonts = Promise.allSettled([
    document.fonts.load('400 11px "Sapphire"', "기습"),
    document.fonts.load('700 16px "Belwe Bold"', "0123456789"),
    document.fonts.load('400 11px "Pretendard Variable"', "기습"),
  ]);
  await Promise.race([fonts, timeout]);
}

async function exportDeckPng() {
  if (isFileMode) {
    elements.deckCodeStatus.textContent = "HTML 파일로 직접 열면 PNG 저장은 로컬 서버에서만 동작합니다.";
    return;
  }

  const groups = currentDeckGroups();
  if (!groups.length) {
    elements.deckCodeStatus.textContent = "PNG로 저장할 카드가 없습니다.";
    return;
  }

  elements.exportPngButton.disabled = true;
  elements.deckCodeStatus.textContent = "PNG 저장 중...";

  try {
    await waitForDeckFonts();

    const tileWidth = 217;
    const tileHeight = 34;
    const gap = 1;
    const padding = 10;
    const canvas = document.createElement("canvas");
    canvas.width = tileWidth + padding * 2;
    canvas.height = groups.length * tileHeight + Math.max(0, groups.length - 1) * gap + padding * 2;
    const context = canvas.getContext("2d");

    context.fillStyle = "#141820";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const [base, fadeOne, fadeTwo, frameOne, frameTwo, frameLegendary] = await Promise.all([
      loadCanvasImage("assets/card-tile-base.png"),
      loadCanvasImage("assets/card-tile-fade.png"),
      loadCanvasImage("assets/card-tile-fade-two.png"),
      loadCanvasImage("assets/card-tile-frame.png"),
      loadCanvasImage("assets/card-tile-frame-two.png"),
      loadCanvasImage("assets/card-tile-frame-legendary.png"),
    ]);

    for (const [index, { card, count }] of groups.entries()) {
      const x = padding;
      const y = padding + index * (tileHeight + gap);
      const isTwoOrLegendary = count > 1 || card.rarity === "legendary";
      const artX = isTwoOrLegendary ? 77 : 96;
      const artSource = deckTileArtSource(card);
      const art = (await loadCanvasImage(proxiedImageUrl(artSource))) || (await loadCanvasImage(artSource));

      if (base) context.drawImage(base, x, y, tileWidth, tileHeight);
      if (art) drawImageCover(context, art, x + artX, y + 4, 117, 27);
      const fade = isTwoOrLegendary ? fadeTwo : fadeOne;
      const frame = card.rarity === "legendary" ? frameLegendary : count > 1 ? frameTwo : frameOne;
      if (fade) context.drawImage(fade, x, y, tileWidth, tileHeight);
      if (frame) context.drawImage(frame, x, y, tileWidth, tileHeight);

      context.font = '700 16px "Belwe Bold", Georgia, serif';
      context.textBaseline = "middle";
      context.lineJoin = "round";
      context.strokeStyle = "rgba(0, 0, 0, 0.9)";
      context.lineWidth = 2;
      context.fillStyle = "#f8f1dc";
      context.textAlign = "center";
      context.strokeText(String(card.cost), x + 18, y + 17);
      context.fillText(String(card.cost), x + 18, y + 17);

      context.textAlign = "left";
      context.font = '400 11px "Sapphire", "Pretendard Variable", Pretendard, sans-serif';
      const maxNameWidth = isTwoOrLegendary ? 128 : 148;
      let name = card.name;
      while (context.measureText(name).width > maxNameWidth && name.length > 1) {
        name = `${name.slice(0, -2)}…`;
      }
      context.strokeText(name, x + 36, y + 17);
      context.fillText(name, x + 36, y + 17);
    }

    downloadCanvas(canvas, pngFileName());
    elements.deckCodeStatus.textContent = "PNG 저장 완료";
  } catch (error) {
    elements.deckCodeStatus.textContent = error.message || "PNG 저장 실패";
  } finally {
    elements.exportPngButton.disabled = false;
  }
}

function clearDeck() {
  state.currentDeck = [];
  releaseDeckClassIfNoClassCards();
  setDeckMode("standard");
  loadCardSnapshot();
  renderAll();
}

function apiConfig() {
  return {
    region: "kr",
    locale: "ko_KR",
    set: deckMode(),
  };
}

async function syncCards() {
  if (isFileMode) {
    elements.syncStatus.textContent = "HTML 파일로 직접 열면 DB 최신화는 로컬 서버에서만 동작합니다.";
    setCardLoading(false);
    return;
  }

  if (isSyncingCards) {
    shouldSyncCardsAgain = true;
    return;
  }
  isSyncingCards = true;
  shouldSyncCardsAgain = false;
  setCardLoading(true);
  elements.syncDbButton.disabled = true;

  const config = apiConfig();
  const query = new URLSearchParams(config);

  elements.syncStatus.textContent = "카드 DB 최신화 중...";

  try {
    const response = await fetch(`/api/sync-db?${query}`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "카드 DB 최신화 실패");
    if (!Array.isArray(payload.cards) || payload.cards.length === 0) throw new Error("받아온 카드가 없습니다.");
    if (config.set !== deckMode()) {
      shouldSyncCardsAgain = true;
      return;
    }

    saveCardDb(payload.cards, payload.meta, payload.metadata);
    state.currentDeck = state.currentDeck.filter(cardById);
    populateSelects();
    elements.syncStatus.textContent = "카드 DB 최신화 완료";
    renderAll();
  } catch (error) {
    elements.syncStatus.textContent = error.message;
  } finally {
    isSyncingCards = false;
    elements.syncDbButton.disabled = false;
    if (shouldSyncCardsAgain) {
      syncCards();
    } else {
      setCardLoading(false);
    }
  }
}

async function syncCardsForMode(mode, { applyToUi = true } = {}) {
  if (isFileMode) return null;

  const targetMode = normalizeDeckMode(mode);
  const query = new URLSearchParams({
    region: "kr",
    locale: "ko_KR",
    set: targetMode,
  });
  const response = await fetch(`/api/sync-db?${query}`, { method: "POST" });
  const payload = await response.json();

  if (!response.ok) throw new Error(payload.error || "카드 DB 최신화 실패");
  if (!Array.isArray(payload.cards) || payload.cards.length === 0) throw new Error("받아온 카드가 없습니다.");

  if (applyToUi && targetMode === deckMode()) {
    saveCardDb(payload.cards, payload.meta, payload.metadata);
    state.currentDeck = state.currentDeck.filter(cardById);
    populateSelects();
    renderAll();
  }

  return payload;
}

async function syncAllModesForVersionChange() {
  if (isSyncingCards) {
    shouldSyncCardsAgain = true;
    return;
  }

  isSyncingCards = true;
  shouldSyncCardsAgain = false;
  elements.syncDbButton.disabled = true;
  setCardLoading(!state.cards.length);
  const activeMode = deckMode();
  const inactiveMode = activeMode === "standard" ? "wild" : "standard";

  try {
    elements.syncStatus.textContent = "새 카드 DB 버전 감지, 최신화 중...";
    await syncCardsForMode(activeMode, { applyToUi: activeMode === deckMode() });
    await syncCardsForMode(inactiveMode, { applyToUi: false });
    elements.syncStatus.textContent = "카드 DB 최신화 완료";
  } catch (error) {
    elements.syncStatus.textContent = state.cards.length ? "버전 확인 실패, 저장된 DB 사용 중" : error.message;
  } finally {
    isSyncingCards = false;
    elements.syncDbButton.disabled = false;
    if (shouldSyncCardsAgain) syncCards();
    else setCardLoading(false);
  }
}

async function loadCardSnapshot() {
  if (isFileMode) {
    renderSyncStatus();
    return;
  }

  const config = apiConfig();
  const query = new URLSearchParams(config);
  const metadataQuery = new URLSearchParams({
    region: config.region,
    locale: config.locale,
  });

  setCardLoading(!state.cards.length);
  elements.syncStatus.textContent = "저장된 카드 DB 불러오는 중...";

  try {
    const [metadataResponse, cardsResponse] = await Promise.all([
      fetch(`/api/metadata?${metadataQuery}`),
      fetch(`/api/cards?${query}`),
    ]);
    const metadataPayload = await metadataResponse.json();
    const cardsPayload = await cardsResponse.json();

    if (!cardsResponse.ok) throw new Error(cardsPayload.error || "저장된 카드 DB 로딩 실패");
    if (!Array.isArray(cardsPayload.cards) || cardsPayload.cards.length === 0) throw new Error("저장된 카드 DB가 비어 있습니다.");
    if (config.set !== deckMode()) return;

    saveCardDb(cardsPayload.cards, cardsPayload.meta, metadataPayload.metadata);
    state.currentDeck = state.currentDeck.filter(cardById);
    populateSelects();
    elements.syncStatus.textContent = "저장된 카드 DB 로드 완료";
    renderAll();
  } catch (error) {
    elements.syncStatus.textContent = state.cards.length ? `${error.message} 마지막 캐시 사용 중` : error.message;
    if (state.cards.length) {
      populateSelects();
      renderAll();
    }
  } finally {
    setCardLoading(false);
  }
}

async function loadCardPatches() {
  try {
    const response = await fetch("/api/card-patches");
    const payload = await response.json();
    state.cardPatches = response.ok && payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    if (state.activeDetailCardId) {
      const activeCard = cardById(state.activeDetailCardId);
      if (activeCard) renderCardPatches(activeCard);
    }
  } catch {
    state.cardPatches = {};
  }
}

async function loadSetReleaseDates() {
  try {
    let response = await fetch("/api/set-release-dates");
    if (!response.ok) response = await fetch("/data/set-release-dates.json");
    const payload = await response.json();
    state.setReleaseDates = response.ok && payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    if (state.activeDetailCardId) {
      const activeCard = cardById(state.activeDetailCardId);
      if (activeCard) renderCardPatches(activeCard);
    }
  } catch {
    state.setReleaseDates = {};
  }
}

async function loadHearthstoneYears() {
  try {
    const response = await fetch("/data/hearthstone-years.json", { cache: "no-store" });
    const payload = await response.json();
    state.hearthstoneYears = response.ok && payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    if (state.activeDetailCardId) {
      const activeCard = cardById(state.activeDetailCardId);
      if (activeCard) renderCardPatches(activeCard);
    }
  } catch {
    state.hearthstoneYears = {};
  }
}

function normalizedPatchEntries(card) {
  return patchEntriesForCard(card).map((entry) => ({
    date: typeof entry === "object" ? String(entry.date || "").trim() : "",
    text: typeof entry === "object" ? String(entry.text || "").trim() : String(entry || "").trim(),
  }));
}

async function savePatchEntry(event) {
  event.preventDefault();
  if (isFileMode) {
    setPatchStatus("HTML 파일로 직접 열면 패치내역 저장은 로컬 서버에서만 동작합니다.");
    return;
  }

  const card = cardById(state.activeDetailCardId);
  if (!card) return;

  const text = elements.cardPatchText.value.trim();
  const date = elements.cardPatchDate.value.trim() || snapshotSyncedDate();
  if (!text) {
    setPatchStatus("패치내역 내용을 입력해줘.");
    return;
  }

  setPatchStatus("저장 중...");

  try {
    const response = await fetch("/api/card-patches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardKey: cardPatchKey(card),
        entry: { date, text },
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "패치내역 저장 실패");

    state.cardPatches[cardPatchKey(card)] = Array.isArray(payload.entries) ? payload.entries : [];
    renderCardPatches(card);
    setPatchStatus("저장 완료");
    closePatchForm({ clearStatus: false });
  } catch (error) {
    setPatchStatus(error.message || "패치내역 저장 실패");
  }
}

async function deletePatchEntry(index) {
  if (isFileMode) {
    setPatchStatus("HTML 파일로 직접 열면 패치내역 삭제는 로컬 서버에서만 동작합니다.");
    return;
  }

  const card = cardById(state.activeDetailCardId);
  if (!card) return;

  setPatchStatus("삭제 중...");

  try {
    const response = await fetch("/api/card-patches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardKey: cardPatchKey(card),
        index,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "패치내역 삭제 실패");

    state.cardPatches[cardPatchKey(card)] = Array.isArray(payload.entries) ? payload.entries : [];
    renderCardPatches(card);
    setPatchStatus("삭제 완료");
  } catch (error) {
    setPatchStatus(error.message || "패치내역 삭제 실패");
  }
}

function openPatchEdit(index, field) {
  state.editingPatch = { index, field };
  const card = cardById(state.activeDetailCardId);
  if (card) renderCardPatches(card);
  setPatchStatus("");
}

function closePatchEdit() {
  state.editingPatch = null;
  const card = cardById(state.activeDetailCardId);
  if (card) renderCardPatches(card);
}

async function savePatchEdit(event) {
  event.preventDefault();
  if (isFileMode) {
    setPatchStatus("HTML 파일로 직접 열면 패치내역 수정은 로컬 서버에서만 동작합니다.");
    return;
  }

  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  const card = cardById(state.activeDetailCardId);
  if (!card) return;

  const index = Number(form.dataset.patchIndex);
  const field = form.dataset.patchField;
  const updates = {};
  if (field === "date") {
    updates.date = String(new FormData(form).get("date") || "").trim();
  } else if (field === "text") {
    updates.text = String(new FormData(form).get("text") || "").trim();
    if (!updates.text) {
      setPatchStatus("패치내역 내용을 입력해줘.");
      return;
    }
  } else {
    return;
  }

  setPatchStatus("수정 중...");

  try {
    const response = await fetch("/api/card-patches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardKey: cardPatchKey(card),
        index,
        updates,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        await replacePatchEntriesWithLegacyApi(card, index, updates);
        return;
      }
      throw new Error(payload.error || "패치내역 수정 실패");
    }

    state.cardPatches[cardPatchKey(card)] = Array.isArray(payload.entries) ? payload.entries : [];
    state.editingPatch = null;
    renderCardPatches(card);
    setPatchStatus("수정 완료");
  } catch (error) {
    setPatchStatus(error.message || "패치내역 수정 실패");
  }
}

async function replacePatchEntriesWithLegacyApi(card, index, updates) {
  const cardKey = cardPatchKey(card);
  const entries = normalizedPatchEntries(card);
  if (index < 0 || index >= entries.length) throw new Error("수정할 패치내역을 찾을 수 없습니다.");
  entries[index] = { ...entries[index], ...updates };

  for (let entryIndex = entries.length - 1; entryIndex >= 0; entryIndex -= 1) {
    const response = await fetch("/api/card-patches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardKey, index: entryIndex }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "패치내역 수정 실패");
    }
  }

  for (const entry of entries) {
    const response = await fetch("/api/card-patches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardKey, entry }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "패치내역 수정 실패");
    }
  }

  state.cardPatches[cardKey] = entries;
  state.editingPatch = null;
  renderCardPatches(card);
  setPatchStatus("수정 완료");
}

function cardBySlugOrId(slug) {
  return state.cards.find((candidate) => candidate.slug === slug || candidate.id === slug);
}

function openPendingCardFromPath() {
  const slug = state.pendingCardSlug || cardSlugFromLocation();
  if (!slug) return;
  const card = cardBySlugOrId(slug);
  if (card) {
    state.pendingCardSlug = "";
    setViewMode("cardSet");
    openCardDetail(card, { updateUrl: false });
  }
}

function handleLocationChange() {
  const slug = cardSlugFromLocation();
  if (!slug) {
    if (!elements.cardDetailModal.hidden) closeCardDetail({ updateUrl: false });
    return;
  }

  const card = cardBySlugOrId(slug);
  if (card) {
    setViewMode("cardSet");
    openCardDetail(card, { updateUrl: false });
  } else {
    state.pendingCardSlug = slug;
  }
}

async function checkDbVersionAndMaybeSync() {
  if (isFileMode) return;

  if (isCheckingDbVersion || isSyncingCards) return;
  isCheckingDbVersion = true;

  try {
    const query = new URLSearchParams({
      region: "kr",
      locale: "ko_KR",
    });
    const response = await fetch(`/api/db-version?${query}`);
    const payload = await response.json();

    if (!response.ok) throw new Error(payload.error || "버전 확인 실패");
    if (!payload.needsSync) {
      elements.syncStatus.textContent = "저장된 카드 DB 사용 중";
      return;
    }

    await syncAllModesForVersionChange();
  } catch (error) {
    elements.syncStatus.textContent = state.cards.length ? "버전 확인 실패, 저장된 DB 사용 중" : error.message;
  } finally {
    isCheckingDbVersion = false;
  }
}

function inferDeckClass(cardIds, fallback = "") {
  if (fallback) return fallback;
  const classCard = cardIds.map(cardById).find((card) => card && !isNeutralCard(card));
  return classCard?.className || "";
}

async function loadDeckCode() {
  if (isFileMode) {
    elements.deckCodeStatus.textContent = "HTML 파일로 직접 열면 덱 코드 불러오기는 로컬 서버에서만 동작합니다.";
    return;
  }

  const code = elements.deckCodeInput.value.trim();
  if (!code) {
    elements.deckCodeStatus.textContent = "덱 코드를 입력하세요.";
    return;
  }

  const config = apiConfig();
  const query = new URLSearchParams({
    region: config.region,
    locale: config.locale,
    code,
  });

  elements.loadDeckCodeButton.disabled = true;
  elements.deckCodeStatus.textContent = "덱 코드 불러오는 중...";

  try {
    const response = await fetch(`/api/deck?${query}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "덱 코드 불러오기 실패");

    const deck = payload.deck || {};
    const cardIds = Array.isArray(deck.cardIds) ? deck.cardIds : [];
    const knownCardIds = cardIds.filter(cardById);
    const missingCount = cardIds.length - knownCardIds.length;

    if (!cardIds.length) throw new Error("덱 코드에서 카드를 찾지 못했습니다.");
    if (!knownCardIds.length) throw new Error("현재 모드의 카드 DB에 이 덱의 카드가 없습니다. 카드 DB 로딩이 끝난 뒤 다시 시도하세요.");

    state.currentDeck = knownCardIds.slice(0, 30);
    elements.deckClass.value = inferDeckClass(knownCardIds, deck.className);
    syncClassFilterToDeckClass();
    elements.deckCodeStatus.textContent = missingCount
      ? `${knownCardIds.length}장 적용, ${missingCount}장은 현재 모드의 카드 DB 로딩 후 다시 확인하세요.`
      : `${knownCardIds.length}장 덱을 불러왔습니다.`;

    renderAll();
  } catch (error) {
    elements.deckCodeStatus.textContent = error.message;
  } finally {
    elements.loadDeckCodeButton.disabled = false;
  }
}

function renderSyncStatus() {
  if (isFileMode) {
    elements.syncStatus.textContent = state.cards.length
      ? "HTML 파일로 직접 여는 중입니다. API 기능은 로컬 서버에서만 동작합니다."
      : "HTML 파일로 직접 열면 API 기능은 로컬 서버에서만 동작합니다. 스타일 확인은 가능하지만 카드 DB는 localhost에서 확인해 주세요.";
    setCardLoading(false);
    return;
  }

  if (!state.cards.length) {
    elements.syncStatus.textContent = "저장된 카드 DB 불러오는 중...";
    setCardLoading(true);
    return;
  }

  if (cardsNeedArtRefresh()) {
    elements.syncStatus.textContent = "원화 데이터 갱신이 필요합니다. DB 최신화를 눌러주세요.";
    setCardLoading(false);
    return;
  }

  setCardLoading(false);
  try {
    const meta = JSON.parse(localStorage.getItem("hsCardDbMeta") || "null");
    if (meta?.syncedAt) {
      elements.syncStatus.textContent = "저장된 카드 DB 사용 중";
    } else {
      elements.syncStatus.textContent = "저장된 카드 DB 사용 중";
    }
  } catch {
    elements.syncStatus.textContent = "저장된 카드 DB 사용 중";
  }
}

function loadCardsOnStart() {
  if (isFileMode) {
    disableServerOnlyControls();
    populateSelects();
    renderSyncStatus();
    renderAll();
    openPendingCardFromPath();
    return;
  }

  window.setTimeout(() => {
    Promise.all([loadCardPatches(), loadSetReleaseDates(), loadHearthstoneYears(), loadCardSnapshot()]).then(() => {
      openPendingCardFromPath();
      checkDbVersionAndMaybeSync();
    });
  }, 300);
}

function renderAll() {
  renderViewMode();
  renderActiveFilters();
  renderCards();
  renderCurrentDeck();
}

populateSelects();
renderSyncStatus();
renderAll();

elements.cardSearch.addEventListener("input", renderCards);
elements.detailSearchToggle.addEventListener("click", () => {
  const willOpen = elements.detailSearchPanel.hidden;
  elements.detailSearchPanel.hidden = !willOpen;
  elements.detailSearchToggle.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) elements.detailSearch.focus();
});
elements.detailSearch.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const value = elements.detailSearch.value.trim();
  if (!value) return;
  state.activeDetailSearch = value;
  elements.detailSearch.value = "";
  renderAll();
});
elements.classFilter.addEventListener("change", renderCards);
elements.activeFilterChips.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button[data-filter-type]") : null;
  if (!button) return;
  clearActiveFilter(button.dataset.filterType);
});
elements.deckBuildToggle.addEventListener("click", () => {
  setViewMode(isDeckBuilderMode() ? "cardSet" : "deckBuilder");
});
elements.deckClass.addEventListener("change", () => {
  syncClassFilterToDeckClass();
  renderAll();
});
elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("is-active")) return;
    setDeckMode(button.dataset.mode);
    loadCardSnapshot();
    renderAll();
  });
});
elements.syncDbButton.addEventListener("click", syncCards);
elements.exportPngButton.addEventListener("click", exportDeckPng);
elements.clearDeckButton.addEventListener("click", clearDeck);
elements.loadDeckCodeButton.addEventListener("click", loadDeckCode);
elements.deckCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loadDeckCode();
});
elements.addPatchButton.addEventListener("click", openPatchForm);
elements.cancelPatchButton.addEventListener("click", () => closePatchForm());
elements.cardPatchForm.addEventListener("submit", savePatchEntry);
elements.cardPatchText.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  savePatchEntry(event);
});
elements.cardPatchList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const setLink = event.target.closest("[data-card-set-link]");
  if (setLink) {
    const card = cardById(state.activeDetailCardId);
    if (card) applySetFilterFromCard(card);
    return;
  }

  const editButton = event.target.closest("[data-patch-edit-field]");
  if (editButton) {
    openPatchEdit(Number(editButton.dataset.patchIndex), editButton.dataset.patchEditField);
    return;
  }

  const cancelEditButton = event.target.closest("[data-cancel-patch-edit]");
  if (cancelEditButton) {
    closePatchEdit();
    return;
  }

  const deleteButton = event.target.closest(".patch-delete-button");
  if (deleteButton) deletePatchEntry(Number(deleteButton.dataset.patchIndex));
});
elements.cardPatchList.addEventListener("submit", savePatchEdit);
elements.saveCardImageButton.addEventListener("click", downloadActiveCardImage);
elements.modalDeckBuilderButton.addEventListener("click", openDeckBuilderFromModal);
elements.cardDetailClose.addEventListener("click", closeCardDetail);
elements.cardDetailModal.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.hasAttribute("data-close-card-detail")) closeCardDetail();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.cardDetailModal.hidden) closeCardDetail();
});
window.addEventListener("popstate", handleLocationChange);
loadCardsOnStart();
