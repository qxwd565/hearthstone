const { createServer } = require("node:http");
const { createHash } = require("node:crypto");
const { existsSync, readFileSync } = require("node:fs");
const { mkdir, readFile, writeFile } = require("node:fs/promises");
const { extname, join, normalize } = require("node:path");

const root = __dirname;
const dataDir = join(root, "data");
const metadataSnapshotPath = join(dataDir, "metadata.json");
const cardPatchesPath = join(dataDir, "card-patches.json");
const setReleaseDatesPath = join(dataDir, "set-release-dates.json");

loadDotEnv();

const port = Number(process.env.PORT || 5173);
const clientId = process.env.BLIZZARD_CLIENT_ID;
const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;
const officialFontUrls = {
  "sapphire.woff":
    "https://d39zum0jwvcigt.cloudfront.net/fonts/YDISapphIIM-c7a72646171370a8020e6a76044ab93a3749678fe4beba6dc42f193b28ef4fc6c327609f314bde73267ba4cf7fe338ed7e525d72194fd20f13216bfc6df02e5a.woff",
  "belwe-bold.woff":
    "https://d39zum0jwvcigt.cloudfront.net/fonts/Belwe-Bold-9a6521fdfa97c59b38cf872354f166fb40b3c89d1026766795dde6540c536f34f3b30fd0fad9039d9457f80e5136d28400a3c1f5b2a73ecbd931b03d0fbfb840.woff",
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const validRegions = new Set(["us", "eu", "kr", "tw", "cn"]);
const metadataTypes = new Set(["sets", "setGroups", "types", "rarities", "classes", "minionTypes", "spellSchools", "keywords"]);

let tokenCache = {
  accessToken: "",
  expiresAt: 0,
};

function loadDotEnv() {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) return;

  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
      if (!match) return;
      const [, key, rawValue] = match;
      if (process.env[key]) return;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    });
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function apiError(response, status, message, details = {}) {
  sendJson(response, status, { error: message, ...details });
}

function getRegion(value) {
  const region = (value || "kr").toLowerCase();
  if (!validRegions.has(region)) return "kr";
  return region;
}

function getHost(region) {
  return region === "cn" ? "https://gateway.battlenet.com.cn" : `https://${region}.api.blizzard.com`;
}

function getTokenUrl(region) {
  return region === "cn" ? "https://www.battlenet.com.cn/oauth/token" : "https://oauth.battle.net/token";
}

function getCardSet(value) {
  return value === "wild" ? "wild" : "standard";
}

function cardsSnapshotPath(cardSet) {
  return join(dataDir, `cards-${getCardSet(cardSet)}.json`);
}

function snapshotMissingMessage(cardSet) {
  return `${cardSet === "wild" ? "야생" : "정규전"} 카드 DB 스냅샷이 없습니다. DB 최신화를 눌러주세요.`;
}

function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.ko_KR || value.en_US || Object.values(value)[0] || "";
  return "";
}

function normalizeMetaItem(item) {
  return {
    id: item.id ?? item.slug,
    slug: item.slug || String(item.id || ""),
    name: normalizeName(item.name) || item.slug || String(item.id || ""),
  };
}

function normalizeMetadata(metadata) {
  return {
    sets: (metadata.sets || []).map(normalizeMetaItem),
    setGroups: (metadata.setGroups || []).map(normalizeMetaItem),
    types: (metadata.types || []).map(normalizeMetaItem),
    rarities: (metadata.rarities || []).map(normalizeMetaItem),
    classes: (metadata.classes || []).map(normalizeMetaItem),
    minionTypes: (metadata.minionTypes || []).map(normalizeMetaItem),
    spellSchools: (metadata.spellSchools || []).map(normalizeMetaItem),
    keywords: (metadata.keywords || []).map(normalizeMetaItem),
  };
}

function stableVersionItems(items = []) {
  return items
    .map((item) => ({
      id: item.id ?? "",
      slug: item.slug || "",
      name: item.name || "",
    }))
    .sort((a, b) => String(a.slug || a.id).localeCompare(String(b.slug || b.id), "en", { numeric: true }));
}

function createDbVersion(metadata) {
  const normalized = normalizeMetadata(metadata || {});
  const versionSource = {
    sets: stableVersionItems(normalized.sets),
    setGroups: stableVersionItems(normalized.setGroups),
    types: stableVersionItems(normalized.types),
    rarities: stableVersionItems(normalized.rarities),
    classes: stableVersionItems(normalized.classes),
    minionTypes: stableVersionItems(normalized.minionTypes),
    spellSchools: stableVersionItems(normalized.spellSchools),
    keywords: stableVersionItems(normalized.keywords),
  };

  return createHash("sha256").update(JSON.stringify(versionSource)).digest("hex");
}

