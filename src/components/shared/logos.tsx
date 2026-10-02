import type { SVGProps } from 'react';

export const LogoIcons = {
  rethread: (props: SVGProps<SVGSVGElement>) => (
    <svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect width='44' height='44' fill='url(#pattern0)' />
      <defs>
        <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'>
          <image href='/img/logo.png' width='1' height='1' preserveAspectRatio='xMidYMid slice' />
        </pattern>
      </defs>
    </svg>
  ),
};
