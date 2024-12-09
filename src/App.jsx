import React, { useState } from 'react'
import Navigation from './components/Navigation'
import ProductGrid from './components/ProductGrid'
import Cart from './components/Cart'

const App = () => {
  const [activeCategory, setActiveCategory] = useState('BOISSON')
  const [cartItems, setCartItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const addToCart = (product) => {
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

  return (
    <div className="app-container">
      <Navigation 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory}
      />
      <div className="main-content">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ProductGrid 
          category={activeCategory}
          searchQuery={searchQuery}
          addToCart={addToCart}
        />
      </div>
      <Cart items={cartItems} setCartItems={setCartItems} />
    </div>
  )
}

export default App 