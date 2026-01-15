import React, { useState } from 'react';
import { Form, InputGroup, Dropdown, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const SearchBar = ({
  onSearch,
  placeholder,
  filters = [],
  onFilterChange,
  initialValue = '',
  showFilters = true,
  className = '',
  size = 'lg'
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [selectedFilter, setSelectedFilter] = useState(
    filters.length > 0 ? filters[0].value : null
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm, selectedFilter);
  };

  const handleFilterSelect = (filterValue) => {
    setSelectedFilter(filterValue);
    if (onFilterChange) {
      onFilterChange(filterValue);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('', selectedFilter);
  };

  return (
    <Form onSubmit={handleSubmit} className={className}>
      <InputGroup size={size}>
        {showFilters && filters.length > 0 && (
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown">
              {filters.find(f => f.value === selectedFilter)?.label || t('filter')}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {filters.map((filter) => (
                <Dropdown.Item
                  key={filter.value}
                  active={selectedFilter === filter.value}
                  onClick={() => handleFilterSelect(filter.value)}
                >
                  {filter.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}

        <Form.Control
          placeholder={placeholder || t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-start-0"
        />

        <Button
          variant="outline-secondary"
          onClick={handleClear}
          disabled={!searchTerm}
        >
          <i className="bi bi-x"></i>
        </Button>

        <Button
          variant="primary"
          type="submit"
        >
          <i className="bi bi-search"></i> {t('search')}
        </Button>
      </InputGroup>

      {searchTerm && (
        <div className="mt-2">
          <small className="text-muted">
            {t('showing_results_for')}: <strong>{searchTerm}</strong>
            {selectedFilter && filters.length > 0 && (
              <> {t('in')} <strong>{filters.find(f => f.value === selectedFilter)?.label}</strong></>
            )}
          </small>
        </div>
      )}
    </Form>
  );
};

export default SearchBar;