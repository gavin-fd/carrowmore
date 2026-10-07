import employerLogo from '@/assets/application-path-employer.png';
import { cn } from '@/lib/utils';

/** The existing employer tile and exact Figma crop, at either screen's size. */
export function EmployerMark({ size = 40 }: { size?: 40 | 48 }) {
  return (
    <span
      className={cn(
        'relative shrink-0 rounded-lg border border-line bg-surface',
        size === 48 ? 'size-12' : 'size-10',
      )}
    >
      <span
        className={cn(
          'absolute overflow-hidden',
          size === 48 ? 'top-[8.6px] left-[8.6px] size-[28.8px]' : 'top-[7px] left-[7px] size-6',
        )}
      >
        <img
          src={employerLogo}
          alt=""
          className="absolute top-[-3.65%] left-[-6.09%] h-[105.56%] w-[122.59%] max-w-none"
        />
      </span>
    </span>
  );
}
