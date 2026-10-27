(function () {
  "use strict";

  const library = window.equipmentLibraryData;
  if (!library) return;

  const sourceLabels = {
    "custom-built": { en: "Custom-built", zh: "自主搭建" },
    "modified-commercial": { en: "Modified commercial", zh: "采购改装" },
    "shared": { en: "University shared facilities", zh: "学校公共平台" }
  };

  const copy = {
    photoPending: { en: "Equipment photo pending", zh: "设备照片待补充" },
    detailsPending: { en: "Pending group input", zh: "待课题组补充" },
    principlePending: { en: "Principle diagram pending", zh: "原理图待补充" },
    resultsPending: { en: "Representative results pending", zh: "代表性测量结果待补充" },
    publicationsPending: { en: "Related publications pending", zh: "相关论文待补充" },
    noItems: { en: "Pending group input", zh: "待课题组补充" },
    viewDetails: { en: "View details", zh: "查看详情" },
    systemsShown: { en: "systems shown", zh: "套设备" }
  };

  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function bilingual(en, zh, className = "") {
    const extra = className ? ` ${className}` : "";
    return `<span class="lang-only-en${extra}">${escapeHTML(en)}</span><span class="lang-only-zh${extra}" lang="zh-CN">${escapeHTML(zh)}</span>`;
  }

  function pendingBlock(kind = "detailsPending") {
    const text = copy[kind];
    return `<p class="equipment-pending">${bilingual(text.en, text.zh)}</p>`;
  }

  function findFilter(id) {
    return library.filters.find(filter => filter.id === id);
  }

  function sourceFor(device) {
    return sourceLabels[device.source] || copy.detailsPending;
  }

  function visibleTags(device) {
    const tags = [];
    (device.parameters || []).forEach(item => {
      if (tags.length < 3) tags.push(item);
    });

    (device.categories || []).forEach(category => {
      if (tags.length >= 3 || category === device.source) return;
      const filter = findFilter(category);
      if (filter && !tags.some(tag => tag.en === filter.label)) {
        tags.push({ en: filter.label, zh: filter.labelZh });
      }
    });

    if (tags.length < 2) tags.push(copy.detailsPending);
    return tags.slice(0, 4);
  }

  function mediaMarkup(device, size = "card") {
    const altEn = device.imageAlt || `${device.name} equipment`;
    const altZh = device.imageAltZh || `${device.nameZh}设备`;
    const image = device.image
      ? `<img src="${escapeHTML(device.image)}" alt="${escapeHTML(altEn)}" loading="lazy" decoding="async" data-equipment-image />`
      : "";

    const credit = device.imageSource
      ? `<span class="equipment-media-credit">${bilingual(device.imageSource.label, device.imageSource.labelZh)}</span>`
      : "";

    return `
      <div class="equipment-media equipment-media-${size}${device.image ? " has-image" : " is-placeholder"}">
        ${image}
        <div class="equipment-image-placeholder" ${device.image ? "hidden" : ""}>
          <svg viewBox="0 0 96 72" aria-hidden="true">
            <rect x="11" y="12" width="74" height="48" rx="3"></rect>
            <path d="M19 52l17-15 12 10 12-12 17 17M33 28h.01"></path>
          </svg>
          ${bilingual(copy.photoPending.en, copy.photoPending.zh)}
        </div>
        ${credit}
        <span class="sr-only no-translate">${bilingual(altEn, altZh)}</span>
      </div>`;
  }

  function renderFilters() {
    const target = document.getElementById("equipment-filters");
    if (!target) return;

    target.innerHTML = library.filters.map((filter, index) => `
      <button type="button" class="equipment-filter${index === 0 ? " is-active" : ""}" data-filter="${escapeHTML(filter.id)}" aria-pressed="${index === 0 ? "true" : "false"}">
        ${bilingual(filter.label, filter.labelZh)}
      </button>`).join("");
  }

  function renderCards() {
    const grid = document.getElementById("equipment-grid");
    if (!grid) return;

    const cardMarkup = device => {
      const source = sourceFor(device);
      const tags = visibleTags(device).map(tag => `<span>${bilingual(tag.en, tag.zh)}</span>`).join("");

      return `
        <li class="equipment-card-item no-translate" lang="en" data-equipment-id="${escapeHTML(device.id)}" data-categories="${escapeHTML([...new Set([...device.categories, device.source])].join(" "))}">
          <button type="button" class="equipment-card" aria-haspopup="dialog" aria-controls="equipment-modal" aria-label="View details: ${escapeHTML(device.name)} / 查看详情：${escapeHTML(device.nameZh)}">
            ${mediaMarkup(device)}
            <span class="equipment-card-body">
              <span class="equipment-card-meta">
                <span class="equipment-source equipment-source-${escapeHTML(device.source)}">${bilingual(source.en, source.zh)}</span>
              </span>
              <strong class="equipment-card-name">${escapeHTML(device.name)}</strong>
              <span class="equipment-card-name-zh" lang="zh-CN">${escapeHTML(device.nameZh)}</span>
              <span class="equipment-card-summary">${bilingual(device.summary, device.summaryZh)}</span>
              <span class="equipment-tags">${tags}</span>
              <span class="equipment-card-link">${bilingual("View details", "查看详情")} <span aria-hidden="true">→</span></span>
            </span>
          </button>
        </li>`;
    };

    grid.querySelectorAll("[data-equipment-group]").forEach(group => {
      const shared = group.dataset.equipmentGroup === "shared";
      group.querySelector(".equipment-card-grid").innerHTML = library.equipment
        .filter(device => (device.source === "shared") === shared)
        .map(cardMarkup).join("");
    });
    updateGroupVisibility();

    grid.querySelectorAll("img[data-equipment-image]").forEach(image => {
      image.addEventListener("error", () => {
        image.hidden = true;
        const media = image.closest(".equipment-media");
        media?.classList.add("is-placeholder");
        media?.querySelector(".equipment-image-placeholder")?.removeAttribute("hidden");
      });
    });
  }

  function renderMatrix() {
    const target = document.getElementById("equipment-matrix");
    if (!target) return;

    const { columns, rows } = library.capabilityMatrix;
    const header = columns.map(column => `<th scope="col">${bilingual(column.label, column.labelZh)}</th>`).join("");
    const body = rows.map(row => {
      const cells = columns.map(column => {
        const value = row.values[column.id];
        const states = {
          direct: { symbol: "●", en: "Direct / primary", zh: "直接／主要", className: "has-capability" },
          conditional: { symbol: "◇", en: "Model-dependent / conditional", zh: "依赖模型／条件", className: "conditional-capability" },
          support: { symbol: "◎", en: "Via coupled accessory", zh: "需联用", className: "support-capability" },
          planned: { symbol: "建", en: "Planned; commissioning pending", zh: "规划；待验收", className: "planned-capability" }
        };
        if (states[value]) {
          const state = states[value];
          return `<td class="${state.className}" title="${escapeHTML(state.en)} / ${escapeHTML(state.zh)}"><span aria-hidden="true">${state.symbol}</span><span class="sr-only">${bilingual(state.en, state.zh)}</span></td>`;
        }
        return `<td class="no-capability"><span aria-hidden="true">—</span><span class="sr-only">${bilingual("Not listed", "未列出")}</span></td>`;
      }).join("");
      return `<tr><th scope="row">${bilingual(row.label, row.labelZh)}</th>${cells}</tr>`;
    }).join("");

    target.innerHTML = `
      <table>
        <thead><tr><th scope="col">${bilingual("Technique", "技术")}</th>${header}</tr></thead>
        <tbody>${body}</tbody>
      </table>`;

    const legend = document.getElementById("equipment-matrix-note");
    if (legend) {
      legend.innerHTML = library.capabilityMatrix.legend.map(item => {
        const symbols = { direct: "●", conditional: "◇", support: "◎", planned: "建" };
        return `<span class="matrix-legend-item matrix-legend-${escapeHTML(item.id)}"><span aria-hidden="true">${symbols[item.id]}</span> ${bilingual(item.label, item.labelZh)}</span>`;
      }).join("");
    }
  }

  function renderPairList(items) {
    if (!items || !items.length) return pendingBlock("noItems");
    return `<ul class="equipment-detail-list">${items.map(item => `<li>${bilingual(item.en, item.zh)}</li>`).join("")}</ul>`;
  }

  function renderText(en, zh) {
    if (!en && !zh) return pendingBlock();
    return `<p>${bilingual(en || copy.detailsPending.en, zh || copy.detailsPending.zh)}</p>`;
  }

  function renderReferences(items, pendingKey) {
    if (!items || !items.length) return pendingBlock(pendingKey);
    return `<ul class="equipment-reference-list">${items.map(item => {
      if (typeof item === "string") return `<li>${escapeHTML(item)}</li>`;
      return `<li>
        <p>${escapeHTML(item.citation)}</p>
        <div class="equipment-reference-actions">
          <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener">DOI <span aria-hidden="true">↗</span></a>
          <a href="${escapeHTML(item.scholarUrl)}" target="_blank" rel="noopener">Google Scholar <span aria-hidden="true">↗</span></a>
          ${item.verified ? `<span class="equipment-reference-verified">${bilingual("Scholar verified", "Scholar 已核验")}</span>` : ""}
        </div>
      </li>`;
    }).join("")}</ul>`;
  }

  function renderSource(item, className = "equipment-source-credit") {
    if (!item) return "";
    const label = bilingual(item.label, item.labelZh);
    return item.url
      ? `<a class="${className}" href="${escapeHTML(item.url)}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>`
      : `<span class="${className}">${label}</span>`;
  }

  function renderPrincipleFigure(device) {
    if (!device.principleImage) return pendingBlock("principlePending");
    const image = (src, alt, langClass = "") => `<a class="equipment-principle-image-link ${langClass}" href="${escapeHTML(src)}" target="_blank" rel="noopener" aria-label="${escapeHTML(alt)}">
      <img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async" />
    </a>`;
    const alt = device.principleImageAlt || `${device.name} operating principle`;
    const images = device.principleImageZh
      ? image(device.principleImage, alt, "lang-only-en") + image(device.principleImageZh, device.principleImageAltZh || `${device.nameZh}工作原理`, "lang-only-zh")
      : image(device.principleImage, alt);
    return `<figure class="equipment-principle-figure">
      ${images}
      <figcaption>${renderSource(device.principleSource, "equipment-principle-source")}</figcaption>
      <p class="equipment-principle-note">${bilingual("Select the diagram to view at full size. Curves and maps are schematic, not experimental data.", "点击图片可查看大图。曲线与分布仅为原理示意，并非实测数据。")}</p>
    </figure>`;
  }

  const modal = document.getElementById("equipment-modal");
  const modalContent = document.getElementById("equipment-modal-content");
  let modalOpener = null;
  let closeTimer = null;

  function activateTab(tabId, moveFocus = false) {
    if (!modal) return;
    modal.querySelectorAll('[role="tab"]').forEach(tab => {
      const active = tab.dataset.tab === tabId;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && moveFocus) tab.focus();
    });
    modal.querySelectorAll('[role="tabpanel"]').forEach(panel => {
      panel.hidden = panel.dataset.panel !== tabId;
    });
  }

  function openModal(device, opener) {
    if (!modal || !modalContent) return;
    const source = sourceFor(device);
    modalOpener = opener;
    clearTimeout(closeTimer);

    modalContent.innerHTML = `
      <header class="equipment-modal-header">
        <div>
          <span class="equipment-source equipment-source-${escapeHTML(device.source)}">${bilingual(source.en, source.zh)}</span>
          <h2 id="equipment-modal-title">${escapeHTML(device.name)}</h2>
          <p class="equipment-modal-title-zh" lang="zh-CN">${escapeHTML(device.nameZh)}</p>
        </div>
        <button type="button" class="equipment-modal-close" aria-label="Close equipment details / 关闭设备详情" data-modal-close><span aria-hidden="true">×</span></button>
      </header>

      <div class="equipment-modal-media-row">
        <div>${mediaMarkup(device, "detail")}${renderSource(device.imageSource)}</div>
        <div class="equipment-modal-summary">
          <p>${bilingual(device.summary, device.summaryZh)}</p>
          <a class="equipment-discuss-button" href="contact.html">${bilingual("Discuss a Measurement", "讨论测试需求")} <span aria-hidden="true">→</span></a>
        </div>
      </div>

      <div class="equipment-tabs" role="tablist" aria-label="Equipment detail sections / 设备详情栏目">
        <button type="button" role="tab" id="tab-overview" aria-controls="panel-overview" aria-selected="true" class="is-active" data-tab="overview">${bilingual("Overview", "概述")}</button>
        <button type="button" role="tab" id="tab-principle" aria-controls="panel-principle" aria-selected="false" tabindex="-1" data-tab="principle">${bilingual("Principle", "工作原理")}</button>
        <button type="button" role="tab" id="tab-capabilities" aria-controls="panel-capabilities" aria-selected="false" tabindex="-1" data-tab="capabilities">${bilingual("Capabilities", "测量能力")}</button>
        <button type="button" role="tab" id="tab-results" aria-controls="panel-results" aria-selected="false" tabindex="-1" data-tab="results">${bilingual("Results & Publications", "结果与论文")}</button>
      </div>

      <div class="equipment-tab-panels">
        <section role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" data-panel="overview">
          <h3>${bilingual("Equipment overview", "设备概述")}</h3>
          ${renderText(device.overview, device.overviewZh)}
          <div class="equipment-detail-columns">
            <div><h3>${bilingual("Measurable parameters", "可测参数")}</h3>${renderPairList(device.parameters)}</div>
            <div><h3>${bilingual("Applicable samples", "适用样品")}</h3>${renderPairList(device.samples)}</div>
          </div>
        </section>

        <section role="tabpanel" id="panel-principle" aria-labelledby="tab-principle" data-panel="principle" hidden>
          <div class="equipment-principle-grid">
            <div><h3>${bilingual("Operating principle", "工作原理")}</h3>${renderText(device.principle, device.principleZh)}</div>
            ${renderPrincipleFigure(device)}
          </div>
        </section>

        <section role="tabpanel" id="panel-capabilities" aria-labelledby="tab-capabilities" data-panel="capabilities" hidden>
          <div class="equipment-detail-columns equipment-detail-columns-three">
            <div><h3>${bilingual("Measurable parameters", "可测参数")}</h3>${renderPairList(device.parameters)}</div>
            <div><h3>${bilingual("Applicable samples", "适用样品")}</h3>${renderPairList(device.samples)}</div>
            <div><h3>${bilingual("Platform features", "平台特色")}</h3>${renderPairList(device.features)}</div>
          </div>
        </section>

        <section role="tabpanel" id="panel-results" aria-labelledby="tab-results" data-panel="results" hidden>
          <div class="equipment-detail-columns">
            <div><h3>${bilingual("Representative results", "代表性测量结果")}</h3>${renderReferences(device.results, "resultsPending")}</div>
            <div><h3>${bilingual("Related publications", "相关论文")}</h3>${renderReferences(device.publications, "publicationsPending")}</div>
          </div>
        </section>
      </div>`;

    modal.hidden = false;
    document.body.classList.add("equipment-modal-open");
    void modal.offsetWidth;
    modal.classList.add("is-open");
    modal.querySelector("[data-modal-close]")?.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("equipment-modal-open");
    closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      modalContent.innerHTML = "";
      modalOpener?.focus();
      modalOpener = null;
    }, 220);
  }

  function updateCount(count) {
    const result = document.getElementById("equipment-result-count");
    if (!result) return;
    result.innerHTML = `<span class="lang-only-en"><strong>${count}</strong> ${copy.systemsShown.en}</span><span class="lang-only-zh" lang="zh-CN"><strong>${count}</strong> ${copy.systemsShown.zh}</span>`;
  }

  function updateGroupVisibility() {
    document.querySelectorAll("[data-equipment-group]").forEach(group => {
      group.hidden = !group.querySelector('.equipment-card-item:not([aria-hidden="true"])');
    });
  }

  function applyFilter(filterId) {
    document.querySelectorAll(".equipment-filter").forEach(button => {
      const active = button.dataset.filter === filterId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    let count = 0;
    document.querySelectorAll(".equipment-card-item").forEach(item => {
      const categories = item.dataset.categories.split(" ");
      const show = filterId === "all" || categories.includes(filterId);
      window.clearTimeout(Number(item.dataset.hideTimer || 0));

      if (show) {
        count += 1;
        item.hidden = false;
        item.removeAttribute("aria-hidden");
        const reveal = () => item.classList.remove("is-filtered-out");
        requestAnimationFrame(reveal);
        window.setTimeout(reveal, 50);
      } else {
        item.classList.add("is-filtered-out");
        item.setAttribute("aria-hidden", "true");
        const finishHide = () => {
          if (item.classList.contains("is-filtered-out")) item.hidden = true;
        };
        item.addEventListener("transitionend", finishHide, { once: true });
        const timer = window.setTimeout(finishHide, 280);
        item.dataset.hideTimer = String(timer);
      }
    });
    updateGroupVisibility();
    updateCount(count);
  }

  function trapModalFocus(event) {
    if (!modal || modal.hidden || event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), a[href], [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderFilters();
    renderCards();
    renderMatrix();
    updateCount(library.equipment.length);

    document.getElementById("equipment-filters")?.addEventListener("click", event => {
      const button = event.target.closest("button[data-filter]");
      if (button) applyFilter(button.dataset.filter);
    });

    document.getElementById("equipment-grid")?.addEventListener("click", event => {
      const card = event.target.closest(".equipment-card");
      const item = card?.closest(".equipment-card-item");
      if (!card || !item) return;
      const device = library.equipment.find(entry => entry.id === item.dataset.equipmentId);
      if (device) openModal(device, card);
    });

    modal?.addEventListener("click", event => {
      if (event.target === modal || event.target.closest("[data-modal-close]")) {
        closeModal();
        return;
      }
      const tab = event.target.closest('[role="tab"]');
      if (tab) activateTab(tab.dataset.tab);
    });

    modal?.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.target.matches('[role="tab"]') && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const tabs = [...modal.querySelectorAll('[role="tab"]')];
        const index = tabs.indexOf(event.target);
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        activateTab(tabs[nextIndex].dataset.tab, true);
        return;
      }

      trapModalFocus(event);
    });
  });
})();
