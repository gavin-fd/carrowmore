import type { CSSProperties } from 'react';
import type { IconName } from '@/components/icon-names';
import { cn } from '@/lib/utils';

interface IconProps {
  name: IconName;
  /** Rendered size in px. The glyph is always the 24px optical size, scaled. */
  size?: 16 | 24 | 48;
  /** 300 throughout, unless a design calls for otherwise. */
  weight?: 300 | 400;
  className?: string;
}

/**
 * A Material Symbols Outlined glyph (FILL 0, GRAD 0, opsz 24).
 *
 * Always decorative: anything an icon means must also be said in text, or in
 * the accessible name of the control around it.
 */
export function Icon({ name, size = 24, weight = 300, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('icon', className)}
      style={{ fontSize: size, '--icon-weight': weight } as CSSProperties}
    >
      {name}
    </span>
  );
}
