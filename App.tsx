import React, { useState, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateAffiliateVisuals } from './services/geminiService';
import type { OutputData, InputType } from './types';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OutputData | null>(null);
  const [apiKey, setApiKey] = useState<string>('');

  const handleGenerate = useCallback(async (inputType: InputType, value: string | File, productSpec?: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      if (!apiKey) {
        throw new Error('Harap masukkan Kunci API Gemini.');
      }
      const input = {
        [inputType === 'url' ? 'productUrl' : 'productImage']: value,
        productSpec: productSpec || undefined
      };
      if (!value) {
        throw new Error('Harap masukkan URL produk atau unggah gambar.');
      }
      const data = await generateAffiliateVisuals(input, apiKey);
      setResults(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);
  
  const resetState = () => {
      setResults(null);
      setError(null);
      setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Icon name="logo" className="w-10 h-10 text-brand-primary dark:text-brand-secondary"/>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white tracking-tight">
              Generator Visual Afiliasi
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Buat visual promosi dan konten marketing yang menakjubkan untuk produk apapun secara instan menggunakan AI.
          </p>
        </header>

        <main>
          {!results && (
            <InputForm 
              onGenerate={handleGenerate} 
              isLoading={isLoading} 
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
            />
          )}

          {isLoading && <LoadingSpinner />}
          
          {error && (
            <div className="mt-8 max-w-2xl mx-auto text-center p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {results && (
            <div className="fade-in">
                <div className="text-center mb-8">
                     <button
                        onClick={resetState}
                        className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 ease-in-out inline-flex items-center gap-2"
                      >
                         <Icon name="back" className="w-5 h-5"/>
                        Buat Lagi
                      </button>
                </div>
              <ResultsDisplay data={results} />
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Didukung oleh Gemini API. Dibuat dengan React & Tailwind CSS.
            </p>
        </footer>
      </div>
      <style>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;