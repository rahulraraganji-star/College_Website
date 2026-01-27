import { useParams } from "react-router-dom";
import PageTemplate from "../../../Components/PageTemplate";

const Subjects = () => {
  const { programme } = useParams();

  const dummySubjects = {
    ba: [
      "English Literature",
      "History",
      "Political Science",
    ],
    bcom: [
      "Financial Accounting",
      "Business Economics",
      "Corporate Law",
    ],
    bca: [
      "Programming in C",
      "Data Structures",
      "Operating Systems",
    ],
  };

  return (
    <PageTemplate
      slug={`academics-${programme}-subjects`}
      title={`${programme.toUpperCase()} – Subjects`}
      dummyContent={dummySubjects[programme] || ["No subjects available"]}
    />
  );
};

export default Subjects;
