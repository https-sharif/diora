import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingCart,
  Heart,
  Search,
  Filter,
  X,
  Plus,
  Minus,
  Dot,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useShopping, Product } from '@/contexts/ShoppingContext';
import { useTheme } from '@/contexts/ThemeContext';

const categories = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Shoes',
  'Accessories',
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vintage Denim Jacket',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Urban Threads',
    category: 'Tops',
    description: 'Classic vintage-style denim jacket perfect for layering. Made from premium cotton denim with authentic distressing.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'White'],
    stock: 0,
    rating: 0,
    reviews: 0,
    isAvailable: false
  },
  {
    id: '2',
    name: 'Flowy Maxi Dress',
    price: 129.99,
    image: 'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Boho Chic',
    category: 'Dresses',
    description: 'Elegant flowy maxi dress for special occasions. Features a flattering silhouette and premium fabric.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral', 'Solid Pink', 'Navy'],
    stock: 0,
    rating: 0,
    reviews: 0,
    isAvailable: false
  },
  {
    id: '3',
    name: 'Classic Sneakers',
    price: 79.99,
    image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Street Style',
    category: 'Shoes',
    description: 'Comfortable classic sneakers for everyday wear. Premium materials and cushioned sole.',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White', 'Black', 'Gray'],
    stock: 0,
    rating: 0,
    reviews: 0,
    isAvailable: false
  },
  {
    id: '4',
    name: 'High-Waisted Jeans',
    price: 69.99,
    image: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Classic Fit',
    category: 'Bottoms',
    description: 'High-waisted jeans with a comfortable fit. Perfect for any casual occasion.',
    sizes: ['26', '28', '30', '32', '34'],
    colors: ['Dark Blue', 'Light Blue', 'Black'],
    stock: 0,
    rating: 0,
    reviews: 0,
    isAvailable: false
  },
  {
    id: '5',
    name: 'Silk Scarf',
    price: 39.99,
    image: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Luxury Accessories',
    category: 'Accessories',
    description: 'Premium silk scarf with elegant patterns. Perfect accessory for any outfit.',
    sizes: ['One Size'],
    colors: ['Red', 'Blue', 'Gold'],
    stock: 0,
    rating: 0,
    reviews: 0,
    isAvailable: false
  },
  {
    id: '6',
    name: 'Casual Blazer',
    price: 149.99,
    image: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
    brand: 'Professional Wear',
    category: 'Tops',
    description: 'Versatile blazer for work and casual occasions. Tailored fit with premium fabric.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Beige'],
    stock: 0,
    rating: 0,
    reviews: 0,
    isAvailable: false
  },
];

export default function ShoppingScreen() {
  const {
    cart,
    wishlist,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getCartItemCount,
    getCartTotal,
    updateCartQuantity,
    removeFromCart,
  } = useShopping();

  const { theme } = useTheme();

  const styles = getStyles(theme);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
  };

  const confirmAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, selectedSize, selectedColor);
      setSelectedProduct(null);
      Alert.alert('Success', 'Item added to cart!');
    }
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => handleProductPress(item)}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.wishlistButton,
          isInWishlist(item.id) && styles.wishlistButtonActive,
        ]}
        onPress={() => toggleWishlist(item)}
      >
        <Heart
          size={20}
          color={isInWishlist(item.id) ? '#FF6B6B' : '#666'}
          fill={isInWishlist(item.id) ? '#FF6B6B' : 'transparent'}
        />
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Text style={styles.productName}>{item.name}</Text>
        </TouchableOpacity>
        <Text style={styles.productPrice}>${item.price}</Text>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemDetails}>
          {item.selectedSize} • {item.selectedColor}
        </Text>
        <Text style={styles.cartItemPrice}>${item.price}</Text>
      </View>
      <View style={styles.cartItemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
          >
            <Minus size={16} color="#666" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
          >
            <Plus size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <X size={16} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Shop</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {router.push('/wishlist');}}
            >
              <Heart size={24} color="#000" />
              {wishlist.length > 0 && (
                <View style={styles.badge}> 
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowCart(true)}
            >
              <ShoppingCart size={24} color="#000" />
              {getCartItemCount() > 0 && (
                <View style={styles.badge}>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categories}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
      />

      {/* Product Selection Modal */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        onRequestClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <View style={styles.productModal}>
            <View style={styles.productModalHeader}>
              <Text style={styles.productModalTitle}>Select Options</Text>
              <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.productModalContent}>
              <Image
                source={{ uri: selectedProduct.image }}
                style={styles.productModalImage}
              />
              <Text style={styles.productModalName}>
                {selectedProduct.name}
              </Text>
              <Text style={styles.productModalPrice}>
                ${selectedProduct.price}
              </Text>
              <Text style={styles.productModalDescription}>
                {selectedProduct.description}
              </Text>

              <View style={styles.optionSection}>
                <Text style={styles.optionTitle}>Size</Text>
                <View style={styles.optionButtons}>
                  {selectedProduct.sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.optionButton,
                        selectedSize === size && styles.optionButtonActive,
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          selectedSize === size &&
                            styles.optionButtonTextActive,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.optionSection}>
                <Text style={styles.optionTitle}>Color</Text>
                <View style={styles.optionButtons}>
                  {selectedProduct.colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.optionButton,
                        selectedColor === color && styles.optionButtonActive,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          selectedColor === color &&
                            styles.optionButtonTextActive,
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmAddToCart}
            >
              <Text style={styles.confirmButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        onRequestClose={() => setShowCart(false)}
      >
        <View style={styles.cartModal}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Shopping Cart</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) =>
                  `${item.id}-${item.selectedSize}-${item.selectedColor}`
                }
                style={styles.cartList}
              />
              <View style={styles.cartFooter}>
                <View style={styles.cartTotal}>
                  <Text style={styles.cartTotalText}>
                    Total: ${getCartTotal().toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.checkoutButton}>
                  <Text style={styles.checkoutButtonText}>Checkout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => 
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: -100,
    paddingBottom: -100,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'DancingScript-Bold',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000',
  },
  filterButton: {
    padding: 4,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    height: 60,
    flexShrink: 0,
    flexGrow: 0,
  },
  categories: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 32,
  },
  categoryChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsGrid: {
    padding: 16,
    paddingBottom: 50,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'contain',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  wishlistButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 2,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  productModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: 60,
  },
  productModalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  productModalContent: {
    flex: 1,
    padding: 16,
  },
  productModalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  productModalName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 8,
  },
  productModalPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
  },
  productModalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  optionSection: {
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  optionButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#000',
    margin: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cartModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: 60,
  },
  cartTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 4,
  },
  cartItemDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  removeButton: {
    padding: 8,
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: 50,
  },
  cartTotal: {
    marginBottom: 16,
  },
  cartTotalText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  wishlistModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: 60,
  },
  wishlistTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  wishlistGrid: {
    padding: 16,
    paddingBottom: 50,
  },
  emptyWishlist: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWishlistText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});