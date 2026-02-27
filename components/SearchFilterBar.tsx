
import React from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface FilterChip {
  id: string;
  label: string;
  icon?: React.ElementType;
  color?: string;
}

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  filters: FilterChip[];
  placeholder?: string;
  rightElement?: React.ReactNode;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filters,
  placeholder = "ค้นหา...",
  rightElement
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search Input Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-stone-100 rounded-2xl text-stone-700 font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50/50 transition-all placeholder:text-stone-300 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-all"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {rightElement}
      </div>

      {/* Filter Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2 bg-stone-100 rounded-xl text-stone-400">
            <SlidersHorizontal size={16} />
          </div>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const Icon = filter.icon;
            
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border-2
                  ${isActive 
                    ? `${filter.color || 'bg-stone-800 border-stone-800 text-white'} shadow-md shadow-stone-200 -translate-y-0.5` 
                    : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200 hover:text-stone-600'
                  }
                `}
              >
                {Icon && <Icon size={14} strokeWidth={2.5} />}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
