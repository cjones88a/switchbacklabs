# Switchback Labs

A production-ready Next.js website for Switchback Labs, a product & growth studio in Fort Collins.

## 🚀 Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components (Button, Card, Input, Textarea, Separator)
- **Jest** for testing
- **Deployed on Vercel**

## 📁 Project Structure

```
src/
├── app/
│   ├── api/contact/route.ts          # Contact form API endpoint
│   ├── layout.tsx                    # Global layout with SEO metadata
│   ├── page.tsx                      # Homepage
│   ├── projects/page.tsx             # Projects page
│   ├── not-found.tsx                 # 404 page
│   ├── robots.txt/route.ts           # Robots.txt endpoint
│   └── sitemap.ts                    # Sitemap generation
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── ContactForm.tsx               # Contact form component
│   ├── Footer.tsx                    # Site footer
│   ├── Header.tsx                    # Site header
│   ├── MountainDivider.tsx           # SVG mountain divider
│   ├── ProjectCard.tsx               # Project card component
│   └── Section.tsx                   # Reusable section wrapper
└── lib/
    └── utils.ts                      # Utility functions (cn helper)
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 3. Run Tests

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
```

## 🌐 Deployment on Vercel

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/cjones88a/switchbacklabs/`
4. Vercel will auto-detect Next.js settings

### 2. Configure Domain

1. In your Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain: `switchbacklabsco.com`
4. Vercel will provide DNS records to configure

### 3. DNS Configuration

Add these DNS records to your domain provider:

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

Or use Vercel's recommended DNS records (they'll show you the exact values).

## 📝 Content Management

### Edit Copy Locations

**Homepage Hero** (`src/app/page.tsx`):
- Title: "Build. Ship. Iterate."
- Subtext: Update the description about Switchback Labs

**Services Section** (`src/app/page.tsx`):
- Product Strategy, Growth & CRM, Data & Apps cards

**About Section** (`src/app/page.tsx`):
- Company description and mission

**4SOH Project** (`src/app/projects/page.tsx`):
- Project description, problem, approach, features

### Social Links

Update social links in `src/components/Footer.tsx`:
- X (Twitter): `https://x.com/yourhandle`
- LinkedIn: `https://linkedin.com/company/switchbacklabs`
- Email: `hello@switchbacklabsco.com`

## 🧪 Testing

The project includes basic tests for the contact API:

```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
```

Tests cover:
- Valid contact form submissions
- Missing required fields validation
- Invalid email format validation
- Malformed JSON handling

## 📧 Contact Form

The contact form (`/api/contact`) currently:
- ✅ Validates required fields (name, email, message)
- ✅ Validates email format
- ✅ Logs submissions to console
- ❌ **No email integration yet** (TODO: Add SendGrid/Resend)

To add email integration:
1. Install email service (e.g., `npm install @sendgrid/mail`)
2. Add API key to environment variables
3. Update `src/app/api/contact/route.ts`

## 🎨 Styling

- **Design System**: Clean, minimal, mobile-first
- **Colors**: White background, gray text, subtle shadows
- **Components**: Rounded corners (`rounded-2xl`), soft shadows
- **Typography**: Large hero text, readable body text
- **Layout**: Max-width containers, responsive grids

## 🔍 SEO Features

- ✅ Meta tags and OpenGraph
- ✅ Twitter Card support
- ✅ Robots.txt
- ✅ Sitemap.xml
- ✅ Structured data ready
- ✅ Mobile-responsive

## 🚀 Performance

- ✅ Static generation for pages
- ✅ Optimized images
- ✅ Minimal JavaScript bundle
- ✅ Fast loading times

## 📱 Features

### Homepage (`/`)
- Hero section with CTAs
- About section
- Services (3 cards)
- Contact form
- Footer with social links

### Projects Page (`/projects`)
- Project cards grid
- 4SOH Tracking details section
- Expandable for more projects

### Contact Form
- Progressive enhancement
- Client-side validation
- Server-side logging
- Success/error states

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

### Code Quality

- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Prettier-ready formatting
- ✅ Component-based architecture
- ✅ Accessible HTML semantics

## 📄 License

Private project for Switchback Labs.

---

**Ready to deploy!** 🎉

The application is production-ready with:
- ✅ No TypeScript errors
- ✅ No ESLint errors  
- ✅ Successful build
- ✅ Passing tests
- ✅ SEO optimized
- ✅ Mobile responsive