/**
 * Initial content for the portfolio. Run `npm run seed` to load it; after that,
 * everything is edited from the admin dashboard and this file is not used again.
 *
 * Skill icons are simple-icons slugs (https://simpleicons.org) or `lucide:<name>`;
 * the client falls back to a generic icon for anything it doesn't recognise.
 */

const month = (ym: string) => new Date(`${ym}-01T00:00:00.000Z`);

export const settings = {
  profile: {
    name: 'Bishwa Bandhu Parmar',
    title: 'Full Stack Engineer',
    company: 'CypherSol Fintech India Pvt. Ltd.',
    companyUrl: '',
    tagline: 'Full Stack Engineer building reliable web products with React, Node.js, and Python.',
    bio:
      'Computer Science graduate (B.Tech, 2026) and Full Stack Engineer at CypherSol Fintech, where I converted to ' +
      'full-time after an internship. I have completed three software internships and built four full-stack products ' +
      'solo, all deployed live. I work across React, Next.js, Node.js, Python (FastAPI, Django), MongoDB, and ' +
      'PostgreSQL, and I have solved 1,500+ DSA problems on LeetCode and GeeksforGeeks.',
    location: 'Patna, Bihar, India',
    availability: 'Open to SDE roles at product-based companies',
    openToWork: true,
    email: 'bishwabandhuparmar06@gmail.com',
    phone: '+91 9142364660',
    showPhone: false,
    photo: null,
  },
  stats: [
    { label: 'Software internships', value: '3' },
    { label: 'Live products', value: '4' },
    { label: 'DSA problems solved', value: '1,500+' },
  ],
  sections: {
    about: { eyebrow: 'About', title: 'Engineer who ships end to end', description: '' },
    experience: { eyebrow: 'Experience', title: "Where I've worked", description: '' },
    projects: {
      eyebrow: 'Projects',
      title: "Products I've built and shipped",
      description:
        'Each one is designed, built and deployed solo, and every one is live. Open a project to see its features and architecture.',
    },
    skills: { eyebrow: 'Skills', title: 'Tools I use every day', description: '' },
    coding: {
      eyebrow: 'Problem solving',
      title: '{total}+ DSA problems solved',
      description: 'Consistent daily practice in data structures and algorithms on LeetCode and GeeksforGeeks.',
    },
    education: { eyebrow: 'Education', title: 'Education & certifications', description: '' },
    contact: {
      eyebrow: 'Contact',
      title: "Let's build something together",
      description:
        "I'm open to SDE roles at product-based companies. Recruiters, engineers and founders: send a message and I'll reply within a day.",
    },
  },
  theme: {
    preset: 'indigo-cyan' as const,
    dark: { primary: '#6366F1', secondary: '#22D3EE' },
    light: { primary: '#4F46E5', secondary: '#0891B2' },
    defaultMode: 'dark' as const,
  },
  seo: {
    title: 'Bishwa Bandhu Parmar | Full Stack Engineer',
    description:
      'Full Stack Engineer building reliable web products with React, Next.js, Node.js, and Python. ' +
      'See my projects, experience, and coding profiles.',
    keywords: [
      'Bishwa Bandhu Parmar',
      'Full Stack Engineer',
      'Software Engineer',
      'React',
      'Next.js',
      'Node.js',
      'Python',
      'Portfolio',
    ],
    ogImage: null,
  },
};

export const socialLinks = [
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/bishwabandhu06/' },
  { platform: 'github', label: 'GitHub', url: 'https://github.com/bishwa-bandhu-parmar-06' },
  { platform: 'leetcode', label: 'LeetCode', url: 'https://leetcode.com/u/bishwabandhu06/' },
  {
    platform: 'geeksforgeeks',
    label: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/profile/bishwabandhu06?tab=activity',
  },
  { platform: 'x', label: 'X (Twitter)', url: 'https://twitter.com/bishwabandhu06' },
  { platform: 'fiverr', label: 'Fiverr', url: 'https://www.fiverr.com/s/yvzo745' },
] as const;

