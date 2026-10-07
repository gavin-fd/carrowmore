import type { ReactNode } from 'react';
import employerLogo from '@/assets/carrowmore-array-logo.png';
import { posting, type PostingBlock } from '@/data/role';
import { cn } from '@/lib/utils';

function Separator() {
  return (
    <>
      <span aria-hidden="true">·</span>
      <span className="sr-only">,</span>
    </>
  );
}

function Block({ block }: { block: PostingBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2>{block.text}</h2>;
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'p':
      return <p>{block.text}</p>;
    case 'ul':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
  }
}

interface PostingCardProps {
  className?: string;
  /** Set between the posting's header and its text. */
  summary?: ReactNode;
  /** Closes the posting. */
  action?: ReactNode;
}

/** The employer's posting, in their words. */
export function PostingCard({ className, summary, action }: PostingCardProps) {
  return (
    <article
      aria-labelledby="role-title"
      className={cn('flex min-w-0 flex-col gap-14 rounded-3xl bg-surface px-8 pt-10 pb-8', className)}
    >
      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="relative size-10 shrink-0 rounded-lg border border-line bg-surface">
            {/* 24px window 8px in from the tile's outer edge, the logo cropped inside it as the Figma crops it. */}
            <span className="absolute top-[7px] left-[7px] size-6 overflow-hidden">
              <img
                src={employerLogo}
                alt=""
                className="absolute top-[-3.65%] left-[-6.09%] h-[105.56%] w-[122.59%] max-w-none"
              />
            </span>
          </span>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug font-semibold sm:leading-none">
            <span>{posting.employer}</span>
            <Separator />
            <span>{posting.location}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h1 id="role-title" className="text-2xl font-semibold">
            {posting.title}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-tertiary">
            <span>{posting.discipline}</span>
            <Separator />
            <span>{posting.pattern}</span>
          </p>
        </div>
      </header>

      {summary}

      <div className="posting">
        {posting.body.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>

      {action && <div className="flex">{action}</div>}
    </article>
  );
}
