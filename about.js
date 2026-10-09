document.addEventListener("DOMContentLoaded", function () {
  const layers = [...document.querySelectorAll(".stack-layer[data-layer]")];
  const issues = [...document.querySelectorAll(".stack-issue[data-layer]")];

  if (!layers.length || !issues.length) return;

  function activate(layerName) {
    layers.forEach(layer => {
      const active = layer.dataset.layer === layerName;
      layer.classList.toggle("is-active", active);
      layer.setAttribute("aria-pressed", String(active));
    });

    issues.forEach(issue => {
      issue.classList.toggle("is-active", issue.dataset.layer === layerName);
    });
  }

  [...layers, ...issues].forEach(element => {
    const showLayer = () => activate(element.dataset.layer);
    element.addEventListener("pointerenter", showLayer);
    element.addEventListener("focus", showLayer);
    element.addEventListener("click", showLayer);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activate(visible.target.dataset.layer);
      },
      { rootMargin: "-30% 0px -48% 0px", threshold: [0.2, 0.45, 0.7] }
    );

    issues.forEach(issue => observer.observe(issue));
  }
});
