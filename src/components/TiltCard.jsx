import { useRef, useState } from "react";
export default function TiltCard({
  children,
  accentColor = "#818cf8",
  className = "",
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -9;
    const rotateY = (x - centerX) / centerX * 9;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlare({
      x: x / rect.width * 100,
      y: y / rect.height * 100,
      opacity: 0.22
    });
  };
  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };
  return <div
    ref={cardRef}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    style={{
      transform,
      transition: "transform 0.15s ease-out, border-color 0.25s, box-shadow 0.25s"
    }}
    className={`relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d0b1e]/90 backdrop-blur-md shadow-xl transition-all duration-300 group hover:border-white/30 hover:shadow-2xl hover:shadow-[${accentColor}]/20 ${className}`}
    {...props}
  >
      {
    /* Dynamic specular light reflection */
  }
      <div
    className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-2xl z-20"
    style={{
      background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
      opacity: glare.opacity
    }}
  />
      {children}
    </div>;
}
