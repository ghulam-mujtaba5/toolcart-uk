export interface ProjectKitItem {
  sku: string;
  product_slug: string;
  title: string;
  default_quantity: number;
  units_per_pack: number;
  price_inc_vat: number;
  price_ex_vat: number;
  badge?: string;
  essential: boolean;
}

export interface ProjectKit {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  badge: string;
  image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Trade';
  estimated_time: string;
  bundle_savings_percent: number;
  items: ProjectKitItem[];
  instructions: string[];
}

export interface BuyingGuideSection {
  title: string;
  content: string;
  tip?: string;
  warning?: string;
}

export interface BuyingGuide {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  read_time_minutes: number;
  published_date: string;
  author: string;
  category: string;
  hero_image: string;
  excerpt: string;
  safety_warnings: string[];
  key_takeaways: string[];
  sections: BuyingGuideSection[];
  recommended_skus: string[];
  standards_referenced: string[];
}
