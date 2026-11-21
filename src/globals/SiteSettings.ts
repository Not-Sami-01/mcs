import type { GlobalConfig } from 'payload';

import {
  canEditContactSettings,
  canEditSensitiveSiteSettings,
  hasRole,
  readPublic,
  writeSiteSettings,
} from '../access/roles';
import { emailField, rows, textField, textareaField } from '../cms/fields';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: readPublic,
    update: writeSiteSettings,
  },
  fields: [
    textField({
      name: 'companyName',
      label: 'Company name',
      preset: 'headline',
      required: true,
      defaultValue: 'Malaysian Care System (MCS)',
      access: { update: ({ req }) => canEditContactSettings(req.user) },
    }),
    {
      name: 'phones',
      label: 'Phone numbers',
      type: 'array',
      ...rows('sitePhones'),
      minRows: 0,
      fields: [
        textField({
          name: 'label',
          label: 'Label',
          preset: 'cardTitle',
          required: true,
          access: { update: ({ req }) => canEditContactSettings(req.user) },
        }),
        textField({
          name: 'number',
          label: 'Phone number',
          preset: 'statLabel',
          required: true,
          access: { update: ({ req }) => canEditContactSettings(req.user) },
        }),
      ],
      access: { update: ({ req }) => canEditContactSettings(req.user) },
    },
    textField({
      name: 'whatsappNumber',
      label: 'WhatsApp number (digits only, e.g. 923001234567)',
      preset: 'statLabel',
      required: true,
      access: { update: ({ req }) => canEditContactSettings(req.user) },
    }),
    emailField({
      name: 'email',
      label: 'Contact email',
      required: true,
      access: { update: ({ req }) => canEditContactSettings(req.user) },
    }),
    textareaField({
      name: 'address',
      label: 'Office address',
      preset: 'shortParagraph',
      required: true,
      access: { update: ({ req }) => canEditContactSettings(req.user) },
    }),
    textField({
      name: 'workingHours',
      label: 'Working hours',
      preset: 'statLabel',
      required: true,
      access: { update: ({ req }) => canEditContactSettings(req.user) },
    }),
    textField({
      name: 'timezone',
      label: 'Timezone',
      preset: 'statLabel',
      required: true,
      defaultValue: 'Asia/Karachi',
      access: { update: ({ req }) => canEditContactSettings(req.user) },
    }),
    {
      name: 'socialLinks',
      label: 'Social media links',
      type: 'array',
      ...rows('socialLinks'),
      access: { update: ({ req }) => canEditContactSettings(req.user) },
      fields: [
        {
          name: 'platform',
          label: 'Platform',
          type: 'select',
          required: true,
          access: { update: ({ req }) => canEditContactSettings(req.user) },
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'X (Twitter)', value: 'x' },
          ],
        },
        textField({
          name: 'url',
          label: 'Profile URL',
          preset: 'url',
          required: true,
          access: { update: ({ req }) => canEditContactSettings(req.user) },
        }),
      ],
    },
    {
      name: 'chat',
      label: 'Live chat settings',
      type: 'group',
      fields: [
        {
          name: 'provider',
          label: 'Chat provider',
          type: 'select',
          required: true,
          defaultValue: 'none',
          access: { update: ({ req }) => canEditSensitiveSiteSettings(req.user) },
          options: [
            { label: 'None', value: 'none' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Tawk.to', value: 'tawk' },
            { label: 'Crisp', value: 'crisp' },
          ],
        },
        textField({
          name: 'hours',
          label: 'Support chat hours',
          preset: 'statLabel',
          access: { update: ({ req }) => canEditSensitiveSiteSettings(req.user) },
        }),
      ],
      access: { update: ({ req }) => canEditSensitiveSiteSettings(req.user) },
    },
    {
      name: 'leadAlertRecipients',
      label: 'Lead alert recipients',
      type: 'array',
      ...rows('leadAlertRecipients'),
      fields: [
        emailField({
          name: 'email',
          label: 'Recipient email',
          required: true,
          access: { read: ({ req }) => hasRole(req.user, 'super-admin') },
        }),
      ],
      access: {
        read: ({ req }) => hasRole(req.user, 'super-admin'),
        update: ({ req }) => canEditSensitiveSiteSettings(req.user),
      },
    },
    {
      name: 'retentionMonths',
      label: 'Photo & Lead retention (months)',
      type: 'number',
      min: 1,
      max: 60,
      defaultValue: 24,
      access: { update: ({ req }) => canEditSensitiveSiteSettings(req.user) },
      admin: {
        description: 'How long customer lead photos are retained before automatic deletion.',
      },
    },
  ],
};
