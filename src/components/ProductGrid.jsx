import React from 'react'

const PRODUCTS = {
  ENTREE: [
    { id: 'E1', name: 'Salade César', price: 6.50, image: '🥗' },
    { id: 'E2', name: 'Soupe du jour', price: 5.00, image: '🥣' },
    { id: 'E3', name: 'Crudités', price: 4.50, image: '🥬' },
    { id: 'E4', name: 'Pois chiches', price: 4.00, image: '🫘' },
  ],
  PLAT: [
    { id: 'P1', name: 'Steak Frites', price: 12.50, image: '🥩' },
    { id: 'P2', name: 'Poulet Rôti', price: 11.00, image: '🍗' },
    { id: 'P3', name: 'Poisson Grillé', price: 13.50, image: '🐟' },
    { id: 'P4', name: 'Pois cassés', price: 10.50, image: '🫘' },
  ],
  DESSERT: [
    { id: 'D1', name: 'Tarte aux pommes', price: 4.50, image: '🥧' },
    { id: 'D2', name: 'Crème brûlée', price: 5.00, image: '🍮' },
    { id: 'D3', name: 'Fruit frais', price: 3.50, image: '🍎' },
  ],
  BOISSON: [
    { id: 'B1', name: 'Eau minérale', price: 2.00, image: '💧' },
    { id: 'B2', name: 'Soda', price: 2.50, image: '🥤' },
    { id: 'B3', name: 'Café', price: 1.50, image: '☕' },
  ]
}

const ProductGrid = ({ category, searchQuery, addToCart }) => {
  const filterProducts = (products) => {
    const query = searchQuery.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query)
    )
  }

  const getProducts = () => {
    if (category === 'TOUT') {
      const allProducts = Object.values(PRODUCTS).flat()
      return filterProducts(allProducts)
    }
    return filterProducts(PRODUCTS[category] || [])
  }

  const products = getProducts()

  const getCategoryFromId = (id) => {
    return id.charAt(0) // Retourne la première lettre du code (E, P, D ou B)
  }

  return (
    <div className="product-grid-container">
      {products.length === 0 ? (
        <div className="no-results">Aucun produit trouvé</div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
              <div className="product-header">
                <div 
                  className="product-id"
                  data-category={getCategoryFromId(product.id)}
                >
                  {product.id}
                </div>
                <div className="product-image">{product.image}</div>
              </div>
              <div className="product-name">{product.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGrid 