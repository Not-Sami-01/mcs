import type { CollectionConfig } from 'payload';

import { isSuperAdmin } from '../access/roles';
import { AUDIT_ACTIONS } from '../audit/log';
import { textField, textareaField } from '../cms/fields';

/**
 * Create-only security/activity trail (CP-2.3, docs/SECURITY.md C14).
 *
 * Entries are written by server hooks with `overrideAccess: true`. No HTTP
 * caller may create, update or delete one; only a Super Admin may read them.
 * Values never include personal data, secrets or file contents.
 */
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { singular: 'Audit entry', plural: 'Audit log' },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['createdAt', 'action', 'collectionSlug', 'documentId', 'summary'],
    group: 'Security',
    description: 'Read-only. Written automatically by the server; never edited.',
  },
  access: {
    create: () => false,
    read: isSuperAdmin,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'action',
      label: 'Action',
      type: 'select',
      required: true,
      index: true,
      options: AUDIT_ACTIONS.map((value) => ({
        label: value.replaceAll('_', ' '),
        value,
      })),
    },
    textField({ name: 'collectionSlug', label: 'Collection', preset: 'slug', index: true }),
    textField({ name: 'documentId', label: 'Document ID', preset: 'statLabel' }),
    {
      name: 'actor',
      label: 'Acted by',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Empty for anonymous events such as a failed login.' },
    },
    textareaField({
      name: 'summary',
      label: 'Summary',
      preset: 'auditSummary',
      required: true,
    }),
    textField({
      name: 'ipHash',
      label: 'IP hash',
      preset: 'ipHash',
      admin: { description: 'Salted HMAC of the request address. Never the raw IP.' },
    }),
  ],
};
