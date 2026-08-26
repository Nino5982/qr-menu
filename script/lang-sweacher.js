import { translations } from "./translations.js";

const langContainer = document.querySelectorAll("[data-lang]");

const langSwitcher = document.getElementById("langSwitcher");

const langList = langSwitcher.querySelector(".lang-list");
const changedLang = langList.querySelectorAll("li");

const langToggleBtn = document.querySelector(".lang-toggle-btn");
const overlay = document.getElementById("overlay");

const currentLanguage = localStorage.getItem("appLang") || "ka";
// localStorage.clear();
clearActiveClass(langList.querySelector(`[data-lang="${currentLanguage}"]`));
changeLang(currentLanguage);
function changeLang(lang) {
  langContainer.forEach((elem) => {
    let key = elem.getAttribute("data-lang");
    if (translations[lang] && translations[lang][key]) {
      elem.textContent = translations[lang][key];
    } else {
      console.warn(`თარგმანი აკლია: ${key}`);
    }
  });
}

//  open list
function toggleLangList() {
  langList.classList.toggle("open");
  overlay.classList.toggle("overlay");
}

// close list
function closeLangList() {
  langList.classList.remove("open");
  overlay.classList.remove("overlay");
}

langToggleBtn.addEventListener("click", () => {
  toggleLangList();
});

langList.addEventListener("click", (e) => {
  let pickedLang = e.target.getAttribute("data-lang"); //en
  if (pickedLang) {
    localStorage.setItem("appLang", pickedLang);
    clearActiveClass(e.target);
    changeLang(pickedLang);
    closeLangList();
  }
});

//  არჩეული ენის შესაბამის ელემენტს დაედოს active კლასი, და დანარჩენ სხვას წაეშალოს.

function clearActiveClass(activeElement) {
  for (const element of changedLang) {
    element.classList.remove("active");
  }
  activeElement.classList.add("active");
}
// თუ ქლიქი მოხდა გარეთ მენიუ დაიხუროს!
document.addEventListener("click", (e) => {
  if (!langSwitcher.contains(e.target)) {
    closeLangList();
  }
});
