import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'newsletter',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Unsubscribed', value: 'unsubscribed'},
          {title: 'Bounced', value: 'bounced'},
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Where did this subscriber come from? (e.g., blog, homepage, etc.)',
    }),
    defineField({
      name: 'interests',
      title: 'Interests',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Express Entry', value: 'express-entry'},
          {title: 'OINP', value: 'oinp'},
          {title: 'Temporary Residence', value: 'temporary-residence'},
          {title: 'Policy Updates', value: 'policy-updates'},
          {title: 'Immigration News', value: 'immigration-news'},
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'firstName',
      media: 'status',
    },
    prepare(selection) {
      const {title, subtitle, media} = selection
      return {
        title: title,
        subtitle: subtitle ? `${subtitle} - ${media}` : media,
      }
    },
  },
})
