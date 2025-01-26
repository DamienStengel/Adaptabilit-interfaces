import React, { useState } from 'react'
import Navigation from './components/Navigation'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'
import SearchBar from './components/SearchBar/SearchBar'
import {Route, Routes, useLocation} from "react-router-dom";
import SubcategoryManager from "./components/SubcategoryManager.tsx";
import { Product } from './services/product.service';

export interface CartItem extends Product {
  quantity: number;
}

const App: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [activeCategory, setActiveCategory] = useState<string>('BOISSON')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? {...item, quantity: item.quantity + 1}
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  return (
    <div className="app-container">
      {!isAdmin && (
        <Navigation
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}
      <Routes>
        <Route path="/" element={
          <div className="main-content">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Rechercher un produit..."
            />
            <ProductGrid
              category={activeCategory}
              searchQuery={searchQuery}
              addToCart={addToCart}
            />
          </div>
        } />
        <Route path="/admin/subcategories" element={<SubcategoryManager />} />
      </Routes>
      {!isAdmin && <Cart items={cartItems} setCartItems={setCartItems} />}
    </div>
  );
}

export default App 