export const experience = [
  {
    company: 'CypherSol Fintech India Pvt. Ltd.',
    location: 'Pune / Mumbai, India',
    workMode: 'remote',
    roles: [
      { title: 'Full Stack Engineer', startDate: month('2026-07'), endDate: null },
      {
        title: 'Full Stack Developer Intern',
        startDate: month('2025-10'),
        endDate: month('2026-06'),
        note: 'Converted to full-time',
      },
    ],
    bullets: [
      'Build cross-platform desktop applications for internal teams using Electron.js and React.',
      'Develop REST APIs in Python with FastAPI and Django, using SQLite for local data storage.',
      'Take part in team code reviews and share regular progress updates with team leads.',
    ],
  },
  {
    company: 'Bytical.ai',
    location: 'Gurugram / Noida / Delhi, India',
    workMode: 'remote',
    roles: [{ title: 'Full Stack Developer Intern', startDate: month('2025-07'), endDate: month('2025-09') }],
    bullets: [
      'Developed backend APIs with Python, Django, and FastAPI, integrated with React frontend components.',
      'Secured a multi-tenant application with JWT authentication and role-based access control (RBAC).',
      'Optimized database queries and ORM usage on frequently used API endpoints.',
    ],
  },
  {
    company: 'LYSS Technology Pvt. Ltd.',
    location: '',
    workMode: 'remote',
    roles: [{ title: 'Frontend Developer', startDate: month('2025-05'), endDate: month('2025-07') }],
    bullets: [
      'Created dynamic, responsive user interfaces with React.js.',
      'Collaborated with designers to turn UI designs into working components.',
    ],
  },
  {
    company: 'Androwebstech Pvt. Ltd.',
    location: 'Bihar, India',
    workMode: 'remote',
    roles: [{ title: 'Backend Developer Intern', startDate: month('2025-05'), endDate: month('2025-07') }],
    bullets: [
      'Created RESTful APIs with Node.js, Express.js, and TypeScript on MongoDB for client-facing modules.',
      'Integrated WebSocket-based real-time communication between client and server.',
      'Improved query performance using MongoDB indexing and query restructuring.',
    ],
  },
] as const;

