import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function usePortfolioMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        ".motion-image",
        { scale: 0.92, opacity: 0.62 },
        {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".featured-grid",
            start: "top 80%",
            end: "bottom 30%",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        ".reveal-word",
        { opacity: 0.16, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: ".scroll-copy",
            start: "top 75%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      );
    });

    return () => context.revert();
  }, []);
}
