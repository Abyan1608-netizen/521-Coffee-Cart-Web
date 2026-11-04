import { useEffect, useState, type ReactNode } from "react";

type Props = { delay?: number; duration?: number; className?: string; children: ReactNode };

/** Mulai transparan, lalu muncul setelah `delay` ms selama `duration` ms. */
export default function FadeIn({ delay = 0, duration = 1000, className = "", children }: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-opacity ${show ? "opacity-100" : "opacity-0"} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
