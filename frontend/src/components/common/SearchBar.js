import React from 'react';
import { InputGroup, Form, Button } from 'react-bootstrap';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ value = '', onChange, onSearch, placeholder = 'Search...' }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
  };

  const handleClear = () => {
    onChange?.('');
    onSearch?.();
  };

  return (
    <InputGroup className="shadow-sm">
      <InputGroup.Text className="bg-white border-end-0">
        <FiSearch className="text-secondary" />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border-start-0 bg-white"
        aria-label="Search"
      />
      {value && (
        <Button
          variant="outline-secondary"
          className="border-start-0"
          onClick={handleClear}
          title="Clear search"
        >
          <FiX />
        </Button>
      )}
      <Button variant="primary" onClick={onSearch}>
        Search
      </Button>
    </InputGroup>
  );
};

export default SearchBar;
