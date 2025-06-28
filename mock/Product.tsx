import { Product } from "@/contexts/ShoppingContext";

export const mockProducts: Product[] = [
    {
      id: '1',
      storeId: '1',
      name: 'Vintage Denim Jacket',
      price: 89.99,
      imageUrl: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
      brand: 'Urban Threads',
      category: 'Tops',
      description:
        'Classic vintage-style denim jacket perfect for layering. Made from premium cotton denim with authentic distressing.',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Blue', 'Black', 'White'],
      stock: 0,
      rating: 0,
    },
    {
      id: '2',
      storeId: '3',
      name: 'Flowy Maxi Dress',
      price: 129.99,
      imageUrl:
        'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=400',
      brand: 'Boho Chic',
      category: 'Dresses',
      description:
        'Elegant flowy maxi dress for special occasions. Features a flattering silhouette and premium fabric.',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Floral', 'Solid Pink', 'Navy'],
      stock: 0,
      rating: 0,
    },
    {
      id: '3',
      storeId: '2',
      name: 'Classic Sneakers',
      price: 79.99,
      imageUrl:
        'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400',
      brand: 'Street Style',
      category: 'Shoes',
      description:
        'Comfortable classic sneakers for everyday wear. Premium materials and cushioned sole.',
      sizes: ['6', '7', '8', '9', '10'],
      colors: ['White', 'Black', 'Gray'],
      stock: 0,
      rating: 0,
    },
    {
      id: '4',
      storeId: '1',
      name: 'High-Waisted Jeans',
      price: 69.99,
      imageUrl:
        'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
      brand: 'Classic Fit',
      category: 'Bottoms',
      description:
        'High-waisted jeans with a comfortable fit. Perfect for any casual occasion.',
      sizes: ['26', '28', '30', '32', '34'],
      colors: ['Dark Blue', 'Light Blue', 'Black'],
      stock: 0,
      rating: 0,
    },
    {
      id: '5',
      storeId: '2',
      name: 'Silk Scarf',
      price: 39.99,
      imageUrl:
        'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=400',
      brand: 'Luxury Accessories',
      category: 'Accessories',
      description:
        'Premium silk scarf with elegant patterns. Perfect accessory for any outfit.',
      sizes: ['One Size'],
      colors: ['Red', 'Blue', 'Gold'],
      stock: 0,
      rating: 0,
    },
    {
      id: '6',
      storeId: '3',
      name: 'Casual Blazer',
      price: 149.99,
      imageUrl:
        'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
      brand: 'Professional Wear',
      category: 'Tops',
      description:
        'Versatile blazer for work and casual occasions. Tailored fit with premium fabric.',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Beige'],
      stock: 0,
      rating: 0,
    },
  ];