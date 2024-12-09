import React from 'react'
import { FaTrash } from 'react-icons/fa'
import './CartItem.scss'

interface Item {
  id: string
  image: string
  name: string
  price: number
  quantity: number
}

interface CartItemProps {
  item: Item
  onDelete: (id: string) => void
}

const CartItem = ({ item, onDelete }: CartItemProps) => {
  return (
    <div className="cart-item">
      <div className="item-image">{item.image}</div>
      <div className="item-details">
        <div className="item-info">
          <span className="item-quantity">{item.quantity}</span>
          <span className="item-x">x</span>
          <span className="item-name">{item.name}</span>
        </div>
        <div className="item-price">{(item.price * item.quantity).toFixed(2)}€</div>
      </div>
      <button 
        className="delete-button"
        onClick={() => onDelete(item.id)}
        aria-label="Supprimer l'article"
      >
        <FaTrash />
      </button>
    </div>
  )
}

export default CartItem 