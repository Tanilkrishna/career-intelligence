module.exports = [
  {
    title: "SaaS Analytics Dashboard",
    description: "Build a fullstack dashboard with authentication, charts, and a RESTful API. Perfect for proving frontend state management and backend architecture.",
    targetSkills: ['React', 'Node.js', 'MongoDB', 'Express'], // These are names; seed script will map to IDs
    difficulty: "Intermediate",
    difficultyScore: 50, // Roughly aligns with a user score around ~500
    tags: ["Fullstack", "SaaS", "Dashboard"],
    requirements: [
      "JWT authentication",
      "REST API design",
      "Data visualization (e.g. Recharts)",
      "Responsive layout using Tailwind CSS"
    ]
  },
  {
    title: "Real-time Chat Application",
    description: "Develop a scalable, low-latency chat application using WebSockets and an Express backend.",
    targetSkills: ['Node.js', 'Express', 'React'],
    difficulty: "Advanced",
    difficultyScore: 75,
    tags: ["WebSockets", "Real-time", "Backend"],
    requirements: [
      "Socket.io integration",
      "Event-driven architecture",
      "Message persistence in MongoDB",
      "User presence tracking"
    ]
  },
  {
    title: "Static Portfolio Website",
    description: "A lightweight, heavily optimized personal portfolio website to showcase your work.",
    targetSkills: ['React', 'Tailwind CSS'],
    difficulty: "Beginner",
    difficultyScore: 20,
    tags: ["Frontend", "UI/UX", "Performance"],
    requirements: [
      "Lighthouse score > 90",
      "Custom React hooks",
      "CSS Grid / Flexbox layouts",
      "Dark mode toggle"
    ]
  }
];
