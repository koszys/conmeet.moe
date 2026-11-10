'use client';

import { ImageUpload, type ImageUploadProps } from '@/shared/components/ui';

export type ItemImageUploadProps = ImageUploadProps;

export function ItemImageUpload(props: ItemImageUploadProps) {
  return <ImageUpload {...props} />;
}
