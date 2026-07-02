# Water Billing Management System

A professional mobile app for managing water billing operations — customers, daily entries, reports, and settings.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — start the Expo mobile app (dev)
- `pnpm --filter @workspace/api-server run dev` — start the API server (port 5000, not used by mobile)

## Stack

- **Frontend:** Expo (React Native) + Expo Router v6, TypeScript
- **Auth:** Firebase Authentication (email/password)
- **DB:** Firebase Firestore
- **Icons:** @expo/vector-icons (Feather)
- **Fonts:** Inter (via @expo-google-fonts/inter)

## Where things live

```
artifacts/mobile/
├── app/
│   ├── _layout.tsx          # Root layout with AuthProvider + Stack
│   ├── login.tsx            # Login screen
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar (5 tabs)
│   │   ├── index.tsx        # Dashboard
│   │   ├── customers.tsx    # Customer list
│   │   ├── entries.tsx      # Daily water entries
│   │   ├── reports.tsx      # Reports (Daily/Monthly/Customer)
│   │   └── settings.tsx     # App settings
│   ├── customer/
│   │   ├── add.tsx          # Add/Edit customer
│   │   └── [id].tsx         # Customer profile
│   └── entry/
│       └── add.tsx          # Add/Edit water entry
├── contexts/AuthContext.tsx # Firebase auth state
├── services/
│   ├── firebase.ts          # Firebase init
│   ├── customers.ts         # Customer CRUD (Firestore)
│   ├── entries.ts           # Entry CRUD (Firestore)
│   └── settingsService.ts   # Settings CRUD (Firestore)
├── components/
│   ├── StatCard.tsx
│   ├── SearchBar.tsx
│   └── EmptyState.tsx
├── constants/colors.ts      # Blue theme (#2563EB primary)
└── types.ts                 # Shared TypeScript types
```

## Firestore Collections

- `customers` — customer records (id, customerId WB-001, name, mobile, area, waterRate, status, notes)
- `daily_entries` — water usage entries (date, customerId, qty, rate, totalAmount, paymentStatus, paymentMethod)
- `settings` — single doc `app_settings` (businessName, defaultCurrency, defaultWaterRate)

## Architecture decisions

- All Firestore queries fetch the full collection and filter client-side to avoid compound index requirements.
- Firebase Auth uses `initializeAuth` + `getReactNativePersistence(AsyncStorage)` on native; `getAuth` on web (try/catch for HMR safety).
- Auth routing lives in `app/_layout.tsx` using `useSegments` — redirects to `/login` if unauthenticated, to `/(tabs)` if authenticated.
- Tab screens use `useFocusEffect` to reload data when navigating back.
- Customer add/edit and entry add/edit are the same screen with an optional `?id=` query param.

## User preferences

- Blue/white/gray color theme, clean SaaS dashboard aesthetic.
- No React Hook Form — uses plain useState for forms.
- No PDF export in initial build.
- Admin-only access (single Firebase user manages everything).

## Gotchas

- Firebase must be initialized before use; the `getReactNativePersistence` approach requires `@react-native-async-storage/async-storage` (already in deps).
- `NativeTabs` is used on iOS 18+ (Liquid Glass); falls back to classic `Tabs` on other platforms.
