import * as migration_20261119_101405_initial from './20261119_101405_initial';
import * as migration_20261119_171018_add_categories_and_pages from './20261119_171018_add_categories_and_pages';
import * as migration_20261120_114629_add_globals from './20261120_114629_add_globals';
import * as migration_20261123_105317 from './20261123_105317';
import * as migration_20261124_070719 from './20261124_070719';
import * as migration_20261125_214628_cp51_services from './20261125_214628_cp51_services';
import * as migration_20261125_223245_cp52_locations from './20261125_223245_cp52_locations';
import * as migration_20261125_233557_cp53_products from './20261125_233557_cp53_products';
import * as migration_20261126_024404_cp55_posts from './20261126_024404_cp55_posts';
import * as migration_20261128_014341_cp55_reviews from './20261128_014341_cp55_reviews';
import * as migration_20261128_093023_cp61_leads from './20261128_093023_cp61_leads';

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
    name: '20261124_070719',
  },
  {
    up: migration_20261125_214628_cp51_services.up,
    down: migration_20261125_214628_cp51_services.down,
    name: '20261125_214628_cp51_services',
  },
  {
    up: migration_20261125_223245_cp52_locations.up,
    down: migration_20261125_223245_cp52_locations.down,
    name: '20261125_223245_cp52_locations',
  },
  {
    up: migration_20261125_233557_cp53_products.up,
    down: migration_20261125_233557_cp53_products.down,
    name: '20261125_233557_cp53_products',
  },
  {
    up: migration_20261126_024404_cp55_posts.up,
    down: migration_20261126_024404_cp55_posts.down,
    name: '20261126_024404_cp55_posts',
  },
  {
    up: migration_20261128_014341_cp55_reviews.up,
    down: migration_20261128_014341_cp55_reviews.down,
    name: '20261128_014341_cp55_reviews',
  },
  {
    up: migration_20261128_093023_cp61_leads.up,
    down: migration_20261128_093023_cp61_leads.down,
    name: '20261128_093023_cp61_leads'
  },
];
