import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import StaffCard from "../Components/StaffCard";

const FacultyPage = () => {
  const { type } = useParams();

  const [staff, setStaff] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/pages/${type}`)
      .then((res) => res.json())
      .then((data) => {

        setTitle(data.title);

        const listSection = data.sections.find(
          (section) => section.type === "list"
        );

        if (listSection) {
          setStaff(listSection.items);
        }
      });

  }, [type]);

  return (
    <div>

      <h2 className="text-2xl font-semibold mb-6">
        {title}
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

       {staff.map((item, index) => {

  const parts = item.split(" – ");

  const person = {
    name: parts[0],
    designation: parts[1],
    photo: "/placeholder.jpg"
  };

  return (
    <StaffCard
      key={index}
      staff={person}
    />
  );

})}

      </div>

    </div>
  );
};

export default FacultyPage;