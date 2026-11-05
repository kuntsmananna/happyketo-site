/**
 * "Happy Favorites" – products Anna recommends (from the old /iherb-מומלצים page).
 * Links carry Anna's iHerb referral code (rcode=CGJ130) – keep it when adding products.
 * Images: src/assets/favorites/<slug>.webp
 */
export type FavoriteGroup = 'fats' | 'salt' | 'sweet' | 'pantry' | 'snacks';

export const favoriteGroups: { id: FavoriteGroup; title: string; intro: string }[] = [
  { id: 'fats', title: 'שומנים טובים', intro: 'לבישול, לטיגון ולטעם.' },
  { id: 'salt', title: 'מלח ואלקטרוליטים', intro: 'במיוחד בשבועות הראשונים של המעבר לקיטו.' },
  { id: 'sweet', title: 'ממתיקים וסירופים', intro: 'מתוק בלי סוכר.' },
  { id: 'pantry', title: 'מזווה ואפייה', intro: 'הבסיס למאפים, לציפויים ולמטבח היומיומי.' },
  { id: 'snacks', title: 'נשנושים', intro: 'לדרך, לטיולים ולרגעי חשק.' },
];

export type Favorite = { slug: string; name: string; ingredients: string; note?: string; href: string; group: FavoriteGroup };

