import { useEffect, useState } from "react";

type Props = { text: string; className?: string; startDelay?: number; charDelay?: number; style?: React.CSSProperties };

/** Judul yang muncul huruf demi huruf (geser dari kiri 18px + memudar). Baris dipisah dengan \n. */
export default function AnimatedHeading({ text, className = "", startDelay = 200, charDelay = 30, style }: Props) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);
  const lines = text.split("\n");
  return (
    <h1 className={className} style={style} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {Array.from(line).map((ch, ci) => (
            <span
              key={ci}
              className="inline-block"
              style={{
                opacity: go ? 1 : 0,
                transform: go ? "translateX(0)" : "translateX(-18px)",
                transition: "opacity 500ms ease, transform 500ms ease",
                transitionDelay: `${li * line.length * charDelay + ci * charDelay}ms`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
