import type { PortfolioCopy } from "./copy";

export function CategoryStory({ copy }: { copy: PortfolioCopy }) {
  return (
    <section id="categories" className="scroll-copy px-5 py-24 sm:px-8 md:py-36 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <h2 className="text-4xl font-semibold leading-tight text-zinc-950 md:text-6xl">{copy.categories}</h2>
        <p className="text-2xl leading-relaxed text-zinc-700">
          {copy.categoryStory}
        </p>
      </div>
    </section>
  );
}
