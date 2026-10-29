// Centralized portfolio data for Manansh Gupta
// Everything the site displays lives here for clean maintainability.

export const socialLinks = {
	github: "https://github.com/Manansh123",
	linkedin: "https://www.linkedin.com/in/manansh-gupta-125215269/",
	leetcode: "https://leetcode.com/u/manansh123/",
	codolio: "https://codolio.com/profile/mnu2305",
};

export const profile = {
	name: "Manansh Gupta",
	role: "Software Engineering Student · Full Stack Developer · DSA Enthusiast",
	summary:
		"Software Engineering student with experience in Java, JavaScript, and full-stack web application development. Strong foundation in Data Structures and Algorithms, Object-Oriented Programming, and database management.",
	email: "guptamanas@gmail.com",
	phone: "+91 9170636826",
	phoneHref: "+919170636826",
	location: "Greater Noida, Uttar Pradesh, India",
	locationShort: "Greater Noida, India",
	resume: "/main_resume.pdf",
	image: "/images/manansh.webp",
	imagePng: "/images/manansh.png",
	links: socialLinks,
};

export const education = {
	primary: {
		institution: "Galgotias University",
		degree: "B.Tech. in Computer Science",
		period: "October 2023 – June 2027",
		cgpa: 8.55,
		status: "Undergraduate Student",
	},
	schooling: [
		{
			level: "Senior Secondary",
			school: "Dr. Virendra Swarup Education Centre",
			score: "73.4%",
			year: "2023",
		},
		{
			level: "Secondary",
			school: "Dr. Virendra Swarup Education Centre",
			score: "62%",
			year: "2021",
		},
	],
};

export const milestones = [
	{
		id: "dsa",
		title: "Problem Solving",
		count: 480,
		suffix: "+",
		detail: "DSA problems solved across platforms with a focus on time and space complexity.",
		meta: "Graphs, Trees, Dynamic Programming, Arrays",
		href: socialLinks.leetcode || null,
	},
	{
		id: "leetcode",
		title: "LeetCode Rating",
		count: 1500,
		suffix: "+",
		detail: "Contest rating reflecting consistent algorithmic problem solving and logic implementation.",
		meta: "Data Structures & Competitive Programming",
		href: socialLinks.leetcode || null,
	},
	{
		id: "sih",
		title: "Smart India Hackathon 2024",
		value: "Top 5",
		detail: "Ranked among the Top 5 teams at the university level for practical software problem solving.",
		meta: "Galgotias University Level, 2024",
	},
];

export const certifications = [
	{
		id: "oracle",
		title: "Oracle Database Design & SQL Essentials",
		issuer: "Oracle Academy",
		year: "2024",
		detail: "Relational database design, normalisation, and advanced SQL querying.",
	},
	{
		id: "efset",
		title: "EF SET English Certificate",
		issuer: "EF SET",
		score: "88/100 (C2 Proficient)",
		year: "2026",
		detail: "International English proficiency standard at C2 Proficient level.",
	},
];

export const projects = [
	{
		id: "avant",
		title: "Avant AI Fashion Platform",
		tagline: "Flagship AI fashion platform for trend discovery & virtual try-on",
		featured: true,
		badge: "Primary Featured Project",
		summary:
			"A full-stack AI fashion platform for trend discovery, personalized outfit creation, digital wardrobe management, smart product discovery, AI-powered styling, and virtual try-on.",
		points: [
			"Developed AI Outfit Builder, Virtual Try-On, Digital Wardrobe, Product Search, and AI Stylist Chatbot using JavaScript, Node.js, Express.js, MongoDB, and AI APIs.",
			"Implemented image-based workflows, dynamic UI interactions, wardrobe tracking, and AI-powered styling for personalized fashion discovery.",
			"Architected backend endpoints and MongoDB collections for digital wardrobe persistence, rapid product search, and responsive styling flows.",
		],
		stack: [
			"HTML",
			"CSS",
			"JavaScript",
			"Node.js",
			"Express.js",
			"MongoDB",
			"AI APIs",
		],
		image: "/images/work-avant.webp",
		width: 1400,
		height: 875,
		live: "https://avant-fashion.onrender.com/index.html",
		source: "https://github.com/Manansh123/avant-fashion",
	},
	{
		id: "hr-dashboard",
		title: "HR Management Dashboard",
		tagline: "Java & MySQL dashboard for employee records and performance",
		featured: false,
		badge: "Enterprise Application",
		summary:
			"A Java-based HR Management Dashboard built to centralize employee records, attendance tracking, and performance monitoring through an organized interface.",
		points: [
			"Implemented complete CRUD operations using Java, JDBC, and MySQL for secure employee data storage, retrieval, and updates.",
			"Designed a centralized operational workflow for tracking attendance, employee information, and performance evaluations.",
			"Optimized database queries and transaction execution for faster record access and streamlined administrative workflows.",
		],
		stack: ["Java", "MySQL", "JDBC"],
		// Placeholder — genuine screenshot not yet available for this desktop application
		image: "/images/work-hr-placeholder.svg",
		width: 1400,
		height: 875,
		live: null, // Desktop/internal database application — not deployed
		source: null,
		noLinkNote: "Desktop application · not deployed · source available on request",
	},
	{
		id: "hmm-gnn-parkinson",
		title: "Human Balance Analysis using HMM + GNN",
		tagline: "Research: HMM & GNN for Parkinson's balance classification",
		featured: false,
		badge: "Research Project",
		summary:
			"Research-based approach combining Continuous Hidden Markov Models and Graph Neural Networks for human balance analysis and Parkinson's disease classification.",
		points: [
			"COP feature extraction and velocity feature computation from stabilometric balance signals.",
			"HMM state representations and sequence modelling for postural stability analysis.",
			"HMM-GNN feature fusion with ML classification for Parkinson's disease detection.",
			"SHAP/XAI analysis to interpret model decisions and identify key balance biomarkers.",
		],
		stack: ["Python", "HMM", "GNN", "SHAP", "XAI", "ML"],
		// Research schematic — not a fabricated screenshot of results
		image: "/images/work-hmm-gnn.svg",
		fit: "contain",
		width: 1400,
		height: 875,
		live: null,
		source: "https://github.com/Manansh123/HMM-GNN-Parkinson-Human-Balance",
	},
];

