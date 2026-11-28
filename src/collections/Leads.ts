import type { CollectionConfig } from 'payload';

import { createLeads, deleteLeads, readLeads, updateLeads } from '../access/roles';
import { emailField, rows, textField, textareaField } from '../cms/fields';
import { alertOnLeadCreate, stampLead } from '../leads/hooks';

/**
 * Customer leads from the public contact, quote and inspection forms
 * (CP-6.1, docs/DATABASE.md §2, docs/API.md §3).
 *
 * Staff-worked rather than published: no drafts and no public read. Super Admin
 * and Sales and Support may read, create and update; only a Super Admin may
 * delete. `leadStatus` is deliberately not `status` — Payload owns that name.
 *
 * Photo relations (`lead-photos`) arrive with CP-6.2/CP-6.3; the public write
 * routes use `overrideAccess` after validating and rate-limiting the request.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['createdAt', 'type', 'name', 'phone', 'leadStatus', 'assignedTo'],
    group: 'Leads',
    description: 'Enquiries from the website. Personal data: handle with care.',
  },
  access: {
    create: createLeads,
    read: readLeads,
    update: updateLeads,
    delete: deleteLeads,
  },
  trash: true,
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      options: [
        { label: 'Contact message', value: 'contact' },
        { label: 'Quote request', value: 'quote' },
        { label: 'Free inspection request', value: 'inspection' },
      ],
    },
    textField({ name: 'name', label: 'Name', preset: 'reviewerName', required: true }),
    textField({
      name: 'phone',
      label: 'Phone',
      preset: 'statLabel',
      required: true,
      validate: (value: string | string[] | null | undefined) =>
        typeof value === 'string' && /^[+0-9][0-9 ()-]{6,39}$/.test(value.trim())
          ? true
          : 'Enter a phone number using digits, spaces, brackets, + or -.',
    }),
    emailField({ name: 'email', label: 'Email' }),
    textField({ name: 'city', label: 'City', preset: 'reviewCity' }),
    textField({ name: 'area', label: 'Area', preset: 'listItem' }),
    {
      name: 'propertyType',
      label: 'Property type',
      type: 'select',
      options: [
        { label: 'House', value: 'house' },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Office', value: 'office' },
        { label: 'Shop', value: 'shop' },
        { label: 'Warehouse', value: 'warehouse' },
        { label: 'Farm or agricultural', value: 'farm' },
        { label: 'Other', value: 'other' },
      ],
    },
    textField({ name: 'pestType', label: 'Pest', preset: 'listItem' }),
    textField({ name: 'preferredTime', label: 'Preferred time', preset: 'statLabel' }),
    textareaField({ name: 'message', label: 'Message', preset: 'paragraph' }),
    {
      name: 'items',
      label: 'Quote items',
      type: 'array',
      ...rows('leadItems'),
      labels: { singular: 'Item', plural: 'Items' },
      admin: { description: 'Products the visitor added to their quote.' },
      fields: [
        {
          name: 'product',
          label: 'Product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        textField({ name: 'packLabel', label: 'Pack', preset: 'listItem' }),
        {
          name: 'quantity',
          label: 'Quantity',
          type: 'number',
          required: true,
          min: 1,
          max: 999,
          defaultValue: 1,
          admin: { step: 1 },
        },
      ],
    },
    textField({
      name: 'sourcePath',
      label: 'Source path',
      preset: 'url',
      admin: { description: 'Page the visitor was on when the form was sent.' },
    }),
    textField({
      name: 'referrer',
      label: 'Referrer',
      preset: 'url',
      admin: { description: 'Where the visit came from, when the browser sent it.' },
    }),
    {
      name: 'utm',
      label: 'Campaign attribution',
      type: 'group',
      fields: [
        textField({ name: 'source', label: 'UTM source', preset: 'listItem' }),
        textField({ name: 'medium', label: 'UTM medium', preset: 'listItem' }),
        textField({ name: 'campaign', label: 'UTM campaign', preset: 'listItem' }),
      ],
    },
    {
      name: 'leadStatus',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
        { label: 'Spam', value: 'spam' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignedTo',
      label: 'Assigned to',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Who is following this lead up.',
      },
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'array',
      ...rows('leadNotes'),
      labels: { singular: 'Note', plural: 'Notes' },
      fields: [
        {
          name: 'author',
          label: 'By',
          type: 'relationship',
          relationTo: 'users',
          admin: { readOnly: true },
        },
        textareaField({ name: 'text', label: 'Note', preset: 'paragraph', required: true }),
        {
          name: 'createdAt',
          label: 'Added',
          type: 'date',
          admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
          defaultValue: () => new Date(),
        },
      ],
    },
    {
      name: 'consent',
      label: 'Customer consented to contact',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'consentAt',
      label: 'Consent recorded',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    textField({
      name: 'ipHash',
      label: 'IP hash',
      preset: 'ipHash',
      admin: {
        readOnly: true,
        description: 'Salted hash for abuse checks. Never the raw address.',
      },
    }),
    {
      name: 'retainUntil',
      label: 'Delete after',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayOnly' },
        description: 'Set from the retention setting when the lead arrives.',
      },
    },
    {
      name: 'alertSentAt',
      label: 'Alert sent',
      type: 'date',
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    textareaField({
      name: 'alertError',
      label: 'Alert error',
      preset: 'shortParagraph',
      admin: {
        readOnly: true,
        description: 'Empty when the alert reached staff. Shown so a failed alert is not silent.',
      },
    }),
  ],
  hooks: {
    beforeChange: [stampLead],
    afterChange: [alertOnLeadCreate],
  },
};
