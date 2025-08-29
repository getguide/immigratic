# 🎯 BREADCRUMB QUICK REFERENCE CARD

## 🚀 **For Any New Page - Copy This Template:**

```astro
---
import Layout from '../../../layouts/Layout.astro';
import Breadcrumbs from '../../../components/Breadcrumbs.astro';
---

<Layout title="Your Page Title | Immigratic">
  <Breadcrumbs 
    items={[
      { text: "Home", href: "/" },
      { text: "Section", href: "/section/" },
      { text: "Current Page", current: true }
    ]}
  />
  
  <!-- Your page content here -->
</Layout>
```

## 📁 **Common Paths (Copy & Paste):**

### **Services Pages:**
```astro
// Main Services
items={[
  { text: "Home", href: "/" },
  { text: "Services", current: true }
]}

// PR Services
items={[
  { text: "Home", href: "/" },
  { text: "Services", href: "/services/" },
  { text: "PR", current: true }
]}

// Express Entry
items={[
  { text: "Home", href: "/" },
  { text: "Services", href: "/services/" },
  { text: "PR", href: "/services/pr/" },
  { text: "EE", href: "/services/pr/ee/" },
  { text: "Category", current: true }
]}

// OINP
items={[
  { text: "Home", href: "/" },
  { text: "Services", href: "/services/" },
  { text: "PR", href: "/services/pr/" },
  { text: "OINP", href: "/services/pr/oinp/" },
  { text: "Program", current: true }
]}
```

### **Tools Pages:**
```astro
items={[
  { text: "Home", href: "/" },
  { text: "Tools", href: "/tools/" },
  { text: "Tool Name", current: true }
]}
```

### **Resources Pages:**
```astro
items={[
  { text: "Home", href: "/" },
  { text: "Resources", href: "/resources/" },
  { text: "Category", href: "/resources/category/" },
  { text: "Page Name", current: true }
]}
```

### **Solutions Pages:**
```astro
items={[
  { text: "Home", href: "/" },
  { text: "Solutions", href: "/solutions/" },
  { text: "Solution Name", current: true }
]}
```

## ⚠️ **NEVER DO:**
- ❌ Don't create custom breadcrumb HTML
- ❌ Don't add custom breadcrumb CSS
- ❌ Don't forget to import Breadcrumbs component
- ❌ Don't forget `current: true` on last item

## ✅ **ALWAYS DO:**
- ✅ Import Breadcrumbs component
- ✅ Use `<Breadcrumbs items={[...]} />`
- ✅ Position after Layout title
- ✅ Mark current page with `current: true`

---

**📚 Full Guide: See `BREADCRUMB_SYSTEM_GUIDE.md`**
**🎯 Remember: Every new page MUST use this system!**
