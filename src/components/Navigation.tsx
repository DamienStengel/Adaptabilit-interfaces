import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaCoffee, FaIceCream, FaWineGlass, FaCog } from 'react-icons/fa'

interface NavigationProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

const Navigation = ({ activeCategory, setActiveCategory }: NavigationProps) => {
  const navigate = useNavigate();
  const categories = [
    { id: 'TOUT', icon: <FaUtensils />, label: 'TOUT' },
    { id: 'ENTREE', icon: <FaWineGlass />, label: 'ENTRÉE' },
    { id: 'PLAT', icon: <FaUtensils />, label: 'PLAT' },
    { id: 'DESSERT', icon: <FaIceCream />, label: 'DESSERT' },
    { id: 'BOISSON', icon: <FaCoffee />, label: 'BOISSON' }
  ];

  return (
      <nav className="navigation">
        {categories.map(category => (
            <button
                key={category.id}
                className={`nav-button ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(category.id);
                  navigate('/');
                }}
            >
              <span className="nav-icon">{category.icon}</span>
              <span className="nav-label">{category.label}</span>
            </button>
        ))}

        <button
            className="nav-button"
            onClick={() => navigate('/admin/subcategories')}
        >
          <span className="nav-icon"><FaCog /></span>
          <span className="nav-label">Admin</span>
        </button>
      </nav>
  );
};

export default Navigation