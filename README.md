<div align="center">

# 🎸 CR Frontend

### A modern, feature-rich musical instruments e-commerce storefront

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Overview

**CR Frontend** is the customer-facing storefront for the CR musical instruments e-commerce platform. Built with **React 18**, **TypeScript**, and **Tailwind CSS**, it offers a seamless shopping experience — from browsing curated instrument collections to a smooth, intuitive checkout flow. The UI is powered by **shadcn/ui** and **Radix UI** primitives for accessible, polished components.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🏠 **Home / Landing Page** | Hero section, featured instruments, promotions |
| 🔍 **Shop & Discovery** | Filter by category, search, and sort instruments |
| 🧾 **Product Detail Page** | Image gallery, configuration/finish selection, add-to-cart |
| 🛒 **Cart & Checkout** | Multi-step checkout with order summary |
| ❤️ **Wishlist** | Save favourite instruments across sessions |
| 👤 **User Authentication** | Login, registration, and profile management |
| 📱 **Fully Responsive** | Optimized for mobile, tablet, and desktop |
| ⚡ **Instant HMR** | Vite-powered development with React Fast Refresh |

---

## 🗂️ Project Structure

```
CR-Frontend/
├── public/                     # Static assets (favicon, etc.)
├── src/
│   ├── components/             # 60+ reusable UI components
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── Header/             # Navigation & cart icon
│   │   ├── Footer/             # Site-wide footer
│   │   ├── Hero/               # Landing hero section
│   │   ├── ProductCard/        # Reusable product display card
│   │   └── ...                 # Many more!
│   ├── pages/
│   │   ├── Index.tsx           # Home page
│   │   ├── Shop.tsx            # Product listing & filters
│   │   ├── ProductDetail.tsx   # Single product view
│   │   ├── Checkout.tsx        # Order checkout flow
│   │   ├── Wishlist.tsx        # Saved items
│   │   └── NotFound.tsx        # 404 page
│   ├── contexts/               # React Context (Cart, Auth)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions (cn, axios)
│   ├── data/                   # Static/mock data
│   ├── App.tsx                 # Root component & routes
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles & CSS variables
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

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
| **shadcn/ui** | Latest | Accessible component library |
| **Radix UI** | Various | Headless UI primitives |
| **React Router DOM** | ^6.30.1 | Client-side routing |
| **TanStack Query** | ^5.83.0 | Server state & data fetching |
| **Axios** | ^1.13.2 | HTTP API client |
| **React Hook Form** | ^7.66.0 | Form state management |
| **Zod** | ^3.25.76 | Form validation schemas |
| **Recharts** | ^2.15.4 | Data visualization |
| **Lucide React** | ^0.462.0 | Icon library |
| **Sonner** | ^1.7.4 | Toast notifications |
| **next-themes** | ^0.3.0 | Dark/light mode support |

---

## 🎨 Design System

The UI follows a consistent design system built on Tailwind CSS custom tokens:

- **Typography**: Inter / system font stack
- **Color Palette**: Neutral grays with warm, music-focused accent colors
- **Components**: Fully accessible via Radix UI primitives
- **Animations**: Smooth micro-interactions with `tailwindcss-animate`
- **Dark Mode**: System-aware + user-toggleable via `next-themes`

---

## 🔗 Related Services

- **[CR Backend](../CR-Backend/README.md)** — REST API server (Express + MongoDB)
- **[CR Admin](../CR-Admin/README.md)** — Admin dashboard panel

---

## 📄 License

This project is private and proprietary. All rights reserved.