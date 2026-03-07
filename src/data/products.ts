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
    name: "Studio Headphones AZF M2000s",
    category: "Microphone",
    price: 196.0,
    image: productHeadphones,
    images: [productHeadphones, productHeadphones, productHeadphones, productHeadphones],
    description: "Professional studio-grade headphones with exceptional sound clarity and comfort for extended sessions.",
    rating: 5,
    reviews: 48,
    brand: "AZF Audio",
    specifications: [
      { label: "Driver Size", value: "50mm" },
      { label: "Frequency Response", value: "20Hz - 20kHz" },
      { label: "Impedance", value: "32 Ohms" },
      { label: "Cable Length", value: "3m detachable" },
      { label: "Weight", value: "285g" },
      { label: "Connector", value: "3.5mm jack with 6.35mm adapter" },
    ],
    customerReviews: [
      {
        id: "r1",
        author: "John Smith",
        rating: 5,
        date: "2 weeks ago",
        comment: "Amazing sound quality! Perfect for my home studio.",
      },
      {
        id: "r2",
        author: "Sarah Johnson",
        rating: 4,
        date: "1 month ago",
        comment: "Very comfortable for long sessions. Great build quality.",
      },
    ],
  },
  {
    id: "dr-001",
    name: "Drum Snare",
    category: "Speaker",
    price: 84.0,
    image: productSnare,
    images: [productSnare, productSnare, productSnare, productSnare],
    description: "High-quality snare drum with crisp, articulate sound perfect for any musical style.",
    rating: 4,
    reviews: 32,
    brand: "DrumMaster",
    specifications: [
      { label: "Shell Material", value: "Maple" },
      { label: "Diameter", value: '14"' },
      { label: "Depth", value: '5.5"' },
      { label: "Finish", value: "Gloss" },
      { label: "Lugs", value: "10 lugs" },
      { label: "Hoops", value: "Triple-flanged" },
    ],
    customerReviews: [
      {
        id: "r3",
        author: "Mike Davis",
        rating: 5,
        date: "3 weeks ago",
        comment: "Best snare in this price range. Great tone and build.",
      },
    ],
  },
  {
    id: "gt-001",
    name: "Fender P2A RJ-600",
    category: "Amplifiers",
    price: 150.0,
    image: productBass,
    images: [productBass, productBass, productBass, productBass],
    description: "Classic bass guitar with rich, deep tones and smooth playability.",
    rating: 5,
    reviews: 67,
    brand: "Fender",
    specifications: [
      { label: "Body Wood", value: "Alder" },
      { label: "Neck Wood", value: "Maple" },
      { label: "Fretboard", value: "Rosewood" },
      { label: "Scale Length", value: '34"' },
      { label: "Pickups", value: "P-Bass style" },
      { label: "Strings", value: "4-string" },
    ],
    customerReviews: [
      {
        id: "r4",
        author: "Alex Turner",
        rating: 5,
        date: "1 week ago",
        comment: "Incredible value! Sounds like a much more expensive bass.",
      },
    ],
  },
  {
    id: "hr-001",
    name: "Pro Valve French Horn",
    category: "Horn",
    price: 849,
    originalPrice: 999,
    onSale: true,
    image: productHorn,
    images: [productHorn, productHorn, productHorn, productHorn],
    description: "Professional French horn with exceptional tonal quality and precise valve action.",
    rating: 5,
    reviews: 23,
    brand: "ProBrass",
    specifications: [
      { label: "Key", value: "F/Bb" },
      { label: "Bell Diameter", value: "12 inches" },
      { label: "Bore Size", value: "12mm" },
      { label: "Finish", value: "Lacquer" },
      { label: "Valves", value: "4 rotary valves" },
      { label: "Case", value: "Hard case included" },
    ],
    customerReviews: [
      {
        id: "r5",
        author: "Emily Watson",
        rating: 5,
        date: "2 months ago",
        comment: "Professional quality at a great price. Highly recommended!",
      },
    ],
  },
  // Additional products for variety
  {
    id: "gt-002",
    name: "Electric Guitar Pro Series",
    category: "Power Amplifiers",
    price: 599,
    image: productBass,
    images: [productBass, productBass, productBass, productBass],
    description: "Versatile electric guitar perfect for rock, blues, and jazz performances.",
    rating: 5,
    reviews: 89,
    brand: "Gibson",
    specifications: [
      { label: "Body", value: "Mahogany" },
      { label: "Neck", value: "Maple" },
      { label: "Frets", value: "22 Medium Jumbo" },
      { label: "Pickups", value: "Humbucker x2" },
      { label: "Bridge", value: "Tune-O-Matic" },
      { label: "Finish", value: "Sunburst" },
    ],
    customerReviews: [
      {
        id: "r6",
        author: "David Lee",
        rating: 5,
        date: "1 month ago",
        comment: "Perfect tone and feel. Worth every penny!",
      },
    ],
  },
  {
    id: "kb-001",
    name: "Digital Piano 88 Keys",
    category: "DJ Mixer",
    price: 749,
    originalPrice: 899,
    onSale: true,
    image: productHeadphones,
    images: [productHeadphones, productHeadphones, productHeadphones, productHeadphones],
    description: "Full-size weighted keyboard with authentic piano sound and feel.",
    rating: 5,
    reviews: 124,
    brand: "Yamaha",
    specifications: [
      { label: "Keys", value: "88 Weighted" },
      { label: "Polyphony", value: "256 notes" },
      { label: "Voices", value: "500+" },
      { label: "Styles", value: "200+" },
      { label: "Speakers", value: "2 x 15W" },
      { label: "Connectivity", value: "USB, MIDI, Audio" },
    ],
    customerReviews: [
      {
        id: "r7",
        author: "Maria Garcia",
        rating: 5,
        date: "3 weeks ago",
        comment: "Amazing piano! The weighted keys feel so realistic.",
      },
    ],
  },
  {
    id: "dr-002",
    name: "Complete Drum Kit",
    category: "Active Speaker",
    price: 1299,
    image: productSnare,
    images: [productSnare, productSnare, productSnare, productSnare],
    description: "Professional 5-piece drum kit with hardware and cymbals included.",
    rating: 5,
    reviews: 56,
    brand: "DrumMaster",
    specifications: [
      { label: "Configuration", value: "5-piece" },
      { label: "Bass Drum", value: '22"' },
      { label: "Toms", value: '10", 12", 16"' },
      { label: "Snare", value: '14"' },
      { label: "Cymbals", value: "Hi-hat, Crash, Ride" },
      { label: "Hardware", value: "Complete set included" },
    ],
    customerReviews: [
      {
        id: "r8",
        author: "Chris Brown",
        rating: 4,
        date: "2 weeks ago",
        comment: "Great kit for the price. Sounds fantastic!",
      },
    ],
  },
  {
    id: "hp-002",
    name: "Wireless Studio Monitors",
    category: "Wireless Microphone",
    price: 349,
    image: productHeadphones,
    images: [productHeadphones, productHeadphones, productHeadphones, productHeadphones],
    description: "Premium wireless headphones with noise cancellation and studio-quality sound.",
    rating: 5,
    reviews: 203,
    brand: "Sony",
    specifications: [
      { label: "Driver", value: "40mm Dynamic" },
      { label: "Battery Life", value: "30 hours" },
      { label: "Noise Cancellation", value: "Active ANC" },
      { label: "Bluetooth", value: "5.0" },
      { label: "Weight", value: "254g" },
      { label: "Codec Support", value: "LDAC, AAC, SBC" },
    ],
    customerReviews: [
      {
        id: "r9",
        author: "Lisa Anderson",
        rating: 5,
        date: "1 week ago",
        comment: "Best wireless headphones I've ever owned!",
      },
    ],
  },
];
