document.addEventListener("DOMContentLoaded", function () {
  const button = document.createElement("button");
  button.className = "back-to-top";
  button.type = "button";
  button.textContent = "Back to Top";
  button.setAttribute("aria-label", "Back to top");

  document.body.appendChild(button);

  function toggleButton() {
    if (window.scrollY > 500) {
      button.classList.add("show");
    } else {
      button.classList.remove("show");
    }
  }

  button.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  window.addEventListener("scroll", toggleButton);
  toggleButton();
});
