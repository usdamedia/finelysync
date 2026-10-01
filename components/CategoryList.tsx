import React from 'react';

interface CategoryListProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  totalValue: number;
  currencySymbol: string;
  showAmounts: boolean;
  limit?: number;
}

const CategoryList: React.FC<CategoryListProps> = ({ data, totalValue, currencySymbol, showAmounts, limit }) => {
  const displayData = limit ? data.slice(0, limit) : data;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center gap-3 type-caption font-medium pb-2 border-b border-outline mb-1 px-1">
        <span>Kategori</span>
        <div className="flex gap-3 sm:gap-4 shrink-0">
          <span className="w-20 text-right">{currencySymbol}</span>
          <span className="w-12 text-right">%</span>
        </div>
      </div>

      <div>
        {displayData.map((entry, index) => {
          const percent = totalValue > 0 ? (entry.value / totalValue) * 100 : 0;
          return (
            <div key={index} className="flex justify-between items-center gap-3 py-3 px-1 rounded-lg hover:bg-surfaceVariant/60 transition-colors border-b border-outline/50 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || 'var(--color-outline)' }} />
                <span className="type-subheadline font-medium text-onSurface truncate">{entry.name}</span>
              </div>
              <div className="flex gap-3 sm:gap-4 items-center shrink-0 tabular-nums">
                <span className="type-subheadline font-medium text-onSurface w-20 text-right truncate">
                  {showAmounts ? `${currencySymbol}${entry.value.toLocaleString()}` : '••••'}
                </span>
                <span className="type-caption w-12 text-right">{percent.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryList;
