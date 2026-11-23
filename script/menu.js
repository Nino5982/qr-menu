const CATEGORY_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRn4Rlfe4ywiSN5NJSHzflXUEGFL_Cb_3xNozoEHoNHqmXakejhnpLyV13eUrc8PymY6REbipEjb46u/pub?gid=649364301&single=true&output=csv";
const DISH_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRn4Rlfe4ywiSN5NJSHzflXUEGFL_Cb_3xNozoEHoNHqmXakejhnpLyV13eUrc8PymY6REbipEjb46u/pub?gid=922732437&single=true&output=csv";

const text = {
  ka: {
    title: "მენიუ",
    loading: "მენიუ იტვირთება...",
    error: "მენიუს ჩატვირთვა ვერ მოხერხდა.",
    retry: "ხელახლა ცდა",
    empty: "მენიუ ამჟამად ცარიელია.",
    unavailable: "დროებით მიუწვდომელია",
  },
  en: {
    title: "Menu",
    loading: "Loading menu...",
    error: "The menu could not be loaded.",
    retry: "Retry",
    empty: "The menu is currently empty.",
    unavailable: "Temporarily unavailable",
  },
  ru: {
    title: "Меню",
    loading: "Загрузка меню...",
    error: "Не удалось загрузить меню.",
    retry: "Повторить",
    empty: "Меню сейчас пусто.",
    unavailable: "Временно недоступно",
  },
};

const statusElement = document.getElementById("menu-status");
const titleElement = document.getElementById("menu-title");
const dishesElement = document.getElementById("menu-dishes");

let categories = [];
let dishes = [];
let currentLanguage = getCurrentLanguage();
let hasLoaded = false;
let loading = false;
let failed = false;

function getCurrentLanguage() {
  const language = localStorage.getItem("appLang") || "ka";
  return text[language] ? language : "ka";
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (inQuotes) {
      if (character === '"' && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && csv[index + 1] === "\n") {
        index += 1;
      }
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows.shift().map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );

  return rows
    .filter((values) => values.some((value) => value.trim() !== ""))
    .map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? ""]),
      ),
    );
}

async function fetchCsv(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CSV request failed with status ${response.status}`);
  }
  return parseCsv(await response.text());
}

function compareSortOrder(first, second) {
  const firstOrder = Number(first.sort_order);
  const secondOrder = Number(second.sort_order);
  const normalizedFirst = Number.isFinite(firstOrder) ? firstOrder : Infinity;
  const normalizedSecond = Number.isFinite(secondOrder) ? secondOrder : Infinity;
  return normalizedFirst - normalizedSecond;
}

function localizedValue(record, field) {
  const translated = record[`${field}_${currentLanguage}`]?.trim();
  return translated || record[`${field}_ka`]?.trim() || "";
}

function formatPrice(value) {
  const price = String(value ?? "").trim();
  const numericPrice = Number(price);
  return `${price !== "" && Number.isFinite(numericPrice) ? numericPrice.toFixed(2) : price} ₾`;
}

function createTextElement(tagName, className, value) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = value;
  return element;
}

function getPublicImageUrl(value) {
  const imageUrl = String(value ?? "").trim();
  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function createDishCard(dish) {
  const card = document.createElement("article");
  card.className = "menu-dish";

  const imageUrl = getPublicImageUrl(dish.image_url);
  if (imageUrl) {
    const image = document.createElement("img");
    image.className = "menu-dish__image";
    image.src = imageUrl;
    image.alt = localizedValue(dish, "name");
    image.addEventListener("error", () => image.remove(), { once: true });
    card.append(image);
  }

  const body = document.createElement("div");
  body.className = "menu-dish__body";

  const heading = document.createElement("div");
  heading.className = "menu-dish__heading";
  heading.append(
    createTextElement("h3", "menu-dish__name", localizedValue(dish, "name")),
    createTextElement("p", "menu-dish__price", formatPrice(dish.price)),
  );
  body.append(heading);

  const description = localizedValue(dish, "desc");
  if (description) {
    body.append(
      createTextElement("p", "menu-dish__description", description),
    );
  }

  if (String(dish.available ?? "").trim().toUpperCase() === "FALSE") {
    body.append(
      createTextElement(
        "p",
        "menu-dish__availability",
        text[currentLanguage].unavailable,
      ),
    );
  }

  card.append(body);
  return card;
}

function renderMenu() {
  const messages = text[currentLanguage];
  titleElement.textContent = messages.title;

  if (loading) {
    statusElement.textContent = messages.loading;
    dishesElement.replaceChildren();
    return;
  }

  if (failed) {
    statusElement.replaceChildren();
    statusElement.append(document.createTextNode(messages.error));
    const retryButton = createTextElement(
      "button",
      "menu-page__retry",
      messages.retry,
    );
    retryButton.type = "button";
    retryButton.addEventListener("click", loadMenu);
    statusElement.append(retryButton);
    dishesElement.replaceChildren();
    return;
  }

  statusElement.textContent = "";
  dishesElement.replaceChildren();

  if (!hasLoaded) {
    return;
  }

  if (dishes.length === 0) {
    statusElement.textContent = messages.empty;
    return;
  }

  const sortedCategories = [...categories].sort(compareSortOrder);
  const sortedDishes = [...dishes].sort(compareSortOrder);

  for (const category of sortedCategories) {
    const categoryDishes = sortedDishes.filter(
      (dish) => String(dish.category_id).trim() === String(category.id).trim(),
    );
    if (categoryDishes.length === 0) {
      continue;
    }

    const section = document.createElement("section");
    section.className = "menu-category";
    section.append(
      createTextElement(
        "h2",
        "menu-category__title",
        localizedValue(category, "category"),
      ),
    );

    const categoryDishList = document.createElement("div");
    categoryDishList.className = "menu-category__dishes";
    for (const dish of categoryDishes) {
      categoryDishList.append(createDishCard(dish));
    }
    section.append(categoryDishList);
    dishesElement.append(section);
  }
}

async function loadMenu() {
  if (loading) {
    return;
  }

  loading = true;
  failed = false;
  renderMenu();

  try {
    const [loadedCategories, loadedDishes] = await Promise.all([
      fetchCsv(CATEGORY_CSV_URL),
      fetchCsv(DISH_CSV_URL),
    ]);
    categories = loadedCategories;
    dishes = loadedDishes;
    hasLoaded = true;
  } catch (error) {
    console.error("მენიუს ჩატვირთვა ვერ მოხერხდა:", error);
    failed = true;
  } finally {
    loading = false;
    renderMenu();
  }
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }
  const languageOption = event.target.closest("#langSwitcher [data-lang]");
  const selectedLanguage = languageOption?.getAttribute("data-lang");
  if (selectedLanguage && text[selectedLanguage]) {
    currentLanguage = selectedLanguage;
    renderMenu();
  }
});

renderMenu();
loadMenu();
