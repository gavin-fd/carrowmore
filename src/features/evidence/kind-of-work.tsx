import { ExpandableRow } from '@/components/ui/expandable-row';
import type { View } from '@/domain/schema';

type Entry = View['claims'][number]['entries'][number];

/**
 * How each era of the archive reached this pack, in the pack's own terms
 * (carrowmore-data-pack/README.md). Shown because where a record came from
 * changes how far it can be trusted.
 */
const SOURCE: Record<Entry['source_era'], string> = {
  1: 'Handwritten journal — scanned, then transcribed by the Authority',
  2: 'KEEPERLOG export — entries cut off at 120 characters',
  3: 'Station spreadsheet',
};

/** The row's name: the earliest record's words, without the closing full stop. */
const name = (text: string) => text.replace(/\.\s*$/, '');

/**
 * One kind of work: how it was written, how many times, and each record
 * behind it — date, station, the system it came from and where to find it.
 */
export function KindOfWork({ label, entries }: { label: string; entries: Entry[] }) {
  const count = entries.length;

  return (
    <ExpandableRow
      label={
        <span>
          {name(label)} ({count}
          <span className="sr-only"> {count === 1 ? 'occasion' : 'occasions'}</span>)
        </span>
      }
    >
      <ul className="pt-4">
        {entries.map((e) => (
          <li key={e.entry_id} className="flex gap-4 border-b border-line py-3 text-sm last:border-b-0">
            <time dateTime={e.date} className="shrink-0 whitespace-nowrap">
              {e.date}
            </time>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="flex min-h-5 items-center leading-none font-semibold">
                {e.station} · {e.station_class} station
              </p>
              <div className="flex flex-col gap-0.5 text-ink-tertiary">
                {/* Grouping ignores which engine was meant; where this record's words differ, show them. */}
                {e.text !== label && <p>“{e.text}”</p>}
                <p>{SOURCE[e.source_era]}</p>
                <p className="wrap-anywhere">{e.source_record}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ExpandableRow>
  );
}
