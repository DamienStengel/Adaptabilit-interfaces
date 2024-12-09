import React from 'react'
import { FaSearch } from 'react-icons/fa'
import './SearchBar.scss'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Rechercher..." 
}: SearchBarProps) => {
  return (
    <div className="search-container">
      <FaSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default SearchBar 