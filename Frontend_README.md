<div align="center">

# 🎸 CR Frontend

### A modern, feature-rich musical instruments & audio equipment e-commerce storefront

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Overview

**CR Frontend** is the customer-facing storefront for the CR musical instruments & audio equipment e-commerce platform. Built with **React 18**, **TypeScript**, and **Tailwind CSS**, it delivers a complete shopping experience — from browsing curated instrument collections, through variant-aware product selection, all the way to Razorpay-powered checkout and post-purchase order management. The UI is powered by **shadcn/ui** and **Radix UI** primitives for accessible, polished components, with **TanStack Query** handling all server-state management.

---

## ✨ Features

### 🏠 Home / Landing Page
- **Hero section** with prominent call-to-action and branding
- **Category banners** for quick navigation to instrument categories
- **Featured products** carousel fetched from the backend API
- **Best-selling products** section highlighting popular items
- **Guitar collection** showcase section
- **Company/brand logos** strip displaying partner brands
- Shared **Header** (sticky, responsive) and **Footer** across all pages

### 🔍 Shop & Product Discovery
- **Full product listing** fetched from backend API with loading states
- **Hierarchical category filter** — parent/child category tree (Amplifiers, Microphones, Speakers, Drivers, etc.) with cascading checkbox selection
- **Brand filter** — multi-select from 20+ featured brands (Ahuja, Yamaha, Pioneer, etc.)
- **Price range slider** — dynamic min/max based on actual product prices, with INR formatting
- **Text search** — filters by product name, category, and brand simultaneously
- **Sort options** — Featured, Newest, Price Low-to-High, Price High-to-Low, Most Popular
- **Result count indicator** and **Clear/Reset all filters** button
- **Responsive product grid** (1–3 columns based on viewport)

### 🧾 Product Detail Page
- **Multi-image gallery** with thumbnail strip and image switching
- **Breadcrumb navigation** (Home → Instruments → Product Name)
- **Brand badge** and category display
- **Variant selector** — Configuration and Finish selection with:
  - Dynamic variant matching by configuration + finish combination
  - Per-variant pricing (overrides base price when available)
  - Per-variant image sets (switches gallery when variant selected)
  - Stock-per-variant awareness with out-of-stock handling
- **Quantity selector** with stock-capped increment
- **Sale badge** and original/discounted price display
- **Product specifications** table
- **Detailed product description** section
- **Add to Cart** button with contextual labels (Select Configuration, Out of Stock, Unavailable)
- **Wishlist toggle** (heart icon) on product detail page
- **Customer reviews** section (see Reviews below)
- **Related products** — "More in [category]" section showing up to 4 related items
- **Variant data issue alerts** — graceful handling when variant data is incomplete
- **Error states** — dedicated 404 / generic error views with retry navigation

### 🛒 Cart System
- **Full cart page** (`/cart`) with detailed item display
- **Slide-out cart sidebar** accessible from header badge (overlay drawer)
- **Variant-aware cart items** — each item stores productId, variantId, configuration, finish, SKU
- **Real-time stock verification** — TanStack Query fetches current product data to verify stock levels per variant
- **Stock status indicators** — In Stock (≥5), Only X left (1-4), Out of Stock (0)
- **Quantity controls** with stock-capped increment/decrement
- **Save to Wishlist** option for unavailable items
- **Order summary sidebar** — subtotal, estimated shipping (free or calculated for oversized items), grand total
- **Blocking issue detection** — disables checkout when cart has unavailable variants, out-of-stock items, or quantity-exceeds-stock conflicts
- **Cart persistence** via localStorage across sessions
- **Toast notifications** on add, remove, quantity change, and clear operations
- **Empty cart state** with "Continue Shopping" redirect

### 💳 Checkout & Payment
- **Protected route** — redirects unauthenticated users to login
- **Saved address selection** — fetches user's address book, auto-fills form from selected address
- **Address management link** — "Manage" button navigates to address book
- **Shipping form** — First Name, Last Name, Email, Phone, Address, City, State, ZIP Code with validation
- **Variant validation** — blocks checkout if cart items are missing variant selections
- **Razorpay payment integration**:
  - Dynamic Razorpay SDK loading (script injection)
  - Payment order creation via backend API
  - Razorpay checkout modal with user profile prefill
  - Payment success verification via webhook endpoint
  - Payment failure and dismissal handling
  - Error boundary (`PaymentFlowErrorBoundary`) wrapping the entire checkout flow
- **Order summary panel** — line items with images, variant details, quantities, subtotal/tax/shipping/total
- **Processing state** — disables submit during payment processing
- **Last order snapshot** — persists to localStorage for order confirmation page fallback

