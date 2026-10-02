import { useEffect, useState } from "react";

import Hero_Section from "./Hero_Section";
import Events_Section from "./Events_Section";
import CoreStrengths from "./CoreStrengths";
import ScrollingText from "./ScrollingText";
import LearningSpacesCarousel from "./LearningSpacesCarousel";
import NoticesSection from "./NoticesSection";
import PrincipalMessageSection from "./PrincipalMessageSection";
import LoadingScreen from "./LoadingScreen";
import { getClientHomeCache, setClientHomeCache } from "../utils/homeCache";

const HomePageTemplate = () => {
  const [data, setData] = useState(() => getClientHomeCache() || null);
  const [loading, setLoading] = useState(() => !getClientHomeCache());

  useEffect(() => {
    let isCurrent = true;
    fetch("/api/home", { cache: "no-store" })
      .then((res) => res.json())
      .then((resData) => {
        if (!isCurrent) return;
        const normalized = Array.isArray(resData) ? resData[0] : resData;
        setClientHomeCache(normalized);
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

      {/* PRINCIPAL'S MESSAGE */}
      {sections.principalMessage && (
        <PrincipalMessageSection data={sections.principalMessage} />
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