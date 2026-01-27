import { useParams } from "react-router-dom";
import PageTemplate from "../../../Components/PageTemplate";

const Outcomes = () => {
  const { programme } = useParams();

  const dummyOutcomes = {
    ba: [
      "Develop critical thinking and analytical skills",
      "Enhance communication and social awareness",
    ],
    bcom: [
      "Understand business and financial systems",
      "Apply accounting and management principles",
    ],
    bca: [
      "Apply programming concepts to solve problems",
      "Understand computer systems and software design",
    ],
  };

  return (
    <PageTemplate
      slug={`academics-${programme}-outcomes`}
      title={`${programme.toUpperCase()} – Programme Outcomes`}
      dummyContent={dummyOutcomes[programme] || ["No outcomes available"]}
    />
  );
};

export default Outcomes;
