import React from 'react'
import { FaUtensils, FaCoffee, FaIceCream, FaWineGlass } from 'react-icons/fa'

const Navigation = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'TOUT', icon: <FaUtensils />, label: 'TOUT' },
    { id: 'ENTREE', icon: <FaWineGlass />, label: 'ENTRÉE' },
    { id: 'PLAT', icon: <FaUtensils />, label: 'PLAT' },
    { id: 'DESSERT', icon: <FaIceCream />, label: 'DESSERT' },
    { id: 'BOISSON', icon: <FaCoffee />, label: 'BOISSON' }
  ]
  
  return (
    <nav className="navigation">
      {categories.map(category => (
        <button
          key={category.id}
          className={`nav-button ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => setActiveCategory(category.id)}
        >
          <span className="nav-icon">{category.icon}</span>
          <span className="nav-label">{category.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default Navigation 