export const projects = [
  {
    slug: 'bhojanqr',
    title: 'BhojanQR',
    subtitle: 'Multi-Tenant Restaurant Ordering SaaS',
    summary:
      'Restaurants generate a QR code per table; diners scan, order, and pay with Razorpay without installing an app.',
    date: month('2025-04'),
    featured: true,
    liveUrl: 'https://www.bhojanqr.com/',
    githubUrl: 'https://github.com/bishwa-bandhu-parmar-06/BhojanQR',
    techTags: ['React', 'Node.js', 'Express', 'Docker', 'CI/CD', 'Razorpay', 'React Native'],
    features: [
      'Restaurants register, get admin approval, manage menus, and generate a QR code per table.',
      'Customers scan, add items to cart, and pay via Razorpay without installing an app.',
      'Real-time orders on the restaurant dashboard with order-status management and analytics.',
      'Dockerized backend deployed on Render through a CI/CD pipeline; frontend on Vercel.',
      'Mobile-first PWA with a 95+ Lighthouse performance score; Android app in Google Play closed testing.',
    ],
    description:
      'BhojanQR is a multi-tenant SaaS that replaces paper menus and waiter round-trips. Each restaurant gets its own ' +
      'menu, tables, and dashboard, and every table gets a QR code. Diners scan it, browse the menu, add items to a ' +
      'cart, and pay online through Razorpay, all in the browser.\n\n' +
      'I built it solo, from the customer PWA and the restaurant dashboard to the API, deployment pipeline, and an ' +
      'Android app built with React Native.',
    architecture:
      '- **Customer app:** mobile-first React PWA (95+ Lighthouse performance), hosted on Vercel.\n' +
      '- **Restaurant dashboard:** live order feed, order-status updates, and menu and order analytics.\n' +
      '- **API:** Node.js + Express, containerized with Docker and deployed to Render through a CI/CD pipeline.\n' +
      '- **Payments:** Razorpay checkout.\n' +
      '- **Mobile:** React Native Android app, in Google Play closed testing.',
  },
  {
    slug: 'gayarent',
    title: 'GayaRent',
    subtitle: 'Property Rental Marketplace',
    summary:
      'Rental marketplace with Tenant, Owner, and Admin roles, "near me" search, and raw SQL on PostgreSQL.',
    date: month('2026-05'),
    featured: true,
    liveUrl: 'https://gaya-rent.onrender.com/',
    githubUrl: 'https://github.com/bishwa-bandhu-parmar-06/Gaya_Rent',
    techTags: ['Next.js 14', 'Express', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'shadcn/ui', 'Redux Toolkit', 'NextAuth'],
    features: [
      'Tenant, Owner, and Admin roles, with admin approval of owners and CSV bulk upload of listings.',
      'All queries written as raw SQL with the pg driver, without an ORM.',
      'Geolocation "near me" search, Google OAuth login, and direct call/WhatsApp contact with owners.',
    ],
    description:
      'GayaRent connects tenants with property owners. Owners are approved by an admin before they can list, can ' +
      'upload listings in bulk from a CSV file, and are reachable directly by call or WhatsApp. Tenants can search ' +
      'for properties near their current location.',
    architecture:
      '- **Frontend:** Next.js 14 App Router with Tailwind CSS and shadcn/ui; client state in Redux Toolkit with Redux Persist.\n' +
      '- **Auth:** Google OAuth through NextAuth.\n' +
      '- **API:** Express on Node.js.\n' +
      '- **Database:** PostgreSQL on Supabase, queried with hand-written SQL through the `pg` driver (no ORM).',
  },
  {
    slug: 'aatura',
    title: 'AATURA',
    subtitle: 'Doctor Appointment Booking System',
    summary:
      'Search doctors, hospitals, or conditions and book appointments, with dashboards for four roles.',
    date: month('2025-05'),
    featured: true,
    liveUrl: 'https://hospital-management-smoky-kappa.vercel.app/',
    githubUrl: 'https://github.com/bishwa-bandhu-parmar-06/Hospital-Management',
    techTags: ['MongoDB', 'Express', 'React', 'Node.js', 'JWT', 'k6'],
    features: [
      'Search by doctor, hospital, or condition and book appointments.',
      'Dashboards for Admin, Doctor, Patient, and Hospital roles; email-OTP and JWT authentication.',
      'Backend load-tested with k6 at 200+ concurrent virtual users.',
    ],
    description:
      'AATURA lets patients find the right doctor by name, hospital, or condition and book an appointment. Doctors, ' +
      'hospitals, and admins each get their own dashboard, and every role signs in with an email OTP.',
    architecture:
      '- **Frontend:** React with four role-based dashboards and protected routes.\n' +
      '- **API:** Node.js + Express with email-OTP and JWT authentication.\n' +
      '- **Database:** MongoDB.\n' +
      '- **Load testing:** k6 at 200+ concurrent virtual users.',
  },
  {
    slug: 'martxpress',
    title: 'MartXpress',
    subtitle: 'Multi-Vendor E-Commerce Marketplace',
    summary: 'Marketplace where approved sellers list products and customers browse, wishlist, and order.',
    date: month('2025-11'),
    featured: false,
    liveUrl: 'https://martxpress.onrender.com/',
    githubUrl: 'https://github.com/bishwa-bandhu-parmar-06/martXpress',
    techTags: ['MongoDB', 'Express', 'React', 'Node.js', 'Cloudinary'],
    features: [
      'Admin approves sellers, sellers list products, customers browse, wishlist, and order.',
      'JWT authentication, role-protected routes, input validation, and rate limiting; payments in test mode.',
    ],
    description:
      'MartXpress is a multi-vendor marketplace with three roles. Sellers apply and are approved by an admin, then ' +
      'list their products; customers browse, save items to a wishlist, and place orders.',
    architecture:
      '- **Frontend:** React.\n' +
      '- **API:** Node.js + Express with JWT auth, role-protected routes, input validation, and rate limiting.\n' +
      '- **Database:** MongoDB; product images on Cloudinary.\n' +
      '- **Payments:** test mode.',
  },
];

