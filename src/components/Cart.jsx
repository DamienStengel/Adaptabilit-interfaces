import React from 'react'
import { FaTimes, FaPlus, FaMinus, FaTrash, FaCreditCard, FaIdCard } from 'react-icons/fa'

const Cart = ({ items, setCartItems }) => {
  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
      }
      return item
    }).filter(Boolean))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const reduction = 0 // À implémenter selon les règles de réduction
  const total = subtotal - reduction

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>Mon Panier</h2>
        <button className="cart-close"><FaTimes /></button>
      </div>

      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-image">{item.image}</div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <div className="item-price">{(item.price * item.quantity).toFixed(2)} €</div>
            </div>
            <div className="item-controls">
              <button onClick={() => updateQuantity(item.id, -1)}><FaMinus /></button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)}><FaPlus /></button>
              <button 
                className="delete-item"
                onClick={() => setCartItems(prev => prev.filter(i => i.id !== item.id))}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="summary-row">
          <span>Réduction</span>
          <span>{reduction.toFixed(2)} €</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="payment-methods">
        <button className="payment-button company">
          <FaIdCard /> Carte Entreprise
        </button>
        <button className="payment-button credit">
          <FaCreditCard /> Carte Bancaire
        </button>
      </div>
    </div>
  )
}

export default Cart 