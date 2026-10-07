/**
 * Every Material Symbols glyph the interface uses.
 *
 * vite.config.ts builds the Google Fonts request from this list, and <Icon>
 * only accepts these names — so adding a glyph here is the whole of adding it.
 */
export const ICON_NAMES = [
  'add',
  'arrow_forward_ios',
  'attach_file',
  'book_4',
  'box_edit',
  'check',
  'check_circle',
  'chevron_right',
  'close',
  'conversion_path',
  'event',
  'expand_more',
  'home',
  'more_horiz',
  'notifications',
  'outbox',
  'search',
  'work',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
