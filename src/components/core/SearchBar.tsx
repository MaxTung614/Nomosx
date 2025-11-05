import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Button } from '../ui/button'

/**
 * SearchBar Component
 * 
 * A search bar with search history functionality
 * Supports searching for games and products
 */
export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load search history:', e)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Add to history (avoid duplicates, limit to 5 items)
    const newHistory = [
      searchQuery,
      ...searchHistory.filter(item => item !== searchQuery)
    ].slice(0, 5)

    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))

    // Perform search (you can implement actual search logic here)
    console.log('Searching for:', searchQuery)
    
    // Close dropdown
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  const handleHistoryClick = (item: string) => {
    setQuery(item)
    handleSearch(item)
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }

  const removeHistoryItem = (item: string) => {
    const newHistory = searchHistory.filter(h => h !== item)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  // Popular searches (example data)
  const popularSearches = ['Valorant', 'Genshin Impact', 'Mobile Legends', 'PUBG']

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" 
          style={{ color: '#9EA3AE' }}
        />
        <Input
          type="text"
          placeholder="搜尋遊戲..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 border transition-all"
          style={{
            backgroundColor: 'rgba(18, 20, 26, 0.8)',
            borderColor: '#1F2937',
            color: '#EAEAEA'
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(true)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 hover:opacity-70"
            style={{ color: '#9EA3AE' }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card 
          className="absolute top-full left-0 right-0 mt-2 z-50 border overflow-hidden"
          style={{
            backgroundColor: '#12141A',
            borderColor: '#1F2937',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="max-h-80 overflow-y-auto">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="p-3 border-b" style={{ borderColor: '#1F2937' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: '#9EA3AE' }} />
                    <span className="text-sm" style={{ color: '#9EA3AE' }}>
                      最近搜尋
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-6 px-2 text-xs"
                    style={{ color: '#9EA3AE' }}
                  >
                    清除
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group hover:bg-opacity-10 hover:bg-white rounded px-2 py-1.5 cursor-pointer transition-colors"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <span className="text-sm" style={{ color: '#EAEAEA' }}>
                        {item}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeHistoryItem(item)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#9EA3AE' }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" style={{ color: '#FFC107' }} />
                <span className="text-sm" style={{ color: '#9EA3AE' }}>
                  熱門搜尋
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item, index) => (
                  <Badge
                    key={index}
                    className="cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      borderColor: '#FFC107',
                      color: '#FFC107',
                      border: '1px solid'
                    }}
                    onClick={() => handleHistoryClick(item)}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