### ✅ Order Confirmation Page
- **Protected route** with authentication & ownership verification
- **Order data fetching** via TanStack Query with Zod schema validation
- **Rich confirmation UI**:
  - Animated success icon with ping effect
  - Order ID and placement date
  - Full order item listing with images, variant details, unit/line prices
  - Pricing breakdown (subtotal, shipping, tax/GST, grand total)
- **Delivery details** card — shipping address, estimated delivery date (3-5 business days via `date-fns`), carrier info
- **Payment summary** card — payment method, transaction ID, amount paid, payment status badge
- **Email confirmation status** — shows sent/pending/error states with timestamps
- **Resend confirmation email** button with mutation state management
- **Print-friendly receipt** — `@media print` styles hide header/footer, optimize layout
- **Image resolution** — resolves order item images from backend URLs, local assets, or fallbacks
- **"What happens next?"** — step-by-step post-purchase guidance
- **Navigation actions** — View Orders, Continue Shopping

### 📦 Order Management
- **Orders list page** (`/account/orders`) — paginated, filterable, sortable:
  - **Status filter pills** — All, Confirmed, Processing, Completed, Cancelled
  - **Sort options** — Most Recent, Oldest First, Price High-to-Low, Price Low-to-High
  - **Pagination controls** with page indicators
  - **Results count** display
  - **Loading skeletons** during fetch
  - **Empty state** and **error state** with retry
- **Order detail page** (`/orders/:orderId`):
  - **Order header** — order number, status badge (Pending/Confirmed/Shipped/Delivered/Cancelled with color-coded styling), placement date
  - **Order timeline** component — visual progress tracker
  - **Order items table** — product details, quantities, pricing
  - **Shipping address** card with "Change address" option (for eligible statuses)
  - **Payment information** — method, transaction ID, amount, payment status badge
  - **Tracking information** — carrier, tracking number, estimated delivery, current location (shown for shipped statuses)
  - **Order actions** — Cancel Order (eligible statuses), Reorder (adds all items back to cart), Return/Exchange, Contact Support
  - **Print & Download PDF** buttons
  - **Auth protection** — redirects to login if session expired, handles 401/403/404 states

### ❤️ Wishlist
- **Protected route** — requires authentication
- **Wishlist grid** (1–4 columns responsive) with item cards
- **Product image** with hover scale animation
- **Remove button** (X icon) per item
- **"Choose Options"** button — navigates to product detail page for variant selection
- **Price display** with original/sale price support
- **Empty wishlist state** with "Continue Shopping" redirect
- **Wishlist persistence** via localStorage
- **Header badge** showing wishlist item count
- **Toggle wishlist** from product detail page (heart icon)
- **Save-to-wishlist** from cart for unavailable items

### 👤 Authentication System
- **Login page** (`/login`):
  - Email/password form with Zod validation
  - Password visibility toggle
  - "Forgot password?" link
  - Google OAuth login button with loading state
  - Session expired and OAuth error toast notifications
  - Redirect-after-login support (preserves intended URL)
  - Auto-redirect if already authenticated
- **Registration page** (`/register`):
  - Name, email, password form with Zod validation
  - Real-time password strength rules (8+ chars, uppercase, number)
  - Google OAuth registration
  - Auto-redirect if already authenticated
- **Forgot password page** (`/forgot-password`):
  - Email submission form
  - Success confirmation with "Check your inbox" message
  - Retry option
- **Reset password page** (`/reset-password`):
  - Token-based password reset flow
- **OAuth callback page** (`/auth/callback`):
  - Handles Google OAuth redirect, extracts token, sets auth state
- **Auth context** (`AuthContext`):
  - JWT token management (localStorage)
  - Profile fetching on mount (`/auth/profile`)
  - Login, register, logout, loginWithGoogle methods
  - `isAuthenticated` and `isLoading` state
- **Protected routes** (`ProtectedRoute` component):
  - Wraps Checkout, Orders, Account, Address Book, Wishlist pages
  - Redirects to login with return URL preservation
- **Axios interceptor**:
  - Auto-attaches Bearer token to all API requests
  - 401 response handler — clears tokens and redirects to login with session-expired flag

### 👤 Account & Profile
- **Account page** (`/account`):
  - User avatar with initials fallback
  - Profile details — full name, email
  - Account status — role, auth provider
  - "View My Orders" quick link
  - Logout button
- **Account dropdown menu** (header):
  - Shows user avatar, name, and email
  - Quick navigation to My Account
  - Logout option

