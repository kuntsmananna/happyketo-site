/**
 * "Happy Favorites" – products Anna recommends (from the old /iherb-מומלצים page):
 * src/data/content/favorites.json + photos in src/assets/favorites/, editable in the admin panel.
 * Links carry Anna's iHerb referral code (rcode=CGJ130) – keep it when adding products.
 */
import { favoritesContent } from './content';

export type Favorite = (typeof favoritesContent)[number];
export const favorites: Favorite[] = favoritesContent;
