/**
 * Translation utility for auto-translating post content
 * Uses MyMemory Translation API (free, no API key required)
 */

// Translation cache to avoid repeated API calls
const translationCache = new Map();

/**
 * Detect if text contains Vietnamese characters
 */
export const containsVietnamese = (text) => {
  if (!text) return false;
  const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
  return vietnameseRegex.test(text);
};

/**
 * Detect the language of text
 * @param {string} text - Text to detect
 * @returns {string} - 'vi' or 'en'
 */
export const detectLanguage = (text) => {
  if (!text || text.trim().length === 0) return 'en';
  return containsVietnamese(text) ? 'vi' : 'en';
};

/**
 * Translate text using MyMemory Translation API
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language ('vi' or 'en')
 * @param {string} toLang - Target language ('vi' or 'en')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, fromLang, toLang) => {
  if (!text || text.trim().length === 0) return text;
  if (fromLang === toLang) return text;

  // Check cache first
  const cacheKey = `${text}|${fromLang}|${toLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // Use MyMemory Translation API (free, no API key required)
    const langPair = fromLang === 'vi' ? 'vi|en' : 'en|vi';
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Translation API failed');
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      // Cache the translation
      translationCache.set(cacheKey, translated);
      return translated;
    } else {
      // If translation fails, return original text
      console.warn('Translation failed:', data);
      return text;
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text on error
    return text;
  }
};

/**
 * Get translated content based on user language preference
 * @param {string} content - Original content
 * @param {string} userLanguage - User's preferred language ('vi' or 'en')
 * @returns {Promise<string>} - Translated or original content
 */
export const getTranslatedContent = async (content, userLanguage) => {
  if (!content || content.trim().length === 0) return content;

  const contentLanguage = detectLanguage(content);

  // If content language matches user language, no translation needed
  if (contentLanguage === userLanguage) {
    return content;
  }

  // Translate to user's preferred language
  return await translateText(content, contentLanguage, userLanguage);
};

/**
 * Clear translation cache (useful for testing or memory management)
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

