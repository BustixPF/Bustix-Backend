import { v2 as cloudinary } from 'cloudinary';
import { environment } from './environment';

cloudinary.config({
  cloud_name: environment.CLOUDINARY_CLOUD_NAME,
  api_key: environment.CLOUDINARY_API_KEY,
  api_secret: environment.CLOUDINARY_API_SECRET,
});

export const CloudinaryConfig = {
  provide: 'CLOUDINARY',
  useFactory: () => cloudinary,
};