export const experience = [
	{
		company: "InAmigos Foundation",
		role: "Web Development Intern",
		period: "2026 · 2 months",
		place: "Remote",
		points: [
			"Created responsive NGO awareness webpages utilizing semantic HTML and CSS.",
			"Conducted foundation website improvements and UI/UX analysis to elevate visitor engagement and layout clarity.",
			"Explored AI-assisted website generation and designed interface features in Figma for user-centric digital experiences.",
		],
		stack: ["HTML", "CSS", "JavaScript", "UI/UX", "Figma", "AI Generation"],
	},
	{
		company: "AICTE Eduskills",
		role: "Java Full Stack Developer Virtual Internship",
		period: "Oct 2025 to Dec 2025",
		place: "Virtual",
		points: [
			"Gained hands-on experience in Java application development, web technologies, and software engineering workflows.",
			"Developed structured backend logic, integrated relational database operations, and applied object-oriented design principles.",
			"Applied debugging and problem-solving skills with Data Structures and Algorithms to practical development tasks.",
		],
		stack: ["Java", "OOP", "MySQL", "Full Stack Development"],
	},
];

export const toolbox = [
	{
		id: "programming",
		title: "Programming",
		subtitle: "Languages & Logic",
		tint: "#7cc7ff",
		tools: [
			{
				name: "Java",
				note: "Core language for DSA, object-oriented architecture, and backend systems.",
			},
			{
				name: "JavaScript",
				note: "Modern ES6+, asynchronous programming, and full-stack application logic.",
			},
			{
				name: "Python",
				note: "Scripting, data processing, and research-oriented development.",
			},
		],
	},
	{
		id: "frontend",
		title: "Frontend",
		subtitle: "User Interface & Styling",
		tint: "#5fe3b0",
		tools: [
			{
				name: "React.js",
				note: "Component architecture, state management, and responsive dynamic interfaces.",
			},
			{
				name: "Tailwind CSS",
				note: "Utility-first responsive design, modern token systems, and rapid UI development.",
			},
			{
				name: "HTML",
				note: "Semantic document structure, accessibility, and modern web standards.",
			},
			{
				name: "CSS",
				note: "Responsive layouts, Flexbox, Grid, transitions, and micro-interactions.",
			},
		],
	},
	{
		id: "backend",
		title: "Backend",
		subtitle: "APIs & Web Services",
		tint: "#ffc46b",
		tools: [
			{
				name: "Node.js",
				note: "Asynchronous runtime for fast, scalable server-side JavaScript applications.",
			},
			{
				name: "Express.js",
				note: "RESTful API development, request handling, middleware, and routing.",
			},
		],
	},
	{
		id: "database",
		title: "Databases",
		subtitle: "Storage & Persistence",
		tint: "#883B42",
		tools: [
			{
				name: "MySQL",
				note: "Relational database design, normalized schemas, SQL queries, and JDBC integration.",
			},
			{
				name: "MongoDB",
				note: "Document-oriented NoSQL database for flexible data modeling and fast queries.",
			},
		],
	},
	{
		id: "core",
		title: "Core CS",
		subtitle: "Foundations & Architecture",
		tint: "#c09bff",
		tools: [
			{
				name: "Data Structures & Algorithms",
				note: "480+ problems solved across platforms with a strong grasp of algorithmic complexity.",
			},
			{
				name: "Object-Oriented Programming",
				note: "Clean class design, encapsulation, inheritance, polymorphism, and modularity.",
			},
			{
				name: "Computer Networking",
				note: "TCP/IP, OSI model, protocols, and network communication fundamentals.",
			},
			{
				name: "Operating Systems",
				note: "Process management, memory allocation, scheduling, and system-level concepts.",
			},
		],
	},
	{
		id: "tools",
		title: "Tools",
		subtitle: "Development & Version Control",
		tint: "#9ee6ff",
		tools: [
			{
				name: "Git",
				note: "Distributed version control, branching strategies, and commit workflows.",
			},
			{
				name: "GitHub",
				note: "Repository management, collaboration, code reviews, and project tracking.",
			},
			{
				name: "VS Code",
				note: "Primary code editor, extensions, debugging environment, and tooling.",
			},
		],
	},
];
