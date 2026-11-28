import type { AdminViewServerProps, Where } from 'payload';

import {
  BookOpen,
  ExternalLink,
  FilePlus2,
  ImagePlus,
  MapPin,
  Package,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

/**
 * Custom admin dashboard (2026-11-28).
 *
 * Replaces Payload's default collection card grid with a compact operations
 * view: content counts, drafts, recent edits and the newest audit entries.
 * Every query runs through the Local API with the signed-in staff member's
 * request, so access control stays in force; panels a role cannot read are
 * hidden instead of bypassed.
 */

type Stat = {
  collection: string;
  href: string;
  label: string;
  published?: number;
  total: number;
};

type ContentItem = {
  href: string;
  status?: string | null;
  title: string;
  type: string;
  updatedAt: string;
};

const numberFormat = new Intl.NumberFormat('en-GB');

function formatCount(value: number): string {
  return numberFormat.format(value);
}

function formatWhen(value?: string | null): string {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function formatToday(): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date());
}

const ACTION_LABELS: Record<string, string> = {
  delete: 'Deleted content',
  export: 'Exported products',
  login: 'Signed in',
  login_failed: 'Failed sign-in',
  lockout: 'Account locked',
  price_change: 'Changed a price',
  publish: 'Published content',
  totp_enrolled: 'Enabled two-factor',
  totp_failed: 'Failed two-factor code',
  totp_recovery_used: 'Used a recovery code',
  totp_reenrolled: 'Reset two-factor',
  totp_setup_started: 'Started two-factor setup',
  totp_verified: 'Verified two-factor',
  unpublish: 'Unpublished content',
  user_created: 'Created a staff account',
  user_deleted: 'Deleted a staff account',
  user_updated: 'Updated a staff account',
};

function actionTone(action: string): string {
  if (action === 'login_failed' || action === 'totp_failed' || action === 'lockout')
    return 'danger';
  if (action === 'publish' || action === 'login' || action === 'totp_verified') return 'success';
  if (action === 'unpublish' || action === 'delete' || action === 'user_deleted') return 'warning';
  return 'neutral';
}

