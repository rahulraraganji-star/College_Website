import { useParams } from "react-router-dom";
import PageTemplate from "../../../Components/PageTemplate";

const Syllabus = () => {
  const { programme } = useParams();

  const dummySyllabus = {
    ba: [
      "Semester I – English, History, Political Science",
      "Semester II – Sociology, Economics",
    ],
    bcom: [
      "Semester I – Financial Accounting, Business Maths",
      "Semester II – Corporate Law, Economics",
    ],
    bca: [
      "Semester I – C Programming, Digital Logic",
      "Semester II – Data Structures, OS",
    ],
  };

  return (
    <PageTemplate
      slug={`academics-${programme}-syllabus`}
      title={`${programme.toUpperCase()} – Syllabus`}
      dummyContent={dummySyllabus[programme] || ["No syllabus available"]}
    />
  );
};

export default Syllabus;
