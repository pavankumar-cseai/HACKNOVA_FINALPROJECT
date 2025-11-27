import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 10v4" />
    <path d="M6 8v8" />
    <path d="M9 6v12" />
    <path d="M13 18h8" />
    <path d="M13 14h8" />
    <path d="M13 10h5" />
    <path d="M13 6h5" />
  </svg>
);
