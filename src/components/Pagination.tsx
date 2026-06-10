import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const btn = (disabled: boolean): React.CSSProperties => ({
    padding: '6px 10px', borderRadius: 5, border: '1px solid #bdc3c7',
    backgroundColor: disabled ? '#ecf0f1' : 'white', cursor: disabled ? 'default' : 'pointer',
    color: disabled ? '#bdc3c7' : '#2c3e50', display: 'flex', alignItems: 'center',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', padding: '10px 0' }}>
      <span style={{ fontSize: 13, color: '#7f8c8d' }}>
        {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–{Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
      </span>
      <button style={btn(currentPage === 1)} onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button key={page} onClick={() => onPageChange(page)} style={{
          padding: '6px 10px', borderRadius: 5, border: '1px solid',
          borderColor: page === currentPage ? '#27ae60' : '#bdc3c7',
          backgroundColor: page === currentPage ? '#27ae60' : 'white',
          color: page === currentPage ? 'white' : '#2c3e50',
          cursor: 'pointer', fontWeight: page === currentPage ? 700 : 400, fontSize: 13,
        }}>{page}</button>
      ))}
      <button style={btn(currentPage === totalPages)} onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;