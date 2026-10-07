import { Link } from 'react-router';
import viewCaret from '@/assets/application-view-caret.svg';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { posting } from '@/data/role';
import { routes } from '@/lib/routes';

/** The shared picker popover, with the tracker design's navigation choices. */
export function ApplicationViewPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-[38px] min-w-0 flex-1 gap-1">
          View
          <img src={viewCaret} width={16} height={16} alt="" className="max-w-none shrink-0 rotate-90" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={'View options for ' + posting.title}
        className="w-[331px] max-w-[calc(100vw-32px)] p-3 motion-reduce:animate-none"
      >
        <div className="flex flex-col">
          <Link
            to={routes.openingRole}
            className="flex h-11 items-center rounded-xl p-3 text-sm leading-none font-semibold text-ink-strong transition-colors outline-none hover:bg-canvas focus-visible:bg-canvas"
          >
            Job details
          </Link>
          <Link
            to={routes.applicationProfile}
            className="flex h-11 items-center rounded-xl p-3 text-sm leading-none font-semibold text-ink-strong transition-colors outline-none hover:bg-canvas focus-visible:bg-canvas"
          >
            Your application
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
