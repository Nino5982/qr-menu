import { translations } from "./translations.js";

const langContainer = document.querySelectorAll("[data-lang]");

const langSwitcher = document.getElementById("langSwitcher");

const langList = langSwitcher.querySelector(".lang-list");

const langToggleBtn = document.querySelector(".lang-toggle-btn");

const currentLanguage = localStorage.getItem("appLang") || "ka";

changeLang(currentLanguage);
function changeLang(lang) {
  //   let activeLang = langSwitcher
  //     .querySelector(".active")
    //     .getAttribute("data-lang"); //ka
    

    
  langContainer.forEach((elem) => {
    let key = elem.getAttribute("data-lang"); 
    elem.textContent = translations[lang][key];
  });
}

//  open list
function openLangList() {
  langList.classList.add("open");
}

// close list
function closeLangList() {
  langList.classList.remove("open");
}

langToggleBtn.addEventListener("click", () => {
  openLangList();
});

langList.addEventListener("click", (e) => {
  let pickedLang = e.target.getAttribute("data-lang"); //en
  //1    ჩავწერო ლოქალ სტორიჯში
  localStorage.setItem("appLang", pickedLang);
  if (pickedLang) {
    let changedLang = langList.querySelectorAll("li");
    for (const element of changedLang) {
      element.classList.remove("active");
    }
    e.target.classList.add("active");
    changeLang(pickedLang);
    closeLangList();
  }
});
