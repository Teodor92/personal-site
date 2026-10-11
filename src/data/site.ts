export const site = {
  name: 'Teodor Kurtev',
  role: 'Senior Applied AI Software Engineer at YuLife',
  pitch:
    'I build AI-powered product features: agentic workflows, LLM evals and the unglamorous engineering that makes them reliable. Behind that sit 10+ years of full-stack development and engineering leadership.',
  // One line of hard evidence under the pitch; figures from the public CV (cv.ts, Deel).
  proof:
    'Before YuLife I was an Engineering Manager at Deel: 13 direct reports, 4 new teams and billing features behind $2M in monthly revenue.',
  // What a visitor can get in touch about, shown under the hero's proof line.
  openTo: 'Open to roles, consulting, talks and collaborations in applied AI.',
  email: 'teodor.ivanov92@gmail.com',
  url: 'https://teodorkurtev.com',
  description:
    'Teodor Kurtev builds reliable AI product features: agentic workflows, LLM evals and the engineering behind them. CV, writing and how to get in touch.',
  cfAnalyticsToken: '17476ee016ba4519a0abad0663853a5e',
  avatar: '/assets/images/bio-photo.jpg',
  socials: [
    { label: 'GitHub', url: 'https://github.com/Teodor92', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/teodorkurtev/', icon: 'linkedin' },
    {
      label: 'StackOverflow',
      url: 'https://stackoverflow.com/users/2109394/teodor-kurtev/',
      icon: 'stackoverflow',
    },
    { label: 'Email', url: 'mailto:teodor.ivanov92@gmail.com', icon: 'email' },
  ],
} as const;

export type SocialIcon = (typeof site.socials)[number]['icon'];
