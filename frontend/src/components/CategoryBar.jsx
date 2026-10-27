import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Sparkles, 
  Tv, 
  Film, 
  Flame, 
  Globe, 
  Calendar, 
  Tv2, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import './CategoryBar.css';

export const DROPDOWN_GROUPS = [
  {
    id: 'ott',
    name: 'OTT Platforms',
    icon: Tv,
    items: [
      { id: 'netflix', label: 'Netflix' },
      { id: 'appletv', label: 'Apple TV+' },
      { id: 'amazon-prime', label: 'Amazon Prime' },
      { id: 'disney', label: 'Disney+ / Hotstar' },
      { id: 'hbo', label: 'HBO / Max' },
      { id: 'anime', label: 'Anime Series' },
      { id: 'kdrama', label: 'K-Drama' },
      { id: 'turkish', label: 'Turkish' },
      { id: 'chinese', label: 'Chinese' }
    ]
  },
  {
    id: 'genres',
    name: 'Genres',
    icon: Film,
    items: [
      { id: '28', label: 'Action' },
      { id: '12', label: 'Adventure' },
      { id: '16', label: 'Animation' },
      { id: '35', label: 'Comedy' },
      { id: '80', label: 'Crime' },
      { id: '99', label: 'Documentary' },
      { id: '18', label: 'Drama' },
      { id: '10751', label: 'Family' },
      { id: '14', label: 'Fantasy' },
      { id: '36', label: 'History' },
      { id: '27', label: 'Horror' },
      { id: '9648', label: 'Mystery' },
      { id: '10749', label: 'Romance' },
      { id: '878', label: 'Sci-Fi' },
      { id: '53', label: 'Thriller' },
      { id: '10752', label: 'War' }
    ]
  },
  {
    id: 'years',
    name: 'By Year',
    icon: Calendar,
    items: [
      { id: '2026', label: '2026' },
      { id: '2025', label: '2025' },
      { id: '2024', label: '2024' },
      { id: '2023', label: '2023' },
      { id: '2022', label: '2022' },
      { id: '2021', label: '2021' },
      { id: '2020', label: '2020' },
      { id: '2019', label: '2019' },
      { id: '2018', label: '2018' },
      { id: '2015', label: '2015' },
      { id: '2010', label: '2010' },
      { id: '2000', label: '2000s Classics' }
    ]
  },
  {
    id: 'qualities',
    name: 'By Quality',
    icon: Tv2,
    items: [
      { id: '4k', label: '2160p 4K UHD' },
      { id: '1080p', label: '1080p Full HD' },
      { id: '720p', label: '720p HD' }
    ]
  },
  {
    id: 'regions',
    name: 'Languages',
    icon: Globe,
    items: [
      { id: 'bollywood', label: 'Bollywood (Hindi)' },
      { id: 'hollywood', label: 'Hollywood (English)' },
      { id: 'south-indian', label: 'South Indian Dubbed' },
      { id: 'kdrama', label: 'Korean / K-Drama' }
    ]
  }
];

const CategoryBar = ({ activeCategory, onSelectCategory }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (menuId) => {
    setOpenDropdown(prev => (prev === menuId ? null : menuId));
  };

  const handleItemClick = (itemId) => {
    onSelectCategory(itemId);
    setOpenDropdown(null);
  };

  // Find active label if a sub-item is selected
  const getActiveLabel = () => {
    if (activeCategory === 'all') return null;
    for (const group of DROPDOWN_GROUPS) {
      const match = group.items.find(i => i.id === activeCategory);
      if (match) return { groupName: group.name, label: match.label };
    }
    return null;
  };

  const activeBadge = getActiveLabel();

  return (
    <div className="category-bar-wrapper" ref={navRef}>
      <div className="container category-container">
        <div className="category-nav-bar">
          
          {/* "All" button */}
          <button 
            className={`cat-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleItemClick('all')}
          >
            <span>All Featured</span>
          </button>

          {/* Quick Trending shortcuts */}
          <button 
            className={`cat-tab-btn ${activeCategory === 'series' ? 'active' : ''}`}
            onClick={() => handleItemClick('series')}
          >
            <span>Web Series</span>
          </button>

          <button 
            className={`cat-tab-btn ${activeCategory === '28' ? 'active' : ''}`}
            onClick={() => handleItemClick('28')}
          >
            <span>Action</span>
          </button>

          {/* Dropdown Menus matching VegaMovies */}
          {DROPDOWN_GROUPS.map((group) => {
            const Icon = group.icon;
            const isOpen = openDropdown === group.id;
            const hasActiveChild = group.items.some(i => i.id === activeCategory);

            return (
              <div key={group.id} className={`dropdown-container ${isOpen ? 'is-open' : ''}`}>
                <button 
                  className={`cat-tab-btn has-dropdown ${hasActiveChild ? 'active' : ''}`}
                  onClick={() => handleToggle(group.id)}
                  aria-expanded={isOpen}
                >
                  <Icon size={15} />
                  <span>{group.name}</span>
                  <ChevronDown size={14} className={`dropdown-chevron ${isOpen ? 'rotate' : ''}`} />
                </button>

                {isOpen && (
                  <div className="dropdown-menu-panel">
                    <div className="dropdown-grid">
                      {group.items.map((item) => {
                        const isSelected = activeCategory === item.id;
                        return (
                          <button
                            key={item.id}
                            className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleItemClick(item.id)}
                          >
                            <span>{item.label}</span>
                            {isSelected && <span className="dropdown-dot" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Filter Indicator Tag */}
        {activeBadge && (
          <div className="active-filter-indicator">
            <span className="filter-pill">
              {activeBadge.groupName}: <strong>{activeBadge.label}</strong>
              <button 
                onClick={() => handleItemClick('all')} 
                className="clear-filter-btn"
                title="Reset to All"
              >
                <X size={14} />
              </button>
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryBar;
