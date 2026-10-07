# Antique Shop

A React storefront for browsing antiques, managing a cart, and walking through a demonstration checkout.

## Run locally

Use Node.js 22.12 or newer and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Choose **Continue as Guest** to explore without registering.

## Features

- Product collections, product details, and price sorting.
- Cart quantities and order summaries.
- Fragile packaging and luxury insurance calculations.
- Theme and language controls.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Generate the production bundle in `dist/`. |
| `npm run preview` | Preview that bundle locally. |
| `npm run lint` | Run the configured ESLint checks. |

## Source map

- `src/pages/App.jsx`: routes, session state, cart actions, and checkout.
- `src/pages/`: storefront screens.
- `src/patterns/`: product factory, cart commands, checkout validation and pricing decorators.
- `src/context/`: shared theme and language state.
- `public/data.json`: sample inventory.

## Demo scope

Authentication uses browser local storage, including demo passwords; use disposable sample credentials only. Checkout creates an in-browser order summary, not a payment transaction. Cart state is held in memory and resets on reload. A production version needs server-side authentication, authorization, inventory checks, and payment processing.

This repository is ZiadMaghraby's fork of [the collaborative project](https://github.com/ABDELRAHMAN-MAHM0UD/antique-shop-project).
