
import React from 'react';
import type { Marketing } from '../types';
import { Icon } from './Icon';

interface MetadataProps {
  marketing: Marketing;
}

export const Metadata: React.FC<MetadataProps> = ({ marketing }) => {
  const { seo_keywords, alt_texts, palette } = marketing;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
        <Icon name="tag" className="w-7 h-7 text-brand-primary dark:text-brand-secondary"/>
        Metadata & SEO
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-200">SEO Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {seo_keywords.map((keyword, i) => (
              <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-sm font-medium px-3 py-1 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-200">Image Alt Texts</h3>
            <ul className="space-y-2 list-disc list-inside">
                {alt_texts.map((alt, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400 text-sm">
                        {alt}
                    </li>
                ))}
            </ul>
        </div>
        <div className="lg:col-span-2">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-200">Dominant Colors</h3>
            <div className="flex items-center gap-4">
                {palette.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group">
                        <div 
                            className="w-12 h-12 rounded-full shadow-md border-2 border-white dark:border-gray-600" 
                            style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{color}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
