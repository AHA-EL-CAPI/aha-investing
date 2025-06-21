export default function YouTubeBanner() {
  return (
    <div className="w-full flex items-center justify-between px-4 py-2">
      {/* Left side: Text that scales with the viewport */}
      <span className="text-[10vw] font-bold text-gray-800 dark:text-white">
        AHA Investing
      </span>

      {/* Right side: Logo that scales with the viewport */}
      <a
        href="https://www.youtube.com/@ahainvesting"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-105 transition-transform"
      >
        <img
          src="/youtube full logo white.png"
          alt="YouTube"
          className="h-[30vw] w-auto"
        />
      </a>
    </div>
  );
}
