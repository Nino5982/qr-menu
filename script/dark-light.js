const theme = document.getElementById("theme");
const themebtns = document.querySelectorAll(".theme-btn");
// const themeDark = document.getElementById("theme-dark");

themebtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    console.log(btn);
      console.log(e.target);
      
// if (btn.contains(e.target){})

  });
});

function toggleThemeBtn(element) {
  element.classList.add("active-theme");
  element.simbling.classList.remove("active-theme");
}
