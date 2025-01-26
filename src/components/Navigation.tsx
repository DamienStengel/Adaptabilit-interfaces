import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUtensils, FaCoffee, FaIceCream, FaWineGlass, FaCog } from 'react-icons/fa'
import './Navigation.scss';

interface NavigationProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

const Navigation = ({ activeCategory, setActiveCategory }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

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
          onClick={() => setActiveCategory(category.id)}
        >
          <span className="nav-icon">{category.icon}</span>
          <span className="nav-label">{category.label}</span>
        </button>
      ))}
      
      <button 
        className="admin-link"
        onClick={() => navigate('/admin/subcategories')}
      >
        <FaCog />
        <span>Administration</span>
      </button>
    </nav>
  );
};

export default Navigation