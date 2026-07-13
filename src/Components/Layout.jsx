import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/settings")
      .then((res) => res.json())
      .then((data) => {
        console.log("SETTINGS:", data); // DEBUG
        setSettings(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 🚨 VERY IMPORTANT
  if (!settings) return <div>Loading layout...</div>;

  return (
    <>
      <Header data={settings.header} />
      {children}
      <Footer data={settings.footer} />
    </>
  );
};

export default Layout;