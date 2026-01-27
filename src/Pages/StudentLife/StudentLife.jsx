import PageTemplate from "../../Components/PageTemplate";

const StudentLife = () => {
  return (
    <PageTemplate
      slug="student-life"
      title="Student Life"
      dummyContent={[
        "Student life at the college extends beyond classrooms, offering opportunities for holistic development, leadership, and community engagement.",
        "Through clubs, sports, support services, and co-curricular activities, students are encouraged to explore their interests and build essential life skills.",
      ]}
    />
  );
};

export default StudentLife;
