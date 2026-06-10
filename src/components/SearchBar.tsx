import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Rechercher...' }) => (
  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
    <Search size={16} color="#7f8c8d" style={{ position: 'absolute', left: 10 }} />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
        borderRadius: 6, border: '1.5px solid #bdc3c7', fontSize: 13,
        backgroundColor: 'white', outline: 'none', width: 200,
        transition: 'border-color 0.2s',
      }}
      onFocus={e => e.currentTarget.style.borderColor = '#3498db'}
      onBlur={e => e.currentTarget.style.borderColor = '#bdc3c7'}
    />
  </div>
);

export default SearchBar;