### 📍 Address Book
- **Address book page** (`/account/addresses`):
  - Full CRUD operations on saved shipping addresses
  - **Add new address** — form dialog with Zod validation (label, full name, phone, address lines, city, state, ZIP)
  - **Edit address** — pre-populated form dialog
  - **Delete address** — confirmation dialog
  - **Set default address** — one-click default toggle
  - **Address cards** — display label, full name, phone, address details, default badge
  - **Sorted display** — default address first, then by creation date
  - **Loading skeletons** during data fetch
  - **Error handling** with API error message extraction
  - **Optimistic mutations** via TanStack Query (`useAddresses`, `useCreateAddress`, `useUpdateAddress`, `useDeleteAddress`, `useSetDefaultAddress`)
- **Checkout integration** — saved addresses are selectable during checkout with auto-fill

### ⭐ Product Reviews & Ratings
- **Review list** on product detail pages:
  - Aggregated rating summary — average rating (x.x / 5.0), total review count, star display
  - **Rating distribution** — visual bar chart for 5→1 stars with percentages
  - **Click-to-filter** — click a rating bar to filter reviews by that star level
  - **Sort options** — Most Recent, Most Helpful, Highest Rated, Lowest Rated
  - **Pagination** — Previous/Next controls with page number buttons
  - **Review cards** — user avatar/initials, name, star rating, date, review title, comment (with expand/collapse for long text), review images
  - **Verified purchase badge** — green "Verified Purchase" indicator
  - **Helpful voting** — thumbs up/down with optimistic UI updates, login requirement enforcement
  - **Report review** button
- **Write review modal**:
  - Star rating selector (1-5)
  - Review title input (10-200 chars)
  - Review comment textarea (20-2000 chars) with character counter
  - Image upload (up to 3 images) with preview and remove
  - Zod validation for all fields
  - Success state with "pending approval" message
  - Login redirect for unauthenticated users
  - Auto-refetch reviews on successful submission

### 🗂️ UI Component Library (shadcn/ui + Custom)
- **49 base UI components** from shadcn/ui: Accordion, Alert, AlertDialog, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toggle, ToggleGroup, Tooltip
- **Custom components**: BestSellingProducts, BrandLogos, CartItem, CartSidebar, CategoryBanners, CompanyLogos, FeaturedProducts, Features, Footer, GuitarCollection, Header, Hero, NavLink, OrderDetailSkeleton, OrderItemsTable, OrderListItem, OrderSkeleton, OrderTimeline, ProductCard, ReviewList, Testimonials, VariantSelector, WriteReviewModal
- **Address components**: AddressCard, AddressFormDialog, DeleteAddressDialog, addressSchema
- **Auth components**: ProtectedRoute
- **Payment components**: PaymentFlowErrorBoundary

### 📱 Responsive Design
- Fully responsive across mobile, tablet, and desktop breakpoints
- Mobile hamburger menu with navigation links and account access
- Responsive grids on Shop (1-3 cols), Wishlist (1-4 cols), Cart, Checkout
- Sticky header with adaptive icon layout

### ⚡ Developer Experience
- **Vite 5** — instant HMR with React Fast Refresh (SWC plugin)
- **TypeScript 5.8** — strict type safety throughout
- **ESLint 9** — linting with React hooks and React Refresh plugins
- **Path aliases** — `@/` mapped to `src/` for clean imports
- **TanStack Query** — server-state caching, background refetching, optimistic updates
- **React Hook Form + Zod** — type-safe form validation
- **Axios interceptors** — centralized auth token injection and 401 handling
- **Sonner + Radix Toast** — dual toast notification systems

---

## 🗂️ Project Structure