export default async function Dashboard(props: AdminViewServerProps) {
  const { initPageResult, payload, permissions } = props;
  const req = initPageResult.req;

  const allowed = (collection: string, action: 'create' | 'read' = 'read') =>
    Boolean(permissions?.collections?.[collection]?.[action]);

  const count = (
    collection: 'locations' | 'media' | 'pages' | 'posts' | 'products' | 'services' | 'users',
    where?: Where,
  ) => payload.count({ collection, req, where });

  const [
    pages,
    pagesPublished,
    posts,
    postsPublished,
    services,
    servicesPublished,
    locations,
    locationsPublished,
    products,
    productsPublished,
    media,
    staff,
  ] = await Promise.all([
    count('pages'),
    count('pages', { _status: { equals: 'published' } }),
    count('posts'),
    count('posts', { _status: { equals: 'published' } }),
    count('services'),
    count('services', { _status: { equals: 'published' } }),
    count('locations'),
    count('locations', { _status: { equals: 'published' } }),
    count('products'),
    count('products', { _status: { equals: 'published' } }),
    count('media'),
    count('users'),
  ]);

  const allStats: Stat[] = [
    {
      collection: 'pages',
      href: '/admin/collections/pages',
      label: 'Pages',
      published: pagesPublished.totalDocs,
      total: pages.totalDocs,
    },
    {
      collection: 'posts',
      href: '/admin/collections/posts',
      label: 'Pest Library articles',
      published: postsPublished.totalDocs,
      total: posts.totalDocs,
    },
    {
      collection: 'services',
      href: '/admin/collections/services',
      label: 'Services',
      published: servicesPublished.totalDocs,
      total: services.totalDocs,
    },
    {
      collection: 'locations',
      href: '/admin/collections/locations',
      label: 'Locations',
      published: locationsPublished.totalDocs,
      total: locations.totalDocs,
    },
    {
      collection: 'products',
      href: '/admin/collections/products',
      label: 'Products',
      published: productsPublished.totalDocs,
      total: products.totalDocs,
    },
    {
      collection: 'media',
      href: '/admin/collections/media',
      label: 'Media files',
      total: media.totalDocs,
    },
  ];

  const stats = allStats.filter((stat) => allowed(stat.collection));

  const [recentPages, recentPosts, recentServices, recentProducts] = await Promise.all([
    allowed('pages')
      ? payload.find({
          collection: 'pages',
          depth: 0,
          limit: 4,
          req,
          select: { title: true, updatedAt: true, _status: true },
          sort: '-updatedAt',
        })
      : null,
    allowed('posts')
      ? payload.find({
          collection: 'posts',
          depth: 0,
          limit: 4,
          req,
          select: { title: true, updatedAt: true, _status: true },
          sort: '-updatedAt',
        })
      : null,
    allowed('services')
      ? payload.find({
          collection: 'services',
          depth: 0,
          limit: 4,
          req,
          select: { title: true, updatedAt: true, _status: true },
          sort: '-updatedAt',
        })
      : null,
    allowed('products')
      ? payload.find({
          collection: 'products',
          depth: 0,
          limit: 4,
          req,
          select: { title: true, updatedAt: true, _status: true },
          sort: '-updatedAt',
        })
      : null,
  ]);

  type RecentDoc = {
    _status?: null | string;
    id: number | string;
    title?: null | string;
    updatedAt: string;
  };

  const toItem =
    (type: string, collection: string) =>
    (doc: RecentDoc): ContentItem => ({
      href: `/admin/collections/${collection}/${doc.id}`,
      status: doc._status ?? null,
      title: doc.title || `Untitled ${type}`,
      type,
      updatedAt: doc.updatedAt,
    });

  const recentContent = [
    ...(recentPages?.docs.map(toItem('Page', 'pages')) ?? []),
    ...(recentPosts?.docs.map(toItem('Article', 'posts')) ?? []),
    ...(recentServices?.docs.map(toItem('Service', 'services')) ?? []),
    ...(recentProducts?.docs.map(toItem('Product', 'products')) ?? []),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 7);

  const canReadAudit = allowed('audit-logs');
  const auditEntries = canReadAudit
    ? await payload.find({
        collection: 'audit-logs',
        depth: 1,
        limit: 7,
        req,
        sort: '-createdAt',
      })
    : null;

  const drafts =
    pages.totalDocs -
    pagesPublished.totalDocs +
    (posts.totalDocs - postsPublished.totalDocs) +
    (services.totalDocs - servicesPublished.totalDocs) +
    (locations.totalDocs - locationsPublished.totalDocs) +
    (products.totalDocs - productsPublished.totalDocs);

  const quickActions = [
    {
      collection: 'pages',
      href: '/admin/collections/pages/create',
      icon: FilePlus2,
      label: 'Write a new page',
    },
    {
      collection: 'posts',
      href: '/admin/collections/posts/create',
      icon: BookOpen,
      label: 'Add a Pest Library article',
    },
    {
      collection: 'services',
      href: '/admin/collections/services/create',
      icon: Wrench,
      label: 'Add a service',
    },
    {
      collection: 'locations',
      href: '/admin/collections/locations/create',
      icon: MapPin,
      label: 'Add a location',
    },
    {
      collection: 'products',
      href: '/admin/collections/products/create',
      icon: Package,
      label: 'Add a product',
    },
    {
      collection: 'media',
      href: '/admin/collections/media/create',
      icon: ImagePlus,
      label: 'Upload an image',
    },
  ].filter((action) => allowed(action.collection, 'create'));

  const siteURL = payload.config.serverURL || 'http://localhost:3000';

  return (
    <div className="mcs-dash">
      <header className="mcs-dash__hero">
        <div className="mcs-dash__hero-copy">
          <p className="mcs-dash__eyebrow">{formatToday()}</p>
          <h1 className="mcs-dash__title">Content overview</h1>
          <p className="mcs-dash__subtitle">
            {formatCount(drafts)} draft{drafts === 1 ? '' : 's'} waiting ·{' '}
            {formatCount(staff.totalDocs)} staff account{staff.totalDocs === 1 ? '' : 's'}
          </p>
        </div>
        <div className="mcs-dash__hero-actions">
          {allowed('pages', 'create') ? (
            <Link
              className="mcs-dash__button mcs-dash__button--primary"
              href="/admin/collections/pages/create"
            >
              New page
            </Link>
          ) : null}
          <a
            className="mcs-dash__button mcs-dash__button--ghost"
            href={siteURL}
            rel="noreferrer"
            target="_blank"
          >
            View site
            <ExternalLink aria-hidden="true" size={14} />
          </a>
        </div>
      </header>

      <section aria-label="Content at a glance" className="mcs-dash__stats">
        {stats.map((stat) => {
          const draftsForStat =
            typeof stat.published === 'number' ? stat.total - stat.published : null;

          return (
            <Link className="mcs-dash__stat" href={stat.href} key={stat.label}>
              <span className="mcs-dash__stat-label">{stat.label}</span>
              <span className="mcs-dash__stat-value">{formatCount(stat.total)}</span>
              <span className="mcs-dash__stat-meta">
                {typeof stat.published === 'number'
                  ? `${formatCount(stat.published)} published${
                      draftsForStat
                        ? ` · ${formatCount(draftsForStat)} draft${draftsForStat === 1 ? '' : 's'}`
                        : ''
                    }`
                  : 'Images and documents'}
              </span>
            </Link>
          );
        })}
      </section>

      <div className="mcs-dash__columns">
        <section className="mcs-dash__panel">
          <div className="mcs-dash__panel-head">
            <div>
              <h2 className="mcs-dash__panel-title">Recently updated</h2>
              <p className="mcs-dash__panel-subtitle">Pick up where the team left off.</p>
            </div>
          </div>
          {recentContent.length === 0 ? (
            <p className="mcs-dash__empty">Nothing has been edited yet.</p>
          ) : (
            <ul className="mcs-dash__list">
              {recentContent.map((item) => (
                <li className="mcs-dash__row" key={item.href}>
                  <span aria-hidden="true" className="mcs-dash__row-dot" />
                  <div className="mcs-dash__row-copy">
                    <Link className="mcs-dash__row-title" href={item.href}>
                      {item.title}
                    </Link>
                    <span className="mcs-dash__row-meta">
                      {item.type} · {formatWhen(item.updatedAt)}
                    </span>
                  </div>
                  <span
                    className={`mcs-dash__badge mcs-dash__badge--${
                      item.status === 'published' ? 'published' : 'draft'
                    }`}
                  >
                    {item.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mcs-dash__panel">
          <div className="mcs-dash__panel-head">
            <div>
              <h2 className="mcs-dash__panel-title">Quick actions</h2>
              <p className="mcs-dash__panel-subtitle">Jump straight into the work.</p>
            </div>
          </div>
          {quickActions.length === 0 ? (
            <p className="mcs-dash__empty">Your role does not create content.</p>
          ) : (
            <ul className="mcs-dash__actions">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <li key={action.href}>
                    <Link className="mcs-dash__action" href={action.href}>
                      <span aria-hidden="true" className="mcs-dash__action-plus">
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      {action.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mcs-dash__panel mcs-dash__panel--full">
        <div className="mcs-dash__panel-head">
          <div>
            <h2 className="mcs-dash__panel-title">Latest activity</h2>
            <p className="mcs-dash__panel-subtitle">
              Security and publishing events, newest first.
            </p>
          </div>
          {canReadAudit ? (
            <Link className="mcs-dash__panel-link" href="/admin/collections/audit-logs">
              Open audit log →
            </Link>
          ) : null}
        </div>
        {!auditEntries ? (
          <p className="mcs-dash__empty">Recent activity is visible to Super Admins.</p>
        ) : auditEntries.docs.length === 0 ? (
          <p className="mcs-dash__empty">No activity has been recorded yet.</p>
        ) : (
          <ul className="mcs-dash__list">
            {auditEntries.docs.map((entry) => {
              const actor =
                entry.actor && typeof entry.actor === 'object' ? entry.actor.email : undefined;

              return (
                <li className="mcs-dash__row" key={entry.id}>
                  <span
                    aria-hidden="true"
                    className={`mcs-dash__row-dot mcs-dash__row-dot--${actionTone(entry.action)}`}
                  />
                  <div className="mcs-dash__row-copy">
                    <span className="mcs-dash__row-title">
                      {ACTION_LABELS[entry.action] ?? entry.action.replaceAll('_', ' ')}
                    </span>
                    <span className="mcs-dash__row-meta">
                      {entry.summary} · {actor ?? 'System'} · {formatWhen(entry.createdAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
