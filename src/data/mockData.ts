// Mock data for Story Studio

export interface Story {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  replicationScore: number;
  scenes: Scene[];
  versions: Version[];
}

export interface Scene {
  id: string;
  number: number;
  title: string;
  script: string;
  duration: string;
  visualDescription: string;
}

export interface Version {
  id: string;
  number: number;
  createdAt: string;
  changes: string;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  voiceStyle: string;
  traits: string[];
  lockedTraits: string[];
  stories: string[];
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  language: string;
  scenes: number;
  storyId: string;
}

export interface Thumbnail {
  id: string;
  storyId: string;
  variants: ThumbnailVariant[];
}

export interface ThumbnailVariant {
  id: string;
  image: string;
  label: string;
  isRecommended: boolean;
  clickRate?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  videoCount: number;
  thumbnail: string;
  videos: string[];
}

export interface MerchItem {
  id: string;
  name: string;
  type: string;
  image: string;
  price: number;
  character?: string;
}

export interface Draft {
  id: string;
  type: 'story' | 'video' | 'thumbnail' | 'character' | 'merch';
  title: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  assignee?: string;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'disconnected';
  description: string;
}

export interface StyleBlueprint {
  id: string;
  visualStyle: {
    colorPalette: string[];
    animationStyle: string;
    characterDesign: string;
  };
  narrativeStructure: {
    pacing: string;
    storyType: string;
    targetAge: string;
  };
  audioProfile: {
    musicStyle: string;
    voiceType: string;
    soundEffects: string;
  };
}

// Mock Stories
export const mockStories: Story[] = [
  {
    id: '1',
    title: 'The Adventures of Luna the Star Fox',
    description: 'A magical journey through the cosmos with Luna, a curious fox who dreams of touching the stars.',
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    replicationScore: 94,
    scenes: [
      { id: 's1', number: 1, title: 'The Wishing Star', script: 'Luna gazes up at the night sky, her eyes sparkling with wonder. She spots a shooting star and makes a wish...', duration: '2:30', visualDescription: 'Night sky with twinkling stars, soft purple and blue hues' },
      { id: 's2', number: 2, title: 'The Magic Telescope', script: 'In her cozy treehouse, Luna discovers an old telescope that belonged to her grandmother...', duration: '3:15', visualDescription: 'Warm interior lighting, vintage telescope, floating dust particles' },
      { id: 's3', number: 3, title: 'Journey Begins', script: 'With a flash of starlight, Luna finds herself floating among the constellations...', duration: '2:45', visualDescription: 'Deep space environment, glowing constellations forming animal shapes' },
    ],
    versions: [
      { id: 'v1', number: 1, createdAt: '2024-01-15', changes: 'Initial draft' },
      { id: 'v2', number: 2, createdAt: '2024-01-18', changes: 'Added more emotional dialogue' },
      { id: 'v3', number: 3, createdAt: '2024-01-20', changes: 'Final polish and pacing adjustments' },
    ],
  },
  {
    id: '2',
    title: 'Captain Coral and the Ocean Mystery',
    description: 'Dive deep with Captain Coral as she uncovers the secrets of the sunken treasure ship.',
    status: 'review',
    thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=300&fit=crop',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-25',
    replicationScore: 87,
    scenes: [
      { id: 's1', number: 1, title: 'The Map Fragment', script: 'Captain Coral discovers a mysterious piece of an ancient map washed ashore...', duration: '2:15', visualDescription: 'Sandy beach at sunset, weathered parchment with golden light' },
      { id: 's2', number: 2, title: 'Submarine Launch', script: 'With her trusty submarine, the SeaStar, Coral prepares for the deep dive...', duration: '2:45', visualDescription: 'Colorful coral reef, bubble effects, friendly sea creatures' },
    ],
    versions: [
      { id: 'v1', number: 1, createdAt: '2024-01-22', changes: 'Initial concept' },
      { id: 'v2', number: 2, createdAt: '2024-01-25', changes: 'Enhanced underwater scenes' },
    ],
  },
  {
    id: '3',
    title: 'The Rainbow Robot',
    description: 'A colorful robot learns about emotions and friendship in a world of gray.',
    status: 'draft',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    createdAt: '2024-01-28',
    updatedAt: '2024-01-28',
    replicationScore: 72,
    scenes: [
      { id: 's1', number: 1, title: 'Factory Born', script: 'In a factory of gray robots, one unique unit powers on with colors flickering across its screen...', duration: '2:00', visualDescription: 'Industrial setting with one colorful element standing out' },
    ],
    versions: [
      { id: 'v1', number: 1, createdAt: '2024-01-28', changes: 'First draft' },
    ],
  },
  {
    id: '4',
    title: 'Whiskers the Detective Cat',
    description: 'Follow Whiskers as he solves mysteries in the cozy village of Maplewood.',
    status: 'approved',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-24',
    replicationScore: 91,
    scenes: [
      { id: 's1', number: 1, title: 'The Missing Cookies', script: 'Mrs. Hedgehog\'s famous cookies have vanished! Whiskers adjusts his tiny detective hat...', duration: '2:30', visualDescription: 'Cozy cottage kitchen, warm autumn colors, magnifying glass effect' },
      { id: 's2', number: 2, title: 'Gathering Clues', script: 'Whiskers interviews the woodland neighbors, each with their own alibi...', duration: '3:00', visualDescription: 'Village setting with various animal characters, detective notebook' },
      { id: 's3', number: 3, title: 'The Sweet Truth', script: 'Following paw prints and crumbs, Whiskers discovers the surprising cookie culprit...', duration: '2:45', visualDescription: 'Trail of clues leading to heartwarming revelation' },
    ],
    versions: [
      { id: 'v1', number: 1, createdAt: '2024-01-10', changes: 'Initial mystery outline' },
      { id: 'v2', number: 2, createdAt: '2024-01-18', changes: 'Added red herrings' },
      { id: 'v3', number: 3, createdAt: '2024-01-24', changes: 'Final revision approved' },
    ],
  },
];

