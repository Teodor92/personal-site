export const site = {
  name: 'Teodor Kurtev',
  role: 'Senior AI Software Engineer at YuLife',
  pitch:
    'Full-stack engineer and engineering leader with 10+ years across TypeScript, Node.js, Go and .NET — currently building AI-powered features for insurance that inspires healthier living.',
  email: 'teodor.ivanov92@gmail.com',
  url: 'https://teodorkurtev.com',
  description:
    'Personal site and blog of Teodor Kurtev — Senior AI Software Engineer, writing about software engineering, tooling and teams.',
  gaId: 'G-36DYRPWC2M',
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
