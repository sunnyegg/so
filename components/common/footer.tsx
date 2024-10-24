import Link from "next/link";

function Footer() {
  return (
    <section className="mt-16 flex justify-center gap-4 text-[0.8rem] md:hidden">
      <Link
        href={"/"}
        className="p-2 transition-all hover:rounded-md hover:bg-so-secondary-color"
      >
        HOME
      </Link>
      <Link
        href={"/support"}
        className="p-2 transition-all hover:rounded-md hover:bg-so-secondary-color"
      >
        SUPPORT
      </Link>
      <Link
        href={"/about"}
        className="p-2 transition-all hover:rounded-md hover:bg-so-secondary-color"
      >
        ABOUT
      </Link>
      <Link
        href={"/how-it-works"}
        className="p-2 transition-all hover:rounded-md hover:bg-so-secondary-color"
      >
        HOW IT WORKS?
      </Link>
    </section>
  );
}

export default Footer;
