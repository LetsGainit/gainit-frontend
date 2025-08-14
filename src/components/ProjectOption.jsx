import { useNavigate } from "react-router-dom";
import OptionCard from "./OptionCard";

function ProjectOption({ option }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (option.title === "Learning Project") {
      navigate("/home-page");
    }
  };

  return (
    <OptionCard
      title={option.title}
      description={option.description}
      imageSrc={option.image}
      onClick={handleClick}
    />
  );
}

export default ProjectOption;
