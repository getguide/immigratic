import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'immigrationProgram',
  title: 'Immigration Program',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Program Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'programType',
      title: 'Program Type',
      type: 'string',
      options: {
        list: [
          {title: 'Express Entry', value: 'express-entry'},
          {title: 'Provincial Nominee', value: 'provincial-nominee'},
          {title: 'Family Sponsorship', value: 'family-sponsorship'},
          {title: 'Study Permit', value: 'study-permit'},
          {title: 'Work Permit', value: 'work-permit'},
          {title: 'Visitor Visa', value: 'visitor-visa'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Coming Soon', value: 'coming-soon'},
          {title: 'Under Development', value: 'under-development'},
          {title: 'Deprecated', value: 'deprecated'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'processingTime',
      title: 'Processing Time',
      type: 'string',
    }),
    defineField({
      name: 'cost',
      title: 'Cost',
      type: 'string',
    }),
    defineField({
      name: 'eligibilityScore',
      title: 'Minimum Eligibility Score',
      type: 'number',
    }),
    defineField({
      name: 'image',
      title: 'Program Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'content',
      title: 'Detailed Content',
      type: 'blockContent',
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
      title: 'name',
      programType: 'programType',
      status: 'status',
      media: 'image',
    },
    prepare(selection) {
      const {programType, status} = selection
      return {
        ...selection,
        subtitle: `${programType} - ${status}`,
      }
    },
  },
})
