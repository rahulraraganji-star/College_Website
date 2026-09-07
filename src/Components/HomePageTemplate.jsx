import { useEffect, useState } from "react";

import Hero_Section from "./Hero_Section";
import Events_Section from "./Events_Section";
import CoreStrengths from "./CoreStrengths";
import ScrollingText from "./ScrollingText";
import LearningSpacesCarousel from "./LearningSpacesCarousel";
import NoticesSection from "./NoticesSection";
import LoadingScreen from "./LoadingScreen";

let clientHomeCache = null;

const HomePageTemplate = () => {
  const [data, setData] = useState(() => clientHomeCache || null);
  const [loading, setLoading] = useState(() => !clientHomeCache);

  useEffect(() => {
    let isCurrent = true;
    fetch("/api/home")
      .then((res) => res.json())
      .then((resData) => {
        if (!isCurrent) return;
        const normalized = Array.isArray(resData) ? resData[0] : resData;
        clientHomeCache = normalized;
        setData(normalized);
        setLoading(false);
      })
      .catch((error) => {
        if (!isCurrent) return;
        console.error(error);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen text="Loading Fragnel College..." />;
  }

  if (!data) {
    return <div>No data</div>;
  }

  // Extract sections from the data object
  const sections = data.sections || {};

  return (
    <div className="page-transition">
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