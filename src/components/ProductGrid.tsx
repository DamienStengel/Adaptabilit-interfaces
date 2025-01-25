import React, { useEffect, useState } from 'react';
import {getProducts, getCategoryCode, transformAndSortProducts, Product} from '../services/product.service';

interface ProductGridProps {
  category: string;
  searchQuery: string;
  addToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ category, searchQuery, addToCart }) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(transformAndSortProducts(data));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const filterProducts = () => {
    return products.filter(product => {
      const matchesCategory = category === 'TOUT' || getCategoryCode(product.category) === category;
      const matchesSearch = !searchQuery ||
          product.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const filteredProducts = filterProducts();

  const getCategoryFromId = (id: string) => {
    return id.charAt(0);
  };

  return (
      <div className="product-grid-container">
        {filteredProducts.length === 0 ? (
            <div className="no-results">Aucun produit trouvé</div>
        ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                  <div
                      key={product.id}
                      className="product-card"
                      onClick={() => addToCart(product)}
                      style={{
                        backgroundImage: `url(${product.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        height: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                      }}
                  >
                    <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255, 255, 255, 0.85)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem'
                        }}
                    >
                      <div
                          className="product-id"
                          data-category={getCategoryFromId(product.id)}
                          style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)'
                          }}
                      >
                        {product.id}
                      </div>
                      <div
                          className="product-name"
                          style={{
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            color: 'var(--black)',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                          }}
                      >
                        {product.fullName}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

export default ProductGrid;