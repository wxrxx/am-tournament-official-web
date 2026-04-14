"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const FULL_TEXT = "AM TOURNAMENT";
const TYPING_SPEED = 110;
const START_DELAY = 400;

export default function HeroSection() {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [doneTyping, setDoneTyping] = useState(false);
  const indexRef = useRef(0);

  // Typewriter
  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        const next = indexRef.current + 1;
        setDisplayed(FULL_TEXT.slice(0, next));
        indexRef.current = next;
        if (next >= FULL_TEXT.length) {
          clearInterval(iv);
          setDoneTyping(true);
        }
      }, TYPING_SPEED);
      return () => clearInterval(iv);
    }, START_DELAY);
    return () => clearTimeout(t);
  }, []);

  // Cursor blink
  useEffect(() => {
    const iv = setInterval(() => setShowCursor((v) => !v), 520);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className="flex items-center justify-center bg-background" style={{ minHeight: "88vh" }}>
      <div className="text-center px-6 max-w-4xl mx-auto pt-20 pb-12 select-none">
        {/* Label */}
        <p className="text-primary text-[10px] font-semibold tracking-[0.45em] uppercase mb-10 opacity-70">
          ฤดูกาล 2026
        </p>

        {/* Headline */}
        <h1
          className="font-bold text-foreground leading-none mb-6 tracking-widest"
          style={{ fontSize: "clamp(2rem, 5.5vw, 4.5rem)" }}
        >
          {displayed}
          <span
            className="inline-block w-[4px] bg-primary ml-1 align-middle"
            style={{
              height: "0.78em",
              opacity: showCursor ? 1 : 0,
              transition: "opacity 0.08s",
            }}
          />
        </h1>

        {/* Tagline */}
        <p
          className="text-muted-foreground text-base md:text-lg font-light mb-14 transition-all duration-700"
          style={{
            opacity: doneTyping ? 1 : 0,
            transform: doneTyping ? "translateY(0)" : "translateY(8px)",
          }}
        >
          ทัวร์นาเมนต์ฟุตบอลสมัครเล่นที่ใหญ่ที่สุดในจังหวัดสตูล
        </p>

        {/* CTA */}
        <div
          className="flex justify-center gap-4 transition-all duration-700"
          style={{
            opacity: doneTyping ? 1 : 0,
            transform: doneTyping ? "translateY(0)" : "translateY(10px)",
            transitionDelay: "120ms",
          }}
        >
          <Link
            href="/gallery"
            className="px-8 py-3 bg-primary text-black text-sm font-semibold rounded-sm hover:bg-yellow-300 transition-colors"
          >
            ดูแกลเลอรี่รูป
          </Link>
          <Link
            href="/shop"
            className="px-8 py-3 border border-border text-foreground text-sm font-semibold rounded-sm hover:border-foreground/50 transition-colors"
          >
            ร้านค้า
          </Link>
        </div>
      </div>
    </section>
  );
}
