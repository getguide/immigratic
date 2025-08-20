# Program Page Template

Based on the successful CEC page (/services/pr/ee-cec.astro), this template provides the structure for creating consistent, high-quality program-specific pages.

## 📋 Page Structure

### 1. **Header & Meta**
- SEO-optimized title and description
- Open Graph and Twitter Card meta tags
- Canonical URL and structured data

### 2. **Breadcrumb Navigation**
```astro
<!-- Breadcrumb Navigation -->
<div class="bg-gray-50 dark:bg-gray-800 py-3 border-b border-gray-200 dark:border-gray-700">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <nav class="flex text-sm" aria-label="Breadcrumb">
      <!-- Breadcrumb items with proper structure -->
    </nav>
  </div>
</div>
```

### 3. **Floating Page Navigation**
```astro
<!-- Floating Page Navigation -->
<div class="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
  <nav class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-3 sm:p-4">
    <!-- Navigation items linking to page sections -->
  </nav>
</div>
```

### 4. **Hero Section with Dynamic Tabs**
- Overview tab with key information
- Quick Check tab for eligibility
- Advantages tab highlighting benefits
- Responsive card layout with proper mobile optimization

### 5. **Main Content Sections**

#### A. **Eligibility Section** (`#eligibility`)
- Requirements cards with hover effects
- Enhanced animations and interactions
- Mobile-responsive layout
- Bullet point animations

#### B. **Success Stories Section** (`#success-stories`)
- Client testimonials (use generic templates)
- Success metrics
- Professional presentation

#### C. **Process Timeline Section** (`#process`)
- **Progressive Timeline with Mobile Support**
- Desktop: Central vertical timeline
- Mobile: Fixed left-side progress bar with smart visibility
- 5-step process cards with animations
- Scroll-triggered progress animations

#### D. **Insights Section** (`#insights`)
- Latest program data and statistics
- Interactive cards with hover effects
- Real-time information display

### 6. **Final CTA Section**
- Counter animations for success metrics
- Dual CTA buttons (Assessment + Consultation)
- Trust indicators
- Responsive design

## 🎨 Key Features

### **Progressive Timeline System**
```javascript
// Mobile timeline visibility (only shows during process section)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      mobileTimeline.style.opacity = '1';
    } else {
      mobileTimeline.style.opacity = '0';
    }
  });
});
```

### **Counter Animations**
```astro
<span class="counter" data-target="96">0</span>%
<span class="counter" data-target="1200">0</span>+
<span class="counter" data-target="5.2" data-decimal="true">0</span>m
```

### **Enhanced Hover Effects**
- Card hover animations with scale and shadow effects
- Bullet point interactions
- Progressive reveal animations
- Mobile-optimized touch interactions

## 🔧 Technical Requirements

### **CSS Classes Used**
- `.timeline-step`, `.timeline-card`, `.timeline-step-number`
- `.mobile-timeline-container`, `.mobile-timeline-progress`
- `.counter` for animated numbers
- `.eligibility-card`, `.insight-card` for section-specific styling

### **JavaScript Functions**
- `initProgressiveTimeline()` - Timeline animations
- `animateCounters()` - Number counter animations
- Intersection Observer for scroll-triggered effects

### **Responsive Breakpoints**
- Mobile: `@media (max-width: 768px)`
- Tablet: `md:` classes
- Desktop: `lg:` and `xl:` classes

## 📱 Mobile Optimizations

### **Timeline Adjustments**
- Fixed positioning for progress bar
- Section-aware visibility
- Optimized spacing and margins
- Touch-friendly interactions

### **Content Adaptations**
- Stacked layouts for small screens
- Simplified navigation
- Optimized font sizes and spacing
- Reduced animation complexity for performance

## 🎯 UTM Parameter Structure

```
utm_source=immigratic
utm_medium=website  
utm_campaign=[program]_page
utm_content=[section]_[action]
```

Examples:
- `utm_campaign=cec_page&utm_content=hero_assessment`
- `utm_campaign=fsw_page&utm_content=final_cta_consultation`

## 🚀 Replication Steps

1. **Copy base structure** from CEC page
2. **Update program-specific content** (requirements, timelines, data)
3. **Modify hero section** tabs and content
4. **Adapt process timeline** for program specifics
5. **Update insights section** with relevant data
6. **Test responsiveness** and animations
7. **Verify UTM parameters** and links

This template ensures consistency across all program pages while maintaining the high-quality user experience established in the CEC page.
