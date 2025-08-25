
import React, { useState } from 'react';
import type { Marketing } from '../types';
import { Icon } from './Icon';

interface MarketingCopyProps {
  marketing: Marketing;
}

const CopyBlock: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

  return (
    <div>
      <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
            <span className="text-gray-800 dark:text-gray-300 text-sm">{item}</span>
            <button 
                onClick={() => handleCopy(item, index)}
                className="text-gray-500 hover:text-brand-primary dark:hover:text-brand-secondary transition-colors shrink-0 ml-4"
            >
              {copiedIndex === index ? <Icon name="check" className="w-5 h-5 text-green-500" /> : <Icon name="copy" className="w-5 h-5" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const MarketingCopy: React.FC<MarketingCopyProps> = ({ marketing }) => {
  const { headlines, captions, ctas, hashtags } = marketing;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
        <Icon name="pencil" className="w-7 h-7 text-brand-primary dark:text-brand-secondary"/>
        Marketing Copy
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <CopyBlock title="Headlines" items={headlines} />
        <CopyBlock title="Captions" items={captions} />
        <CopyBlock title="Calls to Action" items={ctas} />
      </div>
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Hashtags</h3>
        <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, i) => (
                <span key={i} className="bg-brand-light dark:bg-brand-dark/50 text-brand-dark dark:text-brand-light text-sm font-medium px-3 py-1 rounded-full">
                    {tag}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};
