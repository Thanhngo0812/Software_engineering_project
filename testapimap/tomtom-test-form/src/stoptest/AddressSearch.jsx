import React, { useState, useEffect, useCallback, useRef } from 'react';
import { services } from '@tomtom-international/web-sdk-services';
import './AddressSearch.css';

// Custom hook để "trì hoãn" việc tìm kiếm (Debounce)
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const AddressSearch = ({ apiKey, value, onChange, onSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedQuery = useDebounce(value, 500);
    const cache = useRef({});

    const fetchSuggestions = useCallback(async (searchQuery) => {
        if (searchQuery.length <3) {
            setSuggestions([]);
            return;
        }
        if (cache.current[searchQuery]) {
            setSuggestions(cache.current[searchQuery]);
            return;
        }

        setIsLoading(true);

        try {
            const response = await services.fuzzySearch({
                key: apiKey,
                query: searchQuery,
                countrySet: 'VN',
            });
            const results = response.results || [];
            
            // Lưu kết quả vào cache và cập nhật state
            cache.current[searchQuery] = results;
            setSuggestions(results);

        } catch (error) {
            console.error("Fuzzy search error:", error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey]);

    useEffect(() => {
        if (isFocused) {
            fetchSuggestions(debouncedQuery);
        }
    }, [debouncedQuery, fetchSuggestions, isFocused]);

    const handleSelect = (result) => {
        const address = result.address.freeformAddress;
        const position = { 
            lat: result.position.lat, 
            lng: result.position.lng 
        };
        onSelect({ address, position });
        setSuggestions([]);
    };

    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="Nhập địa chỉ..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
            {isFocused && (isLoading ? (
                <ul className="suggestions-list">
                    <li className="loading-indicator">Đang tìm kiếm...</li>
                </ul>
            ) : (suggestions.length == 0?
                <ul className="suggestions-list">
                    <li className="loading-indicator">Không tìm thấy, bạn nên nhập tối thiểu 4 kí tự.</li>
                </ul>
                : (
                <ul className="suggestions-list">
                    {suggestions.slice(0, 3).map((result) => (
                        <li key={result.id} onMouseDown={() => handleSelect(result)}>
                            <svg className="suggestion-icon" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
                            </svg>
                            {result.address.freeformAddress}
                        </li>
                    ))}
                </ul>
            )))}
        </div>
    );
};

export default AddressSearch;