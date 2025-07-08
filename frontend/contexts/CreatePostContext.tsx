import React, { createContext, useContext, useState } from 'react';

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
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: [],
  });

  const createPost = async () => {
    // Validate data for post
    if (images.length === 0) {
      throw new Error('Post requires at least one image!');
    }
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(1000); 
    console.log('Post created');
    // Call your API or logic to create post here
    // Example dummy:
    // return {
    //   type: 'post',
    //   images,
    //   description: formData.description,
    // };
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
  };

  return (
    <CreatePostContext.Provider
      value={{ contentType, setContentType, images, setImages, formData, setFormData, reset, createPost, createProduct }}
    >
      {children}
    </CreatePostContext.Provider>
  );
};
