export type CookieCategory = 'necessary' | 'functional' | 'analytics' | 'marketing';

export interface CookieConsentPreferences {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

export interface CookieDefinition {
  name: string;
  category: CookieCategory;
  purpose: string;
  expiry: string;
  provider: string;
  type: 'HTTP Cookie' | 'Local Storage' | 'Session Cookie';
}

export const TOOLCART_COOKIE_DEFINITIONS: CookieDefinition[] = [
  {
    name: 'toolcart_cookie_consent_v1',
    category: 'necessary',
    purpose: 'Stores your UK PECR & GDPR cookie consent choices and timestamp so your preferences are respected.',
    expiry: '365 days',
    provider: 'ToolCart UK (First-party)',
    type: 'HTTP Cookie',
  },
  {
    name: 'toolcart_vat_mode',
    category: 'necessary',
    purpose: 'Persists your preferred UK pricing view (Inc. VAT for retail or Ex. VAT for registered trade builders).',
    expiry: '365 days',
    provider: 'ToolCart UK (First-party)',
    type: 'HTTP Cookie',
  },
  {
    name: 'toolcart_cart_id',
    category: 'necessary',
    purpose: 'Maintains your active trade shopping basket and reserved stock quantities across pages.',
    expiry: '30 days',
    provider: 'ToolCart UK (First-party)',
    type: 'HTTP Cookie',
  },
  {
    name: 'sb-auth-token',
    category: 'necessary',
    purpose: 'Secures your authenticated trade account session and encrypted credentials.',
    expiry: 'Session / 7 days',
    provider: 'ToolCart UK (First-party)',
    type: 'HTTP Cookie',
  },
  {
    name: 'toolcart_trade_tier',
    category: 'functional',
    purpose: 'Remembers approved trade discount tiers and preferred bulk pack quantity filters.',
    expiry: '90 days',
    provider: 'ToolCart UK (First-party)',
    type: 'Local Storage',
  },
  {
    name: 'toolcart_compare_items',
    category: 'functional',
    purpose: 'Saves your shortlisted tools and specifications in the active comparison drawer.',
    expiry: '30 days',
    provider: 'ToolCart UK (First-party)',
    type: 'Local Storage',
  },
  {
    name: 'toolcart_recent_tools',
    category: 'functional',
    purpose: 'Remembers recently viewed hardware, fixings, and site gear for quick multi-room job referencing.',
    expiry: '30 days',
    provider: 'ToolCart UK (First-party)',
    type: 'Local Storage',
  },
  {
    name: 'toolcart_analytics_id',
    category: 'analytics',
    purpose: 'Collects privacy-preserving, pseudonymised site navigation metrics and search query health.',
    expiry: '180 days',
    provider: 'ToolCart UK Analytics',
    type: 'HTTP Cookie',
  },
  {
    name: 'toolcart_perf_metrics',
    category: 'analytics',
    purpose: 'Monitors Core Web Vitals, API response latency, and UK CDN asset load speeds.',
    expiry: 'Session',
    provider: 'ToolCart UK Analytics',
    type: 'Session Cookie',
  },
  {
    name: 'toolcart_trade_recs',
    category: 'marketing',
    purpose: 'Customises project kit suggestions and relevant VDE/masonry hardware recommendations for your trade.',
    expiry: '90 days',
    provider: 'ToolCart UK Recommendations',
    type: 'Local Storage',
  },
];

export const CONSENT_COOKIE_NAME = 'toolcart_cookie_consent_v1';
export const CONSENT_VERSION = '1.0.0';

export const DEFAULT_CONSENT_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  timestamp: '',
};

export const ACCEPT_ALL_PREFERENCES: Omit<CookieConsentPreferences, 'timestamp'> = {
  necessary: true,
  functional: true,
  analytics: true,
  marketing: true,
  version: CONSENT_VERSION,
};

export const REJECT_NON_ESSENTIAL_PREFERENCES: Omit<CookieConsentPreferences, 'timestamp'> = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
};
