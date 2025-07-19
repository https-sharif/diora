import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/constants/api';
import { User } from '@/types/User';

type ContentType = 'post' | 'product';

interface FormData {
  title: string;
  description: string;
  price: string;
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
  if (!ctx) throw new Error('useCreatePost must be used inside CreatePostProvider');
  return ctx;
};

export const CreatePostProvider = ({ children }: { children: React.ReactNode }) => {
  const [contentType, setContentType] = useState<ContentType>('post');
  const [images, setImages] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { token, user, setUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: [],
  });

  const createPost = async () => {
    if (images.length === 0) throw new Error('Post requires at least one image!');
    if(!user) throw new Error('User not authenticated!');

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
      

      const res = await fetch(`${API_URL}/api/post/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to create post');
      user.posts += 1;
      setUser(user as User);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  
  const createProduct = async () => {
    // Validate product data
    if (
      images.length === 0 ||
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.price.trim() ||
      formData.category.length === 0
    ) {
      throw new Error('Product requires all fields and at least one category');
    }

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(1000); 
    console.log('Product created');
    // Call your API or logic to create product here
    // Example dummy:
    // return {
    //   type: 'product',
    //   images,
    //   title: formData.title,
    //   description: formData.description,
    //   price: formData.price,
    //   category: formData.category,
    // };
  };
  

  const reset = () => {
    setContentType('post');
    setImages([]);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: [],
    });
    setImageUri(null);
  };

  return (
    <CreatePostContext.Provider
      value={{ contentType, setContentType, images, setImages, imageUri, setImageUri, formData, setFormData, reset, createPost, createProduct }}
    >
      {children}
    </CreatePostContext.Provider>
  );
};
