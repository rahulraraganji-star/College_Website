import { useParams } from "react-router-dom";
import PageTemplate from "../Components/PageTemplate";

const DynamicPage = () => {
  const { slug } = useParams();

  return <PageTemplate slug={slug} />;
};

export default DynamicPage;
 