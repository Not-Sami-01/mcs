import * as migration_20261119_101405_initial from './20261119_101405_initial';
import * as migration_20261119_171018_add_categories_and_pages from './20261119_171018_add_categories_and_pages';
import * as migration_20261120_114629_add_globals from './20261120_114629_add_globals';

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
];
