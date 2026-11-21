const themebtns = document.querySelectorAll(".theme-btn");

const savedTheme = localStorage.getItem("qr-menu-theme");
console.log(savedTheme);

if (savedTheme === "dark" || savedTheme === "light") {
  applyTheme(savedTheme);
}

themebtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    //   let selectedTheme = btn.dataset.themeValue;
    //   document.body.dataset.theme = selectedTheme;

    //   themebtns.forEach((element) => {
    //     element.classList.remove("active-theme");
    //     element.setAttribute("aria-pressed", "false");
    //   });
    //   btn.classList.add("active-theme");
    //   btn.setAttribute("aria-pressed", "true");
    applyTheme(btn.dataset.themeValue);
    localStorage.setItem("qr-menu-theme", btn.dataset.themeValue);
  });
});

function applyTheme(theme) {
  document.body.dataset.theme = theme;

  themebtns.forEach((themeBtn) => {
    if (themeBtn.dataset.themeValue === theme) {
      themeBtn.classList.add("active-theme");
      themeBtn.setAttribute("aria-pressed", "true");
    } else {
      themeBtn.classList.remove("active-theme");
      themeBtn.setAttribute("aria-pressed", "false");
    }
  });
}