```
CR-Frontend/
├── public/                          # Static assets (favicon, etc.)
├── src/
│   ├── assets/                      # Static images & media
│   ├── components/
│   │   ├── ui/                      # 49 shadcn/ui base components
│   │   ├── addresses/               # AddressCard, AddressFormDialog,
│   │   │                            #   DeleteAddressDialog, addressSchema
│   │   ├── auth/                    # ProtectedRoute
│   │   ├── payment/                 # PaymentFlowErrorBoundary
│   │   ├── Header.tsx               # Sticky header with nav, auth menu,
│   │   │                            #   cart/wishlist badges
│   │   ├── Footer.tsx               # Site-wide footer
│   │   ├── Hero.tsx                 # Landing hero section
│   │   ├── CartSidebar.tsx          # Slide-out cart drawer
│   │   ├── CartItem.tsx             # Cart item with stock indicators
│   │   ├── ProductCard.tsx          # Product grid card
│   │   ├── VariantSelector.tsx      # Configuration/finish picker
│   │   ├── ReviewList.tsx           # Review list with stats & pagination
│   │   ├── WriteReviewModal.tsx     # Review submission dialog
│   │   ├── OrderListItem.tsx        # Order card for orders list
│   │   ├── OrderTimeline.tsx        # Visual order status timeline
│   │   ├── OrderItemsTable.tsx      # Order items detail table
│   │   ├── FeaturedProducts.tsx     # Featured products carousel
│   │   ├── BestSellingProducts.tsx  # Best sellers section
│   │   ├── CategoryBanners.tsx      # Category navigation banners
│   │   └── ...                      # More reusable components
│   ├── pages/
│   │   ├── Index.tsx                # Home / landing page
│   │   ├── Shop.tsx                 # Product listing with filters
│   │   ├── ProductDetail.tsx        # Single product view
│   │   ├── Cart.tsx                 # Full cart page
│   │   ├── Checkout.tsx             # Checkout with Razorpay payment
│   │   ├── OrderConfirmation.tsx    # Post-purchase confirmation
│   │   ├── Account.tsx              # User profile / account
│   │   ├── AccountOrders.tsx        # Order history (paginated)
│   │   ├── OrderDetail.tsx          # Individual order detail
│   │   ├── AddressBook.tsx          # Address CRUD management
│   │   ├── Wishlist.tsx             # Saved items
│   │   ├── Login.tsx                # Sign in (email + Google OAuth)
│   │   ├── Register.tsx             # Create account
│   │   ├── ForgotPassword.tsx       # Password reset request
│   │   ├── ResetPassword.tsx        # Password reset form
│   │   ├── OAuthCallback.tsx        # Google OAuth token handler
│   │   └── NotFound.tsx             # 404 page
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Auth state, JWT, login/logout
│   │   ├── CartContext.tsx          # Cart state (localStorage-backed)
│   │   ├── WishlistContext.tsx      # Wishlist state (localStorage-backed)
│   │   └── OrderContext.tsx         # Confirmed order ID tracking
│   ├── hooks/
│   │   ├── useAddresses.ts          # Address CRUD hooks (TanStack Query)
│   │   ├── useOrders.ts             # Orders list hook with pagination
│   │   ├── useOrderDetail.ts        # Single order detail hook
│   │   ├── use-toast.ts             # Toast notification hook
│   │   └── use-mobile.tsx           # Mobile breakpoint detection
│   ├── services/
│   │   ├── paymentService.ts        # Razorpay SDK, payment order,
│   │   │                            #   verification, email resend
│   │   └── addressService.ts        # Address API service layer
│   ├── lib/
│   │   ├── api.ts                   # Axios instance, products, orders,
│   │   │                            #   reviews, auth API functions
│   │   ├── axios.ts                 # Base Axios config & interceptors
│   │   ├── lastOrder.ts             # Last order snapshot (localStorage)
│   │   └── utils.ts                 # cn(), formatINR()
│   ├── data/
│   │   └── products.ts              # Static/mock product data
│   ├── App.tsx                      # Root component, providers & routes
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles & CSS variables
├── index.html                       # HTML entry with meta tags
├── tailwind.config.ts               # Tailwind config & design tokens
├── vite.config.ts                   # Vite config with path aliases
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies & scripts
```

---

## 🛤️ Routes

| Route | Page | Protection | Description |
|-------|------|------------|-------------|
| `/` | Index | Public | Home / landing page |
| `/shop` | Shop | Public | Product listing with filters & search |
| `/product/:id` | ProductDetail | Public | Single product view with variants & reviews |
| `/cart` | Cart | Public | Shopping cart with stock verification |
| `/checkout` | Checkout | 🔒 Auth | Shipping info + Razorpay payment |
| `/order-confirmation/:orderId` | OrderConfirmation | 🔒 Auth | Post-purchase confirmation & receipt |
| `/account` | Account | 🔒 Auth | User profile dashboard |
| `/account/orders` | AccountOrders | 🔒 Auth | Paginated order history |
| `/account/addresses` | AddressBook | 🔒 Auth | Address CRUD management |
| `/orders/:orderId` | OrderDetail | 🔒 Auth | Individual order detail & tracking |
| `/wishlist` | Wishlist | 🔒 Auth | Saved items list |
| `/login` | Login | Public | Sign in (email/password + Google OAuth) |
| `/register` | Register | Public | Create new account |
| `/forgot-password` | ForgotPassword | Public | Password reset email request |
| `/reset-password` | ResetPassword | Public | Token-based password reset |
| `/auth/callback` | OAuthCallback | Public | Google OAuth token handler |
| `*` | NotFound | Public | 404 fallback page |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
- CR Backend server running at `http://localhost:5000`