export const skillGroups = [
  {
    name: 'Languages',
    skills: [
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'Python', icon: 'python' },
      { name: 'SQL', icon: 'lucide:database' },
    ],
  },
  {
    name: 'Frontend',
    skills: [
      { name: 'React.js', icon: 'react' },
      { name: 'Next.js', icon: 'nextdotjs' },
      { name: 'Redux Toolkit', icon: 'redux' },
      { name: 'Tailwind CSS', icon: 'tailwindcss' },
      { name: 'shadcn/ui', icon: 'shadcnui' },
      { name: 'React Native', icon: 'react' },
      { name: 'HTML5', icon: 'html5' },
      { name: 'CSS3', icon: 'css' },
    ],
  },
  {
    name: 'Backend',
    skills: [
      { name: 'Node.js', icon: 'nodedotjs' },
      { name: 'Express.js', icon: 'express' },
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'Django', icon: 'django' },
      { name: 'REST APIs', icon: 'lucide:server' },
      { name: 'JWT', icon: 'jsonwebtokens' },
      { name: 'OAuth 2.0', icon: 'lucide:key-round' },
      { name: 'WebSockets', icon: 'lucide:radio' },
    ],
  },
  {
    name: 'Databases',
    skills: [
      { name: 'MongoDB', icon: 'mongodb' },
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'SQLite', icon: 'sqlite' },
    ],
  },
  {
    name: 'Tools & Platforms',
    skills: [
      { name: 'Docker', icon: 'docker' },
      { name: 'CI/CD', icon: 'githubactions' },
      { name: 'Git', icon: 'git' },
      { name: 'GitHub', icon: 'github' },
      { name: 'Linux', icon: 'linux' },
      { name: 'Postman', icon: 'postman' },
      { name: 'Electron.js', icon: 'electron' },
      { name: 'Vercel', icon: 'vercel' },
      { name: 'Render', icon: 'render' },
      { name: 'AWS S3', icon: 'lucide:cloud' },
      { name: 'k6', icon: 'k6' },
    ],
  },
  {
    name: 'CS Fundamentals',
    skills: [
      { name: 'Data Structures & Algorithms', icon: 'lucide:binary' },
      { name: 'OOP', icon: 'lucide:boxes' },
      { name: 'DBMS', icon: 'lucide:database' },
      { name: 'Operating Systems', icon: 'lucide:cpu' },
      { name: 'Computer Networks', icon: 'lucide:network' },
    ],
  },
];

export const education = [
  {
    institution: 'Gaya College of Engineering',
    university: 'Bihar Engineering University',
    degree: 'B.Tech',
    field: 'Computer Science and Engineering',
    startYear: 2022,
    endYear: 2026,
    grade: 'CGPA 8.13/10',
  },
];

export const certifications = [
  {
    name: 'Google Cybersecurity Professional Certificate',
    issuer: 'Google',
    platform: 'Coursera',
    date: null,
    url: 'https://www.coursera.org/account/accomplishments/specialization/certificate/ELVAELDJ76GE',
  },
  {
    name: 'Introduction to Generative AI',
    issuer: 'Google Cloud',
    platform: 'Simplilearn SkillUp',
    date: month('2026-09'),
    url:
      'https://www.simplilearn.com/skillup-certificate-landing?token=eyJjb3Vyc2VfaWQiOiIzODA3IiwiY2VydGlmaWNhdGVfdXJsIjoiaHR0cHM6XC9cL2NlcnRpZmljYXRlcy5zaW1wbGljZG4ubmV0XC9zaGFyZVwvMTA3Mjk5NTZfMTEwODkzNjBfMTc4OTMyMDk0NTI3OS5wbmciLCJ1c2VybmFtZSI6IkJpc2h3YSBCYW5kaHUgUGFybWFyIn0%3D',
  },
  {
    name: 'Postman API Fundamentals Student Expert',
    issuer: 'Postman',
    platform: '',
    date: null,
    url: '',
  },
];

export const codingProfiles = [
  {
    platform: 'leetcode',
    username: 'bishwabandhu06',
    url: 'https://leetcode.com/u/bishwabandhu06/',
    totalSolved: 837,
    breakdown: { easy: 225, medium: 449, hard: 163 },
    highlights: [{ label: 'Badge', value: '500 Days' }],
  },
  {
    platform: 'geeksforgeeks',
    username: 'bishwabandhu06',
    url: 'https://www.geeksforgeeks.org/profile/bishwabandhu06?tab=activity',
    totalSolved: 710,
    breakdown: { easy: null, medium: null, hard: null },
    highlights: [
      { label: 'Coding score', value: '2,834' },
      { label: 'Institute rank', value: '#5' },
      { label: 'Longest streak', value: '480 days' },
    ],
  },
] as const;
