import PageTemplate from "../../Components/PageTemplate"

const Committees = () => {
  return (
    <PageTemplate
      slug="administration-committees"
      title="College Committees"
      dummyContent={[
        "Various statutory and non-statutory committees support the academic and administrative activities of the institution.",
        "These committees ensure quality assurance, student welfare, and compliance with regulatory requirements.",
      ]}
    />
  );
};

export default Committees;