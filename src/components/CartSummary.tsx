import React from 'react'
import CartItem from './CartItem'

interface Item {
  id: string
  image: string
  name: string
  price: number
  quantity: number
}

interface CartSummaryProps {
  items: Item[]
}

const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const reduction = 0 // À implémenter selon les règles de réduction
  const total = subtotal - reduction

  return (
    <div>
      <div className="cart-items">
        {items.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)}€</span>
        </div>
        <div className="summary-row reduction">
          <span>Réduction</span>
          <span>-{reduction}%</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{total.toFixed(2)}€</span>
        </div>
      </div>
    </div>
  )
}

export default CartSummary 