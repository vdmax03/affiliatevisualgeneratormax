
export type InputType = 'url' | 'image';

export interface Product {
  name: string;
  category: string;
  brand: string | null;
  color: string | null;
  notable_features: string[];
  source: {
    type: 'url' | 'image';
    value: string;
  };
}

export interface GeneratedImage {
  scenario: 'studio' | 'lifestyle' | 'ugc';
  prompt_used: string;
  variant_note: string;
  path_or_b64: string;
}

export interface Marketing {
  headlines: string[];
  captions: string[];
  ctas: string[];
  hashtags: string[];
  alt_texts: string[];
  seo_keywords: string[];
  palette: string[];
}

export interface Affiliate {
  affiliate_url: string | null;
}

export interface Diagnostics {
  confidence_product_parse: number;
  notes: string;
}

export interface OutputData {
  product: Product;
  images: GeneratedImage[];
  marketing: Marketing;
  affiliate: Affiliate;
  diagnostics: Diagnostics;
}