function indexMetadataById(items = []) {
  return Object.fromEntries(items.map((item) => [String(item.id), item]));
}

function createMetadataLookup(metadata = {}) {
  return {
    classesById: indexMetadataById(metadata.classes),
    raritiesById: indexMetadataById(metadata.rarities),
    setsById: indexMetadataById(metadata.sets),
    typesById: indexMetadataById(metadata.types),
    minionTypesById: indexMetadataById(metadata.minionTypes),
    spellSchoolsById: indexMetadataById(metadata.spellSchools),
    keywordsById: indexMetadataById(metadata.keywords),
  };
}

function normalizeCard(card, lookup = {}) {
  const classInfo = card.class || lookup.classesById?.[String(card.classId)] || {};
  const rarityInfo = card.rarity || lookup.raritiesById?.[String(card.rarityId)] || {};
  const typeInfo = card.cardType || lookup.typesById?.[String(card.cardTypeId)] || {};
  const setInfo = card.cardSet || card.set || lookup.setsById?.[String(card.cardSetId)] || lookup.setsById?.[String(card.setId)] || {};
  const minionTypeInfo = card.minionType || lookup.minionTypesById?.[String(card.minionTypeId)] || {};
  const spellSchoolInfo = card.spellSchool || lookup.spellSchoolsById?.[String(card.spellSchoolId)] || {};
  const keywordNames = Array.isArray(card.keywordIds)
    ? card.keywordIds
        .map((id) => lookup.keywordsById?.[String(id)]?.name)
        .map(normalizeName)
        .filter(Boolean)
    : [];
  const inlineKeywords = Array.isArray(card.keywords)
    ? card.keywords.map((keyword) => normalizeName(keyword.name) || keyword.slug || String(keyword)).filter(Boolean)
    : [];

  return {
    id: String(card.id),
    slug: card.slug || String(card.id),
    name: card.name || "이름 없음",
    className: normalizeName(classInfo.name) || "중립",
    classSlug: classInfo.slug || "neutral",
    cost: Number(card.manaCost || 0),
    attack: card.attack === undefined || card.attack === null ? null : Number(card.attack),
    health: card.health === undefined || card.health === null ? null : Number(card.health),
    durability: card.durability === undefined || card.durability === null ? null : Number(card.durability),
    armor: card.armor === undefined || card.armor === null ? null : Number(card.armor),
    type: normalizeName(typeInfo.name) || "기타",
    typeSlug: typeInfo.slug || "",
    rarity: (rarityInfo.slug || "common").toLowerCase(),
    rarityName: normalizeName(rarityInfo.name),
    setName: normalizeName(setInfo.name),
    setSlug: setInfo.slug || "",
    minionTypeName: normalizeName(minionTypeInfo.name),
    minionTypeSlug: minionTypeInfo.slug || "",
    spellSchoolName: normalizeName(spellSchoolInfo.name),
    spellSchoolSlug: spellSchoolInfo.slug || "",
    flavorText: cleanText(card.flavorText),
    artistName: card.artistName || "",
    collectible: card.collectible !== false,
    text: cleanText(card.text),
    image: card.image || "",
    cropImage: card.cropImage || "",
    art: card.cropImage || "",
    keywords: [...new Set([...keywordNames, ...inlineKeywords])],
  };
}

function normalizeDeck(deck) {
  const cardIds = [];
  const cards = Array.isArray(deck.cards) ? deck.cards : [];

  cards.forEach((card) => {
    const count = Number(card.count || 1);
    for (let copy = 0; copy < count; copy += 1) {
      cardIds.push(String(card.id));
    }
  });

  return {
    code: deck.deckCode || deck.code || "",
    name: deck.name || "",
    className: deck.class?.name || deck.hero?.class?.name || "",
    classSlug: deck.class?.slug || deck.hero?.class?.slug || "",
    heroId: deck.hero?.id ? String(deck.hero.id) : "",
    cards: cards.map(normalizeCard),
    cardIds,
  };
}

async function getAccessToken(region) {
  if (tokenCache.accessToken && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  if (!clientId || !clientSecret) {
    throw new Error(".env에 BLIZZARD_CLIENT_ID와 BLIZZARD_CLIENT_SECRET을 설정해야 합니다.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenUrl = getTokenUrl(region);
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Battle.net 토큰 요청 실패 (${response.status})`);
  }

  const token = await response.json();
  tokenCache = {
    accessToken: token.access_token,
    expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000,
  };
  return tokenCache.accessToken;
}

async function blizzardGet(region, path, params = {}) {
  const accessToken = await getAccessToken(region);
  const apiUrl = new URL(`${getHost(region)}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      apiUrl.searchParams.set(key, value);
    }
  });

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`하스스톤 API 요청 실패 (${response.status})${text ? `: ${text.slice(0, 160)}` : ""}`);
  }

  return response.json();
}

