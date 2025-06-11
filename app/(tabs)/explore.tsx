import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, X, Check } from 'lucide-react-native';

const trendingUsers = [
  {
    id: '1',
    username: 'fashion_guru',
    avatar:
      'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '12.5K',
    isShop: false,
    category: 'Users',
    bio: 'Fashion enthusiast & style blogger',
  },
  {
    id: '2',
    username: 'vintage_store',
    avatar:
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '8.2K',
    isShop: true,
    category: 'Shops',
    bio: 'Curated vintage fashion pieces',
  },
  {
    id: '3',
    username: 'street_wear',
    avatar:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '15.7K',
    isShop: true,
    category: 'Shops',
    bio: 'Urban streetwear collection',
  },
  {
    id: '4',
    username: 'boho_chic',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '9.3K',
    isShop: false,
    category: 'Users',
    bio: 'Bohemian style inspiration',
  },
  {
    id: '5',
    username: 'luxury_boutique',
    avatar:
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '22.1K',
    isShop: true,
    category: 'Shops',
    bio: 'High-end designer fashion',
  },
  {
    id: '6',
    username: 'casual_style',
    avatar:
      'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=150',
    followers: '6.8K',
    isShop: false,
    category: 'Users',
    bio: 'Everyday casual outfit ideas',
  },
];

const categories = [
  'All',
  'Users',
  'Shops',
  'Trends',
  'Vintage',
  'Casual',
  'Formal',
  'Accessories',
];

const filterOptions = {
  accountType: ['All', 'Users', 'Shops'],
  followers: ['All', '1K-10K', '10K-50K', '50K+'],
  style: ['All', 'Vintage', 'Modern', 'Casual', 'Formal', 'Streetwear', 'Boho'],
};

const exploreGrid = [
  {
    id: '1',
    image:
      'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&w=300',
    user: 'fashionista_jane',
    stars: 128,
    category: 'Trends',
  },
  {
    id: '2',
    image:
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
    user: 'style_maven',
    stars: 256,
    category: 'Formal',
  },
  {
    id: '3',
    image:
      'https://images.pexels.com/photos/1457983/pexels-photo-1457983.jpeg?auto=compress&cs=tinysrgb&w=300',
    user: 'trendy_alex',
    stars: 89,
    category: 'Casual',
  },
  {
    id: '4',
    image:
      'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=300',
    user: 'urban_chic',
    stars: 167,
    category: 'Trends',
  },
  {
    id: '5',
    image:
      'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=300',
    user: 'boho_babe',
    stars: 203,
    category: 'Accessories',
  },
  {
    id: '6',
    image:
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=300',
    user: 'classic_style',
    stars: 145,
    category: 'Vintage',
  },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    accountType: 'All',
    followers: 'All',
    style: 'All',
  });

  const applyFilters = (
    users: typeof trendingUsers,
    posts: typeof exploreGrid
  ) => {
    let filteredUsers = users;
    let filteredPosts = posts;

    // Apply search query
    if (searchQuery) {
      filteredUsers = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filteredPosts = posts.filter((post) =>
        post.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filteredUsers = filteredUsers.filter((user) => {
        if (selectedCategory === 'Users' || selectedCategory === 'Shops') {
          return user.category === selectedCategory;
        }
        return true;
      });
      filteredPosts = filteredPosts.filter(
        (post) => post.category === selectedCategory
      );
    }

    // Apply advanced filters
    if (filters.accountType !== 'All') {
      filteredUsers = filteredUsers.filter(
        (user) => user.category === filters.accountType
      );
    }

    if (filters.followers !== 'All') {
      filteredUsers = filteredUsers.filter((user) => {
        const followerCount =
          parseFloat(user.followers.replace('K', '')) * 1000;
        switch (filters.followers) {
          case '1K-10K':
            return followerCount >= 1000 && followerCount <= 10000;
          case '10K-50K':
            return followerCount > 10000 && followerCount <= 50000;
          case '50K+':
            return followerCount > 50000;
          default:
            return true;
        }
      });
    }

    return { filteredUsers, filteredPosts };
  };

  const { filteredUsers, filteredPosts } = applyFilters(
    trendingUsers,
    exploreGrid
  );

  const renderUserCard = ({ item }: { item: (typeof trendingUsers)[0] }) => (
    <TouchableOpacity style={styles.userCard}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userBio}>{item.bio}</Text>
        <Text style={styles.userFollowers}>{item.followers} followers</Text>
        {item.isShop && <Text style={styles.shopBadge}>Shop</Text>}
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: (typeof exploreGrid)[0] }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.gridOverlay}>
        <Text style={styles.gridStars}>⭐ {item.stars}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterOption = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterOption,
              selectedValue === option && styles.filterOptionActive,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedValue === option && styles.filterOptionTextActive,
              ]}
            >
              {option}
            </Text>
            {selectedValue === option && (
              <Check size={16} color="#fff" style={styles.filterCheck} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, shops, trends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilter(true)}
          >
            <Filter size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {filteredUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Trending'}
            </Text>
            <FlatList
              data={filteredUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {filteredPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover</Text>
            <FlatList
              data={filteredPosts}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        )}

        {filteredUsers.length === 0 && filteredPosts.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <SafeAreaView style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterHeaderTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {renderFilterOption(
              'Account Type',
              filterOptions.accountType,
              filters.accountType,
              (value) => setFilters((prev) => ({ ...prev, accountType: value }))
            )}

            {renderFilterOption(
              'Followers',
              filterOptions.followers,
              filters.followers,
              (value) => setFilters((prev) => ({ ...prev, followers: value }))
            )}

            {renderFilterOption(
              'Style',
              filterOptions.style,
              filters.style,
              (value) => setFilters((prev) => ({ ...prev, style: value }))
            )}
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() =>
                setFilters({
                  accountType: 'All',
                  followers: 'All',
                  style: 'All',
                })
              }
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilter(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: -34,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 32,
    fontFamily: 'DancingScript-Bold',
    color: '#000',
    marginBottom: 16,
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
  content: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  userBio: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  userFollowers: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  shopBadge: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFD700',
    marginTop: 4,
  },
  followButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gridStars: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  bottomPadding: {
    height: 34,
  },
  filterModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterHeaderTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  filterContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
    gap: 8,
  },
  filterOptionActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  filterCheck: {
    marginLeft: 4,
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  clearFiltersText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});
