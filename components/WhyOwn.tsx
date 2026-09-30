import type { Dictionary } from "@/content/fr";

export default function WhyOwn({ t }: { t: Dictionary }) {
  const s = t.why;
  return (
    <section aria-labelledby="why-title" className="bg-paper-2 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow text-teal">{s.eyebrow}</p>
        <h2 id="why-title" className="h2 mt-4 max-w-3xl">
          {s.title}
        </h2>
        <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {s.items.map((item) => (
            <li key={item.title} className="border-t-2 border-slate pt-5">
              <h3 className="h3 text-lg">{item.title}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-steel">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
