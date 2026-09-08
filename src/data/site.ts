export const navigation = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Publications", href: "#publications" },
  { label: "Education", href: "#education" },
  { label: "Honors", href: "#honors" }
];

export const news = [
  {
    date: "Sep 2026",
    text: "Started my Ph.D. in Cybersecurity at the Institute of Information Engineering, Chinese Academy of Sciences."
  },
  {
    date: "Jun 2026",
    text: "Graduated from UCAS and received the Outstanding Graduate honor."
  },
  {
    date: "2026",
    text: "Our paper Firmenstein was accepted to USENIX Security 2026."
  }
];

export const research = [
  {
    id: "R—01",
    period: "2025—2026",
    title: "Root-Cause Localization for Semantic Vulnerabilities",
    context: "Undergraduate Thesis · IIE, CAS",
    description:
      "A bidirectional semantic-specification approach that maps program behavior to security constraints, producing evidence chains and root-cause functions for non-crashing semantic vulnerabilities.",
    details: ["Execution-state trees", "Agent-assisted analysis", "90% accuracy on 20 cases"]
  },
  {
    id: "R—02",
    period: "2024—2025",
    title: "Evaluating Differential Fuzzing",
    context: "Research Practice · IIE, CAS × VUsec",
    description:
      "Designed Diffray, a differential fuzzing framework with six testing strategies, and built a benchmark of 18 programs and 182 real-world differential inputs.",
    details: ["LibFuzzer & LibAFL", "OpenSSL, wolfSSL & libpng", "Real-world vulnerability discovery"]
  }
];

export const publications = [
  {
    year: "2026",
    venue: "USENIX Security",
    status: "Accepted",
    title:
      "Firmenstein: Scaling Dynamic Analysis for Linux-Based Firmware Services via API-Centric Intervention Code Synthesis",
    authors: [
      "Yanzhong Wang",
      "Wenhui Zhang",
      "Ruigang Liang",
      "Kai Chen",
      "Yi Yang",
      "Zhiyu Zhang",
      "Junyan Jiang"
    ]
  }
];

export const education = [
  {
    period: "2026—Present",
    degree: "Ph.D. in Cybersecurity",
    institution: "Institute of Information Engineering, Chinese Academy of Sciences",
    note: "Software security analysis theory and techniques"
  },
  {
    period: "2022—2026",
    degree: "B.Eng. in Cybersecurity",
    institution: "University of Chinese Academy of Sciences",
    note: "GPA 3.89 / 4.00 · Ranked 2 / 30"
  }
];

export const honors = [
  { year: "2026", title: "Outstanding Graduate, University of Chinese Academy of Sciences" },
  { year: "2025", title: "National Scholarship" },
  { year: "2025", title: "Outstanding Student Pacesetter, UCAS" },
  { year: "2023—2025", title: "Undergraduate Academic Scholarship, UCAS" },
  { year: "2023—2025", title: "Outstanding Student, UCAS" },
  { year: "2023—2026", title: "Outstanding Communist Youth League Cadre, UCAS" }
];
