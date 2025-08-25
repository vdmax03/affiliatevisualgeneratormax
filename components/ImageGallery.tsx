
import React from 'react';
import type { GeneratedImage } from '../types';
import { Icon } from './Icon';

interface ImageGalleryProps {
  images: GeneratedImage[];
}

const ScenarioBadge: React.FC<{ scenario: string }> = ({ scenario }) => {
    const styles: {[key: string]: string} = {
        studio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        lifestyle: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        ugc: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return (
        <span className={`absolute top-3 left-3 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${styles[scenario]}`}>
            {scenario.toUpperCase()}
        </span>
    );
};

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
        <Icon name="image" className="w-7 h-7 text-brand-primary dark:text-brand-secondary"/>
        Generated Images
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={index} className="group relative overflow-hidden rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <img 
              src={image.path_or_b64} 
              alt={image.variant_note} 
              className="w-full h-auto object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
            />
            <ScenarioBadge scenario={image.scenario} />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center p-4">
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <a href={image.path_or_b64} download={`image_${image.scenario}_1x1.jpg`} className="bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white rounded-full p-3 transition-colors">
                       <Icon name="download" className="w-5 h-5"/>
                   </a>
                   <a href={image.path_or_b64.replace('1024/1024', '1080/1350')} download={`image_${image.scenario}_4x5.jpg`} className="bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white rounded-full p-3 transition-colors">
                       <Icon name="aspectRatio45" className="w-5 h-5"/>
                   </a>
                   <a href={image.path_or_b64.replace('1024/1024', '1920/1080')} download={`image_${image.scenario}_16x9.jpg`} className="bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white rounded-full p-3 transition-colors">
                       <Icon name="aspectRatio169" className="w-5 h-5"/>
                   </a>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
