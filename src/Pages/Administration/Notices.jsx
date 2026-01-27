import PageTemplate from "../../Components/PageTemplate";

const Notices = () => {
  return (
    <PageTemplate
      slug="administration-notices"
      title="Notices & Announcements"
      dummyContent={[
        "This section provides official notices and announcements related to administrative activities.",
        "Students, staff, and stakeholders are advised to check this page regularly for updates.",
      ]}
    />
  );
};

export default Notices;
