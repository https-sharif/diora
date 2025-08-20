import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/config';
import { User } from '@/types/User';
import axios from 'axios';

type ContentType = 'post' | 'product';

interface FormData {
  name: string;
  description: string;
  price: string;
  sizes: string[];
  variants: string[];
  stock?: number;
  discount?: number;
  category: string[];
}

interface CreatePostContextType {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  images: string[];
  setImages: (uris: string[]) => void;
  imageUri: string | null;
  setImageUri: (uri: string | null) => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  createPost: () => Promise<void>;
  createProduct: () => Promise<void>;
  reset: () => void;
}

const CreatePostContext = createContext<CreatePostContextType | null>(null);

export const useCreatePost = () => {
  const ctx = useContext(CreatePostContext);
  if (!ctx)
    throw new Error('useCreatePost must be used inside CreatePostProvider');
  return ctx;
};

export const CreatePostProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [contentType, setContentType] = useState<ContentType>('post');
  const [images, setImages] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { token, user, setUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: [],
    sizes: [],
    variants: [],
    stock: undefined,
    discount: undefined,
  });

  const createPost = async () => {
    if (images.length === 0)
      throw new Error('Post requires at least one image!');
    if (!user) throw new Error('User not authenticated!');

    try {
      const form = new FormData();

      const uri = images[0];
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      form.append('image', {
        uri,
        name: filename,
        type,
      } as any);

      form.append('caption', formData.description);

      const res = await axios.post(`${config.apiUrl}/api/post/create`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      if (!data.status)
        throw new Error(data.message || 'Failed to create post');
      user.posts += 1;
      setUser(user as User);
    } catch (error) {
      throw error;
    }
  };

  const createProduct = async () => {
    if (
      images.length === 0 ||
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price.trim() ||
      formData.category.length === 0
    )
      throw new Error('Product requires all fields and at least one category');
    if (!user) throw new Error('User not authenticated!');
    if (user.type !== 'shop')
      throw new Error('Only shop users can create products');

    try {
      const form = new FormData();

      images.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        form.append('image', {
          uri,
          name: filename,
          type,
        } as any);
      });

      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('category', JSON.stringify(formData.category));
      form.append('sizes', JSON.stringify(formData.sizes));
      form.append('variants', JSON.stringify(formData.variants));
      form.append('stock', formData.stock?.toString() || '0');
      form.append('discount', formData.discount?.toString() || '0');

      const res = await axios.post(`${config.apiUrl}/api/product`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;
      if (!data.status)
        throw new Error(data.message || 'Failed to create product');

      user.shop?.productIds.push(data.product._id);
      setUser(user as User);
    } catch (error) {
      throw error;
    }
  };

  const reset = () => {
    setContentType('post');
    setImages([]);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: [],
      sizes: [],
      variants: [],
      stock: undefined,
      discount: undefined,
    });
    setImageUri(null);
  };

  return (
    <CreatePostContext.Provider
      value={{
        contentType,
        setContentType,
        images,
        setImages,
        imageUri,
        setImageUri,
        formData,
        setFormData,
        reset,
        createPost,
        createProduct,
      }}
    >
      {children}
    </CreatePostContext.Provider>
  );
};
