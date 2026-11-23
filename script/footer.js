async function loadFooter() {
  const response = await fetch(
    new URL("../partials/footer.html", import.meta.url),
  );

  if (!response.ok) {
    throw new Error("ფუტერი ვერ ჩაიტვირთა");
  }

  const footerHtml = await response.text();
  const footerTemplate = document.createElement("template");
  footerTemplate.innerHTML = footerHtml;

  const projectRoot = new URL("../", import.meta.url);
  footerTemplate.content.querySelectorAll("img[src]").forEach((image) => {
    image.src = new URL(image.getAttribute("src"), projectRoot).href;
  });

  document
    .getElementById("site-footer")
    .replaceChildren(footerTemplate.content);

  await import("./lang-sweacher.js");
  await import("./dark-light.js");
}

loadFooter().catch((error) => {
  console.error(error);
});

// async function loadFooter() {
//   const response = await fetch("../partials/footer.html");

//   if (!response.ok) {
//     throw new Error("ფუტერი ვერ ჩაიტვირთა");
//   }

//   const footerHtml = await response.text();

//   console.log(document.getElementById("site-footer"));
  
//   document.getElementById("site-footer").innerHTML = footerHtml;
// }
loadFooter();
