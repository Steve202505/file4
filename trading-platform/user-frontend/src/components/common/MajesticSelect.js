import React, { useState, useRef, useEffect } from 'react';

const MajesticSelect = ({ options, value, onChange, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="majestic-dropdown-container" ref={dropdownRef}>
            <div
                className={`majestic-input-wrapper majestic-dropdown-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="d-flex align-items-center gap-2 py-2">
                    {icon && <i className={`bi ${icon} text-warning opacity-75`}></i>}
                    <span className={selectedOption ? 'text-white' : 'text-secondary opacity-50'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <i className={`bi bi-chevron-down majestic-dropdown-chevron ${isOpen ? 'open' : ''}`}></i>
            </div>

            <div className={`majestic-dropdown-list ${isOpen ? 'open' : ''}`}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        className={`majestic-dropdown-item ${value === option.value ? 'selected' : ''}`}
                        onClick={() => {
                            onChange({ target: { name: option.name, value: option.value } });
                            setIsOpen(false);
                        }}
                    >
                        {option.icon && <i className={`bi ${option.icon}`}></i>}
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MajesticSelect;
