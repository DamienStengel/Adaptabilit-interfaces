import React from 'react'
import { FaCreditCard, FaIdCard } from 'react-icons/fa'
import CartSummary from './CartSummary'

interface Item {
  id: string
  image: string
  name: string
  price: number
  quantity: number
}

interface CartProps {
  items: Item[]
  setCartItems: React.Dispatch<React.SetStateAction<Item[]>>
}

const Cart: React.FC<CartProps> = ({ items, setCartItems }) => {
  const handleDeleteItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>Mon Panier</h2>
      </div>

      <CartSummary 
        items={items} 
        onDeleteItem={handleDeleteItem}
      />

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