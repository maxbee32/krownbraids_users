'use client';

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Brain, Sparkles } from 'lucide-react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import StyleCard from './components/StyleCard';
import MarketplaceSection from './components/MarketplaceSection';
import AITryOn from './components/AITryOn';
import { categories, styles } from '../lib/data';
import { Category } from '../app/types';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAITryOn, setShowAITryOn] = useState<boolean>(false);

  // Filter styles
  const filteredStyles = styles.filter((style) => {
    const matchesSearch = style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         style.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory
      ? style.category.toLowerCase().replace(/ /g, '-') === selectedCategory
      : true;
    
    return matchesSearch && matchesCategory;
  });

  // Get category count
  const categoriesWithCount: Category[] = categories.map((cat) => ({
    ...cat,
    count: styles.filter((s) => s.category.toLowerCase().replace(/ /g, '-') === cat.id).length,
  }));

  return (
    <>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#d4914c',
              secondary: '#fff',
            },
          },
        }}
      />
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="pt-4 pb-12">
          {/* AI Try-On Hero Banner */}
          <div className="container-custom mb-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 p-6 sm:p-8 text-white">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              </div>
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-bold">
                      Try On Styles with <span className="text-yellow-300">AI</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80">
                      Upload or take a photo to see how different hairstyles look on you
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAITryOn(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  Try Now
                </button>
              </div>
            </div>
          </div>

          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
          <CategoryFilter
            categories={categoriesWithCount}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          
          <div className="container-custom py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-900">
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.name 
                    : 'All Styles'}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredStyles.length} style{filteredStyles.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            {filteredStyles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700">No styles found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredStyles.map((style) => (
                  <StyleCard key={style.id} style={style} />
                ))}
              </div>
            )}
          </div>

          {/* Marketplace Section */}
          <MarketplaceSection />
        </div>
      </main>

      {/* AI Try-On Modal */}
      {showAITryOn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slideUp">
            <AITryOn onClose={() => setShowAITryOn(false)} />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}