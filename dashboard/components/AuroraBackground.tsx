"use client";

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base radial wash — warm cream + sage + clinical blue pools */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 15% -10%, rgba(185,130,45,0.16), transparent 55%), radial-gradient(1000px 700px at 90% 0%, rgba(107,126,78,0.14), transparent 50%), radial-gradient(1100px 900px at 50% 120%, rgba(84,113,138,0.10), transparent 55%)",
        }}
      />
      {/* drifting blobs — caramel, sage, honey */}
      <div
        className="animate-aurora absolute -left-40 top-[-10%] h-[55vh] w-[55vh] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(185,130,45,0.30), transparent 70%)",
        }}
      />
      <div
        className="animate-aurora absolute right-[-10%] top-1/4 h-[50vh] w-[50vh] rounded-full blur-[130px]"
        style={{
          animationDelay: "-7s",
          background:
            "radial-gradient(circle, rgba(107,126,78,0.24), transparent 70%)",
        }}
      />
      <div
        className="animate-aurora absolute bottom-[-15%] left-1/3 h-[45vh] w-[45vh] rounded-full blur-[120px]"
        style={{
          animationDelay: "-14s",
          background:
            "radial-gradient(circle, rgba(246,228,184,0.45), transparent 70%)",
        }}
      />
      {/* warm caramel grid — barely there */}
      <div
        className="animate-grid absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(142,89,22,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(142,89,22,0.18) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)",
        }}
      />
      {/* soft cocoa vignette — warmer than black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 55%, rgba(62,52,40,0.22) 100%)",
        }}
      />
      <div className="noise" />
    </div>
  );
}
