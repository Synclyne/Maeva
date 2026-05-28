/**
 * Maeva — Feature Flags
 *
 * PAID_FEATURES_ENABLED
 *   false (default) → Featured listings are admin-granted for free.
 *                     Realtors click "Request Feature" and admin approves.
 *   true            → Realtors self-purchase featured placement via
 *                     the package picker (M-Pesa / card integration).
 *                     Flip this to true once payment is wired up.
 *
 * FEATURED_PACKAGES (used when PAID_FEATURES_ENABLED = true)
 *   Pricing in KES for the Kenyan market.
 */

export const PAID_FEATURES_ENABLED = false;

export const FEATURED_PACKAGES = [
  {
    id:       '7d',
    label:    '7 Days',
    price:    1000,         // KES — adjust to your market
    badge:    'Featured',
    days:     7,
    rank:     1,
    popular:  false,
    perks: ['Listed at top of search results', 'Featured badge on card', 'Priority in category pages'],
  },
  {
    id:       '30d',
    label:    '30 Days',
    price:    3500,
    badge:    'Premium',
    days:     30,
    rank:     2,
    popular:  true,
    perks: ['Everything in 7-day', 'Premium gold badge', 'Featured on homepage', 'Priority map pin'],
  },
  {
    id:       'agency',
    label:    'Agency Package',
    price:    15000,        // per month
    badge:    'Sponsored',
    days:     30,
    rank:     3,
    popular:  false,
    perks: ['All listings boosted', 'Sponsored badge', 'Agency profile highlight', 'Dedicated support'],
  },
];
