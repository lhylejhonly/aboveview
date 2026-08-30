export type Category = 
  | 'all'
  | 'ua-prime-shirts'
  | 'ua-premium-plains'
  | 'ua-premium-hoodies-v3'
  | 'ua-french-terries'
  | 'ua-fco-hoodies-sweatpants'
  | 'ua-essentials'
  | 'ua-cropped-tees'
  | 'ua-caps'
  | 'ua-box-tees'
  | 'ua-architect-tees'
  | 'ua-athleisure-elite'
  | 'ua-pocket-tees';

export interface ColorOption {
  name: string;
  hex: string;
  frontImage?: string;
  backImage?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: Category;
  price: number;
  originalPrice?: number;
  currency: string;
  description: string;
  frontImage: string;
  backImage: string;
  frontFeatureHighlight?: string;
  backFeatureHighlight?: string;
  fabricDetails: string;
  gsm: number;
  fitType: string;
  colors: ColorOption[];
  sizes: string[];
  tags: string[];
  tiktokShopUrl: string;
  stockCount: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ViewMode = 'grid' | 'large' | 'compact';
