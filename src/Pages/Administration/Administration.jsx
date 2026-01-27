import PageTemplate from "../../Components/PageTemplate";

const Administration = () => {
  return (
    <PageTemplate
      slug="administration"
      title="Administration"
      dummyContent={[
        "The administration of the college ensures effective governance, transparent decision-making, and smooth academic and administrative functioning.",
        "It plays a crucial role in policy implementation, institutional planning, and coordination among various academic and non-academic units.",
      ]}
    />
  );
};

export default Administration;
