export interface Role {
  company: string;
  url: string;
  title: string;
  location: string;
  period: string;
  intro?: string;
  bullets: string[];
  highlight?: boolean; // surfaces the role on the homepage
}

export const roles: Role[] = [
  {
    company: 'YuLife',
    url: 'https://yulife.com/',
    title: 'Senior AI Software Engineer',
    location: 'Remote',
    period: 'May 2025 – Present',
    highlight: true,
    // NOTE: intentionally generic, no internal project/client specifics.
    bullets: [
      'Designing and building AI-powered features across YuLife’s employer portal and insurance platform, from scoping through production.',
      'Building full-stack features end to end with AI-first tooling: Claude Code, OpenAI Codex and Cursor.',
      'Developing custom Claude Code skills and agentic workflows to automate engineering and business processes.',
      'Building evaluation pipelines and quality gates for LLM-powered features: acceptance test cases, scoring rubrics and regression evals.',
      'Optimizing cost, latency and reliability of LLM features through model selection, prompt/context engineering and guardrails.',
      'Automating internal processes with trigger.dev background jobs and workflows.',
      'Authoring engineering architecture decision records and contributing to platform-wide engineering standards.',
      'Leading demos and knowledge-sharing sessions across engineering squads.',
      'Stack: TypeScript, React, Node.js, LLM-based services and AWS.',
    ],
  },
  {
    company: 'Deel',
    url: 'https://www.deel.com/',
    title: 'Engineering Manager',
    location: 'Remote',
    period: 'Jan 2024 – May 2025',
    highlight: true,
    bullets: [
      'Led the development of critical FinTech features: a new billing framework, an invoicing architecture built for compliance and consistency, and a new pricing engine.',
      'Led refactoring of the billing and invoicing systems, making them simpler to operate and extend.',
      'Managed and grew 13 direct reports, owning their career development.',
      'Oversaw delivery of business-critical features contributing to $2M in monthly revenue.',
      'Streamlined internal processes to cut distractions and give engineers more time to build.',
      'Defined and delivered quarterly OKRs with product managers, product operations and engineering directors.',
      'Conducted 70+ interviews and established 4 new teams.',
      'Stack: TypeScript, React, Nest.js, Node.js and PostgreSQL on AWS.',
    ],
  },
  {
    company: 'Moteefe',
    url: 'https://moteefe.com/',
    title: 'Senior Software Engineer',
    location: 'Remote',
    period: 'Jan 2022 – Jan 2024',
    intro: 'Developed, deployed and maintained key features across Moteefe’s e-commerce platform.',
    bullets: [
      'Built and supported end-to-end features: payment integrations with Stripe and PayPal, headless CMS integration and cart-recovery emails.',
      'Created new microservices and split existing ones to improve performance and scalability.',
      'Monitored system metrics, troubleshooting issues and applying fixes or escalating when necessary.',
      'Contributed to internal code-quality initiatives, mentoring and sharing knowledge with the team.',
      'Stack: TypeScript, React, Nest.js and Node.js on AWS.',
    ],
  },
  {
    company: 'Software University',
    url: 'https://softuni.bg/',
    title: 'Part-time Lecturer',
    location: 'Remote',
    period: 'May 2020 – Apr 2024',
    bullets: [
      'Led the “Programming Basics”, “Programming Fundamentals” and “Programming Advanced” courses, delivering interactive lectures for a comprehensive understanding.',
      'Provided practical insights and fostered skill development to equip students with applicable programming expertise across foundational and advanced levels.',
      'Extended support beyond class with supplementary reading materials, resources and guidance for independent growth.',
    ],
  },
  {
    company: 'Mentor The Young',
    url: 'https://www.mentortheyoung.com/',
    title: 'Mentor',
    location: 'Sofia, Bulgaria / Remote',
    period: 'Sept 2022 – Jan 2024',
    bullets: [
      'Provided personalized guidance in software engineering through one-on-one sessions, addressing specific needs and goals.',
      'Assisted in setting achievable goals, monitoring progress and offering constructive feedback for continuous improvement.',
      'Shared practical knowledge and industry experience to help mentees navigate challenges and make informed decisions.',
    ],
  },
  {
    company: 'Independent Contractor',
    url: 'https://teodorkurtev.com/',
    title: 'Software Engineer',
    location: '',
    period: 'Sept 2011 – Present',
    intro:
      'Building a wide range of applications with .NET, JavaScript/TypeScript/Node.js and Go, primarily in the web domain.',
    bullets: [
      'Translate business needs into specific software requirements by working closely with clients.',
      'Design, implement, test, document and deploy front-end and back-end software solutions.',
      'Provide ongoing support for existing solutions to ensure smooth operation and optimal performance.',
    ],
  },
  {
    company: 'News UK',
    url: 'https://www.news.co.uk/',
    title: 'Lead Software Engineer',
    location: 'Sofia, Bulgaria',
    period: 'Aug 2020 – Jan 2022',
    intro:
      'As part of the MAIN Technology Group, I worked across the Monetization, Access and Identity verticals.',
    bullets: [
      'Developed new capabilities for projects built in Go on AWS.',
      'Researched and evaluated new solutions to improve project performance.',
      'Collaborated with stakeholders to ensure project alignment with business objectives.',
      'Supported recruitment efforts to build a strong and capable team.',
    ],
  },
  {
    company: 'Synchronoss Technologies',
    url: 'https://synchronoss.com/',
    title: 'Lead Software Engineer',
    location: 'Sofia, Bulgaria',
    period: 'Oct 2017 – Aug 2020',
    bullets: [
      'Developed and implemented code standards and practices to promote high code quality across all projects in the Bulgaria branch.',
      'Built out the team by participating in the recruitment process.',
      'Managed and streamlined work activities to eliminate blockers and ensure smooth project execution.',
      'Designed, implemented and tested front-end and back-end features across multiple projects, primarily MEAN stack plus .NET work.',
      'Facilitated team activities such as daily stand-ups and code-review sessions.',
      'Mentored junior developers to support their professional development and growth.',
    ],
  },
  {
    company: 'Software Improvement Group (SIG)',
    url: 'https://www.softwareimprovementgroup.com/',
    title: 'Software Engineer / Researcher',
    location: 'Amsterdam, The Netherlands',
    period: 'Jan 2017 – Aug 2017',
    bullets: [
      'Investigated and proposed refactoring options for architecturally related code smells to improve code quality and maintainability.',
      'Developed a Visual Studio refactoring plugin utilizing the .NET ecosystem and the Roslyn compiler.',
      'Utilized R and Python for data analysis and visualization to identify optimization opportunities.',
      'Achieved positive outcomes from the research and PoC project, with an increase in desired metrics by 5–10%.',
    ],
  },
  {
    company: 'EPAM',
    url: 'https://www.epam.com/',
    title: 'Software Engineer',
    location: 'Sofia, Bulgaria',
    period: 'Mar 2016 – Aug 2016',
    bullets: [
      'Utilized the .NET stack for back-end development: C#, MS SQL Server, Entity Framework and ASP.NET MVC.',
      'Implemented front-end features with Angular.js, jQuery and the Google Maps APIs.',
      'Established processes to ensure code quality: static code analysis, CI, git branching strategies and code reviews.',
    ],
  },
  {
    company: 'SBTech',
    url: 'https://www.sbtech.com/',
    title: 'Software Engineer',
    location: 'Sofia, Bulgaria',
    period: 'Jan 2015 – Aug 2015',
    bullets: [
      'Developed new front-end and back-end features for the mobile and tablet betting solutions using .NET and JavaScript, helping bring the tablet solution to its initial release.',
      'Took part in code quality initiatives: code reviews, CI, static code analysis and refactoring efforts.',
    ],
  },
  {
    company: 'Software University',
    url: 'https://softuni.bg/',
    title: 'Software Engineer',
    location: 'Sofia, Bulgaria',
    period: 'Oct 2013 – Feb 2015',
    intro:
      'As the first developer at Software University, I designed, developed and tested the core modules of the Software University Learning System (SULS).',
    bullets: [
      'Developed an e-learning system from scratch, including electronic payments, teamwork management, CMS capabilities and course management.',
      'Technologies used: .NET, ASP.NET MVC, Entity Framework, HTML, JavaScript, KendoUI.',
    ],
  },
  {
    company: 'Telerik Academy',
    url: 'https://www.telerikacademy.com/',
    title: 'Trainee Software Engineer',
    location: 'Sofia, Bulgaria',
    period: 'Sept 2011 – Oct 2013',
    bullets: [
      'Practical introduction to technologies ranging from C# and JavaScript to frameworks like ASP.NET MVC, Angular.js, Kendo and WPF.',
      'Key focus on high-quality code in compliance with OOP best practices such as SOLID, DRY and YAGNI.',
    ],
  },
];

