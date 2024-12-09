import React from 'react'

interface Item {
  id: string
  image: string
  name: string
  price: number
  quantity: number
}

interface CartItemProps {
  item: Item
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
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
    </div>
  )
}

export default CartItem 