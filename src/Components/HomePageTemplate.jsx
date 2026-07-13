import { useEffect, useState } from "react";

import Hero_Section from "./Hero_Section";
import Events_Section from "./Events_Section";
import CoreStrengths from "./CoreStrengths";
import ScrollingText from "./ScrollingText";
import LearningSpacesCarousel from "./LearningSpacesCarousel";

const HomePageTemplate = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/home")
      .then((res) => res.json())
      .then((resData) => {

        console.log("HOME:", resData);

        // FIX ARRAY RESPONSE
        setData(
          Array.isArray(resData)
            ? resData[0]
            : resData
        );

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div>

      {/* HERO */}
      {data.hero && (
        <Hero_Section data={data.hero} />
      )}

      {/* SCROLLING TEXT */}
      {data.eventsMarquee && (
        <ScrollingText data={data.eventsMarquee} />
      )}

      {/* LEARNING SPACES */}
      {data.heroSection2 && (
        <LearningSpacesCarousel data={data.heroSection2} />
      )}

      {/* EVENTS */}
      {data.eventsSection && (
        <Events_Section data={data.eventsSection} />
      )}

      {/* CORE STRENGTHS */}
      {data.coreStrengths && (
        <CoreStrengths data={data.coreStrengths} />
      )}

    </div>
  );
};

export default HomePageTemplate;