import { useEffect, useState } from "react";

import Hero_Section from "./Hero_Section";
import Events_Section from "./Events_Section";
import CoreStrengths from "./CoreStrengths";
import ScrollingText from "./ScrollingText";
import LearningSpacesCarousel from "./LearningSpacesCarousel";
import NoticesSection from "./NoticesSection";

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

  // Extract sections from the data object
  const sections = data.sections || {};
  console.log("NOTICES SECTION:", sections.notices);

  return (
    <div>
      {/* HERO */}
      {sections.hero && (
        <Hero_Section data={sections.hero} />
      )}

      {/* SCROLLING TEXT */}
      {sections.eventsMarquee && (
        <ScrollingText data={sections.eventsMarquee} />
      )}


      {/* NOTICES */}
      {sections.notices && (
        <NoticesSection data={sections.notices} />
      )}

      {/* LEARNING SPACES */}
      {sections.heroSection2 && (
        <LearningSpacesCarousel data={sections.heroSection2} />
      )}

      {/* EVENTS */}
      {sections.eventsSection && (
        <Events_Section data={sections.eventsSection} />
      )}

      {/* CORE STRENGTHS */}
      {sections.coreStrengths && (
        <CoreStrengths data={sections.coreStrengths} />
      )}
    </div>
  );
};

export default HomePageTemplate;