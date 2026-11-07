import { motion } from 'framer-motion'
import { FiChevronDown, FiGrid, FiSearch } from 'react-icons/fi'

// Keyword + category drop-down. Owner: Yashkumar
// The page that uses this keeps the values, so the URL can stay in sync with them.
export default function SearchBar({ keyword, category, categories, onKeywordChange, onCategoryChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className="search-card search-card-wide" onSubmit={handleSubmit} role="search">
      <label className="search-field search-field-keyword">
        <FiSearch className="text-orange" />
        <input
          type="search"
          placeholder="Try &quot;leaking tap&quot; or &quot;LaSalle&quot;"
          aria-label="Search by keyword"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </label>

      <label className="search-field">
        <FiGrid className="opacity-75" />
        <select aria-label="Category" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <FiChevronDown className="chev" />
      </label>

      <motion.button type="submit" className="btn btn-orange search-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        Search
      </motion.button>
    </form>
  )
}
