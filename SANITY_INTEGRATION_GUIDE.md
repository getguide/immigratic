# 🚀 SANITY CMS INTEGRATION GUIDE

## 📋 **Overview**
This guide explains how to use Sanity CMS with your Immigratic website to manage content, blog posts, immigration programs, and policy updates.

## 🏗️ **What We've Set Up**

### **1. Sanity Studio (Content Management)**
- **Location**: `/sanity-studio/`
- **Purpose**: Admin interface for content creators
- **Features**: Visual content editing, image management, real-time collaboration

### **2. Sanity Client (Data Fetching)**
- **Location**: `/src/lib/sanity.ts`
- **Purpose**: Fetch data from Sanity in your Astro pages
- **Features**: Real-time data, image optimization, content queries

### **3. Content Schemas**
- **Blog Posts**: Articles, guides, and insights
- **Immigration Programs**: Program details and requirements
- **Policy Updates**: Immigration policy changes and announcements

## 🚀 **Getting Started**

### **Step 1: Start Sanity Studio**
```bash
cd sanity-studio
npm run dev
```
This opens the admin interface at `http://localhost:3333`

### **Step 2: Create Your First Content**
1. Open `http://localhost:3333` in your browser
2. Log in with your Sanity account
3. Start creating blog posts, programs, or policy updates

### **Step 3: Use Content in Your Pages**
```astro
---
import { client } from '../../lib/sanity.js';

// Fetch data from Sanity
const posts = await client.fetch(`
  *[_type == "post"] | order(publishedAt desc) {
    title,
    excerpt,
    "mainImage": mainImage.asset->url
  }
`);
---
```

## 📝 **Content Types Available**

### **Blog Posts (`post`)**
- **Title**: Post headline
- **Slug**: URL-friendly identifier
- **Author**: Content creator
- **Main Image**: Featured image with hotspot editing
- **Categories**: Content classification
- **Excerpt**: Short summary
- **Body**: Rich text content
- **SEO**: Meta tags and keywords

### **Immigration Programs (`immigrationProgram`)**
- **Name**: Program title
- **Type**: Express Entry, Provincial, etc.
- **Status**: Active, Coming Soon, etc.
- **Requirements**: Array of requirements
- **Processing Time**: Estimated duration
- **Cost**: Program fees
- **Eligibility Score**: Minimum CRS score
- **Content**: Detailed program information

### **Policy Updates (`policyUpdate`)**
- **Title**: Update headline
- **Type**: Express Entry, Provincial, etc.
- **Priority**: Critical, High, Medium, Low
- **Effective Date**: When changes take effect
- **Impact**: How it affects applicants
- **Action Required**: What applicants need to do
- **Source**: Official government link

## 🔧 **Advanced Features**

### **Real-Time Updates**
Sanity provides real-time updates. When content changes in the studio, your website automatically reflects the changes.

### **Image Optimization**
```astro
---
import { urlFor } from '../../lib/sanity.js';

// Optimize images automatically
const imageUrl = urlFor(post.mainImage).width(800).height(600).url();
---
```

### **Content Filtering**
```astro
---
// Get only active programs
const activePrograms = await client.fetch(`
  *[_type == "immigrationProgram" && status == "active"] {
    name,
    description,
    requirements
  }
`);

// Get programs by type
const eePrograms = await client.fetch(`
  *[_type == "immigrationProgram" && programType == "express-entry"] {
    name,
    eligibilityScore
  }
`);
---
```

### **Pagination**
```astro
---
// Get posts with pagination
const posts = await client.fetch(`
  *[_type == "post"] | order(publishedAt desc) [0...10]
`);
---
```

## 📱 **Content Management Workflow**

### **1. Content Creation**
1. Open Sanity Studio
2. Select content type (Post, Program, Policy Update)
3. Fill in required fields
4. Add images, categories, and SEO data
5. Publish or save as draft

### **2. Content Editing**
1. Find content in Sanity Studio
2. Make changes in real-time
3. Preview changes
4. Publish updates

### **3. Content Organization**
- Use categories and tags
- Set priority levels for policy updates
- Organize programs by type and status
- Create content relationships

## 🎨 **Customizing Schemas**

### **Adding New Fields**
```typescript
// In your schema file
defineField({
  name: 'newField',
  title: 'New Field',
  type: 'string',
  validation: (Rule) => Rule.required(),
})
```

### **Creating New Content Types**
1. Create new schema file in `/sanity-studio/schemaTypes/`
2. Add to `index.ts`
3. Restart Sanity Studio

### **Field Types Available**
- **string**: Text input
- **text**: Multi-line text
- **number**: Numeric values
- **boolean**: True/false
- **date**: Date picker
- **datetime**: Date and time
- **url**: Web addresses
- **email**: Email addresses
- **image**: Image uploads
- **file**: File uploads
- **array**: Lists of items
- **object**: Structured data
- **reference**: Links to other content

## 🔐 **Security & Access Control**

### **Public vs Private Content**
- **Public**: Accessible without authentication
- **Private**: Requires API token for access

### **API Tokens**
```typescript
// For private content
export const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN, // Add this for private content
})
```

## 📊 **Performance Optimization**

### **CDN Usage**
```typescript
// For production
export const client = createClient({
  // ... other config
  useCdn: true, // Enable CDN for faster delivery
})
```

### **Query Optimization**
```astro
---
// Only fetch needed fields
const posts = await client.fetch(`
  *[_type == "post"] {
    title,
    slug,
    excerpt,
    "mainImage": mainImage.asset->url
  }
`);

// Use projections for better performance
const programs = await client.fetch(`
  *[_type == "immigrationProgram"] {
    name,
    "imageUrl": image.asset->url,
    "requirements": requirements[0...5] // Limit array size
  }
`);
---
```

## 🚀 **Deployment**

### **Vercel Deployment**
1. Sanity Studio builds automatically
2. Environment variables are configured
3. Content updates are live immediately

### **Environment Variables**
```bash
# Add to your deployment environment
SANITY_PROJECT_ID=kxqfasm6
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_USE_CDN=true
```

## 📚 **Useful Resources**

### **Sanity Documentation**
- [Sanity Docs](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Schema Types](https://www.sanity.io/docs/schema-types)

### **Astro Integration**
- [Astro + Sanity](https://docs.astro.build/en/guides/integrations-guide/sanity/)
- [Server-Side Rendering](https://docs.astro.build/en/guides/server-side-rendering/)

## 🎯 **Next Steps**

### **Immediate Actions**
1. **Start Sanity Studio**: `cd sanity-studio && npm run dev`
2. **Create Sample Content**: Add a blog post or program
3. **Test Integration**: Visit your blog page to see content

### **Future Enhancements**
1. **Add More Content Types**: FAQs, testimonials, case studies
2. **Implement Search**: Full-text search across content
3. **Add Comments**: User engagement features
4. **Content Scheduling**: Publish content at specific times
5. **Multi-language Support**: Content in multiple languages

---

## 🎉 **You're All Set!**

Your Immigratic website now has a powerful content management system that will:
- ✅ **Simplify content updates** for your team
- ✅ **Improve SEO** with structured content
- ✅ **Enable real-time collaboration** on content
- ✅ **Provide professional content editing** interface
- ✅ **Scale with your content needs**

**Start creating amazing immigration content today!** 🚀✨
