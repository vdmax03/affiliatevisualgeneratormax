
import React from 'react';
import type { OutputData } from '../types';
import { ImageGallery } from './ImageGallery';
import { MarketingCopy } from './MarketingCopy';
import { Metadata } from './Metadata';
import { Icon } from './Icon';

interface ResultsDisplayProps {
  data: OutputData;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  const { product, images, marketing, affiliate } = data;

  return (
    <div className="space-y-12">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Icon name="box" className="w-7 h-7 text-brand-primary dark:text-brand-secondary"/>
            Product Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div><strong>Name:</strong> {product.name}</div>
            <div><strong>Brand:</strong> {product.brand || 'N/A'}</div>
            <div><strong>Category:</strong> {product.category}</div>
            <div><strong>Color:</strong> {product.color || 'N/A'}</div>
            <div className="md:col-span-2">
                <strong>Features:</strong>
                <ul className="list-disc list-inside ml-2 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {product.notable_features.map((feature, i) => (
                        <li key={i} className="text-sm">{feature}</li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      <ImageGallery images={images} />
      <MarketingCopy marketing={marketing} />
      <Metadata marketing={marketing} />

      {affiliate.affiliate_url && (
        <div className="bg-brand-light dark:bg-brand-dark/30 p-6 rounded-2xl shadow-lg border border-brand-secondary/30">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Icon name="link" className="w-7 h-7 text-brand-primary dark:text-brand-secondary"/>
            Affiliate Link
          </h2>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-700 p-3 rounded-lg">
            <input 
              type="text" 
              readOnly 
              value={affiliate.affiliate_url} 
              className="w-full bg-transparent outline-none text-gray-600 dark:text-gray-300"
            />
            <button
              onClick={() => navigator.clipboard.writeText(affiliate.affiliate_url!)}
              className="bg-brand-secondary hover:bg-brand-primary text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm shrink-0"
            >
              <Icon name="copy" className="w-4 h-4"/>
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