// Mock Characters
export const mockCharacters: Character[] = [
  {
    id: '1',
    name: 'Luna the Star Fox',
    avatar: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=200&h=200&fit=crop',
    personality: 'Curious, brave, dreamy, optimistic',
    voiceStyle: 'Soft, wonder-filled, young',
    traits: ['Adventurous', 'Kind-hearted', 'Creative'],
    lockedTraits: ['Purple fur', 'Star-shaped marking', 'Fluffy tail'],
    stories: ['1'],
  },
  {
    id: '2',
    name: 'Captain Coral',
    avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop',
    personality: 'Bold, resourceful, caring, determined',
    voiceStyle: 'Confident, warm, nautical accent',
    traits: ['Leadership', 'Problem-solver', 'Nature-lover'],
    lockedTraits: ['Teal scales', 'Captain hat', 'Coral jewelry'],
    stories: ['2'],
  },
  {
    id: '3',
    name: 'Whiskers',
    avatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200&h=200&fit=crop',
    personality: 'Clever, patient, observant, gentle',
    voiceStyle: 'Thoughtful, British accent, distinguished',
    traits: ['Analytical', 'Empathetic', 'Wise'],
    lockedTraits: ['Tabby pattern', 'Detective hat', 'Monocle'],
    stories: ['4'],
  },
  {
    id: '4',
    name: 'Rainbow Bot',
    avatar: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=200&h=200&fit=crop',
    personality: 'Innocent, learning, joyful, expressive',
    voiceStyle: 'Slightly robotic but warm, child-like',
    traits: ['Curious', 'Honest', 'Colorful'],
    lockedTraits: ['LED face display', 'Color-changing panels', 'Antenna'],
    stories: ['3'],
  },
];

// Mock Videos
export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Luna\'s Starlight Journey - Episode 1',
    thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=225&fit=crop',
    duration: '8:30',
    status: 'published',
    language: 'English',
    scenes: 3,
    storyId: '1',
  },
  {
    id: '2',
    title: 'Luna\'s Starlight Journey - Spanish',
    thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=225&fit=crop',
    duration: '8:45',
    status: 'approved',
    language: 'Spanish',
    scenes: 3,
    storyId: '1',
  },
  {
    id: '3',
    title: 'Captain Coral - Deep Sea Discovery',
    thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=225&fit=crop',
    duration: '5:00',
    status: 'review',
    language: 'English',
    scenes: 2,
    storyId: '2',
  },
  {
    id: '4',
    title: 'Whiskers Solves the Case',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=225&fit=crop',
    duration: '8:15',
    status: 'approved',
    language: 'English',
    scenes: 3,
    storyId: '4',
  },
];

