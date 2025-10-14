import { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  title: string;
  brand: string;
  imgRef: string[];
  colorVariants: string[];
  description: string;
  createdAt: Timestamp;
};