async function readJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJsonFile(filePath, payload) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function readRequestJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1024 * 1024) throw new Error("요청 본문이 너무 큽니다.");
  }
  return body ? JSON.parse(body) : {};
}

function normalizePatchStore(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

async function readCardPatchStore() {
  try {
    return normalizePatchStore(await readJsonFile(cardPatchesPath));
  } catch {
    return {};
  }
}

function normalizePatchEntry(entry) {
  const date = String(entry?.date || "").trim();
  const text = String(entry?.text || "").trim();
  return { date, text };
}

function normalizePatchUpdates(updates) {
  const normalized = {};
  if (updates && Object.prototype.hasOwnProperty.call(updates, "date")) {
    normalized.date = String(updates.date || "").trim();
  }
  if (updates && Object.prototype.hasOwnProperty.call(updates, "text")) {
    normalized.text = String(updates.text || "").trim();
  }
  return normalized;
}

async function fetchCardSnapshotFromBlizzard(region, locale, cardSet) {
  const rawMetadata = await blizzardGet(region, "/hearthstone/metadata", { locale });
  const metadata = normalizeMetadata(rawMetadata);
  const lookup = createMetadataLookup(rawMetadata);
  const dbVersion = createDbVersion(rawMetadata);
  const cards = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const payload = await blizzardGet(region, "/hearthstone/cards", {
      locale,
      set: cardSet,
      collectible: "1",
      gameMode: "constructed",
      pageSize: "500",
      page: String(page),
      sort: "manaCost:asc",
    });

    cards.push(...(payload.cards || []).map((card) => normalizeCard(card, lookup)));
    pageCount = Number(payload.pageCount || 1);
    page += 1;
  }

  const syncedAt = new Date().toISOString();
  return {
    cards,
    metadata,
    meta: {
      source: "blizzard-hearthstone-api",
      region,
      locale,
      set: cardSet,
      dbVersion,
      checkedAt: syncedAt,
      syncedAt,
    },
  };
}

async function writeCardSnapshot(snapshot) {
  const metadataMeta = {
    source: snapshot.meta.source,
    region: snapshot.meta.region,
    locale: snapshot.meta.locale,
    dbVersion: snapshot.meta.dbVersion,
    checkedAt: snapshot.meta.checkedAt,
    syncedAt: snapshot.meta.syncedAt,
  };

  await writeJsonFile(metadataSnapshotPath, {
    metadata: snapshot.metadata,
    meta: metadataMeta,
  });
  await writeJsonFile(cardsSnapshotPath(snapshot.meta.set), {
    cards: snapshot.cards,
    meta: snapshot.meta,
  });
}

async function readStoredDbVersion() {
  try {
    const metadataSnapshot = await readJsonFile(metadataSnapshotPath);
    if (metadataSnapshot.meta?.dbVersion) return metadataSnapshot.meta.dbVersion;
  } catch {}

  for (const cardSet of ["standard", "wild"]) {
    try {
      const cardSnapshot = await readJsonFile(cardsSnapshotPath(cardSet));
      if (cardSnapshot.meta?.dbVersion) return cardSnapshot.meta.dbVersion;
    } catch {}
  }

  return "";
}

