import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LanguageSelector } from './components/LanguageSelector';
import { LevelSelector } from './components/LevelSelector';
import { translateTextStream } from './services/geminiService';
import { SUPPORTED_LANGUAGES, TARGET_LANGUAGES } from './constants';
import { CEFRLevel } from './types';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LocalizationProvider, useLocalization } from './contexts/LocalizationContext';
import { UI_LANGUAGES } from './translations';

// Icons with aria-hidden since they are decorative or accompanying text
const SwapIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" />
    <path d="M17 8v12M17 20l4-4M17 20l-4-4" />
  </svg>
);

const CopyIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ClearIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const MoonIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const SunIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocalization();
  const label = theme === 'light' ? t.themeDark : t.themeLight;
  
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      title={label}
      aria-label={label}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

const UiLanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Handle escape key to close dropdown
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (isOpen && event.key === 'Escape') {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Select UI Language"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <span>{UI_LANGUAGES.find(l => l.code === language)?.name}</span>
                 <svg className={`w-3 h-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div 
                    role="menu"
                    className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                >
                     {UI_LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                                buttonRef.current?.focus();
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${language === lang.code ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700/50' : 'text-gray-700 dark:text-gray-200'}`}
                        >
                            {lang.name}
                        </button>
                     ))}
                </div>
            )}
        </div>
    )
}

