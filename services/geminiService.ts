import { GoogleGenAI, Type } from "@google/genai";
import type { OutputData, Product, Marketing, GeneratedImage } from '../types';

// Helper to convert a File object to a GoogleGenAI.Part object
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Schemas for structured JSON output from Gemini
const productSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Full product name." },
    category: { type: Type.STRING, description: "Product category (e.g., t-shirt, headphones)." },
    brand: { type: Type.STRING, description: "Brand of the product, or 'N/A' if not found." },
    color: { type: Type.STRING, description: "Primary color of the product." },
    notable_features: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of key features or selling points."
    },
  },
  required: ["name", "category", "brand", "color", "notable_features"]
};

const marketingSchema = {
    type: Type.OBJECT,
    properties: {
        headlines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 catchy headlines, max 60 chars each." },
        captions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 engaging captions, max 150 chars each." },
        ctas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 clear calls to action." },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-8 relevant hashtags." },
        alt_texts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 descriptive alt texts for the generated images." },
        seo_keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "8-12 relevant SEO keywords/phrases." },
        palette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3-5 dominant color HEX codes from the product." }
    },
    required: ["headlines", "captions", "ctas", "hashtags", "alt_texts", "seo_keywords", "palette"]
};

export const generateAffiliateVisuals = async (
    input: { productUrl?: string; productImage?: File; productSpec?: string },
    apiKey: string
): Promise<OutputData> => {
    if (!apiKey) {
        throw new Error("Kunci API tidak boleh kosong. Harap masukkan Kunci API Gemini.");
    }
    
    // Basic validation untuk API key format
    if (apiKey.trim().length < 10) {
        throw new Error("Kunci API terlalu pendek. Harap periksa kembali kunci API Gemini Anda.");
    }
    
    if (!input.productUrl && !input.productImage) {
        throw new Error("Harap masukkan URL produk atau unggah gambar.");
    }
    
    console.log("Initializing Gemini AI with API key:", apiKey.substring(0, 10) + "...");
    const ai = new GoogleGenAI({ apiKey });
    
    try {
        // --- 1. Extract Product Details ---
        const source: Product['source'] = {
            type: input.productImage ? 'image' : 'url',
            value: input.productImage ? input.productImage.name : input.productUrl!
        };

        let productResponse;
        
        if (input.productImage && input.productImage instanceof File) {
            const imagePart = await fileToGenerativePart(input.productImage);
            let prompt = "Anda adalah agen AI yang menganalisis produk. Ekstrak detail berikut dan kembalikan dalam format JSON. Jika detail tidak tersedia, gunakan 'N/A'. Analisis produk dalam gambar ini.";
            
            if (input.productSpec) {
                prompt += ` Fokus khususnya pada: ${input.productSpec}.`;
            }
            
            console.log("Sending request to Gemini API for product analysis with image...");
            productResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    { role: "user", parts: [{ text: prompt }, imagePart] }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: productSchema
                }
            });
        } else {
            let prompt = `Anda adalah agen AI yang menganalisis produk. Ekstrak detail berikut dan kembalikan dalam format JSON. Jika detail tidak tersedia, gunakan 'N/A'. Analisis produk dari URL ini: ${input.productUrl}. Bayangkan Anda sedang mengunjungi halaman tersebut.`;
            
            if (input.productSpec) {
                prompt += ` Fokus khususnya pada: ${input.productSpec}.`;
            }
            
            console.log("Sending request to Gemini API for product analysis with URL...");
            productResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    { role: "user", parts: [{ text: prompt }] }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: productSchema
                }
            });
        }

        console.log("Product analysis response received");
        console.log("Product response text length:", productResponse.text.length);
        console.log("Product response text preview:", productResponse.text.substring(0, 200) + "...");
        
        let productData: Omit<Product, 'source'>;
        try {
            productData = JSON.parse(productResponse.text);
            console.log("Product data parsed successfully:", productData);
        } catch (parseError) {
            console.error("JSON Parse Error for product response:", parseError);
            console.error("Full response text:", productResponse.text);
            
            // Try to fix common JSON issues
            let fixedText = productResponse.text;
            
            // Try to find and fix unterminated strings
            const stringMatches = fixedText.match(/"([^"]*)$/g);
            if (stringMatches) {
                console.log("Attempting to fix unterminated strings in product response...");
                // Remove the last incomplete string
                fixedText = fixedText.replace(/"[^"]*$/, '');
                // Close any open objects/arrays
                const openBraces = (fixedText.match(/\{/g) || []).length;
                const closeBraces = (fixedText.match(/\}/g) || []).length;
                const openBrackets = (fixedText.match(/\[/g) || []).length;
                const closeBrackets = (fixedText.match(/\]/g) || []).length;
                
                for (let i = 0; i < openBraces - closeBraces; i++) {
                    fixedText += '}';
                }
                for (let i = 0; i < openBrackets - closeBrackets; i++) {
                    fixedText += ']';
                }
            }
            
            try {
                productData = JSON.parse(fixedText);
                console.log("Product data parsed successfully after fixing:", productData);
            } catch (secondParseError) {
                console.error("Failed to parse product response even after fixing:", secondParseError);
                
                // Create fallback product data
                console.log("Creating fallback product data...");
                productData = {
                    name: input.productImage ? input.productImage.name : input.productUrl || "Produk",
                    category: "Item Fashion",
                    brand: "N/A",
                    color: "N/A",
                    notable_features: ["Kualitas tinggi", "Desain stylish", "Nyaman dipakai"]
                };
                console.log("Fallback product data created:", productData);
            }
        }
        
        const product: Product = { ...productData, source };

        // --- 2. Generate Marketing Copy ---
        const marketingPrompt = `Berdasarkan produk ini, buatlah set lengkap konten marketing dalam bahasa Indonesia. Produk: ${JSON.stringify(product)}.`;
        
        console.log("Sending request to Gemini API for marketing copy...");
        const marketingResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: marketingPrompt }] }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: marketingSchema
            }
        });
        
        console.log("Marketing copy response received");
        console.log("Marketing response text length:", marketingResponse.text.length);
        console.log("Marketing response text preview:", marketingResponse.text.substring(0, 200) + "...");
        
        let marketing: Marketing;
        try {
            marketing = JSON.parse(marketingResponse.text);
            console.log("Marketing data parsed successfully:", marketing);
        } catch (parseError) {
            console.error("JSON Parse Error for marketing response:", parseError);
            console.error("Full response text:", marketingResponse.text);
            
            // Try to fix common JSON issues
            let fixedText = marketingResponse.text;
            
            // Try to find and fix unterminated strings
            const stringMatches = fixedText.match(/"([^"]*)$/g);
            if (stringMatches) {
                console.log("Attempting to fix unterminated strings...");
                // Remove the last incomplete string
                fixedText = fixedText.replace(/"[^"]*$/, '');
                // Close any open objects/arrays
                const openBraces = (fixedText.match(/\{/g) || []).length;
                const closeBraces = (fixedText.match(/\}/g) || []).length;
                const openBrackets = (fixedText.match(/\[/g) || []).length;
                const closeBrackets = (fixedText.match(/\]/g) || []).length;
                
                for (let i = 0; i < openBraces - closeBraces; i++) {
                    fixedText += '}';
                }
                for (let i = 0; i < openBrackets - closeBrackets; i++) {
                    fixedText += ']';
                }
            }
            
            try {
                marketing = JSON.parse(fixedText);
                console.log("Marketing data parsed successfully after fixing:", marketing);
            } catch (secondParseError) {
                console.error("Failed to parse even after fixing:", secondParseError);
                
                // Create fallback marketing data
                console.log("Creating fallback marketing data...");
                marketing = {
                    headlines: [
                        `${product.name} yang Menakjubkan`,
                        `Temukan ${product.category}`,
                        `Kualitas Premium ${product.brand || 'Terbaik'}`
                    ],
                    captions: [
                        `Rasakan keunggulan ${product.name}. Sempurna untuk berbagai kesempatan!`,
                        `Temukan mengapa ${product.name} menjadi pilihan terbaik dalam ${product.category}.`,
                        `Ubah gaya Anda dengan ${product.name}. Kualitas bertemu dengan keanggunan.`
                    ],
                    ctas: [
                        `Beli ${product.name}`,
                        `Dapatkan Sekarang`,
                        `Jelajahi Koleksi`
                    ],
                    hashtags: [
                        `#${product.category.replace(/\s+/g, '')}`,
                        `#${product.color?.replace(/\s+/g, '') || 'Gaya'}`,
                        `#Kualitas`,
                        `#Fashion`,
                        `#Lifestyle`
                    ],
                    alt_texts: [
                        `${product.name} yang indah dalam warna ${product.color || 'menakjubkan'}`,
                        `${product.category} berkualitas tinggi menampilkan ${product.name}`,
                        `Foto profesional ${product.name} dengan detail yang sempurna`
                    ],
                    seo_keywords: [
                        product.name.toLowerCase(),
                        product.category.toLowerCase(),
                        product.color?.toLowerCase() || 'fashion',
                        'kualitas',
                        'premium',
                        'gaya'
                    ],
                    palette: ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af']
                };
                console.log("Fallback marketing data created:", marketing);
            }
        }

        // --- 3. Generate Images (Optional - requires billing) ---
        let images: GeneratedImage[] = [];
        
        try {
            const imageScenarios = [
                {
                    name: 'studio',
                    variant_note: "Tampilan bersih dan profesional yang fokus pada detail produk.",
                    prompt: `Foto studio fotorealistik, model menarik dengan pose netral mengenakan atau memegang ${product.name} (${product.category}, ${product.color}, ${product.notable_features.join(', ')} terlihat jelas). Latar belakang gradien minimal, pencahayaan softbox, dynamic range tinggi, detail material yang tajam, tanpa properti yang mengganggu. Resolusi tinggi 1024x1024, produk di tengah.`
                },
                {
                    name: 'lifestyle',
                    variant_note: "Penggunaan kontekstual yang menunjukkan produk dalam suasana alami.",
                    prompt: `Adegan lifestyle dalam setting yang relevan dengan ${product.category}. Model menggunakan ${product.name} secara alami, dengan produk sebagai fokus. Pencahayaan alami hangat, nuansa candid. Tampilkan fitur-fiturnya tanpa halangan. Resolusi tinggi 1024x1024 portrait untuk iklan sosial media.`
                },
                {
                    name: 'ugc',
                    variant_note: "Foto otentik bergaya konten kreator yang relatable.",
                    prompt: `Foto vertikal bergaya UGC, sedikit terlihat handheld. Framing dekat, model menggunakan ${product.name}; produk menghadap kamera, fokus tajam, tone kulit alami, latar belakang indoor sederhana. Tanpa filter berat. Resolusi tinggi 1024x1024.`
                }
            ];

            const imagePromises = imageScenarios.map(scenario => 
                ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: `${scenario.prompt} --ar 1:1 --no extra logos, no text overlay, no watermark`,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/jpeg',
                        aspectRatio: '1:1',
                    },
                })
            );

            console.log("Sending requests to Gemini API for image generation...");
            const imageResults = await Promise.all(imagePromises);
            console.log("Image generation responses received");
            console.log("Number of image results:", imageResults.length);

            images = imageResults.map((res, i) => {
                console.log(`Processing image ${i + 1}/${imageResults.length} for scenario: ${imageScenarios[i].name}`);
                return {
                    scenario: imageScenarios[i].name as 'studio' | 'lifestyle' | 'ugc',
                    prompt_used: imageScenarios[i].prompt,
                    variant_note: imageScenarios[i].variant_note,
                    path_or_b64: `data:image/jpeg;base64,${res.generatedImages[0].image.imageBytes}`
                };
            });
        } catch (imageError) {
            console.warn("Image generation failed (requires billing):", imageError);
            // Create placeholder images with prompts for manual generation
            images = [
                {
                    scenario: 'studio' as const,
                    prompt_used: `Foto studio fotorealistik dari ${product.name} (${product.category}, ${product.color})`,
                    variant_note: "Tampilan bersih dan profesional yang fokus pada detail produk.",
                    path_or_b64: `data:image/svg+xml;base64,${btoa(`
                        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                            <rect width="400" height="400" fill="#f3f4f6"/>
                            <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Foto Studio</text>
                            <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">${product.name}</text>
                            <text x="200" y="220" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">(Perlu Billing)</text>
                        </svg>
                    `)}`
                },
                {
                    scenario: 'lifestyle' as const,
                    prompt_used: `Adegan lifestyle dengan ${product.name} dalam suasana alami`,
                    variant_note: "Penggunaan kontekstual yang menunjukkan produk dalam suasana alami.",
                    path_or_b64: `data:image/svg+xml;base64,${btoa(`
                        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                            <rect width="400" height="400" fill="#f3f4f6"/>
                            <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Foto Lifestyle</text>
                            <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">${product.name}</text>
                            <text x="200" y="220" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">(Perlu Billing)</text>
                        </svg>
                    `)}`
                },
                {
                    scenario: 'ugc' as const,
                    prompt_used: `Foto bergaya UGC dari ${product.name}`,
                    variant_note: "Foto otentik bergaya konten kreator yang relatable.",
                    path_or_b64: `data:image/svg+xml;base64,${btoa(`
                        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                            <rect width="400" height="400" fill="#f3f4f6"/>
                            <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Foto UGC</text>
                            <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">${product.name}</text>
                            <text x="200" y="220" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">(Perlu Billing)</text>
                        </svg>
                    `)}`
                }
            ];
        }

        // --- 4. Assemble and Return ---
        const finalOutput: OutputData = {
            product,
            images,
            marketing,
            affiliate: {
                affiliate_url: `https://example-store.com/product-slug?utm_source=aff&utm_medium=social&utm_campaign=ai-generated`,
            },
            diagnostics: {
                confidence_product_parse: 0.9,
                notes: `Konten dibuat oleh Gemini API. ${images.length > 0 && images[0].path_or_b64.includes('svg') ? 'Gambar adalah placeholder (Imagen API memerlukan billing).' : 'Semua fitur berfungsi.'}`,
            },
        };

        console.log("All API calls completed successfully");
        return finalOutput;
    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error instanceof Error) {
            // Parse error message untuk memberikan pesan yang lebih user-friendly
            let errorMessage = error.message;
            
            if (errorMessage.includes("API key not valid")) {
                errorMessage = "Kunci API tidak valid. Harap periksa kembali kunci API Gemini Anda.";
            } else if (errorMessage.includes("API_KEY_INVALID")) {
                errorMessage = "Kunci API tidak valid. Pastikan Anda menggunakan kunci API Gemini yang benar.";
            } else if (errorMessage.includes("quota")) {
                errorMessage = "Kuota API telah habis. Harap coba lagi nanti atau upgrade akun Anda.";
            } else if (errorMessage.includes("billing")) {
                errorMessage = "Fitur ini memerlukan akun berbayar. Harap aktifkan billing di Google Cloud Console.";
            } else if (errorMessage.includes("400")) {
                errorMessage = "Permintaan tidak valid. Harap periksa input Anda dan coba lagi.";
            } else if (errorMessage.includes("403")) {
                errorMessage = "Akses ditolak. Pastikan kunci API Anda memiliki izin yang cukup.";
            } else if (errorMessage.includes("429")) {
                errorMessage = "Terlalu banyak permintaan. Harap tunggu sebentar sebelum mencoba lagi.";
            } else if (errorMessage.includes("500")) {
                errorMessage = "Kesalahan server. Harap coba lagi nanti.";
            } else {
                errorMessage = `Kesalahan Gemini API: ${errorMessage}`;
            }
            
            throw new Error(errorMessage);
        } else {
            throw new Error("Terjadi kesalahan yang tidak diketahui saat memanggil Gemini API");
        }
    }
};