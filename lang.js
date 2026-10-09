document.addEventListener("DOMContentLoaded", function () {
  const dictionary = {
    // Global
    "Peking University": "北京大学",
    "School of Integrated Circuits": "集成电路学院",
    "PKU": "PKU",
    "Thermal Management and Advanced Integration of Chips Laboratory": "芯片热管理与先进集成实验室",
    "Advanced Packaging • Heterogeneous Integration • Thermal Characterization": "先进封装 • 异质集成 • 热表征",
    "TherMAX-IC Lab · Zhe Cheng Research Group": "TherMAX-IC 实验室 · 程哲课题组",
    "Thermal Characterization · Heat Transport · Advanced Electronic Systems": "热表征 · 热输运 · 先进电子系统",
    "Home": "首页",
    "About": "关于我们",
    "Research": "研究方向",
    "Facilities": "设备平台",
    "Equipment Library": "设备平台",
    "People": "成员",
    "Publications": "论文发表",
    "News": "动态",
    "Contact": "联系我们",
    "Search": "搜索",
    "Search this site": "站内搜索",
    "Back to Top": "返回顶部",
    "Back to top": "返回顶部",
    "Website under development": "网站建设中",
    "Beijing, China": "中国北京",
    "Address": "地址",
    "Email": "邮箱",
    "Skip to main content": "跳转至主要内容",
    "Micro-Nano Electronics Building": "微纳电子大厦",
    "5 Yiheyuan Road, Haidian District, Beijing 100871": "北京市海淀区颐和园路5号，邮编100871",
    "Portrait of": "肖像：",
    "TherMAX-IC Lab": "芯片热管理与先进集成实验室（TherMAX-IC）",
    "SCROLL TO EXPLORE": "向下探索",
    "Laboratory research environment": "实验室研究环境",
    "Advanced thermal characterization platform": "先进热表征平台",
    "Research capabilities": "研究能力",
    "Group photo": "团队合影",
    "TherMAX-IC Lab bilingual identity": "TherMAX-IC 实验室双语标识",
    "Research keywords": "研究关键词",
    "Cutaway rendering of a multilayer 3D integrated circuit with chiplets, interconnects, hybrid bonding, hotspots, and vertical heat-flow paths": "多层三维集成电路剖面图，展示芯粒、互连、混合键合、局部热点与垂直热流通路",
    "Relationship between total thermal resistance and maximum available power": "总热阻与最大可用功率之间的关系",
    "Maximum power is approximately allowable temperature rise divided by total thermal resistance": "最大功率约等于允许温升除以总热阻",
    "Available power rises as total thermal resistance falls": "总热阻降低时可用功率提高",
    "Research system linking thermal-management materials, interfaces and bonding, devices and interconnects, and heterogeneous integration and advanced packaging": "连接热管理材料、界面与键合、器件与互连以及异质集成与先进封装的研究体系",
    "Technical pathway from characterization to understanding, control, integration, and re-validation": "从表征、理解、调控、集成到再验证的技术路径",
    "Interactive vertical cross-section of a 3D integrated circuit showing the heat spreader, chip layers, BEOL, hybrid bonding, thermal interface material, and package substrate": "三维集成电路交互式纵向剖面，展示热扩散层、芯片层、BEOL、混合键合、热界面材料与封装基板",
    "Panoramic view of an advanced thermal-characterization laboratory with optical metrology, microscopy, thermal imaging, and automated measurement systems": "先进热表征实验室全景，展示光学测量、显微测试、热成像与自动化测量系统",

    // Home
    "Thermal metrology for next-generation chips and integrated systems": "面向下一代芯片与集成系统的热测试与热表征",
    "We develop thermal characterization methods and physical models for thin films, interfaces, multilayer chip structures, and advanced electronic packaging.": "我们发展面向薄膜、界面、多层芯片结构和先进电子封装的热表征方法与物理模型。",
    "As device dimensions continue to scale and power densities increase, heat transport across thin films, interfaces, buried layers, metal interconnects, and package structures becomes a critical factor affecting device performance and reliability.": "随着器件尺寸持续缩小、功率密度不断提升，薄膜、界面、埋层、金属互连和封装结构中的热输运已经成为影响器件性能与可靠性的关键因素。",
    "Our work connects optical thermal metrology, physical modeling, automated data analysis, and application-driven chip thermal testing.": "我们的工作连接光学热测试、物理建模、自动化数据分析和面向应用的芯片热表征。",
    "Our work spans thermal transport in micro/nanoelectronic devices, interface heat transfer, heat dissipation in 3D stacked chips, semiconductor materials growth, and advanced thermal characterization.": "研究覆盖微纳电子器件热输运、界面热传递、三维堆叠芯片散热、半导体材料生长与先进热表征。",
    "We welcome motivated students and young researchers from integrated circuits, electronic engineering, materials science, physics, mechanical engineering, energy science, and related fields.": "我们欢迎来自集成电路、电子信息、材料、物理、机械、能源等相关领域的学生与青年学者加入。",
    "Research focus": "研究重点",
    "Platform capabilities": "平台能力",
    "Our goal and our approach": "我们的目标与方法",
    "Recent updates": "近期动态",

    // About
    "Why thermal metrology matters": "为什么热测试很重要",
    "Where we work in the chip thermal stack": "我们关注的芯片热结构层级",
    "How we work": "我们的研究方式",
    "A platform for chip thermal characterization": "面向芯片热表征的平台",
    "What makes the lab distinctive": "实验室特色",
    "We study how heat moves through real chip structures, from nanoscale interfaces to multilayer electronic systems.": "我们研究热量如何在真实芯片结构中传递，研究尺度覆盖纳米界面到多层电子系统。",
    "Modern chips are no longer limited only by electrical performance. As integration density, operating frequency, and power density increase, heat transport becomes a central constraint for performance, reliability, and packaging design.": "现代芯片的瓶颈已不再局限于电学性能。随着集成密度、工作频率和功率密度不断提高，热输运正成为制约性能、可靠性和封装设计的核心因素。",
    "The most important thermal bottlenecks are often hidden inside multilayer structures: thin films, buried interfaces, interconnect stacks, diffusion barriers, dielectric layers, bonding layers, and packaging materials.": "最关键的热瓶颈往往隐藏在多层结构内部，包括薄膜、埋层界面、互连堆栈、扩散阻挡层、介质层、键合层和封装材料。",
    "Power density, local heating, device-level thermal response": "功率密度、局部发热与器件级热响应",
    "Metal layers, vias, dielectrics, buried thermal pathways": "金属层、通孔、介质层与埋层导热路径",
    "Thermal boundary resistance and contact-limited heat flow": "界面热阻与接触受限的热流",
    "Heat spreading, bonding layers, chiplets, 3D integration": "热扩散、键合层、芯粒与三维集成",
    "We use optical thermal metrology methods such as TDTR, FDTR, SSTR, and related mapping techniques to probe thin films, interfaces, and chip-level structures.": "我们采用 TDTR、FDTR、SSTR 等光学热测试方法及相关成像技术，研究薄膜、界面和芯片级结构。",
    "We connect measurement signals to physical heat-transfer models, sensitivity analysis, uncertainty evaluation, and parameter extraction workflows.": "我们将测量信号与传热物理模型、敏感度分析、不确定性评估和参数提取流程相结合。",
    "We translate measured thermal properties into device- and package-relevant understanding for materials selection, process evaluation, and thermal design.": "我们将测得的热物性转化为面向器件与封装的认识，为材料选择、工艺评估和热设计提供依据。",
    "Our laboratory is built around a thermal metrology platform rather than a single measurement tool. The platform combines multiple thermal measurement systems, customized model fitting, automated data processing, and close interaction with semiconductor materials, device, and packaging research.": "实验室围绕综合热测试平台建设，而非依赖单一测量工具。平台集成多种热测量系统、定制化模型拟合和自动化数据处理，并与半导体材料、器件及封装研究紧密结合。",
    "The laboratory sits at the intersection of heat transfer, semiconductor technology, optical metrology, and scientific computing. We aim to make thermal characterization more rigorous, reproducible, and useful for real chip structures.": "实验室的研究交叉融合传热学、半导体技术、光学测量和科学计算，致力于让真实芯片结构的热表征更加严谨、可重复并具有工程价值。",
    "Device": "器件",
    "Interconnects": "互连层",
    "Interfaces": "界面",
    "Package": "封装",
    "Measure": "测量",
    "Model": "建模",
    "Translate": "转化",
    "thermal measurement systems and related workflows": "套热测量系统及相关流程",
    "thin-film, interface, and chip-scale thermal transport": "薄膜、界面与芯片尺度热输运",
    "model + experiment": "模型 + 实验",
    "measurement, fitting, sensitivity, and uncertainty analysis": "测量、拟合、敏感度与不确定性分析",
    "Modern chips are no longer limited only by electrical performance.": "现代芯片的瓶颈已经不只来自电学性能。",
    "thermal bottlenecks": "热瓶颈",
    "thin films": "薄膜",
    "buried interfaces": "埋层界面",
    "interconnect stacks": "互连堆栈",
    "bonding layers": "键合层",
    "packaging materials": "封装材料",

    // Research
    "Research vision": "研究愿景",
    "Research thrusts": "研究方向",
    "TDTR and FDTR thermal metrology": "TDTR 与 FDTR 热测试",
    "Thermal boundary resistance and interfacial heat transport": "界面热阻与界面热输运",
    "Chip-level thermal testing": "芯片级热测试",
    "Advanced packaging thermal management": "先进封装热管理",
    "Modeling, fitting, and data analysis": "建模、拟合与数据分析",
    "Time-domain thermoreflectance": "时域热反射",
    "Frequency-domain thermoreflectance": "频域热反射",
    "thermal conductivity": "热导率",
    "thermal boundary conductance": "界面热导",
    "thermal resistance": "热阻",
    "sensitivity analysis": "敏感度分析",
    "uncertainty evaluation": "不确定性评估",
    "We study heat transport and thermal characterization problems in semiconductor materials, chip structures, advanced packaging, and integrated electronic systems.": "我们研究半导体材料、芯片结构、先进封装和集成电子系统中的热输运与热表征问题。",
    "Thermal issues are becoming increasingly important as chip power density increases, device structures become more complex, and advanced packaging introduces new heat transport pathways and interfaces.": "随着芯片功率密度提高、器件结构日益复杂，以及先进封装引入新的导热路径和界面，热问题正变得愈发重要。",
    "Our research focuses on developing reliable thermal metrology methods and applying them to real device-relevant structures, including thin films, multilayer stacks, interfaces, interconnects, and packaging-level architectures.": "我们的研究聚焦于发展可靠的热测试方法，并将其应用于薄膜、多层堆栈、界面、互连和封装架构等真实器件相关结构。",
    "Thermal boundary resistance": "界面热阻",
    "Modeling and data analysis": "建模与数据分析",
    "Time-domain thermoreflectance and frequency-domain thermoreflectance are used to measure thermal conductivity, thermal boundary conductance, and heat transport behavior in thin films and multilayer structures.": "时域和频域热反射技术用于测量薄膜及多层结构的热导率、界面热导和热输运行为。",
    "We develop fitting workflows, sensitivity analysis methods, and automated data processing tools to improve measurement reliability and interpretation.": "我们开发拟合流程、敏感度分析方法和自动化数据处理工具，以提高测量可靠性与结果解释能力。",
    "Thermal conductivity of thin films and multilayers": "薄膜与多层结构热导率",
    "Thermal boundary conductance extraction": "界面热导提取",
    "Beam-offset and spatially resolved thermal measurements": "偏置光斑与空间分辨热测量",
    "Model fitting, uncertainty analysis, and sensitivity evaluation": "模型拟合、不确定性分析与敏感度评估",
    "Interfaces often dominate the total thermal resistance in nanoscale and multilayer semiconductor structures. We study how materials, deposition processes, interlayers, and interface quality affect heat transfer across boundaries.": "在纳米及多层半导体结构中，界面常常主导总热阻。我们研究材料、沉积工艺、中间层和界面质量如何影响跨界面传热。",
    "This direction connects material characterization with device-level thermal design, especially for structures involving metals, dielectrics, semiconductors, and diffusion barriers.": "该方向连接材料表征与器件级热设计，尤其关注包含金属、介质、半导体和扩散阻挡层的结构。",
    "Metal / dielectric / semiconductor interfaces": "金属／介质／半导体界面",
    "Thermal resistance in ultrathin films": "超薄膜热阻",
    "Effects of processing and interface quality": "加工工艺与界面质量的影响",
    "Device-relevant multilayer thermal stacks": "器件相关多层热堆栈",
    "Modern chips contain complex multilayer structures, including metal interconnects, dielectric layers, vias, device regions, and packaging-related interfaces. Their effective thermal behavior cannot be understood from bulk material values alone.": "现代芯片包含金属互连、介质层、通孔、器件区域和封装界面等复杂多层结构，仅依靠块体材料参数无法准确理解其有效热行为。",
    "We apply thermal metrology to chip-relevant samples and develop physical models that connect measured signals to the thermal properties of buried layers and interfaces.": "我们将热测试技术应用于芯片相关样品，并建立物理模型，将测量信号与埋层及界面的热物性联系起来。",
    "Interconnect-layer thermal characterization": "互连层热表征",
    "Multilayer chip stack measurements": "多层芯片堆栈测量",
    "Thermal pathway analysis in device structures": "器件结构导热路径分析",
    "Measurement strategies for buried layers": "埋层测量策略",
    "Heterogeneous integration, chiplets, 3D integration, and high-power electronic systems introduce new thermal bottlenecks at the package and system levels.": "异质集成、芯粒、三维集成和高功率电子系统在封装与系统层面引入了新的热瓶颈。",
    "We study heat spreading, interface resistance, and thermal coupling in advanced packaging structures, with the goal of supporting more reliable and efficient thermal management strategies.": "我们研究先进封装结构中的热扩散、界面热阻和热耦合，为更可靠、更高效的热管理策略提供支持。",
    "3D integration and chiplet thermal bottlenecks": "三维集成与芯粒热瓶颈",
    "Thermal interface materials and bonding layers": "热界面材料与键合层",
    "Package-level heat spreading": "封装级热扩散",
    "Thermal reliability of high-power devices": "高功率器件热可靠性",
    "Thermal measurements require accurate models and careful data interpretation. We develop computational workflows for fitting, parameter sensitivity analysis, uncertainty evaluation, and batch processing of experimental data.": "热测量需要准确的模型和审慎的数据解释。我们开发用于拟合、参数敏感度分析、不确定性评估和实验数据批处理的计算流程。",
    "This direction supports both fundamental heat transport studies and practical measurement workflows for semiconductor samples.": "该方向同时服务于基础热输运研究和半导体样品的实用测量流程。",
    "TDTR / FDTR fitting algorithms": "TDTR／FDTR 拟合算法",
    "Sensitivity and uncertainty analysis": "敏感度与不确定性分析",
    "Automated data processing and visualization": "自动化数据处理与可视化",
    "Physics-informed interpretation of measurement results": "物理机理驱动的测量结果解释",
    "TDTR / FDTR System": "TDTR / FDTR 系统",
    "RESEARCH THRUST 01": "研究方向 01",
    "RESEARCH THRUST 02": "研究方向 02",
    "RESEARCH THRUST 03": "研究方向 03",
    "RESEARCH THRUST 04": "研究方向 04",
    "RESEARCH THRUST 05": "研究方向 05",
    "Research Thrust": "研究方向",
    "Thin Films and Interfaces": "薄膜与界面",
    "Chip-Level Structures": "芯片级结构",
    "Advanced Packaging": "先进封装",

    // Research (2026 update)
    "We develop thermal metrology and heat-transport engineering for next-generation integrated circuits, spanning high-thermal-conductivity materials, heterogeneous interfaces and bonding, and three-dimensional thermal tomography of interconnects.": "我们面向下一代集成电路发展热测试方法与热输运调控技术，研究涵盖高导热散热材料、异质界面与键合，以及互连结构的三维热层析。",
    "As chip power density, integration density, and reliability requirements keep rising, heat transport across materials, interfaces, interconnects, and package structures becomes a central constraint for performance and lifetime.": "随着芯片功率密度、集成密度和可靠性要求不断提升，材料、界面、互连与封装结构中的热输运正成为制约器件性能与寿命的核心因素。",
    "Our research connects experimental thermal metrology — TDTR, FDTR, and Raman mapping — with materials growth, interface engineering, and physical modeling, targeting the structures that matter in real devices: diamond and SiC heat spreaders, bonded interfaces, and 3D-stacked interconnect layers.": "我们的研究将 TDTR、FDTR 与 Raman mapping 等实验热测试手段与材料生长、界面工程和物理建模相结合，聚焦真实器件中的关键结构：金刚石与碳化硅热扩散材料、键合界面以及三维堆叠互连层。",
    "High-thermal-conductivity heat-spreading materials": "高导热散热材料",
    "Heterogeneous interfaces and bonding": "异质界面与键合",
    "Advanced interconnects and 3D thermal tomography": "先进互连与三维热层析",
    "3C-SiC single-crystal wafer and Raman / XRD characterization (Nat. Commun. 2022)": "3C-SiC 单晶晶圆及 Raman / XRD 表征（Nat. Commun. 2022）",
    "Atomically resolved 3C-SiC/Si and AlN/3C-SiC interfaces (STEM)": "原子分辨的 3C-SiC/Si 与 AlN/3C-SiC 界面（STEM）",
    "Layer-by-layer 3D thermal-conductivity maps of production interconnect stacks": "量产互连堆叠结构的逐层三维热导率分布图",
    "We grow and engineer wide-bandgap heat-spreading materials — diamond, 3C-SiC, and AlN — and tailor their thermal properties for integration with real devices.": "我们生长并调控金刚石、3C-SiC、AlN 等宽禁带高导热材料，针对真实器件集成需求定制其热学性能。",
    "Combining epitaxial growth, precision thermal metrology (TDTR / FDTR / Raman mapping), and theory, we turn grain size, doping, and interface structure into designable knobs for heat dissipation.": "通过将外延生长、精密热测试（TDTR / FDTR / Raman mapping）与理论相结合，我们把晶粒尺寸、掺杂和界面结构转化为可设计的散热调控参量。",
    "Wafer-scale single-crystal 3C-SiC with record in-plane and cross-plane thermal conductivity (Nat. Commun. 2022)": "晶圆级单晶 3C-SiC，面内与面外热导率均创纪录（Nat. Commun. 2022）",
    "SiC polytype boundaries with thermal boundary conductance above 2000 MW/m²·K — the highest reported to date": "SiC 多型体边界热导突破 2000 MW/m²·K，为迄今已知最高纪录",
    "Low-temperature (<450 °C) BEOL-compatible diamond integrated on GaN transistors, cutting device temperature by 111 °C at 24 W/mm": "低温（<450 °C）后道兼容金刚石集成于 GaN 晶体管，24 W/mm 功耗下器件温度下降 111 °C",
    "B- and N-doped 3C-SiC with the largest thermal-conductivity tunability among common semiconductors": "B、N 掺杂 3C-SiC 实现常见半导体中最大的热导率可调范围",
    "AlN films with intrinsic room-temperature thermal conductivity up to 321 W/m·K": "本征 AlN 薄膜室温最高热导率达 321 W/m·K",
    "Interfaces often dominate the thermal resistance of integrated devices. We study how atoms bond across them — and how to make bonded interfaces thermally transparent.": "界面热阻常常主导集成器件的总热阻。我们研究原子如何跨越界面成键，以及如何让键合界面在热学上透明。",
    "Using surface-activated bonding (SAB), annealing, and atomically engineered interlayers, we maximize thermal boundary conductance at semiconductor–semiconductor and semiconductor–dielectric interfaces, while revealing the underlying phonon physics with STEM-EELS, Raman spectroscopy, and machine-learned molecular dynamics.": "我们利用表面活化键合（SAB）、退火工艺与原子级界面层设计，最大化半导体-半导体及半导体-介质界面的热导，并通过 STEM-EELS、拉曼光谱与机器学习分子动力学揭示其背后的声子物理。",
    "Room-temperature GaN–diamond SAB bonding with 90 MW/m²·K interface thermal conductance (ACS Appl. Mater. Interfaces 2020)": "室温 GaN-金刚石 SAB 键合，界面热导达 90 MW/m²·K（ACS Appl. Mater. Interfaces 2020）",
    "Annealing-boosted GaN–diamond interface thermal conductance with a nearly 300% improvement (Adv. Electron. Mater. 2025)": "退火使 GaN-金刚石界面热导提升近 300%（Adv. Electron. Mater. 2025）",
    "AlN–SiC interface thermal conductance up to 800 MW/m²·K (arXiv:2602.13827)": "AlN-SiC 界面热导最高达 800 MW/m²·K（arXiv:2602.13827）",
    "GaN-on-diamond with a high-thermal-conductivity 3C-SiC interlayer relieving thermal-expansion mismatch (Small 2024)": "以高导热 3C-SiC 为中介层的 GaN-on-diamond 结构，缓解热膨胀失配（Small 2024）",
    "From elastic phonon transmission at ideal Al–Al₂O₃ interfaces to interface phonon modes in Si–Ge — the physics that guides better bonding (Nat. Commun. 2020, 2021)": "从理想 Al-Al₂O₃ 界面的弹性声子透射到 Si-Ge 界面局域声子模式——指导更优键合的物理机制（Nat. Commun. 2020, 2021）",
    "Inside stacked chips, the interconnect stack is a thermal black box. We have developed 3D thermal tomography that experimentally maps the thermal-conductivity distribution of real interconnect layers, from 28 nm down to 3 nm process nodes.": "在堆叠芯片内部，互连堆叠是一个热学“黑盒子”。我们发展了三维热层析技术，首次实验测得真实互连层的导热系数分布，覆盖 28 nm 至 3 nm 制程节点。",
    "Combining P-FIB staircase preparation, aluminum sensor layers, and layer-by-layer TDTR scanning, we quantify how grain size, diffusion barriers, and interface resistance set the thermal bottleneck — and apply the same metrology to assess dielectric interface quality in hybrid bonding.": "通过 P-FIB 阶梯制样、铝传感层与逐层 TDTR 扫描相结合，我们量化了晶粒尺寸、扩散阻挡层与界面热阻如何决定热瓶颈，并将同一测量方法用于评估混合键合中的介质界面质量。",
    "First experimental measurement of 3D thermal-conductivity distribution in interconnect layers across 3–28 nm logic nodes (IEEE IEDM 2025, IEEE EDTM 2026)": "首次实现 3–28 nm 逻辑节点互连层三维热导率分布的实验测量（IEEE IEDM 2025, IEEE EDTM 2026）",
    "Layer-by-layer thermal maps revealing ultra-low conductivity of nanoscale interconnect layers and the dominant role of thermal boundary resistance (ACS Nano 2026)": "逐层热学分布图揭示纳米互连层极低热导率与界面热阻的主导作用（ACS Nano 2026）",
    "Three-dimensional TDTR scans exposing circuit-pattern effects on heat flow in production interconnect stacks": "三维 TDTR 扫描揭示量产互连堆叠中电路图形对热流的影响",
    "Thermal boundary conductance above 150 MW/m²·K as a metric for dielectric interface quality in hybrid bonding (Appl. Phys. Lett. 2026)": "以高于 150 MW/m²·K 的界面热导评估混合键合介质界面质量（Appl. Phys. Lett. 2026）",

    // Facilities
    "Thermal metrology platform": "热测试平台",
    "Capabilities": "平台能力",
    "Time-Domain Thermoreflectance": "时域热反射",
    "Frequency-Domain Thermoreflectance": "频域热反射",
    "Steady-State Thermoreflectance": "稳态热反射",
    "Raman and Microscale Thermal Mapping": "拉曼与微尺度热成像",
    "Sample Preparation and Optical Inspection": "样品制备与光学检查",
    "Modeling and Data Processing": "建模与数据处理",
    "Measurement and collaboration": "测试与合作",
    "The laboratory develops and operates thermal characterization systems for thin films, interfaces, chip structures, and advanced electronic packaging.": "实验室面向薄膜、界面、芯片结构和先进电子封装，开发并运行热表征系统。",
    "Our platform combines optical thermal metrology, chip-level thermal testing, model-based parameter extraction, and automated data analysis. The systems support measurements of thermal conductivity, thermal boundary conductance, thermal resistance, and device-relevant heat transport behavior.": "平台融合光学热测试、芯片级热测试、基于模型的参数提取和自动化数据分析，可测量热导率、界面热导、热阻及器件相关热输运行为。",
    "Thin-film thermal conductivity measurement": "薄膜热导率测量",
    "Multilayer chip stack characterization": "多层芯片堆栈表征",
    "Beam-offset and spatial thermal mapping": "偏置光斑与空间热成像",
    "Data fitting, sensitivity analysis, and uncertainty evaluation": "数据拟合、敏感度分析与不确定性评估",
    "TDTR is used for measuring thermal conductivity and thermal boundary conductance in thin films, interfaces, and multilayer materials.": "TDTR 用于测量薄膜、界面和多层材料中的热导率与界面热导。",
    "Thermal conductivity of thin films": "薄膜热导率",
    "Interface thermal conductance": "界面热导",
    "Multilayer thermal transport analysis": "多层结构热输运分析",
    "Fitting and sensitivity evaluation": "拟合与敏感度评估",
    "FDTR provides frequency-dependent thermal response measurements and supports analysis of heat diffusion length, interface effects, and multilayer heat transport.": "FDTR 提供频率相关的热响应测量，可用于分析热扩散长度、界面效应和多层结构热输运。",
    "Frequency-dependent thermal response": "频率相关热响应",
    "Thermal penetration depth analysis": "热渗透深度分析",
    "Thin-film and interface characterization": "薄膜与界面表征",
    "Complementary validation with TDTR": "与 TDTR 互补验证",
    "SSTR supports thermal resistance and effective thermal conductivity measurements under steady-state heating conditions.": "SSTR 支持稳态加热条件下的热阻和有效热导率测量。",
    "Steady-state thermal response": "稳态热响应",
    "Effective thermal resistance measurement": "有效热阻测量",
    "Device-relevant thermal testing": "器件相关热测试",
    "Cross-checking optical thermal metrology results": "光学热测试结果交叉验证",
    "Raman-based and microscale thermal mapping methods provide spatial information for temperature distribution and local thermal behavior in selected structures.": "拉曼和微尺度热成像方法可提供特定结构中温度分布及局部热行为的空间信息。",
    "Raman mapping": "拉曼成像",
    "Local temperature analysis": "局部温度分析",
    "Microscale thermal response": "微尺度热响应",
    "Complementary chip-level diagnostics": "芯片级互补诊断",
    "Supporting tools are used for sample mounting, optical inspection, alignment, film preparation, and measurement workflow development.": "配套工具用于样品装载、光学检查、对准、薄膜制备和测量流程开发。",
    "Chip and thin-film sample preparation": "芯片与薄膜样品制备",
    "Optical microscopy and alignment": "光学显微观察与对准",
    "Metal transducer preparation workflow": "金属换能层制备流程",
    "Measurement repeatability control": "测量重复性控制",
    "Data analysis workflows support model fitting, uncertainty evaluation, sensitivity analysis, automated plotting, and batch processing of measurement data.": "数据分析流程支持模型拟合、不确定性评估、敏感度分析、自动绘图及测量数据批处理。",
    "TDTR / FDTR model fitting": "TDTR／FDTR 模型拟合",
    "Batch data processing": "批量数据处理",
    "Publication-ready figure generation": "发表级图表生成",
    "The platform is designed to support both fundamental thermal transport research and practical thermal characterization needs for semiconductor materials, chips, devices, and packaging structures.": "该平台既服务于基础热输运研究，也满足半导体材料、芯片、器件和封装结构的实际热表征需求。",
    "TDTR System": "TDTR 系统",
    "FDTR System": "FDTR 系统",
    "SSTR System": "SSTR 系统",
    "Raman / Microscale Mapping": "拉曼 / 微尺度热成像",
    "Sample Preparation": "样品制备",
    "Data Analysis": "数据分析",

    // People
    "Person Type": "人员类型",
    "21 people": "共 21 人",
    "27 people": "共 27 人",
    "26 people": "共 26 人",
    "Assistant Professor and Principal Investigator": "助理教授、课题负责人",
    "Assistant Professor": "研究员、助理教授",
    "Principal Investigator": "负责人",
    "Postdoctoral Fellows and Visiting Scholars": "博士后与访问学者",
    "Research and Technical Staffs": "科研与技术人员",
    "Ph.D. Candidates": "博士候选人",
    "Ph.D. Students": "博士生",
    "Master's Students": "硕士生",
    "Jointly Trained Master's Students": "联合培养硕士生",
    "Visiting Master's Students": "访问硕士生",
    "Undergraduate Students": "本科生",
    "Alumni": "校友",
    "Professor Name": "教师姓名",
    "Student Name": "学生姓名",
    "Ph.D. Candidate": "博士候选人",
    "Ph.D. Student": "博士生",
    "Master's Student": "硕士生",
    "Jointly Trained Master's Student": "联合培养硕士生",
    "Visiting Master's Student": "访问硕士生",
    "Undergraduate Student": "本科生",
    "Co-advised Master's Student (2023–2025)": "联合培养硕士生（2023–2025）",
    "Undergraduate Student (2024–2026)": "本科生（2024–2026）",
    "NAURA Technology Group": "北方华创",
    "Ph.D. student at Stanford University": "斯坦福大学博士生",
    "Postdoctoral Fellow / Visiting Scholar": "博士后 / 访问学者",
    "Alumnus": "校友",
    "Research Assistant": "科研助理",
    "Visiting Student": "访问学生",
    "Load More People": "加载更多成员",
    "Photo": "照片",

    "View profile": "查看主页",
    "Back to People": "返回成员列表",
    "Biography": "个人简介",
    "Research Focus": "研究方向",
    "Education": "教育经历",
    "Links": "链接",
    "Member Information": "成员信息",
    "English name": "英文姓名",
    "Chinese name": "中文姓名",
    "Position": "身份",
    "Member group": "成员类别",
    "Joined the Lab": "入组年份",
    "Zhe Cheng": "程哲",
    "Yang He": "何阳",
    "Xiaoyang Ji": "冀晓洋",
    "Zifeng Huang": "黄子丰",
    "Jinwen Liu": "刘晋闻",
    "Yicheng Wei": "魏义程",
    "Yiyun He": "何宜芸",
    "Xingqiang Zhang": "张兴强",
    "Zirou Chen": "陈子柔",
    "Zixuan Zhou": "周子瑄",
    "Xinyan Xu": "徐欣艳",
    "Jinquan Zhang": "张锦佺",
    "Zimu Jiang": "姜子木",
    "Rui Zhang": "张睿",
    "Yifan Tu": "涂一凡",
    "Guoyu Song": "宋国宇",
    "Junliang Fan": "范俊良",
    "Haoyue Huang": "黄颢越",
    "Yiheng Li": "李亦恒",
    "Jiarui Tao": "陶嘉瑞",

    // Publications
    "Selected Publications": "代表性论文",
    "Preprints": "预印本",
    "Journal Articles": "期刊论文",
    "Conference Papers": "会议论文",
    "Conference Papers and Presentations": "会议论文与报告",
    "Research Themes": "研究主题",
    "Coming soon": "即将更新",
    "Thermal Metrology": "热测试与热表征",
    "Interfaces and Thin Films": "界面与薄膜",
    "Chip Thermal Testing": "芯片热测试",
    "Modeling and Data Analysis": "建模与数据分析",
    "The publication list is being curated for the first public version of the website.": "论文列表正在为网站第一版公开内容进行整理。",
    "Selected papers, preprints, and conference contributions from the group will be listed here.": "这里将展示课题组的代表性论文、预印本和会议成果。",
    "The publication list is being curated for the first public version of the website. Verified journal papers, conference papers, and preprints will be added here with complete author lists, journal information, DOI links, and PDF links where available.": "我们正在整理网站首个公开版本的论文列表。经核实的期刊论文、会议论文和预印本将陆续补充完整作者、期刊信息、DOI 及可用的 PDF 链接。",
    "Preprints and manuscripts under review will be listed after internal verification.": "预印本和审稿中的稿件将在内部核实后列出。",
    "Filter publications by type": "按类型筛选论文",
    "Filter publications by year": "按年份筛选论文",
    "Journal publications related to thermal metrology, interface heat transport, chip thermal testing, and advanced packaging will be added here.": "与热测试、界面热输运、芯片热测试和先进封装相关的期刊论文将陆续添加。",
    "Conference papers, invited talks, posters, and selected presentations will be listed as the website content is finalized.": "随着网站内容完善，将陆续列出会议论文、邀请报告、海报和代表性学术报告。",
    "TDTR, FDTR, SSTR, beam-offset measurement, and optical thermal characterization.": "TDTR、FDTR、SSTR、偏置光斑测量与光学热表征。",
    "Thermal boundary resistance, multilayer structures, transducer layers, and buried interfaces.": "界面热阻、多层结构、换能层与埋层界面。",
    "Interconnect layers, device-relevant stacks, chip samples, and thermal pathway analysis.": "互连层、器件相关堆栈、芯片样品与导热路径分析。",
    "Model fitting, sensitivity analysis, uncertainty evaluation, and automated visualization.": "模型拟合、敏感度分析、不确定性评估与自动化可视化。",
    "Paper title here": "论文题目",
    "Author A, Author B, Author C": "作者甲、作者乙、作者丙",
    "Journal Name, volume, pages, year.": "期刊名称、卷号、页码、年份。",
    "Browse": "浏览",

    // News
    "Sep": "9月",
    "Mar": "3月",
    "Jan": "1月",
    "Dec": "12月",
    "Website homepage": "网站首页",
    "The official website of the group is now online. The site introduces the group's research directions — high-thermal-conductivity materials, heterogeneous interfaces and bonding, and three-dimensional thermal tomography — together with our facilities, publications, and team members.": "课题组官方网站正式上线。网站介绍了研究方向——高导热散热材料、异质界面与键合、三维热层析，以及实验室的设备平台、论文成果和团队成员。",
    "Group's first IEDM paper: 3D thermal conductivity mapping of advanced interconnects": "课题组首篇 IEDM 论文：先进工艺节点互连层三维导热系数分布的高精度测量",
    "At the 2025 IEEE International Electron Devices Meeting (IEDM) — the group's first paper at the conference — we presented high-precision, layer-by-layer measurements of interconnect thermal conductivity across advanced logic process nodes from 28 nm down to 3 nm. Combining advanced sample preparation with high-resolution thermal characterization and thermal scanning, we mapped the in-layer spatial distribution of thermal conductivity for the first time. The results show effective thermal conductivities of only about 1 W/m-K — far below copper (~400 W/m-K) — with Cu/dielectric interface thermal resistance (60–80 m²-K/GW) dominating heat transport. Guided by these findings, finite-element simulations propose high-thermal-conductivity AlN bonding layers, diamond heat spreaders, and high-convection cooling to keep 3D-stacked transistors within acceptable temperature rise. Zifeng Huang and Yiyun He are co-first authors, and Zhe Cheng is the corresponding author.": "在 2025 年 IEEE 国际电子器件会议（IEDM）上，课题组发表了首篇 IEDM 论文，首次实现对 28 nm–3 nm 先进制程节点芯片互连层导热系数的逐层高精度测量，并结合热扫描技术获得互连层内导热系数的空间分布。结果表明，各互连层有效导热系数仅约 1 W/m-K，远低于铜的本征值（约 400 W/m-K），铜/介质界面热阻（约 60–80 m²-K/GW）在互连层热输运中占据主导地位。基于这一认识，有限元热仿真提出引入高导热氮化铝键合层、金刚石均热结构并配合高对流换热散热，使超微缩三维堆叠晶体管保持可接受的温升水平。博士生黄子丰和何宜芸为共同第一作者，程哲研究员为通讯作者。",
    "Research · IEEE IEDM 2025": "研究 · IEEE IEDM 2025",
    "Presenting the group's IEDM 2025 paper on interconnect thermal tomography": "课题组成员在 IEDM 2025 会议上报告互连层三维热层析工作",
    "Thermal management of backside power delivery networks: paper accepted by IEEE IEDM 2026": "背面供电网络（BSPDN）热管理研究论文被 IEEE IEDM 2026 接收",
    "A paper by the group on thermal management of backside power delivery networks (BSPDN) has been accepted by the 2026 IEEE International Electron Devices Meeting (IEDM). The work presents the first three-dimensional thermal characterization and optimization-oriented reconstruction of advanced logic technologies with BSPDN beyond the 2 nm node. The first three authors — Junliang Fan, Zirou Chen, and Haoyue Huang — are all undergraduate students in the group.": "课题组关于背面供电网络（BSPDN）热管理的研究论文被 2026 年 IEEE 国际电子器件会议（IEDM）接收。该工作首次对 2 nm 节点以下采用 BSPDN 的先进逻辑技术进行了三维热表征与面向优化的重构。论文第一、二、三作者范俊良、陈子柔、黄颢越均为课题组本科生。",
    "IEDM 2026 program entry on BSPDN thermal characterization and reconstruction": "IEDM 2026 会议日程中关于 BSPDN 热表征与重构的论文条目",
    "Research · IEEE IEDM 2026": "研究 · IEEE IEDM 2026",
    "Thermal conduction in doped 3C-SiC published in Applied Physics Reviews": "掺杂 3C-SiC 热输运研究发表于 Applied Physics Reviews",
    "The group's work on thermal conduction in doped 3C-SiC has been published in Applied Physics Reviews. The study experimentally reveals the effect of resonant phonon scattering on thermal transport, deepening the understanding of heat conduction in wide-bandgap semiconductors. With a thermal conductivity second only to diamond among large-wafer materials, together with full compatibility with silicon processing, 3C-SiC is a promising candidate material for through-silicon via (TSV) applications in advanced integration.": "课题组关于掺杂 3C-SiC 热输运的研究成果发表于 Applied Physics Reviews。该研究实验揭示了共振声子散射对热输运的影响，深化了对宽禁带半导体热传导机制的理解。3C-SiC 热导率在大尺寸晶圆材料中仅次于金刚石，且与硅工艺完全兼容，是先进集成中硅通孔（TSV）应用的理想候选材料。",
    "Applied Physics Reviews article on defect-phonon scatterings in cubic SiC single crystals": "Applied Physics Reviews 上关于立方碳化硅单晶中缺陷-声子散射的论文",
    "Publications · Applied Physics Reviews": "论文发表 · Applied Physics Reviews",
    "Collaborative study observes ultra-low near-junction thermal resistance in GaN devices": "合作研究在 GaN 器件中观测到极低的近结热阻",
    "In a collaborative study on GaN devices, advanced thin-film epitaxial growth has enabled an ultra-low near-junction thermal resistance — an important step toward high-power-density gallium nitride radio-frequency transistors. The work has been published in Nature Communications, and a follow-up paper elucidating the underlying heat-conduction mechanism is forthcoming.": "在 GaN 器件合作研究中，先进的薄膜外延生长工艺实现了极低的近结热阻，是迈向高功率密度氮化镓射频晶体管的重要一步。该成果已发表于 Nature Communications，阐明其热传导机制的后续论文亦在整理发表之中。",
    "Nature Communications article on high-power-density GaN radio frequency transistors": "Nature Communications 上关于高功率密度氮化镓射频晶体管的论文",
    "Research · Collaboration · Nature Communications": "研究 · 合作 · Nature Communications",
    "Website structure completed": "网站结构已完成",
    "Thermal metrology platform development": "热测试平台建设进展",
    "TDTR data analysis workflow updated": "TDTR 数据分析流程已更新",
    "Chip sample thermal characterization in progress": "芯片样品热表征进行中",
    "Selected updates from the laboratory, including research progress, publications, facilities, student activities, and collaboration news.": "实验室动态包括研究进展、论文成果、设备平台、学生活动和合作消息。",
    "Featured News": "焦点新闻",
    "July 2026": "2026年7月",
    "Jul": "7月",
    "Jun": "6月",
    "May": "5月",
    "Apr": "4月",
    "The group website is being developed to introduce the group’s research directions, facilities, publications, and people.": "课题组网站正在建设中，用于介绍课题组的研究方向、设备平台、论文成果和团队成员。",
    "The first version focuses on thermal characterization, chip-level thermal testing, advanced packaging, and research platform development.": "首个版本重点展示热表征、芯片级热测试、先进封装和科研平台建设。",
    "The initial website structure has been completed, including Home, About, Research, Facilities, People, Publications, News, and Contact pages.": "网站初步结构已经完成，包括首页、关于我们、研究方向、设备平台、成员、论文发表、动态和联系我们等页面。",
    "Website · Laboratory Platform": "网站 · 实验室平台",
    "The group continues to develop thermal characterization capabilities based on TDTR, FDTR, SSTR, Raman mapping, and chip-level thermal testing.": "课题组持续建设基于 TDTR、FDTR、SSTR、拉曼成像和芯片级热测试的热表征能力。",
    "Facilities · Thermal Metrology": "设备平台 · 热测试",
    "The TDTR fitting and plotting workflow has been improved to support cleaner data export, sensitivity analysis, and publication-ready visualization.": "TDTR 拟合与绘图流程已得到改进，可支持更规范的数据导出、敏感度分析和发表级可视化。",
    "Software · Data Analysis": "软件 · 数据分析",
    "Measurements are ongoing for multilayer chip structures and device-relevant samples, with focus on buried-layer heat transport and interface thermal resistance.": "多层芯片结构和器件相关样品的测量正在进行，重点关注埋层热输运和界面热阻。",
    "Research · Chip Thermal Testing": "研究 · 芯片热测试",

    // Contact
    "Laboratory Contact": "实验室联系方式",
    "Laboratory": "实验室",
    "Institution": "机构",
    "School": "学院",
    "Collaboration & Measurement Requests": "合作交流与测试需求",
    "For Students": "学生加入",
    "Location": "位置",
    "Subway": "地铁",
    "Campus Access": "入校方式",
    "Micro-Nano Electronics Building, Peking University, 5 Yiheyuan Road, Haidian District, Beijing 100871, China": "北京市海淀区颐和园路5号北京大学微纳电子大厦，邮编 100871",
    "Take Line 4 to Peking University East Gate Station (北京大学东门站), enter through the campus East Gate, and walk about 10 minutes to the building.": "乘坐地铁4号线至北京大学东门站，由校园东门入校后步行约10分钟即可到达微纳电子大厦。",
    "The building is inside the PKU campus. Visitors are kindly asked to contact us in advance so campus entry can be arranged.": "大厦位于北京大学校园内，来访前请提前与我们联系，以便协助安排入校事宜。",
    "Open in AMap ↗": "在高德地图中打开 ↗",
    "Open in Google Maps ↗": "在 Google 地图中打开 ↗",
    "Map of the Micro-Nano Electronics Building, Peking University": "北京大学微纳电子大厦位置地图",
    "Research Areas": "研究领域",
    "sample material": "样品材料",
    "measurement objective": "测试目标",
    "student opportunities": "学生机会",
    "general questions": "一般咨询",
    "For research collaboration, thermal measurement inquiries, student opportunities, or general questions, please contact the laboratory.": "如需开展科研合作、交流测试需求、了解学生机会或提出一般问题，请联系实验室。",
    "Please include a brief description of your sample, measurement objective, expected thermal property, sample structure, and available supporting information.": "来信请简要说明样品、测量目标、拟测热学参数、样品结构及已有辅助信息。",
    "Sample material and layer structure": "样品材料与层状结构",
    "Approximate film thickness or device geometry": "薄膜大致厚度或器件几何结构",
    "Target property: thermal conductivity, thermal boundary conductance, or thermal resistance": "目标参数：热导率、界面热导或热阻",
    "Available images, process information, or previous measurement data": "已有图像、工艺信息或历史测量数据",
    "Expected timeline and collaboration purpose": "预期时间安排与合作目的",
    "Thin-film and interface heat transport": "薄膜与界面热输运",
    "Thermal modeling and data analysis": "热建模与数据分析",
    "Students interested in thermal metrology, semiconductor devices, optics, heat transfer, data analysis, and scientific computing are welcome to contact us.": "欢迎对热测试、半导体器件、光学、传热、数据分析和科学计算感兴趣的学生联系我们。",
    "A campus map or building location image can be added here later.": "此处后续将补充校园地图或楼宇位置图片。",
    "TDTR / FDTR thermal metrology": "TDTR / FDTR 热测试",
    "Map / Campus Location": "校园位置",

    // Search
    "Enter a keyword above to search this website.": "请输入关键词搜索本站内容。",
    "Page": "页面",
    "Pages": "页面",
    "Member": "成员",
    "Enter keywords, e.g. TDTR, publications, people": "请输入关键词，例如 TDTR、论文、成员",
    "Results for": "搜索结果",
    "No results found for": "未找到相关结果",
    "Search pages within this website.": "搜索本网站中的页面。",
    "Research environment at Peking University": "北京大学科研环境",
    "Thermal transport and interfaces research": "热输运与界面研究",
    "Heterogeneous integration and packaging research": "异质集成与封装研究",
    "Thermal characterization and design research": "热表征与热设计研究",
    "Thermal metrology chips integrated systems thin films interfaces packaging TDTR FDTR heat transport": "热测试、芯片、集成系统、薄膜、界面、封装、TDTR、FDTR 与热输运",
    "about thermal metrology chip thermal stack device interconnects interfaces package platform modeling measurement": "关于热测试、芯片热结构、器件、互连、界面、封装、平台、建模与测量",
    "research TDTR FDTR thermal boundary resistance chip-level testing advanced packaging modeling data analysis": "研究 TDTR、FDTR、界面热阻、芯片级测试、先进封装、建模与数据分析",
    "facilities TDTR FDTR SSTR Raman microscale mapping sample preparation data processing thermal measurement systems": "设备平台 TDTR、FDTR、SSTR、拉曼、微尺度成像、样品制备、数据处理与热测量系统",
    "people members principal investigator phd candidates graduate students undergraduate researchers": "成员、负责人、博士候选人、博士生、硕士生与本科生",
    "publications papers preprints journal articles conference thermal metrology heat transport chip testing": "论文、预印本、期刊文章、会议成果、热测试、热输运与芯片测试",
    "news laboratory updates website thermal metrology platform TDTR data analysis workflow": "动态、实验室消息、网站、热测试平台、TDTR 与数据分析流程",
    "contact email address collaboration measurement inquiries student opportunities": "联系、邮箱、地址、合作、测量咨询与学生机会",
    "IC thermal management, heterogeneous integration and advanced packaging, 3D stacked chips, thermal transport in micro/nanoelectronic devices, advanced thermal characterization, semiconductor materials and devices.": "集成电路热管理、异质集成与先进封装、三维堆叠芯片、微纳电子器件热输运、先进热表征、半导体材料与器件。",
    "IC thermal management, heterogeneous integration, advanced packaging, and thermal characterization.": "集成电路热管理、异质集成、先进封装与热表征。"
  };

  const phraseDictionary = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);

  const originalText = new Map();
  const originalDocumentTitle = document.title;
  const translatableAttributes = ["placeholder", "title", "aria-label", "alt"];
  const originalAttributes = new Map();

  function normalize(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function shouldSkipElement(el) {
    if (!el) return true;
    // .publication-list holds citation data — dictionary phrases inside it
    // (e.g. "Jun", "Interfaces", "Contact") must never be phrase-replaced.
    if (el.closest("script, style, noscript, .language-toggle, .publication-list, .no-translate")) return true;
    return false;
  }

  function collectTextNodes(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (shouldSkipElement(node.parentElement)) return NodeFilter.FILTER_REJECT;
          if (!normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }

  const textNodes = collectTextNodes(document.body);

  textNodes.forEach(node => {
    originalText.set(node, node.nodeValue);
  });

  translatableAttributes.forEach(attribute => {
    document.querySelectorAll(`[${attribute}]`).forEach(el => {
      if (el.closest("script, style, noscript, .language-toggle, .publication-list, .no-translate")) return;
      if (!originalAttributes.has(el)) originalAttributes.set(el, {});
      originalAttributes.get(el)[attribute] = el.getAttribute(attribute);
    });
  });

  function translateText(en) {
    if (dictionary[en]) return dictionary[en];

    let result = en;
    for (const [source, target] of phraseDictionary) {
      if (result.includes(source)) {
        result = result.split(source).join(target);
      }
    }
    return result;
  }

  function applyLanguage(lang) {
    const isZh = lang === "zh";

    document.documentElement.lang = isZh ? "zh-CN" : "en";
    document.body.classList.toggle("lang-zh", isZh);
    document.body.classList.toggle("lang-en", !isZh);
    document.title = isZh ? translateText(originalDocumentTitle) : originalDocumentTitle;

    textNodes.forEach(node => {
      const raw = originalText.get(node);
      if (raw == null) return;
      const en = normalize(raw);
      if (!en) return;
      node.nodeValue = isZh ? translateText(en) : raw;
    });

    originalAttributes.forEach((attributes, el) => {
      Object.entries(attributes).forEach(([attribute, value]) => {
        el.setAttribute(attribute, isZh ? translateText(value) : value);
      });
    });

    document.querySelectorAll(".language-toggle").forEach(button => {
      button.dataset.lang = lang;
      button.setAttribute("aria-label", isZh ? "切换到英文" : "Switch to Chinese");
      button.setAttribute("title", isZh ? "切换到英文" : "Switch to Chinese");
    });

    localStorage.setItem("siteLanguage", lang);
  }

  document.querySelectorAll(".language-toggle").forEach(button => {
    button.addEventListener("click", function () {
      const current = this.dataset.lang || "en";
      const next = current === "zh" ? "en" : "zh";
      applyLanguage(next);
    });
  });

  const savedLanguage = localStorage.getItem("siteLanguage") || "en";
  applyLanguage(savedLanguage);
});