### Installation & Setup

```bash
# 1. Navigate to the frontend directory
cd CR-Frontend

# 2. Install dependencies
npm install

# 3. Configure environment
# Create a .env file in the root with:
echo "VITE_API_URL=http://localhost:5000" > .env

# 4. Start the development server
npm run dev
```

The storefront will be available at **[http://localhost:5173](http://localhost:5173)**.

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## 🧰 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^18.3.1 | UI framework |
| **TypeScript** | ^5.8.3 | Type safety |
| **Vite** | ^5.4.19 | Build tool & dev server |
| **Tailwind CSS** | ^3.4.17 | Utility-first styling |
| **shadcn/ui** | Latest | Accessible component library (49 components) |
| **Radix UI** | Various | Headless UI primitives |
| **React Router DOM** | ^6.30.1 | Client-side routing (17 routes) |
| **TanStack Query** | ^5.83.0 | Server state, caching & data fetching |
| **Axios** | ^1.13.2 | HTTP API client with interceptors |
| **React Hook Form** | ^7.66.0 | Form state management |
| **Zod** | ^3.25.76 | Schema validation (forms, API responses) |
| **Razorpay Checkout** | SDK v1 | Payment gateway integration |
| **date-fns** | ^3.6.0 | Date formatting & calculation |
| **Recharts** | ^2.15.4 | Data visualization |
| **Lucide React** | ^0.462.0 | Icon library |
| **Sonner** | ^1.7.4 | Toast notifications |
| **next-themes** | ^0.3.0 | Dark/light mode support |
| **Embla Carousel** | ^8.6.0 | Carousel/slider primitives |
| **class-variance-authority** | ^0.7.1 | Component variant styling |
| **tailwind-merge** | ^2.6.0 | Tailwind class deduplication |
| **tailwindcss-animate** | ^1.0.7 | Animation utilities |

---

## 🎨 Design System

The UI follows a consistent design system built on Tailwind CSS custom tokens:

- **Typography**: Inter / system font stack, Playfair Display for branding
- **Color Palette**: Stone/neutral grays with warm, music-focused accent colors; emerald for success/confirmation states; amber for warnings; red for errors
- **Components**: Fully accessible via Radix UI primitives
- **Animations**: Smooth micro-interactions with `tailwindcss-animate`, custom ping/zoom-in effects
- **Dark Mode**: System-aware + user-toggleable via `next-themes`
- **Layout**: Container-based responsive design with consistent spacing tokens
- **Cards**: Rounded corners (2xl/3xl), subtle shadows, stone-toned borders
- **Forms**: Rounded-xl inputs with focus ring states, inline validation errors

---

## 🔗 API Integration

The frontend communicates with the CR Backend via a centralized Axios instance:

| Endpoint | Method | Usage |
|----------|--------|-------|
| `/api/v1/products` | GET | Fetch all products |
| `/api/v1/products/:id` | GET | Fetch single product |
| `/api/v1/products/:id/reviews` | GET | Fetch product reviews (paginated) |
| `/api/v1/products/:id/reviews` | POST | Create a product review |
| `/api/v1/products/:id/reviews/:reviewId/vote` | POST | Vote helpful/unhelpful |
| `/api/v1/auth/login` | POST | Email/password login |
| `/api/v1/auth/register` | POST | Create account |
| `/api/v1/auth/logout` | POST | Logout |
| `/api/v1/auth/profile` | GET | Fetch user profile |
| `/api/v1/auth/google` | GET | Google OAuth redirect |
| `/api/v1/auth/forgot-password` | POST | Request password reset |
| `/api/v1/orders` | GET | Fetch user orders (paginated) |
| `/api/v1/orders/:id` | GET | Fetch order detail |
| `/api/v1/addresses` | GET/POST | List & create addresses |
| `/api/v1/addresses/:id` | PUT/DELETE | Update & delete addresses |
| `/api/v1/addresses/:id/default` | PATCH | Set default address |
| `/api/v1/payments/create-order` | POST | Create Razorpay payment order |
| `/api/v1/payments/verify-webhook` | POST | Verify payment signature |
| `/api/v1/payments/:orderId/resend-confirmation` | POST | Resend order confirmation email |

---

## 🔗 Related Services

- **[CR Backend](../CR-Backend/README.md)** — REST API server (Express + MongoDB)
- **[CR Admin](../CR-Admin/README.md)** — Admin dashboard panel

---

## 📄 License

This project is private and proprietary. All rights reserved.