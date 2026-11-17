import { useApp } from '../context/AppContext';
import './CategoryFilter.css';

function cleanTitle(str) {
  if (!str) return "";
  return str
    .replace(/&#8217;/g, "’")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export default function CategoryFilter({ categories = [], activeCategory, onCategoryChange }) {
  const { t } = useApp();

  return (
    <div className="category-filter-wrapper">
      <div className="category-filter-container">
        <button
          className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          <span className="category-icon">🌟</span>
          <span className="category-name">{t('menuAll')}</span>
        </button>

        {categories.map((cat) => {
          const displayIcon = !cat.icon || cat.icon === '✦' ? '🍰' : cat.icon;
          const displayName = cleanTitle(cat.name);

          return (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <span className="category-icon">{displayIcon}</span>
              <span className="category-name">{displayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
