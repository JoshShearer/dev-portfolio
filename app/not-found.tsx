import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-32 sm:px-10">
      <p className="tag">404</p>
      <h1 className="display mt-6 text-5xl sm:text-7xl">Nothing at this address.</h1>
      <ul className="mt-10 flex gap-8">
        <li>
          <Link href="/" className="link">
            Home
          </Link>
        </li>
        <li>
          <Link href="/#work" className="link">
            Selected work
          </Link>
        </li>
      </ul>
    </div>
  );
}
