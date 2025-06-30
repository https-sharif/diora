import { Comment } from '@/types/Comment';

export const mockComments: Comment[] = [
  {
    id: '1',
    userId: '1',
    username: 'fashionista_jane',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'This is so classy! Where did you get that top?',
    createdAt: '1h ago',
    likes: 20,
  },
  {
    id: '2',
    userId: '2',
    username: 'style_maven',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'Love the simplicity of this look! Perfect for any occasion.',
    createdAt: '2h ago',
    likes: 15,
  },
  {
    id: '3',
    userId: '3',
    username: 'trendy_alex',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'This dress is gorgeous! Perfect for a beach day 🌊',
    createdAt: '30m ago',
    likes: 10,
  },
  {
    id: '4',
    userId: '4',
    username: 'urban_chic',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'I love the floral print! So perfect for summer 🌺',
    createdAt: '1h ago',
    likes: 8,
  },
  {
    id: '5',
    userId: '5',
    username: 'beach_babe',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'This dress is gorgeous! Perfect for a beach day 🌊',
    createdAt: '1h ago',
    likes: 8,
  },
  {
    id: '6',
    userId: '6',
    username: 'floral_fan',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'I love the floral print! So perfect for summer 🌺',
    createdAt: '1h ago',
    likes: 8,
  },
  {
    id: '7',
    userId: '7',
    username: 'floral_fan',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'I love the floral print! So perfect for summer 🌺',
    createdAt: '1h ago',
    likes: 8,
  },
  {
    id: '8',
    userId: '8',
    username: 'floral_fan',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'I love the floral print! So perfect for summer 🌺',
    createdAt: '1h ago',
    likes: 8,
  },
  {
    id: '9',
    userId: '9',
    username: 'floral_fan',
    avatar:
      'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'I love the floral print! So perfect for summer 🌺',
    createdAt: '1h ago',
    likes: 8,
  },
  {
    id: '10',
    userId: 'style_lover',
    username: 'style_lover',
    avatar:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'Absolutely love this look! Where did you get that jacket?',
    createdAt: '2h ago',
    likes: 12,
    replies: [
      {
        id: '1-1',
        userId: 'fashionista_jane',
        username: 'fashionista_jane',
        avatar:
          'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
        text: 'Thank you! Got it from Urban Threads 💕',
        createdAt: '1h ago',
        likes: 5,
      },
    ],
  },
  {
    id: '11',
    userId: 'trendy_alex',
    username: 'trendy_alex',
    avatar:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    text: 'Perfect styling! The colors work so well together 🔥',
    createdAt: '3h ago',
    likes: 8,
  },
];
