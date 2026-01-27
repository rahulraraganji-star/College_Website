import AboutLayout from "../Layouts/AboutLayout";
import DynamicPage from "../Pages/DynamicPage";

const AboutRoutes = {
  path: "about",
  element: <AboutLayout />,
  children: [
    {
      path: ":slug",
      element: <DynamicPage />
    }
  ]
};

export default AboutRoutes;
