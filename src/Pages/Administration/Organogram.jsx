import PageTemplate from "../../Components/PageTemplate"


const Organogram = () => {
  return (
    <PageTemplate
      slug="administration-organogram"
      title="Organogram"
      dummyContent={[
        "The organizational structure of the institution defines roles, responsibilities, and reporting relationships.",
        "It ensures clarity in governance and efficient administrative functioning.",
      ]}
    />
  );
};

export default Organogram;