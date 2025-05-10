import { useNavigate } from "react-router-dom";
import "../css/ProjectOption.css";

function ProjectOption({ option }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (option.title === "Learning Project") {
      navigate("/learning-projects");
    }
  };

  return (
    <div className="project-option" onClick={handleClick} style={{ cursor: "pointer" }}>
      <img src={option.image} alt={option.title} className="project-image" />
      <h2>{option.title}</h2>
      <p>{option.description}</p>
    </div>
  );
}

export default ProjectOption;
