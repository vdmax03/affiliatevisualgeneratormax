import React, { useState, useRef } from 'react';
import type { InputType } from '../types';
import { Icon } from './Icon';

interface InputFormProps {
  onGenerate: (inputType: InputType, value: string | File, productSpec?: string, includeHumanModel?: boolean) => void;
  isLoading: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, apiKey, onApiKeyChange }) => {
  const [inputType, setInputType] = useState<InputType>('url');
  const [productUrl, setProductUrl] = useState<string>('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productSpec, setProductSpec] = useState<string>('');
  const [includeHumanModel, setIncludeHumanModel] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilePickerClick = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
      setProductImage(null);
      setImagePreview(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputType === 'url' && productUrl) {
      onGenerate('url', productUrl, productSpec, includeHumanModel);
    } else if (inputType === 'image' && productImage) {
      onGenerate('image', productImage, productSpec, includeHumanModel);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kunci API Gemini
            </label>
            <div className="relative">
                 <Icon name="key" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="Masukkan Kunci API Gemini Anda"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-colors"
                    required
                />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Dapatkan kunci API gratis di <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google AI Studio</a>
            </p>
        </div>
      
        <div className="mb-6">
          <div className="flex justify-center bg-gray-100 dark:bg-gray-700 rounded-full p-1 w-full sm:w-2/3 mx-auto">
            <button
              type="button"
              onClick={() => setInputType('url')}
              className={`w-1/2 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-colors duration-300 ${inputType === 'url' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              URL Produk
            </button>
            <button
              type="button"
              onClick={() => setInputType('image')}
              className={`w-1/2 py-2 px-4 rounded-full text-sm sm:text-base font-semibold transition-colors duration-300 ${inputType === 'image' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Unggah Gambar
            </button>
          </div>
        </div>

        <div className="mb-6 min-h-[150px]">
          {inputType === 'url' ? (
            <div className="relative">
              <Icon name="link" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://contoh.com/produk/item-anda"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-colors"
                required
              />
            </div>
          ) : (
            <div className="text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                required
              />
              {!imagePreview ? (
                <button
                  type="button"
                  onClick={handleFilePickerClick}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-brand-secondary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Icon name="upload" className="mx-auto w-10 h-10 text-gray-400 mb-2"/>
                  <span className="block font-semibold text-gray-700 dark:text-gray-200">Klik untuk mengunggah gambar</span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">PNG, JPG, atau WEBP</span>
                </button>
              ) : (
                <div className="relative inline-block">
                    <img src={imagePreview} alt="Product Preview" className="max-h-48 rounded-lg mx-auto shadow-md" />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-transform transform hover:scale-110"
                        aria-label="Remove image"
                    >
                       <Icon name="close" className="w-4 h-4" />
                    </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="productSpec" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Spesifikasi Produk (Opsional)
          </label>
          <div className="relative">
            <Icon name="info" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            <input
              id="productSpec"
              type="text"
              value={productSpec}
              onChange={(e) => setProductSpec(e.target.value)}
              placeholder="contoh: Fokus pada baju merah, bukan tasnya"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-colors"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Tentukan produk mana yang ingin difokuskan jika ada beberapa item dalam gambar/URL
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Opsi Model
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeHumanModel}
                onChange={(e) => setIncludeHumanModel(e.target.checked)}
                className="w-4 h-4 text-brand-primary bg-gray-100 border-gray-300 rounded focus:ring-brand-secondary focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Sertakan model manusia dalam gambar
              </span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {includeHumanModel 
              ? "Gambar akan menampilkan produk yang dipakai oleh model manusia" 
              : "Gambar akan menampilkan produk saja tanpa model manusia"
            }
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !apiKey || (inputType === 'url' && !productUrl) || (inputType === 'image' && !productImage)}
          className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sedang Membuat...
            </>
          ) : (
            <>
            <Icon name="sparkles" className="w-5 h-5"/>
             Buat Visual
             </>
          )}
        </button>
      </form>
    </div>
  );
};