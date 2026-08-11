export const site = {
  name: 'Teodor Kurtev',
  role: 'Senior AI Software Engineer at YuLife',
  pitch:
    'I build AI-powered product features: agentic workflows, LLM evals and the unglamorous engineering that makes them reliable. Behind that sit 10+ years of full-stack development and engineering leadership.',
  email: 'teodor.ivanov92@gmail.com',
  url: 'https://teodorkurtev.com',
  description:
    'Personal site and blog of Teodor Kurtev, Senior AI Software Engineer, writing about AI-assisted engineering, tooling and teams.',
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