export const education = [
  {
    degree: 'MSc Software Engineering',
    school: 'University of Amsterdam',
    url: 'https://www.uva.nl/en',
    location: 'Amsterdam, The Netherlands',
    note: '5.9/6 GPA',
    details:
      'Intense one-year master’s programme focused on source-code analysis and transformation, software craftsmanship, software testing and software processes, with an essential role for scientific research and practical application.',
  },
  {
    degree: 'BSc Business Informatics',
    school: 'University of National and World Economy',
    url: 'https://www.unwe.bg/en/',
    location: 'Sofia, Bulgaria',
    note: '5.5/6 GPA',
    details:
      'Four-year computer-science-related bachelor programme covering programming, algorithms, computer architecture, operating systems, networks, internet technologies and software engineering.',
  },
  {
    degree: 'Practical Software Engineer',
    school: 'Telerik Academy',
    url: 'https://www.telerikacademy.com/',
    location: 'Sofia, Bulgaria',
    note: 'Graduated with excellence',
    details:
      'Highly intensive one-year coding bootcamp concentrated on JavaScript, .NET and related technologies, with a specific focus on high-quality code in practice.',
  },
];

export const skills = [
  {
    group: 'JavaScript / TypeScript',
    items:
      'JavaScript ES6+, TypeScript, React, Next.js, Nest.js, Angular 2+, RxJS, NgRx, Express, Node.js, MongoDB, Mongoose, Jest, Mocha, Chai, ESLint, HTML, CSS',
  },
  {
    group: 'AI / LLM',
    items:
      'LLM-powered product features, Claude Code (custom skills, agentic workflows), OpenAI Codex, Cursor, trigger.dev, prompt/context engineering, retrieval-augmented generation, evaluation pipelines, Claude and OpenAI APIs',
  },
  {
    group: 'Go',
    items: 'Go, echo, go-jet, Ginkgo, Gomega, logrus, zap',
  },
  {
    group: '.NET',
    items:
      'C#, ASP.NET Core, ASP.NET MVC / WebAPI / SignalR, LINQ, Entity Framework (Core), Roslyn, WPF, WCF, xUnit, NUnit, NuGet',
  },
  {
    group: 'Infrastructure & Data',
    items:
      'AWS (Lambda, ECR, SQS, SNS, SES, …), Docker, PostgreSQL, MySQL/MariaDB, MS SQL Server, MongoDB, Redis, REST, GraphQL, OpenAPI, OAuth2, OIDC',
  },
  {
    group: 'Practices',
    items:
      'OOP and design patterns, functional programming, refactoring and code smells, software craftsmanship, agile methodologies, mentoring, technical leadership',
  },
];

export const volunteering = [
  {
    org: 'ABLE',
    url: 'https://www.ablementor.bg/',
    role: 'Mentor',
    details:
      'Sharing knowledge and experience while helping students with projects that influence their personal development.',
  },
  {
    org: 'Telerik Academy',
    url: 'https://www.telerikacademy.com/',
    role: 'Mentor',
    details:
      'Provided technical and career guidance to a group of mentees in the Telerik Academy Alpha programme.',
  },
  {
    org: 'Software University Foundation',
    url: 'https://softuni.foundation/',
    role: 'Technical Writer',
    details:
      'Wrote several chapters for the “Introduction to Programming” books published by the foundation.',
  },
  {
    org: 'Telerik Academy',
    url: 'https://www.telerikacademy.com/',
    role: 'Lecturer and Assistant',
    details:
      'Helped organize the C# Part 2 workshops and assisted students across several C# and web courses.',
  },
];

export const interests = [
  '📚 Reading',
  '🎮 Gaming',
  '🌱 Gardening',
  '🏠 Smart home automation',
  '🏃 Running',
  '🏋️ Fitness',
  '⛰️ Mountain hiking',
];