const AppContent: React.FC = () => {
  const { t } = useLocalization();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null); // Ref to scroll to bottom
  
  // State
  const [sourceCode, setSourceCode] = useState<string>('auto');
  const [targetCode, setTargetCode] = useState<string>('source');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>(CEFRLevel.B1_1);
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Handlers
  const handleSwapLanguages = () => {
    if (sourceCode === 'auto' || targetCode === 'source') return; // Cannot swap if auto or target is source
    setSourceCode(targetCode);
    setTargetCode(sourceCode);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setOutputText(''); // Clear previous output

    try {
      await translateTextStream(
        inputText,
        sourceCode,
        targetCode,
        cefrLevel,
        (chunk) => {
          setOutputText((prev) => prev + chunk);
        }
      );
    } catch (err) {
      console.error(err);
      let errorMessage = t.errorGeneric;
      const errorStr = err instanceof Error ? err.message : String(err);
      
      // Determine error type based on message content or status codes
      if (errorStr.includes('401') || errorStr.includes('403') || errorStr.toLowerCase().includes('api key')) {
        errorMessage = t.errorApiKey;
      } else if (errorStr.includes('429') || errorStr.toLowerCase().includes('quota')) {
        errorMessage = t.errorQuota;
      } else if (errorStr.toLowerCase().includes('network') || errorStr.toLowerCase().includes('fetch')) {
        errorMessage = t.errorNetwork;
      } else if (errorStr.includes('SAFETY') || errorStr.includes('blocked')) {
        errorMessage = t.errorSafety;
      }
      
      setError(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    // Focus back on textarea after clear
    textareaRef.current?.focus();
  }

  // Effect to auto-translate on Ctrl+Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
        handleTranslate();
    }
  }, [inputText, sourceCode, targetCode, cefrLevel]);

  // Auto-scroll to bottom when text is streaming or skeleton is active
  useEffect(() => {
    if (isTranslating && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputText, isTranslating]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{t.appTitle}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 font-medium">{t.appSubtitle}</p>
                </div>
            </div>
            
            <nav className="flex items-center gap-2 sm:gap-4" aria-label="App settings">
                <UiLanguageSelector />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></div>
                <ThemeToggle />
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 flex flex-col gap-6">
        
        {/* Controls Card */}
        <section 
            aria-label="Translation Settings"
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 lg:p-6 transition-colors"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                
                {/* Source Language */}
                <div className="lg:col-span-3 w-full">
                    <LanguageSelector 
                        id="source-lang"
                        label={t.sourceLabel}
                        selectedCode={sourceCode} 
                        languages={SUPPORTED_LANGUAGES} 
                        onChange={setSourceCode} 
                    />
                </div>

                {/* Swap Button */}
                <div className="lg:col-span-1 flex justify-center pb-1">
                    <button 
                        type="button"
                        onClick={handleSwapLanguages}
                        disabled={sourceCode === 'auto' || targetCode === 'source'}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${sourceCode === 'auto' || targetCode === 'source' ? 'opacity-30 cursor-not-allowed dark:text-gray-500' : 'text-blue-600 dark:text-blue-400'}`}
                        title="Swap languages"
                        aria-label="Swap source and target languages"
                    >
                        <SwapIcon />
                    </button>
                </div>

                {/* Target Language */}
                <div className="lg:col-span-3 w-full">
                    <LanguageSelector 
                        id="target-lang"
                        label={t.targetLabel}
                        selectedCode={targetCode} 
                        languages={TARGET_LANGUAGES} 
                        onChange={setTargetCode} 
                    />
                </div>

                {/* Level Selector */}
                <div className="lg:col-span-5 w-full">
                    <LevelSelector 
                        id="cefr-level"
                        label={t.levelLabel}
                        selectedLevel={cefrLevel} 
                        onChange={setCefrLevel} 
                    />
                </div>
            </div>
        </section>

        {/* Translation Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[400px]">
            
            {/* Input Card */}
            <section 
                aria-label="Input Text"
                className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-blue-500/10 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all overflow-hidden relative group"
            >
                <label htmlFor="input-textarea" className="sr-only">{t.inputPlaceholder}</label>
                <textarea
                    id="input-textarea"
                    ref={textareaRef}
                    className="flex-1 w-full p-6 text-lg lg:text-xl resize-none outline-none bg-transparent dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 font-normal leading-relaxed"
                    placeholder={t.inputPlaceholder}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck="false"
                />
                
                {/* Input Actions */}
                <div className="h-16 px-4 flex justify-between items-center border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                     <span className="text-xs text-gray-400 dark:text-gray-500 font-medium" aria-live="polite">
                        {inputText.length} {t.chars}
                     </span>
                     <div className="flex items-center gap-2">
                         {inputText && (
                             <button 
                                type="button"
                                onClick={handleClear}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                title={t.clear}
                                aria-label={t.clear}
                            >
                                 <ClearIcon />
                             </button>
                         )}
                     </div>
                </div>
            </section>
            
            {/* Output Card */}
            <section 
                aria-label="Translation Result"
                className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-800 flex flex-col relative overflow-hidden"
            >
                {error ? (
                    <div className="flex-1 p-6 flex items-center justify-center text-red-500 dark:text-red-400 text-center" role="alert">
                        <div>
                            <p className="font-bold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div 
                        ref={outputRef}
                        className="flex-1 w-full p-6 text-lg lg:text-xl font-normal leading-relaxed overflow-y-auto scroll-smooth"
                        role="status"
                        aria-live="polite"
                    >
                        {/* Placeholder if empty and not translating */}
                        {!outputText && !isTranslating && (
                             <div className="text-gray-400 dark:text-gray-600">{t.outputPlaceholder}</div>
                        )}

                        {/* Content */}
                        <div className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                            {outputText}
                            
                            {/* Skeleton - Shows that the next part is loading */}
                            {isTranslating && (
                                <div className="mt-8 space-y-4 animate-pulse opacity-50" aria-label="Translating next segment">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-11/12"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                </div>
                            )}
                            <div ref={bottomRef}></div>
                        </div>
                    </div>
                )}

                {/* Output Actions */}
                <div className="h-16 px-4 flex justify-end items-center gap-2 border-t border-gray-100/50 dark:border-gray-700/50">
                    <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!outputText}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${copySuccess 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200'}
                            ${!outputText && 'opacity-50 cursor-not-allowed'}
                        `}
                        aria-live="polite"
                    >
                        {copySuccess ? <CheckIcon /> : <CopyIcon />}
                        {copySuccess ? t.copied : t.copy}
                    </button>
                </div>
            </section>
        </div>

        {/* Main Action Button Area */}
        <div className="flex justify-center pb-8">
            <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className={`
                    group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 
                    text-base font-bold text-white transition-all duration-200 
                    bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 hover:-translate-y-0.5
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
                    w-full sm:w-auto min-w-[200px] dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-900/20
                `}
                aria-label={isTranslating ? t.processing : t.translateButton}
            >
                {isTranslating ? (
                   <>
                       <SpinnerIcon />
                       <span>{t.processing}</span>
                   </>
                ) : (
                   <>
                    <span>{t.translateButton}</span>
                    <span className="bg-blue-500/50 dark:bg-blue-400/30 rounded px-1.5 text-xs py-0.5 text-blue-100 dark:text-blue-50 hidden sm:inline-block group-hover:bg-blue-600/50 dark:group-hover:bg-blue-400/40 transition-colors" aria-hidden="true">{t.ctrlEnter}</span>
                   </>
                )}
            </button>
        </div>

      </main>
      
      {/* Disclaimer */}
      <footer className="py-6 text-center text-gray-400 dark:text-gray-500 text-xs px-4" role="contentinfo">
        <p>{t.disclaimer}</p>
        <p className="mt-1">{t.builtWith}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocalizationProvider>
        <AppContent />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;