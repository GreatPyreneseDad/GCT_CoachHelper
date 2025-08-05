'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, User, Calendar, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

type SearchResult = {
  id: string;
  type: 'client' | 'session' | 'note';
  title: string;
  subtitle?: string;
  date?: string;
  url: string;
};

type SearchProps = {
  onSearch?: (query: string) => Promise<SearchResult[]>;
  recentSearches?: string[];
  trendingSearches?: string[];
  placeholder?: string;
};

const typeIcons = {
  client: User,
  session: Calendar,
  note: FileText,
};

export function ProgressiveSearch({
  onSearch,
  recentSearches = [],
  trendingSearches = [],
  placeholder = 'Search clients, sessions, notes...',
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery || !onSearch) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await onSearch(debouncedQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, onSearch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const maxIndex = results.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = results[selectedIndex].url;
        }
        break;
      case 'Escape':
        e.preventDefault();
        setQuery('');
        inputRef.current?.blur();
        break;
    }
  }, [results, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showResults = isFocused && (query || recentSearches.length > 0 || trendingSearches.length > 0);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
          aria-label="Search"
          aria-expanded={showResults}
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
        />
        {query && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            ref={resultsRef}
            id="search-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full rounded-lg border bg-popover p-2 shadow-lg"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}

            {/* Search results */}
            {!isLoading && results.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Results
                </p>
                {results.map((result, index) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <a
                      key={result.id}
                      id={`result-${index}`}
                      href={result.url}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent',
                        selectedIndex === index && 'bg-accent'
                      )}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-xs text-muted-foreground">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      {result.date && (
                        <span className="text-xs text-muted-foreground">
                          {result.date}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {!isLoading && query && results.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No results found for "{query}"
                </p>
              </div>
            )}

            {/* Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Recent
                </p>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Trending searches */}
            {!query && trendingSearches.length > 0 && (
              <div className="mt-3 space-y-1 border-t pt-3">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Trending
                </p>
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{search}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}