async function checkDbVersion(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const region = getRegion(requestUrl.searchParams.get("region"));
    const locale = requestUrl.searchParams.get("locale") || "ko_KR";
    const rawMetadata = await blizzardGet(region, "/hearthstone/metadata", { locale });
    const currentVersion = createDbVersion(rawMetadata);
    const storedVersion = await readStoredDbVersion();

    sendJson(response, 200, {
      currentVersion,
      storedVersion,
      needsSync: !storedVersion || storedVersion !== currentVersion,
      meta: {
        source: "blizzard-hearthstone-api",
        region,
        locale,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    apiError(response, 500, error.message);
  }
}

async function fetchCards(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const region = getRegion(requestUrl.searchParams.get("region"));
    const locale = requestUrl.searchParams.get("locale") || "ko_KR";
    const cardSet = getCardSet(requestUrl.searchParams.get("set"));
    const snapshot = await readJsonFile(cardsSnapshotPath(cardSet));

    if (!Array.isArray(snapshot.cards) || snapshot.cards.length === 0) {
      apiError(response, 404, snapshotMissingMessage(cardSet), { code: "SNAPSHOT_MISSING", set: cardSet });
      return;
    }

    sendJson(response, 200, {
      cards: snapshot.cards,
      meta: {
        region,
        locale,
        set: cardSet,
        ...(snapshot.meta || {}),
        source: "static-card-snapshot",
      },
    });
  } catch (error) {
    apiError(response, 404, snapshotMissingMessage(getCardSet(new URL(request.url, `http://${request.headers.host}`).searchParams.get("set"))), {
      code: "SNAPSHOT_MISSING",
    });
  }
}

async function fetchMetadata(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const region = getRegion(requestUrl.searchParams.get("region"));
    const locale = requestUrl.searchParams.get("locale") || "ko_KR";
    const type = requestUrl.searchParams.get("type");

    if (type && !metadataTypes.has(type)) {
      apiError(response, 400, "지원하지 않는 메타데이터 타입입니다.");
      return;
    }

    const snapshot = await readJsonFile(metadataSnapshotPath);
    const metadata = snapshot.metadata || normalizeMetadata({});

    sendJson(response, 200, {
      metadata: type ? { [type]: Array.isArray(metadata[type]) ? metadata[type] : [] } : metadata,
      meta: {
        region,
        locale,
        ...(snapshot.meta || {}),
        source: "static-card-snapshot",
      },
    });
  } catch (error) {
    sendJson(response, 200, {
      metadata: normalizeMetadata({}),
      meta: {
        source: "static-card-snapshot",
        region: "kr",
        locale: "ko_KR",
        missing: true,
      },
    });
  }
}

async function fetchSetReleaseDates(request, response) {
  try {
    sendJson(response, 200, await readJsonFile(setReleaseDatesPath));
  } catch {
    sendJson(response, 200, {});
  }
}

async function fetchCardPatches(request, response) {
  try {
    if (request.method === "GET") {
      sendJson(response, 200, await readCardPatchStore());
      return;
    }

    if (request.method === "POST") {
      const payload = await readRequestJson(request);
      const cardKey = String(payload.cardKey || "").trim();
      const entry = normalizePatchEntry(payload.entry);
      if (!cardKey) {
        apiError(response, 400, "카드 키가 필요합니다.");
        return;
      }
      if (!entry.text) {
        apiError(response, 400, "패치내역 내용이 필요합니다.");
        return;
      }

      const patches = await readCardPatchStore();
      const entries = Array.isArray(patches[cardKey]) ? patches[cardKey] : [];
      patches[cardKey] = [...entries, entry];
      await writeJsonFile(cardPatchesPath, patches);
      sendJson(response, 200, { cardKey, entries: patches[cardKey] });
      return;
    }

    if (request.method === "PATCH") {
      const payload = await readRequestJson(request);
      const cardKey = String(payload.cardKey || "").trim();
      const index = Number(payload.index);
      const updates = normalizePatchUpdates(payload.updates);
      const hasDateUpdate = Object.prototype.hasOwnProperty.call(updates, "date");
      const hasTextUpdate = Object.prototype.hasOwnProperty.call(updates, "text");

      if (!cardKey || !Number.isInteger(index)) {
        apiError(response, 400, "카드 키와 수정할 항목 번호가 필요합니다.");
        return;
      }
      if (!hasDateUpdate && !hasTextUpdate) {
        apiError(response, 400, "수정할 날짜 또는 내용이 필요합니다.");
        return;
      }
      if (hasTextUpdate && !updates.text) {
        apiError(response, 400, "패치내역 내용이 필요합니다.");
        return;
      }

      const patches = await readCardPatchStore();
      const entries = Array.isArray(patches[cardKey]) ? patches[cardKey] : [];
      if (index < 0 || index >= entries.length) {
        apiError(response, 400, "수정할 패치내역을 찾을 수 없습니다.");
        return;
      }

      const nextEntry = {
        ...normalizePatchEntry(entries[index]),
        ...updates,
      };
      patches[cardKey] = entries.map((entry, entryIndex) => (entryIndex === index ? nextEntry : normalizePatchEntry(entry)));
      await writeJsonFile(cardPatchesPath, patches);
      sendJson(response, 200, { cardKey, entries: patches[cardKey] });
      return;
    }

    if (request.method === "DELETE") {
      const payload = await readRequestJson(request);
      const cardKey = String(payload.cardKey || "").trim();
      const index = Number(payload.index);
      if (!cardKey || !Number.isInteger(index)) {
        apiError(response, 400, "카드 키와 삭제할 항목 번호가 필요합니다.");
        return;
      }

      const patches = await readCardPatchStore();
      const entries = Array.isArray(patches[cardKey]) ? patches[cardKey] : [];
      if (index < 0 || index >= entries.length) {
        apiError(response, 400, "삭제할 패치내역을 찾을 수 없습니다.");
        return;
      }

      patches[cardKey] = entries.filter((_, entryIndex) => entryIndex !== index);
      if (!patches[cardKey].length) delete patches[cardKey];
      await writeJsonFile(cardPatchesPath, patches);
      sendJson(response, 200, { cardKey, entries: patches[cardKey] || [] });
      return;
    }

    apiError(response, 405, "지원하지 않는 요청 방식입니다.");
  } catch (error) {
    apiError(response, 500, error.message);
  }
}

