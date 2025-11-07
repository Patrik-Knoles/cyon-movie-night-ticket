import Image from "next/image";

export function CopyrightFooter() {
  return (
    <footer className="flex items-center justify-center gap-2 py-4 px-4 text-center">
      <a
        href="https://patricktheassistant.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Image
          src="/images/design-mode/PTA-icon.png"
          alt="Patrick The Assistant"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-sm font-medium">Made by patricktheassistant</span>
      </a>
    </footer>
  );
}
