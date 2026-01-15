import React, { useState, useEffect } from 'react';
import { Table, Badge, Pagination, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  emptyMessage,
  actions = null,
  striped = true,
  hover = true,
  bordered = true,
  responsive = true
}) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }

    if (column.key === 'status' || column.key === 'isActive') {
      const status = item[column.key];
      const isActive = column.key === 'isActive' ? status : status === 'active';
      return (
        <Badge bg={isActive ? 'success' : 'danger'}>
          {isActive ? t('active') : t('inactive')}
        </Badge>
      );
    }

    if (column.key === 'role') {
      return (
        <Badge bg={item[column.key] === 'admin' ? 'danger' : 'info'}>
          {item[column.key]}
        </Badge>
      );
    }

    if (column.key === 'balance' || column.key === 'accountBalance') {
      return `$${parseFloat(item[column.key] || 0).toLocaleString()}`;
    }

    if (column.key === 'createdAt' && item[column.key]) {
      return new Date(item[column.key]).toLocaleDateString();
    }

    return item[column.key] || '-';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </div>
        <p className="mt-2 text-muted">{t('loading_data', 'Loading data...')}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-inbox display-1 text-muted"></i>
        <p className="mt-3 text-muted">{emptyMessage || t('no_data')}</p>
      </div>
    );
  }

  const renderCardView = () => (
    <div className="d-flex flex-column gap-3">
      {data.map((item, index) => (
        <Card key={item.id || index} className="border-secondary bg-card shadow-sm" onClick={() => onRowClick && onRowClick(item)}>
          <Card.Body className="p-3">
            {columns.map((column, colIdx) => (
              <div key={colIdx} className="d-flex justify-content-between py-2 border-bottom border-light border-opacity-10 last-child-no-border">
                <span className="text-secondary small fw-bold text-uppercase">{column.title}</span>
                <span className="text-white">{renderCell(item, column)}</span>
              </div>
            ))}
            {actions && (
              <div className="mt-3 pt-2 d-flex justify-content-end gap-2 border-top border-secondary border-opacity-25">
                {typeof actions === 'function' ? actions(item) : actions}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="data-table-container">
      {isMobile ? renderCardView() : (
        <Table striped={striped} hover={hover} bordered={bordered} responsive={responsive}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} style={column.style}>
                  {column.title}
                </th>
              ))}
              {actions && <th>{t('actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={item.id || rowIndex}
                onClick={() => onRowClick && onRowClick(item)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {renderCell(item, column)}
                  </td>
                ))}
                {actions && (
                  <td>
                    {typeof actions === 'function' ? actions(item) : actions}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}

            <Pagination.Next
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
      <style>{`
        .last-child-no-border:last-child { border-bottom: none !important; }
      `}</style>
    </div>
  );
};

export default DataTable;