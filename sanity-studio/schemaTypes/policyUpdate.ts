import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'policyUpdate',
  title: 'Policy Update',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Update Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updateType',
      title: 'Update Type',
      type: 'string',
      options: {
        list: [
          {title: 'Express Entry Changes', value: 'express-entry'},
          {title: 'Provincial Programs', value: 'provincial'},
          {title: 'Family Sponsorship', value: 'family-sponsorship'},
          {title: 'Study Permits', value: 'study-permits'},
          {title: 'Work Permits', value: 'work-permits'},
          {title: 'General Policy', value: 'general'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority Level',
      type: 'string',
      options: {
        list: [
          {title: 'Critical', value: 'critical'},
          {title: 'High', value: 'high'},
          {title: 'Medium', value: 'medium'},
          {title: 'Low', value: 'low'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
    }),
    defineField({
      name: 'announcementDate',
      title: 'Announcement Date',
      type: 'date',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Brief summary of the policy change',
    }),
    defineField({
      name: 'details',
      title: 'Detailed Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'impact',
      title: 'Impact on Applicants',
      type: 'text',
      rows: 4,
      description: 'How this change affects immigration applicants',
    }),
    defineField({
      name: 'actionRequired',
      title: 'Action Required',
      type: 'text',
      rows: 3,
      description: 'What applicants need to do in response to this change',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'url',
      description: 'Link to official government announcement',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this policy update is currently active',
      initialValue: true,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{type: 'string'}],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      updateType: 'updateType',
      priority: 'priority',
      effectiveDate: 'effectiveDate',
    },
    prepare(selection) {
      const {updateType, priority, effectiveDate} = selection
      return {
        ...selection,
        subtitle: `${updateType} - ${priority} priority${effectiveDate ? ` (${effectiveDate})` : ''}`,
      }
    },
  },
})
