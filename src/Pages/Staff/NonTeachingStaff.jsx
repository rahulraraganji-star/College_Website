import PageTemplate from "../../Components/PageTemplate";

const NonTeachingStaff = () => {
  return (
    <PageTemplate
      slug="staff-non-teaching"
      title="Non-Teaching Staff"
      dummyContent={[
        "The non-teaching staff play a vital role in the smooth functioning of the institution.",
        "They provide administrative, technical, and operational support.",
      ]}
    />
  );
};

export default NonTeachingStaff;
