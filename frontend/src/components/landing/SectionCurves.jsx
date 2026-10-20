// Curved section edges. Shapes use objectBoundingBox units (0–1), so they
// stretch with each section at any screen size. Applied in CSS via clip-path.
const shapes = {
  how: { top: [0.07, 0.0, 0.06, 0.012], bottom: [0.955, 1.0, 0.93, 0.99] },
  homes: { top: [0.02, 0.08, 0.0, 0.06], bottom: [0.975, 0.92, 1.0, 0.94] },
  pros: { top: [0.055, 0.0, 0.07, 0.02], bottom: [0.965, 1.0, 0.92, 0.985] },
}

// Each edge: [y at left, control 1 y, control 2 y, y at right]
function d({ top, bottom }, scale = 1) {
  const t = top.map((v) => v * scale)
  const b = bottom.map((v) => 1 - (1 - v) * scale)
  return `M0,${t[0]} C0.3,${t[1]} 0.65,${t[2]} 1,${t[3]} L1,${b[0]} C0.7,${b[1]} 0.35,${b[2]} 0,${b[3]} Z`
}

export default function SectionCurves() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {Object.entries(shapes).map(([id, s]) => [
          <clipPath key={id} id={`curve-${id}`} clipPathUnits="objectBoundingBox">
            <path d={d(s)} />
          </clipPath>,
          <clipPath key={`${id}-m`} id={`curve-${id}-m`} clipPathUnits="objectBoundingBox">
            <path d={d(s, 0.45)} />
          </clipPath>,
        ])}
      </defs>
    </svg>
  )
}