// Mock Thumbnails
export const mockThumbnails: Thumbnail[] = [
  {
    id: '1',
    storyId: '1',
    variants: [
      { id: 'v1', image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=225&fit=crop', label: 'Starry Night', isRecommended: true, clickRate: 12.4 },
      { id: 'v2', image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=225&fit=crop', label: 'Luna Close-up', isRecommended: false, clickRate: 8.7 },
      { id: 'v3', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=225&fit=crop', label: 'Galaxy View', isRecommended: false, clickRate: 10.2 },
    ],
  },
  {
    id: '2',
    storyId: '2',
    variants: [
      { id: 'v1', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=225&fit=crop', label: 'Ocean Deep', isRecommended: true, clickRate: 11.8 },
      { id: 'v2', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=225&fit=crop', label: 'Treasure Map', isRecommended: false, clickRate: 9.5 },
    ],
  },
];

// Mock Playlists
export const mockPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Bedtime Adventures',
    description: 'Calm, magical stories perfect for winding down',
    videoCount: 8,
    thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=225&fit=crop',
    videos: ['1', '2'],
  },
  {
    id: '2',
    title: 'Ocean Explorers',
    description: 'Dive into underwater adventures',
    videoCount: 5,
    thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=225&fit=crop',
    videos: ['3'],
  },
  {
    id: '3',
    title: 'Mystery Solvers',
    description: 'Join our detective friends on puzzling cases',
    videoCount: 6,
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=225&fit=crop',
    videos: ['4'],
  },
];

// Mock Merch
export const mockMerch: MerchItem[] = [
  { id: '1', name: 'Luna Plush Toy', type: 'Plush', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', price: 24.99, character: 'Luna' },
  { id: '2', name: 'Starry Night T-Shirt', type: 'Apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', price: 19.99, character: 'Luna' },
  { id: '3', name: 'Captain Coral Mug', type: 'Drinkware', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop', price: 14.99, character: 'Captain Coral' },
  { id: '4', name: 'Detective Kit', type: 'Toys', image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=300&h=300&fit=crop', price: 29.99, character: 'Whiskers' },
  { id: '5', name: 'Rainbow Bot Sticker Pack', type: 'Stickers', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', price: 7.99, character: 'Rainbow Bot' },
  { id: '6', name: 'Adventure Coloring Book', type: 'Books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop', price: 12.99 },
];

// Mock Drafts
export const mockDrafts: Draft[] = [
  { id: '1', type: 'story', title: 'The Rainbow Robot', status: 'draft', createdAt: '2024-01-28', updatedAt: '2024-01-28', thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop' },
  { id: '2', type: 'video', title: 'Captain Coral - Deep Sea Discovery', status: 'review', createdAt: '2024-01-25', updatedAt: '2024-01-27', thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=100&h=100&fit=crop', assignee: 'Admin' },
  { id: '3', type: 'thumbnail', title: 'Luna Episode 2 Thumbnails', status: 'review', createdAt: '2024-01-26', updatedAt: '2024-01-27', thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=100&h=100&fit=crop' },
  { id: '4', type: 'character', title: 'New Character: Sparkle the Unicorn', status: 'draft', createdAt: '2024-01-29', updatedAt: '2024-01-29', thumbnail: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=100&h=100&fit=crop' },
  { id: '5', type: 'merch', title: 'Luna Backpack Design', status: 'approved', createdAt: '2024-01-20', updatedAt: '2024-01-26', thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop' },
];

// Mock Integrations
export const mockIntegrations: Integration[] = [
  { id: '1', name: 'YouTube', icon: 'Youtube', status: 'connected', description: 'Publish videos directly to your YouTube channel' },
  { id: '2', name: 'Printful', icon: 'Shirt', status: 'connected', description: 'Automated merchandise fulfillment' },
  { id: '3', name: 'Spotify', icon: 'Music', status: 'disconnected', description: 'Distribute audio content and podcasts' },
  { id: '4', name: 'TikTok', icon: 'Video', status: 'disconnected', description: 'Create short-form content' },
  { id: '5', name: 'Instagram', icon: 'Instagram', status: 'connected', description: 'Share visual content and stories' },
  { id: '6', name: 'Shopify', icon: 'ShoppingBag', status: 'disconnected', description: 'E-commerce storefront' },
];

// Mock Style Blueprint
export const mockStyleBlueprint: StyleBlueprint = {
  id: '1',
  visualStyle: {
    colorPalette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
    animationStyle: '2D Flat with depth layers',
    characterDesign: 'Rounded, friendly, expressive eyes',
  },
  narrativeStructure: {
    pacing: 'Gentle with excitement peaks',
    storyType: 'Adventure with moral lessons',
    targetAge: '3-8 years',
  },
  audioProfile: {
    musicStyle: 'Orchestral with playful elements',
    voiceType: 'Warm, expressive narrator',
    soundEffects: 'Soft, magical, nature-inspired',
  },
};

// Dashboard Stats
export const dashboardStats = {
  user: {
    activeDrafts: 4,
    avgReplicationScore: 86,
    recentCreations: 12,
    publishedThisMonth: 3,
  },
  admin: {
    pendingApprovals: 7,
    systemHealth: 98,
    activeUsers: 24,
    contentGenerated: 156,
  },
};
