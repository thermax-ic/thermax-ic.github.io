(function () {
  "use strict";

  const escapeHTML = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function bilingual(en, zh) {
    return `<span class="lang-only-en">${escapeHTML(en)}</span><span class="lang-only-zh" lang="zh-CN">${escapeHTML(zh)}</span>`;
  }

  const KNOWN_TYPES = new Set(["preprint", "journal", "conference", "book_chapter", "patent", "thesis"]);
  const OTHER_TYPES = new Set(["book_chapter", "patent", "thesis"]);

  // Fallback type detection, only used when an entry has no explicit type
  // (all entries in publication-data.js carry an explicit, verified type).
  function detectType(citation) {
    const c = String(citation || "");
    if (/\bpreprint\b/i.test(c)) return "preprint";
    if (/\bpatent\b/i.test(c)) return "patent";
    if (/\. In: .+\bpp\.\s*\d+/i.test(c)) return "book_chapter";
    if (/, in [^.;]+[.;]\s*[^.]*;?\s*(19|20)\d{2}/i.test(c)) return "conference";
    if (/Meeting Abstracts|ITherm|IEDM|EDTM|IHTC|InterPACK|CSICS|Conference \(|Symposium \(|Proceedings of/i.test(c)) return "conference";
    return "journal";
  }

  function normalizeEntry(entry, index) {
    const citation = String(entry?.citation ?? "").trim();
    if (!citation) return null;
    const year = Number(entry?.year);
    if (!Number.isFinite(year)) return null;
    const type = KNOWN_TYPES.has(entry?.type) ? entry.type : detectType(citation);
    return {
      id: `publication-${year}-${index + 1}`,
      year,
      type,
      citation,
      doi: typeof entry?.doi === "string" ? entry.doi.trim() : "",
      link: typeof entry?.link === "string" ? entry.link.trim() : "",
      pdf: typeof entry?.pdf === "string" ? entry.pdf.trim() : ""
    };
  }

  function loadPublications() {
    if (!Array.isArray(window.publicationData)) return [];
    const yearCounts = new Map();
    const parsed = [];
    window.publicationData.forEach(entry => {
      const year = Number(entry?.year);
      const index = yearCounts.get(year) || 0;
      const item = normalizeEntry(entry, index);
      if (item) {
        parsed.push(item);
        yearCounts.set(year, index + 1);
      }
    });
    return parsed;
  }

  const publications = loadPublications();
  const years = [...new Set(publications.map(item => item.year))].sort((a, b) => b - a);

  const typeFilters = document.getElementById("publication-type-filters");
  const yearFilters = document.getElementById("publication-year-filters");
  const list = document.getElementById("publication-list");
  const count = document.getElementById("publication-count");

  const state = { type: "all", year: "all" };

  const TYPE_FILTERS = [
    { key: "all", en: "All", zh: "全部" },
    { key: "preprint", en: "Preprints", zh: "预印本" },
    { key: "journal", en: "Journal Articles", zh: "期刊论文" },
    { key: "conference", en: "Conference Papers", zh: "会议论文" },
    { key: "other", en: "Other", zh: "其他" }
  ];

  const BADGE_LABELS = {
    preprint: ["Preprint", "预印本"],
    journal: ["Journal Article", "期刊论文"],
    conference: ["Conference Paper", "会议论文"],
    book_chapter: ["Book Chapter", "书籍章节"],
    patent: ["Patent", "专利"],
    thesis: ["Thesis", "学位论文"]
  };

  function badgeClass(type) {
    return OTHER_TYPES.has(type) ? "other" : type;
  }

  function matchesType(item, type) {
    if (type === "all") return true;
    if (type === "other") return OTHER_TYPES.has(item.type);
    return item.type === type;
  }

  const ACTION_LABELS_ZH = { DOI: "DOI", Link: "链接", PDF: "PDF" };

  function action(label, url, pendingLabel) {
    // Bare DOIs ("10.xxxx/...") are not valid URLs — point them at doi.org.
    if (url && label === "DOI" && /^10\.\d{4,9}\//.test(url)) {
      url = "https://doi.org/" + url;
    }
    const labelHTML = bilingual(label, ACTION_LABELS_ZH[label] || label);
    if (url) {
      return `<a class="publication-action" href="${escapeHTML(url)}" target="_blank" rel="noopener">${labelHTML} <span aria-hidden="true">↗</span></a>`;
    }
    return `<button class="publication-action is-disabled" type="button" disabled title="${escapeHTML(pendingLabel)}">${labelHTML} <small>${bilingual("Pending", "待补充")}</small></button>`;
  }

  function parseCitation(item) {
    const citation = item.citation;
    const firstBreak = citation.indexOf(". ");
    const authors = firstBreak >= 0 ? citation.slice(0, firstBreak).trim() : "";
    const remainder = firstBreak >= 0 ? citation.slice(firstBreak + 2).trim() : citation.trim();
    const secondBreak = remainder.indexOf(". ");
    let title = secondBreak >= 0 ? remainder.slice(0, secondBreak).trim() : remainder.replace(/\.$/, "");
    let details = secondBreak >= 0 ? remainder.slice(secondBreak + 2).trim() : "";

    // Conference citations often embed the venue as ", in <Venue>." right
    // after the title (e.g. "... Logic Chips, in EDTM. IEEE; 2026." or
    // "... Process Nodes, in IEEE IEDM.; 2025."). Move the venue out of the
    // title and merge it into the details line.
    if (item.type === "conference") {
      const venueMatch = title.match(/^(.*?),\s*in\s+(.+)$/s);
      if (venueMatch && venueMatch[1].trim()) {
        const venuePart = venueMatch[2].trim().replace(/\.$/, "");
        const split = venuePart.match(/^([^;.]+?)\s*[;.]\s*(.*)$/);
        const venue = (split ? split[1] : venuePart).trim();
        const tail = (split ? split[2] : "").replace(/^[;.]\s*/, "").replace(/\.$/, "").trim();
        const rest = details.replace(/^\s*[;.]?\s*/, "").trim();
        const merged = [venue, tail, rest].filter(Boolean).join(". ");
        details = merged + (/\.$/.test(merged) ? "" : ".");
        title = venueMatch[1].trim();
      }
    }

    return { authors, title, details };
  }

  function recordMarkup(item, number) {
    const { authors, title, details } = parseCitation(item);
    const [badgeEn, badgeZh] = BADGE_LABELS[item.type] || BADGE_LABELS.journal;
    return `
      <article class="publication-record" id="${item.id}">
        <div class="publication-number" aria-hidden="true">${String(number).padStart(2, "0")}</div>
        <div class="publication-record-content">
          <div class="publication-badges"><span class="publication-badge publication-badge-${badgeClass(item.type)}">${bilingual(badgeEn, badgeZh)}</span></div>
          <h3>${escapeHTML(title)}</h3>
          ${authors ? `<p class="publication-authors">${escapeHTML(authors)}</p>` : ""}
          ${details ? `<p class="publication-details">${escapeHTML(details)}</p>` : ""}
          <div class="publication-actions" role="group" aria-label="Publication resources / 论文资源">
            ${action("DOI", item.doi, "DOI pending / DOI 待补充")}
            ${action("Link", item.link, "External link pending / 跳转链接待补充")}
            ${action("PDF", item.pdf, "PDF pending / PDF 待补充")}
          </div>
        </div>
      </article>`;
  }

  function renderFilters() {
    if (typeFilters) {
      typeFilters.innerHTML = TYPE_FILTERS.map(filter => {
        const active = state.type === filter.key;
        return `<button type="button" class="publication-filter${active ? " is-active" : ""}" data-type="${filter.key}" aria-pressed="${active}">${bilingual(filter.en, filter.zh)}</button>`;
      }).join("");
    }
    if (yearFilters) {
      const allActive = state.year === "all";
      yearFilters.innerHTML = [
        `<button type="button" class="publication-filter${allActive ? " is-active" : ""}" data-year="all" aria-pressed="${allActive}">${bilingual("All", "全部")}</button>`,
        ...years.map(year => {
          const key = String(year);
          const active = state.year === key;
          return `<button type="button" class="publication-filter${active ? " is-active" : ""}" data-year="${key}" aria-pressed="${active}">${year}</button>`;
        })
      ].join("");
    }
  }

  function render() {
    if (!list || !count) return;
    const visible = publications.filter(item =>
      matchesType(item, state.type) && (state.year === "all" || String(item.year) === state.year)
    );
    const groupedYears = years.filter(year =>
      state.year === "all" ? true : String(year) === state.year
    );

    const sections = groupedYears.map(year => {
      const items = visible.filter(item => item.year === year);
      if (!items.length) return "";
      return `
        <section class="publication-year-group" aria-labelledby="publication-year-${year}">
          <header class="publication-year-heading">
            <h2 id="publication-year-${year}">${year}</h2>
            <span>${items.length} ${bilingual(items.length === 1 ? "item" : "items", "项成果")}</span>
          </header>
          <div>${items.map((item, index) => recordMarkup(item, index + 1)).join("")}</div>
        </section>`;
    }).join("");

    list.innerHTML = sections || `<p class="publication-empty" role="status">${bilingual("No publications match the selected filters.", "没有符合当前筛选条件的论文。")}</p>`;
    count.innerHTML = `<strong>${visible.length}</strong> ${bilingual(visible.length === 1 ? "publication" : "publications", "项成果")}`;
  }

  function syncFilterButtons() {
    typeFilters?.querySelectorAll("button[data-type]").forEach(button => {
      const active = button.dataset.type === state.type;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    yearFilters?.querySelectorAll("button[data-year]").forEach(button => {
      const active = button.dataset.year === state.year;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function applyState() {
    // Update classes in place (not innerHTML) so keyboard focus on the
    // activated filter button survives the state change.
    syncFilterButtons();
    render();
  }

  function handleFilterClick(event) {
    const typeButton = event.target.closest("button[data-type]");
    if (typeButton) {
      state.type = typeButton.dataset.type;
      applyState();
      return;
    }
    const yearButton = event.target.closest("button[data-year]");
    if (yearButton) {
      state.year = yearButton.dataset.year;
      applyState();
    }
  }

  typeFilters?.addEventListener("click", handleFilterClick);
  yearFilters?.addEventListener("click", handleFilterClick);

  renderFilters();
  applyState();
})();
