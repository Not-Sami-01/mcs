import * as migration_20261119_101405_initial from './20261119_101405_initial';
import * as migration_20261119_171018_add_categories_and_pages from './20261119_171018_add_categories_and_pages';

export const migrations = [
  {
    up: migration_20261119_101405_initial.up,
    down: migration_20261119_101405_initial.down,
    name: '20261119_101405_initial',
  },
  {
    up: migration_20261119_171018_add_categories_and_pages.up,
    down: migration_20261119_171018_add_categories_and_pages.down,
    name: '20261119_171018_add_categories_and_pages'
  },
];
