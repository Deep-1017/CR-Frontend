import productHeadphones from "@/assets/product-headphones.jpg";
import productSnare from "@/assets/product-snare.jpg";
import productBass from "@/assets/product-bass.jpg";
import productHorn from "@/assets/product-horn.jpg";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  brand: string;
  condition: string;
  skillLevel: string;
  inStock: boolean;
  stockCount: number;
  specifications: Array<{ label: string; value: string }>;
  customerReviews: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}

export const mockProducts: Product[] = [
  {
    id: "hp-001",
    name: "Sony MDR-7506 Studio Headphones",
    category: "Studio & Recording",
    price: 99,
    image: productHeadphones,
    images: [productHeadphones, productHeadphones, productHeadphones, productHeadphones],
    description: "The industry-standard closed-back headphone used in studios around the world for over 30 years. Detailed, accurate monitoring with deep bass extension.",
    rating: 5,
    reviews: 3201,
    brand: "Sony",
    condition: "New",
    skillLevel: "Intermediate",
    inStock: true,
    stockCount: 75,
    specifications: [
      { label: "Driver", value: "40mm Dynamic" },
      { label: "Frequency Response", value: "10Hz – 20kHz" },
      { label: "Impedance", value: "63 Ohms" },
      { label: "Sensitivity", value: "106dB" },
      { label: "Cable", value: "9.8ft coiled" },
      { label: "Connector", value: "3.5mm with 6.35mm adapter" },
    ],
    customerReviews: [
      {
        id: "r1",
        author: "John Smith",
        rating: 5,
        date: "2 weeks ago",
        comment: "An absolute studio staple. Every recording engineer owns at least one pair.",
      },
      {
        id: "r2",
        author: "Sarah Johnson",
        rating: 5,
        date: "1 month ago",
        comment: "Best reference headphones at this price. Crystal clear mids.",
      },
    ],
  },
  {
    id: "dr-001",
    name: "Ludwig Supraphonic Snare Drum",
    category: "Drums & Percussion",
    price: 449,
    image: productSnare,
    images: [productSnare, productSnare, productSnare, productSnare],
    description: "The Ludwig Supraphonic is the most recorded snare drum in history. Its pure aluminum shell produces a crisp, articulate sound that cuts through any mix.",
    rating: 5,
    reviews: 176,
    brand: "Ludwig",
    condition: "New",
    skillLevel: "Professional",
    inStock: true,
    stockCount: 18,
    specifications: [
      { label: "Shell Material", value: "Aluminum" },
      { label: "Diameter", value: '14"' },
      { label: "Depth", value: '6.5"' },
      { label: "Finish", value: "Chrome-plated" },
      { label: "Lugs", value: "10 lugs" },
      { label: "Strainer", value: "P85 Strainer" },
    ],
    customerReviews: [
      {
        id: "r3",
        author: "Mike Davis",
        rating: 5,
        date: "3 weeks ago",
        comment: "The legend. Nothing else sounds like this snare drum.",
      },
    ],
  },
  {
    id: "gt-001",
    name: "Fender Player Precision Bass",
    category: "Bass",
    price: 849,
    image: productBass,
    images: [productBass, productBass, productBass, productBass],
    description: "A modern take on the iconic Precision Bass with the classic split-coil pickup delivering the deep, punchy tone that defined an era.",
    rating: 5,
    reviews: 134,
    brand: "Fender",
    condition: "New",
    skillLevel: "Intermediate",
    inStock: true,
    stockCount: 20,
    specifications: [
      { label: "Body", value: "Alder" },
      { label: "Neck", value: "Maple Modern C" },
      { label: "Fretboard", value: "Pau Ferro" },
      { label: "Scale Length", value: '34"' },
      { label: "Pickups", value: "Player Series Split Single-Coil" },
      { label: "Strings", value: "4-string" },
    ],
    customerReviews: [
      {
        id: "r4",
        author: "Alex Turner",
        rating: 5,
        date: "1 week ago",
        comment: "Incredible value! Punchy P-bass tone that sounds like a much more expensive instrument.",
      },
    ],
  },
  {
    id: "hr-001",
    name: "Selmer Paris Series III Alto Saxophone",
    category: "Wind Instruments",
    price: 4299,
    originalPrice: 4799,
    onSale: true,
    image: productHorn,
    images: [productHorn, productHorn, productHorn, productHorn],
    description: "The pinnacle of saxophone craftsmanship. The Series III provides the preferred tonal quality of professional musicians worldwide.",
    rating: 5,
    reviews: 67,
    brand: "Selmer",
    condition: "New",
    skillLevel: "Professional",
    inStock: true,
    stockCount: 4,
    specifications: [
      { label: "Key", value: "E-flat" },
      { label: "Material", value: "Lacquered Brass" },
      { label: "Keys", value: "High F# + Front F" },
      { label: "Neck", value: "Silver-plated" },
      { label: "Finish", value: "Gold lacquer" },
      { label: "Case", value: "Contoured case included" },
    ],
    customerReviews: [
      {
        id: "r5",
        author: "Emily Watson",
        rating: 5,
        date: "2 months ago",
        comment: "Heirloom quality. The projection and intonation are unmatched.",
      },
    ],
  },
  {
    id: "gt-002",
    name: "Fender American Professional II Stratocaster",
    category: "Guitars",
    price: 1499,
    image: productBass,
    images: [productBass, productBass, productBass, productBass],
    description: "The American Professional II Stratocaster draws on over 60 years of innovation to meet the demands of today's working player.",
    rating: 5,
    reviews: 214,
    brand: "Fender",
    condition: "New",
    skillLevel: "Professional",
    inStock: true,
    stockCount: 12,
    specifications: [
      { label: "Body", value: "Alder" },
      { label: "Neck", value: "Maple" },
      { label: "Fretboard", value: "Rosewood" },
      { label: "Frets", value: "22 Narrow Tall" },
      { label: "Pickups", value: "V-Mod II Single-Coil x3" },
      { label: "Finish", value: "Olympic White" },
    ],
    customerReviews: [
      {
        id: "r6",
        author: "David Lee",
        rating: 5,
        date: "1 month ago",
        comment: "Best Strat I've ever played. The tone is just perfect.",
      },
    ],
  },
  {
    id: "kb-001",
    name: "Yamaha P-515 Digital Piano",
    category: "Keyboards & Pianos",
    price: 1499,
    originalPrice: 1699,
    onSale: true,
    image: productHeadphones,
    images: [productHeadphones, productHeadphones, productHeadphones, productHeadphones],
    description: "The flagship portable piano featuring Yamaha's GrandTouch keyboard and 38 premium instrument voices with realistic acoustic piano resonance.",
    rating: 5,
    reviews: 201,
    brand: "Yamaha",
    condition: "New",
    skillLevel: "Professional",
    inStock: true,
    stockCount: 9,
    specifications: [
      { label: "Keys", value: "88 Weighted GrandTouch" },
      { label: "Polyphony", value: "256 notes" },
      { label: "Voices", value: "38 premium sounds" },
      { label: "Speakers", value: "4 x 20W" },
      { label: "Bluetooth", value: "Yes (Audio + MIDI)" },
      { label: "Connectivity", value: "USB, MIDI, Stereo Out" },
    ],
    customerReviews: [
      {
        id: "r7",
        author: "Maria Garcia",
        rating: 5,
        date: "3 weeks ago",
        comment: "The key action is almost indistinguishable from a real grand piano.",
      },
    ],
  },
  {
    id: "dr-002",
    name: "Pearl Export EXX 5-Piece Drum Kit",
    category: "Drums & Percussion",
    price: 899,
    image: productSnare,
    images: [productSnare, productSnare, productSnare, productSnare],
    description: "The Export series remains the best-selling acoustic drum set in the world. Featuring poplar and Asian mahogany shells.",
    rating: 5,
    reviews: 289,
    brand: "Pearl",
    condition: "New",
    skillLevel: "Beginner",
    inStock: true,
    stockCount: 15,
    specifications: [
      { label: "Configuration", value: "5-piece" },
      { label: "Bass Drum", value: '22" x 18"' },
      { label: "Toms", value: '10", 12", 16"' },
      { label: "Snare", value: '14" x 5.5"' },
      { label: "Shell Material", value: "Poplar/Asian Mahogany" },
      { label: "Hardware", value: "Complete set included" },
    ],
    customerReviews: [
      {
        id: "r8",
        author: "Chris Brown",
        rating: 4,
        date: "2 weeks ago",
        comment: "Great kit for the price. Punchy and consistent across all drum sizes.",
      },
    ],
  },
  {
    id: "hp-002",
    name: "Shure SM7dB Active Dynamic Microphone",
    category: "Studio & Recording",
    price: 499,
    image: productHeadphones,
    images: [productHeadphones, productHeadphones, productHeadphones, productHeadphones],
    description: "The SM7dB is the iconic SM7B with a built-in preamp, providing a clean 28dB of gain ideal for podcasting, broadcasting, and vocal recording.",
    rating: 5,
    reviews: 267,
    brand: "Shure",
    condition: "New",
    skillLevel: "Professional",
    inStock: true,
    stockCount: 22,
    specifications: [
      { label: "Type", value: "Active Dynamic" },
      { label: "Pattern", value: "Cardioid" },
      { label: "Frequency Response", value: "50Hz – 20kHz" },
      { label: "Built-in Preamp", value: "+28dB switchable" },
      { label: "Connection", value: "XLR" },
      { label: "Includes", value: "Yoke mount, windscreen, pop filter" },
    ],
    customerReviews: [
      {
        id: "r9",
        author: "Lisa Anderson",
        rating: 5,
        date: "1 week ago",
        comment: "The built-in preamp is a game changer. Crystal clear recordings every time.",
      },
    ],
  },
];
