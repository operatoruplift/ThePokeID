import { createSocialImage, socialImageMetadata } from "@/lib/social-image";

export function generateImageMetadata() {
  return [socialImageMetadata];
}

export default function TwitterImage() {
  return createSocialImage();
}
