import { Outlet } from "react-router-dom";

const IqacLayout = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-semibold mb-8">
        Internal Quality Assurance Cell (IQAC)
      </h1>

      <main>
        <Outlet />
      </main>
    </section>
  );
};

export default IqacLayout;