export const favorites: Favorite[] = [
  {
    slug: "organic-grass-fed-original-ghee",
    name: "Organic Grass-Fed Original Ghee",
    ingredients: "Grass-fed organic butter (made from non-homogenized whole milk from grassfed cows).",
    note: "Contains: Milk",
    href: "https://il.iherb.com/pr/pure-indian-foods-100-organic-grass-fed-original-ghee-15-oz-425-g/65370?rcode=CGJ130",
    group: "fats",
  },
  {
    slug: "traditional-duck-fat",
    name: "Traditional Duck Fat",
    ingredients: "Rendered duck fat.",
    href: "https://il.iherb.com/pr/epic-bar-traditional-duck-fat-11-oz-312-g/86445?rcode=CGJ130",
    group: "fats",
  },
  {
    slug: "celtic-sea-salt",
    name: "Celtic Sea Salt",
    ingredients: "Sea salt mined from an ancient seabed in Utah.",
    note: "Contains no anti-caking or bleaching agents, or any other additives.",
    href: "https://www.iherb.com/pr/redmond-trading-company-real-salt-ancient-fine-sea-salt-26-oz-737-g/111678?rcode=CGJ130",
    group: "salt",
  },
  {
    slug: "allulose-sweetener",
    name: "Allulose Sweetener",
    ingredients: "Allulose.",
    href: "https://il.iherb.com/pr/health-garden-all-natural-allulose-sweetener-14-oz-397-g/106072?rcode=CGJ130",
    group: "sweet",
  },
  {
    slug: "trace-minerals-keto-electrolyte-drops",
    name: "Trace Minerals® Keto Electrolyte Drops",
    ingredients: "Ionic trace minerals complex, purified water, Utah Sea Minerals™, potassium chloride, non-gmo citric acid.",
    note: "Keto Electrolyte Drops is a potent electrolyte formula that is ideal for anyone on the Keto Diet. It provides full spectrum electrolytes your body may be lacking to help avoid electrolyte imbalance, dehydration, leg or other muscle cramps, which are part of what is termed as the \"keto flu\".",
    href: "https://il.iherb.com/pr/trace-minerals-keto-electrolyte-drops-4-fl-oz-118-ml/86299?rcode=CGJ130",
    group: "salt",
  },
  {
    slug: "almond-flour-crackers",
    name: "Almond Flour Crackers",
    ingredients: "Almond flour, water, cheddar cheese (pasteurized milk, cheese culture, salt, enzymes), butter (cream, natural flavoring), coconut flour, flax meal, parmesan cheese (pasteurized cow's milk, cheese culture, salt, enzymes), egg white, sea salt, aluminum-free baking powder, xanthan gum, annatto (color), garlic, paprika extract, rosemary extract, onion.",
    href: "https://il.iherb.com/pr/fat-snax-almond-flour-crackers-cheddar-4-25-oz-120-5-g/110970?rcode=CGJ130",
    group: "snacks",
  },
  {
    slug: "nutritional-yeast-flakes",
    name: "Nutritional Yeast Flakes",
    ingredients: "Imported yeast.",
    href: "https://il.iherb.com/pr/kal-imported-nutritional-yeast-flakes-unsweetened-7-8-oz-220-g/70122?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "pork-rind-crumbs",
    name: "Pork Rind Crumbs",
    ingredients: "Pork rinds, (cooked in pork fat), seasoning (salt, spices, paprika, mustard, onion powder, garlic powder, oleoresin of paprika).",
    href: "https://il.iherb.com/pr/pork-king-good-pork-rind-crumbs-original-12-oz-340-g/103732?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "keto-granola-chocolate-sea-salt",
    name: "Keto Granola, Chocolate Sea Salt",
    ingredients: "Sunflower seeds, wondrose sugar replacer (erythritol, non-gmo soluble corn fiber, inulin, monk fruit, natural flavors), almonds, coconut chips, pepitas, walnuts, cocoa powder, coconut oil, water, salt, natural flavors.",
    href: "https://il.iherb.com/pr/keto-and-co-keto-granola-chocolate-sea-salt-10-oz-285-g/106915?rcode=CGJ130",
    group: "snacks",
  },
  {
    slug: "organic-maple-flavored-syrup",
    name: "Organic Maple Flavored Syrup",
    ingredients: "Organic allulose, organic maple flavor, organic caramel color.",
    href: "https://il.iherb.com/pr/rxsugar-organic-maple-flavored-syrup-16-fl-oz-473-ml/104181?rcode=CGJ130",
    group: "sweet",
  },
  {
    slug: "organic-chocolate-syrup",
    name: "Organic Chocolate Syrup",
    ingredients: "Organic allulose, organic cocoa powder.",
    href: "https://il.iherb.com/pr/rxsugar-organic-chocolate-syrup-16-fl-oz-473-ml/106688?rcode=CGJ130",
    group: "sweet",
  },
  {
    slug: "wagyu-beef-steak-strip",
    name: "Wagyu Beef Steak Strip",
    ingredients: "Beef, honey, sea salt, black pepper, garlic powder",
    href: "https://il.iherb.com/pr/epic-bar-wagyu-beef-steak-strip-0-08-oz-23-g/103154?rcode=CGJ130",
    group: "snacks",
  },
  {
    slug: "organic-unsweetened-toasted-coconut-flakes",
    name: "Organic Unsweetened Toasted Coconut Flakes",
    ingredients: "Organic coconut (sliced, dehydrated & toasted).",
    href: "https://il.iherb.com/pr/edward-sons-let-s-do-organic-100-organic-unsweetened-toasted-coconut-flakes-7-oz-200-g/61275?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "double-acting-baking-powder",
    name: "Double Acting Baking Powder",
    ingredients: "Sodium acid pyrophosphate, sodium bicarbonate, cornstarch, and monocalcium phosphate.",
    href: "https://il.iherb.com/pr/bob-s-red-mill-double-acting-baking-powder-gluten-free-14-oz-397-g/89507?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "raw-almond-butter",
    name: "Raw Almond Butter",
    ingredients: "Raw organic almonds.",
    href: "https://il.iherb.com/pr/artisana-organics-raw-almond-butter-14-oz-397-g/64977?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "super-fine-almond-flour",
    name: "Super-Fine Almond Flour",
    ingredients: "Whole almonds.",
    href: "https://il.iherb.com/pr/bob-s-red-mill-natural-almond-flour-super-fine-16-oz-453-g/103994?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "egg-white-protein-unflavored",
    name: "Egg White Protein, Unflavored",
    ingredients: "Egg white powder*, sunflower lecithin (*from chickens not treated with hormones or antibiotics, non-GMO).",
    href: "https://il.iherb.com/pr/julian-bakery-paleo-thin-egg-white-protein-unflavored-2-lbs-907-g/77542?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "chocolate-salted-caramel",
    name: "Chocolate Salted Caramel",
    ingredients: "Unsweetened chocolate, erythritol†, chicory root fiber, milk (rBST free), cocoa butter, natural flavors, milk fat (rBST free), sunflower lecithin, salt, stevia extract.",
    href: "https://il.iherb.com/pr/lily-s-sweets-baking-chips-chocolate-salted-caramel-9-oz-255-g/109823?rcode=CGJ130",
    group: "pantry",
  },
  {
    slug: "liquid-sweetener-english-toffee",
    name: "Liquid Sweetener, English Toffee",
    ingredients: "Vegetable glycerin, natural english toffee flavor (in an alcohol base) certified organic stevia leaf extract.",
    href: "https://il.iherb.com/pr/now-foods-better-stevia-zero-calorie-liquid-sweetener-english-toffee-2-fl-oz-59-ml/50803?rcode=CGJ130",
    group: "sweet",
  },
  {
    slug: "organic-monk-fruit-liquid-sweetener",
    name: "Organic Monk Fruit, Liquid Sweetener",
    ingredients: "Organic glycerin, de-ionized water, organic monk fruit (luo han guo) extract.",
    href: "https://il.iherb.com/pr/now-foods-organic-monk-fruit-liquid-sweetener-2-fl-oz-59-ml/115817?rcode=CGJ130",
    group: "sweet",
  },
  {
    slug: "liquid-sweetener-hazelnut",
    name: "Liquid Sweetener, Hazelnut",
    ingredients: "Vegetable glycerin, natural hazelnut flavor (tree nut) (in an alcohol base), certified organic stevia leaf extract.",
    href: "https://il.iherb.com/pr/now-foods-better-stevia-zero-calorie-liquid-sweetener-hazelnut-2-fl-oz-59-ml/15121?rcode=CGJ130",
    group: "sweet",
  },
];
