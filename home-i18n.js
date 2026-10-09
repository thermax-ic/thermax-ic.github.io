document.addEventListener("DOMContentLoaded", () => {
  const pick = (selector, index = 0) => document.querySelectorAll(selector)[index];
  const put = (selector, en, zh, index = 0) => {
    const node = pick(selector, index);
    if (node) node.textContent = document.body.classList.contains("lang-zh") ? zh : en;
  };
  const apply = () => {
    const zh = document.body.classList.contains("lang-zh");
    const nav = ["首页", "关于我们", "研究方向", "设备平台", "成员", "论文发表", "新闻", "联系我们"];
    document.querySelectorAll(".homepage .main-nav a").forEach((a, i) => { a.textContent = zh ? nav[i] : ["Home", "About", "Research", "Facilities", "People", "Publications", "News", "Contact"][i]; });
    put(".homepage .university-inner a", "Peking University", "北京大学");
    put(".homepage .lockup-title", "Thermal Management and Advanced Integration of Chips Laboratory", "芯片热管理与先进集成实验室");
    const sub = pick(".homepage .lockup-subtitle");
    if (sub) sub.innerHTML = zh ? "先进封装 • 异质集成 • 热表征<br />TherMAX-IC 实验室 · 程哲课题组" : "Advanced Packaging • Heterogeneous Integration • Thermal Characterization<br />TherMAX-IC Lab · Zhe Cheng Research Group";
    put(".homepage .hero-v3-eyebrow", "Peking University · School of Integrated Circuits", "北京大学 · 集成电路学院");
    put(".homepage #hero-title", "Thermal Management and Advanced Integration for Future Integrated Circuits", "面向未来集成电路的热管理与先进集成");
    put(".homepage .hero-v3-summary", "We advance thermal management, heterogeneous integration, and advanced packaging technologies for next-generation integrated circuits through innovations in materials, devices, and thermal characterization.", "聚焦高性能集成电路中的热管理、异质集成与先进封装，发展面向下一代芯片的关键材料、器件与表征技术。");
    put(".homepage .hero-v3-actions .button-primary", "Explore research →", "探索研究方向 →");
    put(".homepage .hero-v3-actions .button-secondary", "Meet the team", "认识我们的团队");
    put(".homepage .intro-v3 .section-kicker", "About the lab", "关于实验室");
    put(".homepage #intro-title", "Engineering the thermal foundations of tomorrow's chips", "为下一代芯片构建热学基础");
    put(".homepage .intro-v3-copy p", "We focus on thermal management, heterogeneous integration, and advanced packaging for future high-performance integrated circuits.", "我们聚焦未来高性能芯片中的热管理、异质集成与先进封装问题，面向高功率密度、高集成度和高可靠性的集成电路系统，发展关键热调控理论、材料、器件与工艺技术。", 0);
    put(".homepage .intro-v3-copy p", "We address critical thermal challenges in chips with increasing power density, integration density, and reliability requirements, connecting fundamental understanding with measurement techniques and engineering solutions.", "我们围绕微纳电子器件热输运、界面热阻、三维堆叠芯片散热、半导体材料生长与先进热表征开展研究，建立面向先进集成电路的热设计、测试与优化方法。", 1);
    put(".homepage .intro-v3-copy .text-link", "Discover our approach →", "了解研究方法 →");
    put(".homepage .intro-v3-figure figcaption", "Pump–probe optics", "泵浦–探测光学实验台");
    put(".homepage .home-photo-credits summary", "Photo credits & sources", "图片署名与来源");
    put(".homepage .home-photo-note", "These external research images illustrate our research themes. They do not depict our facilities or results. Images are resized and cropped for display; the interface micrograph retains its scale bar.", "以上外部科研影像用于展示研究主题，并非本实验室设备或研究成果的实拍。图片经过尺寸压缩与显示裁切；界面显微图保留完整比例尺。");
    const photoTitles = [["Pump–probe spectroscopy setup", "泵浦–探测光谱实验台"], ["BCB-bonded wafer interface", "BCB 键合晶圆界面"], ["AMD EPYC 7702 chiplet package (near-infrared photograph)", "AMD EPYC 7702 多芯粒封装（近红外实拍）"], ["NIST TDTR measurement system", "NIST TDTR 热反射测量系统"]];
    document.querySelectorAll(".homepage .home-photo-title").forEach((title, i) => { title.textContent = photoTitles[i][zh ? 1 : 0]; });
    put(".homepage .home-photo-nist-policy", "Reuse policy", "图片复用政策");
    const photoAlts = [
      ["Optical table in a pump–probe spectroscopy experiment", "泵浦–探测光谱装置的光学实验台"],
      ["Electron micrograph of a BCB-bonded wafer interface, with the original 30 micrometre scale bar", "BCB 键合晶圆界面的电子显微照片，保留原始 30 微米比例尺"],
      ["Near-infrared photograph of a delidded AMD EPYC 7702 package with eight compute chiplets and a central I/O die", "AMD EPYC 7702 去盖封装的近红外实拍，显示八个计算芯粒与中央 I/O 裸片"],
      ["NIST time-domain thermoreflectance measurement system, photographed by Joshua Martin", "NIST 时域热反射测量系统，摄影：Joshua Martin"]
    ];
    document.querySelectorAll(".homepage .intro-v3-figure img, .homepage .focus-v3-img").forEach((photo, i) => { photo.alt = photoAlts[i][zh ? 1 : 0]; });
    put(".homepage .focus-v3 .section-kicker", "Research focus", "研究重点");
    put(".homepage #focus-title", "From nanoscale interfaces to integrated systems", "从纳米界面到集成系统");
    put(".homepage .section-heading-v3 > p", "We investigate the thermal behavior, design, and characterization of complex chip structures across scales.", "跨尺度研究复杂芯片结构的热行为、热设计与热表征。 ");
    const cards = [["Thermal transport & interfaces", "热输运与界面", "Micro- and nanoelectronic heat transport, thermal boundary resistance, and semiconductor materials and devices.", "微纳电子热输运、界面热阻与半导体材料器件。"], ["Heterogeneous integration & packaging", "异质集成与先进封装", "Thermal challenges in high-density integration, 3D stacked chips, and advanced electronic packaging.", "面向高密度集成、三维堆叠芯片与先进电子封装的热学挑战。"], ["Thermal characterization & design", "热表征与热设计", "Advanced methods for chip thermal characterization, testing, modeling, and optimization.", "面向芯片热表征、测试、建模与优化的先进方法。"]];
    document.querySelectorAll(".homepage .focus-v3-card").forEach((card, i) => { const [enTitle, zhTitle, enCopy, zhCopy] = cards[i]; const h = card.querySelector("h3"), p = card.querySelector("p"); if (h) h.textContent = zh ? zhTitle : enTitle; if (p) p.textContent = zh ? zhCopy : enCopy; });
    put(".homepage .platform-v3 .section-kicker", "Measure · model · optimize", "测量 · 建模 · 优化");
    put(".homepage #platform-title", "A platform for advanced thermal characterization", "先进热表征平台");
    put(".homepage .platform-v3-content > p", "From nanoscale interfaces to full-chip systems, we connect precise measurement with engineering insight to reveal, understand, and control heat in advanced integrated circuits.", "从纳米界面到芯片系统，我们将精密测量与工程分析相结合，致力于揭示、理解并调控先进集成电路中的热输运过程。");
    const tags = ["Chip thermal characterization", "Thermal boundary resistance", "3D chip heat dissipation", "Thermal design & optimization"];
    const ztags = ["芯片热表征", "界面热阻", "三维芯片散热", "热设计与优化"];
    document.querySelectorAll(".homepage .platform-v3-tags li").forEach((tag, i) => { tag.textContent = zh ? ztags[i] : tags[i]; });
    put(".homepage .platform-v3 .text-link", "View facilities →", "查看设备平台 →");
    put(".homepage .people-v3 .section-kicker", "People & community", "团队与社区");
    put(".homepage #people-title", "A collaborative lab for the next generation of IC researchers", "面向下一代集成电路研究者的协作型实验室");
    put(".homepage .people-v3-copy > p", "Driven by curiosity and collaboration, we develop innovative solutions in IC thermal management, heterogeneous integration, and advanced packaging for the next generation of high-performance chips.", "以好奇心与协作精神为驱动，我们聚焦集成电路热管理、异质集成与先进封装，为下一代高性能芯片探索创新技术与解决方案。");
    put(".homepage .people-v3 .button-primary", "Meet our people →", "认识我们的团队 →");
    put(".homepage .footer-grid h3", "Thermal Management and Advanced Integration of Chips Laboratory", "芯片热管理与先进集成实验室");
    put(".homepage .footer-grid h4", "Address", "地址", 0);
    put(".homepage .footer-grid h4", "Contact", "联系", 1);
    put(".homepage .contact-v3 .section-kicker", "Get in touch", "联系我们");
    put(".homepage .contact-v3 h2", "Let’s address the thermal challenges of integrated electronics", "共同应对集成电子系统的热学挑战");
    put(".homepage .contact-v3-links a:last-child", "Contact & location →", "联系与地址 →");
  };
  apply();
  document.querySelector(".homepage .language-toggle")?.addEventListener("click", () => setTimeout(apply, 0));
});
