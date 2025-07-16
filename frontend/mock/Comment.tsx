import { Comment } from '@/types/Comment';

export const mockComments: Comment[] = [
  {
    _id: '1',
    user: {
      _id: '1',
      username: 'john_doe',
      avatar: 'https://picsum.photos/seed/1/600',
    },
    targetId: '2',
      text: 'This is so classy! Where did you get that top?',
    createdAt: '1h ago',
  },
  {
    _id: '2',
    user: {
      _id: '2',
      username: 'jane_doe',
      avatar: 'https://picsum.photos/seed/2/600',
    },
    text: 'Love the simplicity of this look! Perfect for any occasion.',
    targetId: '3',
    createdAt: '2h ago',
  },
  {
    _id: '3',
    user: {
      _id: '3',
      username: 'john_smith',
      avatar: 'https://picsum.photos/seed/3/600',
    },
    text: 'You look great!',
    targetId: '1',
    createdAt: '30m ago',
  },
  {
    _id: '4',
    user: {
      _id: '4',
      username: 'maria_hill',
      avatar: 'https://picsum.photos/seed/4/600',
    },
    text: 'I love the floral print!',
    targetId: '4',
    createdAt: '1h ago',
  },
  {
    _id: '5',
    user: {
      _id: '2',
      username: 'jane_smith',
      avatar: 'https://picsum.photos/seed/5/600',
    },
    text: 'This dress is gorgeous!',
    targetId: '1',
    createdAt: '1h ago',
  },
  {
    _id: '6',
    user: {
      _id: '6',
      username: 'margaret_doe',
      avatar: 'https://picsum.photos/seed/6/600',
    },
    text: 'I love the floral print!',
    targetId: '2',
    createdAt: '1h ago',
  },
  {
    _id: '7',
    user: {
      _id: '7',
      username: 'harry_potter',
      avatar: 'https://picsum.photos/seed/7/600',
    },
    text: 'I love the floral print!',
    targetId: '5',
    createdAt: '1h ago',
  },
  {
    _id: '8',
    user: {
      _id: '2',
      username: 'jane_doe',
      avatar: 'https://picsum.photos/seed/2/600',
    },
    text: 'I love the floral print!',
    targetId: '6',
    createdAt: '1h ago',
  },
  {
    _id: '9',
    user: {
      _id: '1',
      username: 'john_doe',
      avatar: 'https://picsum.photos/seed/1/600',
    },
    text: 'I love the floral print!',
    targetId: '3',
    createdAt: '1h ago',
  },
  {
    _id: '10',
    user: {
      _id: '5',
      username: 'jane_smith',
      avatar: 'https://picsum.photos/seed/5/600',
    },
    text: 'Killed it!',
    targetId: '2',
    createdAt: '2h ago',
    replies: ['11', '2', '5'],
  },
  {
    _id: '11',
    user: {
      _id: '8',
      username: 'hermione_granger',
      avatar: 'https://picsum.photos/seed/8/600',
    },
    text: 'Perfect styling!',
    targetId: '3',
    createdAt: '3h ago',
  },
  {
    _id: '12',
    user: {
      _id: '1',
      username: 'john_doe',
      avatar: 'https://picsum.photos/seed/1/600',
    },
    text: 'test comment',
    targetId: '3',
    createdAt: '3h ago',
  },
];
