document.addEventListener("DOMContentLoaded", function () {
  const members = {
    "ruicong-ye": {
      name: "Ye Ruicong", nameZh: "叶睿聪", role: "Master's Student", roleZh: "硕士生", group: "Master's Students", groupZh: "硕士生",
      email: "yeruicong26@stu.pku.edu.cn",
      education: ["2026–Present, Peking University, M.S.", "2022–2026, Beijing Forestry University, B.S."],
      educationZh: ["2026–至今，北京大学，硕士", "2022–2026，北京林业大学，学士"],
      links: [["Google Scholar", "https://scholar.google.com/citations?user=4GQ9s1YAAAAJ"]],
      photo: "../Fig/people/叶睿聪.jpg", photoPos: "50% 31%",
    },
    "shi-su": {
      name: "Shi Su", nameZh: "苏适", role: "Undergraduate Student", roleZh: "本科生", group: "Undergraduate Students", groupZh: "本科生",
      email: "2400011313@stu.pku.edu.cn",
      education: ["2023–Present, Peking University, B.S."],
      educationZh: ["2023–至今，北京大学，学士"],
      photo: "../Fig/people/苏适.jpg", photoPos: "50% 72%",
    },
    "zheqi-zheng": { name: "Zheqi Zheng", role: "Undergraduate Student", roleZh: "本科生", group: "Undergraduate Students", groupZh: "本科生" },
    "zhihong-wang": {
      name: "Zhihong Wang", nameZh: "王志鸿", role: "Undergraduate Student", roleZh: "本科生", group: "Undergraduate Students", groupZh: "本科生",
      email: "2400012803@stu.pku.edu.cn",
      education: ["2024–Present, Peking University, B.S."],
      educationZh: ["2024–至今，北京大学，学士"],
      photo: "../Fig/people/王志鸿.jpg", photoPos: "50% 0%",
    },
    "yuxiang-wang": { name: "Yuxiang Wang", role: "Co-advised Master's Student (2023–2025)", roleZh: "联合培养硕士生（2023–2025）", group: "Alumni", groupZh: "校友", note: "NAURA Technology Group", noteZh: "北方华创" },
    "xufei-guo": {
      name: "Xufei Guo", nameZh: "郭旭飞", role: "Undergraduate Student (2024–2026)", roleZh: "本科生（2024–2026）", group: "Alumni", groupZh: "校友", note: "Ph.D. student at Stanford University", noteZh: "斯坦福大学博士生",
      email: "xufeiguo@stanford.edu",
      education: ["2026–Present, Stanford University, Ph.D.", "2022–2026, Peking University, B.S."],
      educationZh: ["2026–至今，斯坦福大学，博士", "2022–2026，北京大学，学士"],
      links: [
        ["Google Scholar", "https://scholar.google.com/citations?user=4FHOgDsAAAAJ"],
        ["LinkedIn", "https://www.linkedin.com/in/xufei-guo-900b8a438"],
      ],
      photo: "../Fig/people/郭旭飞.jpg", photoPos: "66% 50%",
    },
  };

  const id = new URLSearchParams(window.location.search).get("member");
  const member = members[id] || members["ruicong-ye"];
  const bilingual = (en, zh) => `<span class="lang-only-en">${en}</span><span class="lang-only-zh" lang="zh-CN">${zh}</span>`;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  document.title = `${member.name} | TherMAX-IC`;
  document.getElementById("pending-name").innerHTML = member.nameZh ? bilingual(member.name, member.nameZh) : member.name;
  document.getElementById("pending-role").innerHTML = bilingual(member.role, member.roleZh);
  document.getElementById("pending-group").innerHTML = bilingual(member.group, member.groupZh);

  const details = document.getElementById("pending-details");
  details.innerHTML = `<div><dt>${bilingual("English name", "英文姓名")}</dt><dd>${esc(member.name)}</dd></div><div><dt>${bilingual("Chinese name", "中文姓名")}</dt><dd lang="zh-CN">${esc(member.nameZh || "—")}</dd></div><div><dt>${bilingual("Position", "身份")}</dt><dd>${bilingual(member.role, member.roleZh)}</dd></div><div><dt>${bilingual("Member group", "成员类别")}</dt><dd>${bilingual(member.group, member.groupZh)}</dd></div>` +
    (member.email ? `<div class="lang-only-en"><dt>Email</dt><dd><a href="mailto:${esc(member.email)}">${esc(member.email)}</a></dd></div><div class="lang-only-zh"><dt>邮箱</dt><dd lang="zh-CN"><a href="mailto:${esc(member.email)}">${esc(member.email)}</a></dd></div>` : "");

  // External links (Google Scholar / LinkedIn), when provided.
  // Rendered first so that education (inserted right after the member-info article) precedes it.
  if (member.links && member.links.length) {
    const items = member.links.map(([label, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a></li>`).join("");
    const links = document.createElement("div");
    links.className = "profile-language-sections lang-only-en";
    links.innerHTML = `<article><h2>Links</h2><ul>${items}</ul></article>`;
    const linksZh = document.createElement("div");
    linksZh.className = "profile-language-sections lang-only-zh";
    linksZh.setAttribute("lang", "zh-CN");
    linksZh.innerHTML = `<article><h2>相关链接</h2><ul>${items}</ul></article>`;
    details.closest("article").after(links, linksZh);
  }

  // Education and Training, in Zhe Cheng's entry format, bilingual
  if (member.education && member.education.length) {
    const enParas = member.education.map((e) => `<p>${esc(e)}</p>`).join("");
    const zhParas = member.educationZh.map((e) => `<p lang="zh-CN">${esc(e)}</p>`).join("");
    const edu = document.createElement("div");
    edu.className = "profile-language-sections lang-only-en";
    edu.innerHTML = `<article><h2>Education and Training</h2>${enParas}</article>`;
    const eduZh = document.createElement("div");
    eduZh.className = "profile-language-sections lang-only-zh";
    eduZh.setAttribute("lang", "zh-CN");
    eduZh.innerHTML = `<article><h2>教育与科研经历</h2>${zhParas}</article>`;
    details.closest("article").after(edu, eduZh);
  }

  if (member.note) {
    document.getElementById("pending-note-section").hidden = false;
    document.getElementById("pending-note").innerHTML = bilingual(member.note, member.noteZh);
  }

  if (member.photo) {
    const photoEl = document.querySelector(".person-profile-photo");
    if (photoEl) {
      photoEl.classList.remove("person-profile-photo-placeholder");
      photoEl.setAttribute("role", "img");
      photoEl.setAttribute("aria-label", `Portrait of ${member.name}`);
      photoEl.innerHTML = `<img src="${member.photo}" alt="Portrait of ${member.name}" style="object-position: ${member.photoPos};" />`;
    }
  }
});
