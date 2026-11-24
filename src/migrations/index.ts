import * as migration_20261119_101405_initial from './20261119_101405_initial';
import * as migration_20261119_171018_add_categories_and_pages from './20261119_171018_add_categories_and_pages';
import * as migration_20261120_114629_add_globals from './20261120_114629_add_globals';
import * as migration_20261123_105317 from './20261123_105317';
import * as migration_20261124_070719 from './20261124_070719';

export const migrations = [
  {
    up: migration_20261119_101405_initial.up,
    down: migration_20261119_101405_initial.down,
    name: '20261119_101405_initial',
  },
  {
    up: migration_20261119_171018_add_categories_and_pages.up,
    down: migration_20261119_171018_add_categories_and_pages.down,
    name: '20261119_171018_add_categories_and_pages',
  },
  {
    up: migration_20261120_114629_add_globals.up,
    down: migration_20261120_114629_add_globals.down,
    name: '20261120_114629_add_globals',
  },
  {
    up: migration_20261123_105317.up,
    down: migration_20261123_105317.down,
    name: '20261123_105317',
  },
  {
    up: migration_20261124_070719.up,
    down: migration_20261124_070719.down,
    name: '20261124_070719'
  },
];