async function syncDb(request, response) {
  if (request.method !== "POST") {
    apiError(response, 405, "POST 요청만 지원합니다.");
    return;
  }

  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const region = getRegion(requestUrl.searchParams.get("region"));
    const locale = requestUrl.searchParams.get("locale") || "ko_KR";
    const cardSet = getCardSet(requestUrl.searchParams.get("set"));
    const snapshot = await fetchCardSnapshotFromBlizzard(region, locale, cardSet);

    await writeCardSnapshot(snapshot);

    sendJson(response, 200, {
      cards: snapshot.cards,
      metadata: snapshot.metadata,
      meta: snapshot.meta,
    });
  } catch (error) {
    apiError(response, 500, error.message);
  }
}

async function fetchDeck(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const region = getRegion(requestUrl.searchParams.get("region"));
    const locale = requestUrl.searchParams.get("locale") || "ko_KR";
    const code = requestUrl.searchParams.get("code");
    const ids = requestUrl.searchParams.get("ids");
    const hero = requestUrl.searchParams.get("hero");

    if (!code && !ids) {
      apiError(response, 400, "덱 코드 또는 카드 ID 목록이 필요합니다.");
      return;
    }

    const deck = await blizzardGet(region, "/hearthstone/deck", { locale, code, ids, hero });

    sendJson(response, 200, {
      deck: normalizeDeck(deck),
      meta: {
        source: "blizzard-hearthstone-api",
        region,
        locale,
      },
    });
  } catch (error) {
    apiError(response, 500, error.message);
  }
}

async function fetchImage(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const imageUrl = requestUrl.searchParams.get("url");
    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
      apiError(response, 400, "이미지 URL이 올바르지 않습니다.");
      return;
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      apiError(response, imageResponse.status, "이미지 요청 실패");
      return;
    }

    const contentType = imageResponse.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    });
    response.end(buffer);
  } catch (error) {
    apiError(response, 500, error.message);
  }
}

async function fetchFont(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const fontName = requestUrl.pathname.replace("/api/font/", "");
    const fontUrl = officialFontUrls[fontName];

    if (!fontUrl) {
      apiError(response, 404, "Font not found");
      return;
    }

    const fontResponse = await fetch(fontUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!fontResponse.ok) {
      apiError(response, fontResponse.status, "Font request failed");
      return;
    }

    const buffer = Buffer.from(await fontResponse.arrayBuffer());
    response.writeHead(200, {
      "Content-Type": "font/woff",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    });
    response.end(request.method === "HEAD" ? undefined : buffer);
  } catch (error) {
    apiError(response, 500, error.message);
  }
}

async function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : decodeURIComponent(requestUrl.pathname);
  const filePath = normalize(join(root, pathname.startsWith("/cards/") ? "/index.html" : pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

createServer((request, response) => {
  if (request.url.startsWith("/api/db-version")) {
    checkDbVersion(request, response);
    return;
  }

  if (request.url.startsWith("/api/sync-db")) {
    syncDb(request, response);
    return;
  }

  if (request.url.startsWith("/api/cards")) {
    fetchCards(request, response);
    return;
  }

  if (request.url.startsWith("/api/card-patches")) {
    fetchCardPatches(request, response);
    return;
  }

  if (request.url.startsWith("/api/set-release-dates")) {
    fetchSetReleaseDates(request, response);
    return;
  }

  if (request.url.startsWith("/api/metadata")) {
    fetchMetadata(request, response);
    return;
  }

  if (request.url.startsWith("/api/deck")) {
    fetchDeck(request, response);
    return;
  }

  if (request.url.startsWith("/api/image")) {
    fetchImage(request, response);
    return;
  }

  if (request.url.startsWith("/api/font")) {
    fetchFont(request, response);
    return;
  }

  serveStatic(request, response);
}).listen(port, () => {
  console.log(`Hearthstone Deck Vault: http://localhost:${port}`);
});
