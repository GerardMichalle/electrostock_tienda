
import type { ReactNode } from "react";



const hstripes = (colors: string[]): ReactNode =>
  colors.map((c, i) => (
    <rect key={i} x={0} y={(i * 3) / colors.length} width={4} height={3 / colors.length} fill={c} />
  ));

const vstripes = (colors: string[]): ReactNode =>
  colors.map((c, i) => (
    <rect key={i} x={(i * 4) / colors.length} y={0} width={4 / colors.length} height={3} fill={c} />
  ));

const weighted = (bands: [string, number][]): ReactNode => {
  const total = bands.reduce((s, [, w]) => s + w, 0);
  let y = 0;
  return bands.map(([c, w], i) => {
    const h = (3 * w) / total;
    const rect = <rect key={i} x={0} y={y} width={4} height={h} fill={c} />;
    y += h;
    return rect;
  });
};



const FLAGS: Record<string, ReactNode> = {
  pe: (
    <>
      <rect width={4} height={3} fill="#fff" />
      <rect width={1.333} height={3} fill="#D91023" />
      <rect x={2.667} width={1.333} height={3} fill="#D91023" />
    </>
  ),
  ar: (
    <>
      {hstripes(["#74ACDF", "#fff", "#74ACDF"])}
      <circle cx={2} cy={1.5} r={0.42} fill="#FFF" stroke="#F6B40E" strokeWidth={0.12} />
      <circle cx={2} cy={1.5} r={0.24} fill="#F6B40E" />
    </>
  ),
  bo: hstripes(["#DA291C", "#F4E400", "#007A33"]),
  br: (
    <>
      <rect width={4} height={3} fill="#009C3B" />
      <polygon points="2,0.35 3.65,1.5 2,2.65 0.35,1.5" fill="#FFDF00" />
      <circle cx={2} cy={1.5} r={0.62} fill="#002776" />
    </>
  ),
  cl: (
    <>
      <rect width={4} height={1.5} fill="#fff" />
      <rect y={1.5} width={4} height={1.5} fill="#D52B1E" />
      <rect width={1.5} height={1.5} fill="#0039A6" />
      <polygon
        points="0.75,0.42 0.87,0.78 1.25,0.78 0.94,1.0 1.06,1.36 0.75,1.14 0.44,1.36 0.56,1.0 0.25,0.78 0.63,0.78"
        fill="#fff"
      />
    </>
  ),
  co: weighted([
    ["#FCD116", 2],
    ["#003893", 1],
    ["#CE1126", 1],
  ]),
  cr: (
    <>
      {hstripes(["#002B7F", "#002B7F", "#002B7F"])}
      <rect y={0.5} width={4} height={2} fill="#fff" />
      <rect y={1} width={4} height={1} fill="#CE1126" />
    </>
  ),
  ec: (
    <>
      {weighted([
        ["#FFDD00", 2],
        ["#034EA2", 1],
        ["#ED1C24", 1],
      ])}
      <circle cx={2} cy={1.5} r={0.22} fill="#8A6D3B" />
    </>
  ),
  es: weighted([
    ["#AA151B", 1],
    ["#F1BF00", 2],
    ["#AA151B", 1],
  ]),
  us: (
    <>
      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          x={0}
          y={(i * 3) / 13}
          width={4}
          height={3 / 13}
          fill={i % 2 === 0 ? "#B22234" : "#fff"}
        />
      ))}
      <rect width={1.7} height={21 / 13} fill="#3C3B6E" />
    </>
  ),
  mx: (
    <>
      {vstripes(["#006847", "#fff", "#CE1126"])}
      <circle cx={2} cy={1.5} r={0.2} fill="#8B5A2B" />
    </>
  ),
  pa: (
    <>
      <rect width={4} height={3} fill="#fff" />
      <rect x={2} width={2} height={1.5} fill="#D21034" />
      <rect y={1.5} width={2} height={1.5} fill="#072357" />
      <circle cx={1} cy={0.75} r={0.28} fill="#072357" />
      <circle cx={3} cy={2.25} r={0.28} fill="#D21034" />
    </>
  ),
  py: hstripes(["#D52B1E", "#fff", "#0038A8"]),
  uy: (
    <>
      <rect width={4} height={3} fill="#fff" />
      {[1, 2, 3, 4].map((i) => (
        <rect key={i} x={0} y={(i * 3) / 4.5} width={4} height={3 / 9} fill="#0038A8" />
      ))}
      <rect width={1.35} height={1.35} fill="#fff" />
      <circle cx={0.67} cy={0.67} r={0.3} fill="#FCD116" />
    </>
  ),
  ve: hstripes(["#FCD116", "#00247D", "#CF142B"]),
};

export default function Flag({
  iso,
  className = "",
}: {
  iso: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 4 3" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
        {FLAGS[iso] ?? <rect width={4} height={3} fill="#e2e8f0" />}
      </svg>
    </span>
  );
}
