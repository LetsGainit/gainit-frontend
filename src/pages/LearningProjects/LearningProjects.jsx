import { Search } from "lucide-react";
import ProjectCard from "../../components/ProjectCard";
import Footer from "../../components/Footer";
import "../../css/LearningProjects.css";

function LearningProjects() {
  // Sample projects data - replace with actual data from your backend
  const projects = [
    {
      id: 1,
      title: "Build a Full-Stack Web App",
      description: "Create a modern web application using React and Node.js",
      technologies: ["React", "Node.js", "MongoDB"],
      difficulty: "Intermediate",
      duration: "4 weeks"
    },
    {
      id: 2,
      title: "Machine Learning Basics",
      description: "Learn the fundamentals of machine learning with Python",
      technologies: ["Python", "TensorFlow", "Scikit-learn"],
      difficulty: "Beginner",
      duration: "6 weeks"
    },
    {
      id: 3,
      title: "Mobile App Development",
      description: "Build a cross-platform mobile app using React Native",
      technologies: ["React Native", "JavaScript", "Firebase"],
      difficulty: "Advanced",
      duration: "8 weeks"
    }
  ];

  return (
    <div className="learning-projects">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-headline">Let’s make your skills shine. Gain real experience today.</h1>
        <p className="hero-subheading">
          Discover projects that match your interests and skills
        </p>
          {/* Search Bar */}
          <div className="search-container">
          <input
            type="text"
            placeholder="Search projects, technologies..."
            className="search-input"
          />
          <button className="search-button">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
      
        {/* Projects Grid */}
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LearningProjects; 