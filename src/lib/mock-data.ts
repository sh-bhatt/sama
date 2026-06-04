export type DiscoveryEvent = {
  title: string;
  dateTime: string;
  city: string;
  location: string;
  interested: string;
  category: string;
  description: string;
  variant: "rose" | "lime" | "saffron" | "blue" | "plum" | "coral";
};

export const categories = [
  "All",
  "Music",
  "College",
  "Arts",
  "Food",
  "Workshops",
  "Nightlife",
  "Community",
];

export const discoveryEvents: DiscoveryEvent[] = [
  {
    title: "Moonlit Mehfil",
    dateTime: "Sat, 21 Jun · 7:30 PM",
    city: "Delhi NCR",
    location: "The Courtyard Cafe",
    interested: "128 interested",
    category: "Music",
    description: "Soft lights, live music, food, and familiar faces.",
    variant: "plum",
  },
  {
    title: "Hauz Khas Vinyl Night",
    dateTime: "Fri, 20 Jun · 9 PM",
    city: "Delhi NCR",
    location: "Basement 37",
    interested: "214 interested",
    category: "Nightlife",
    description: "Old records, new friends, one room that stays loud.",
    variant: "rose",
  },
  {
    title: "Bengaluru Creator Brunch",
    dateTime: "Sun, 22 Jun · 11 AM",
    city: "Bengaluru",
    location: "Indiranagar Studio",
    interested: "96 interested",
    category: "Community",
    description: "Coffee, cameras, and people building internet things.",
    variant: "lime",
  },
  {
    title: "Mumbai Indie Listening Room",
    dateTime: "Thu, 26 Jun · 8 PM",
    city: "Mumbai",
    location: "Bandra Listening Bar",
    interested: "182 interested",
    category: "Music",
    description: "New releases, tiny stage, big chorus energy.",
    variant: "blue",
  },
  {
    title: "Campus Farewell Afterparty",
    dateTime: "Sat, 28 Jun · 8:30 PM",
    city: "Pune",
    location: "Koregaon Park",
    interested: "309 interested",
    category: "College",
    description: "One last dance before everyone pretends to be adults.",
    variant: "coral",
  },
  {
    title: "Jaipur Art Walk",
    dateTime: "Sun, 29 Jun · 5 PM",
    city: "Jaipur",
    location: "C-Scheme Lanes",
    interested: "74 interested",
    category: "Arts",
    description: "Galleries, chai stops, and late golden-hour photos.",
    variant: "saffron",
  },
  {
    title: "Goa Sunset Social",
    dateTime: "Sat, 5 Jul · 6 PM",
    city: "Goa",
    location: "Anjuna Cliff",
    interested: "241 interested",
    category: "Nightlife",
    description: "Sunset, strangers, and a playlist that knows what it is doing.",
    variant: "blue",
  },
  {
    title: "Pune Board Game Night",
    dateTime: "Wed, 25 Jun · 7 PM",
    city: "Pune",
    location: "Camp Table Club",
    interested: "63 interested",
    category: "Community",
    description: "Bring snacks, learn rules, lose gracefully.",
    variant: "lime",
  },
  {
    title: "Delhi Open Mic Under Lights",
    dateTime: "Fri, 27 Jun · 8 PM",
    city: "Delhi NCR",
    location: "Shahpur Jat",
    interested: "156 interested",
    category: "Arts",
    description: "Poems, jokes, first songs, brave voices.",
    variant: "rose",
  },
  {
    title: "Chandigarh Rooftop Mixer",
    dateTime: "Sat, 12 Jul · 8 PM",
    city: "Chandigarh",
    location: "Sector 8 Rooftop",
    interested: "88 interested",
    category: "Community",
    description: "A breezy room for new circles and old stories.",
    variant: "plum",
  },
  {
    title: "Hyderabad Food Trail",
    dateTime: "Sun, 13 Jul · 4 PM",
    city: "Hyderabad",
    location: "Old City",
    interested: "133 interested",
    category: "Food",
    description: "Follow the snacks. Stay for the people.",
    variant: "saffron",
  },
  {
    title: "Kolkata Poetry Evening",
    dateTime: "Thu, 17 Jul · 7 PM",
    city: "Kolkata",
    location: "Park Street Room",
    interested: "101 interested",
    category: "Arts",
    description: "Small lamps, long lines, and a room that listens.",
    variant: "coral",
  },
];

export const eventRows = [
  {
    title: "trending tonight",
    events: discoveryEvents.slice(0, 5),
  },
  {
    title: "modern mehfil",
    events: [discoveryEvents[0], discoveryEvents[8], discoveryEvents[11], discoveryEvents[5]],
  },
  {
    title: "evenings & weekends",
    events: [discoveryEvents[6], discoveryEvents[7], discoveryEvents[4], discoveryEvents[10]],
  },
  {
    title: "browse more",
    events: [discoveryEvents[2], discoveryEvents[3], discoveryEvents[9], discoveryEvents[1]],
  },
];

export const cities = [
  {
    name: "Delhi NCR",
    detail: "open mics, cafes, vinyl rooms",
    count: "42 gatherings",
    variant: "plum",
  },
  {
    name: "Bengaluru",
    detail: "creator brunches, workshops, indie rooms",
    count: "36 gatherings",
    variant: "lime",
  },
  {
    name: "Mumbai",
    detail: "listening bars, art nights, afterparties",
    count: "39 gatherings",
    variant: "blue",
  },
];

export const moreCities = ["Pune", "Hyderabad", "Jaipur", "Chandigarh", "Goa"];

export const demoEvent = {
  title: "Moonlit Mehfil",
  host: "Aarav & Friends",
  date: "Saturday, 21 June",
  time: "7:30 PM onwards",
  location: "The Courtyard Cafe, Delhi",
  city: "Delhi NCR",
  description:
    "An intimate evening of music, food, stories, and familiar faces under soft lights.",
  contribution: "Contribution: INR 499 at the venue or UPI to host@upi",
  interested: "128 interested",
  guests: [
    { name: "Mira", status: "going" },
    { name: "Kabir", status: "song request" },
    { name: "Ira", status: "maybe" },
    { name: "Zoya", status: "going" },
    { name: "Rhea", status: "going" },
  ],
  poll: [
    { label: "Fri, 20 June", votes: 18 },
    { label: "Sat, 21 June", votes: 34 },
    { label: "Sun, 22 June", votes: 12 },
  ],
};

export const dashboardStats = [
  { label: "live events", value: "12", detail: "4 in your city" },
  { label: "guest energy", value: "1.2k", detail: "watch the list wake up" },
  { label: "upcoming", value: "5", detail: "next room in 3 days" },
  { label: "check-ins", value: "342", detail: "across hosted nights" },
];

export const hostEvents = [discoveryEvents[0], discoveryEvents[4], discoveryEvents[2]];

export const recentActivity = [
  "Riya is going to Moonlit Mehfil",
  "Kabir added a song request",
  "Ananya voted for 21 June",
  "The Campus Farewell invite link was copied",
];

export const studioThemes = [
  { name: "Mehfil", gradient: "from-fuchsia-500 via-rose-500 to-amber-300" },
  { name: "Rooftop", gradient: "from-sky-500 via-indigo-500 to-zinc-950" },
  { name: "Cafe", gradient: "from-amber-200 via-orange-400 to-rose-600" },
  { name: "Campus", gradient: "from-lime-300 via-emerald-500 to-zinc-900" },
  { name: "Afterdark", gradient: "from-zinc-950 via-fuchsia-700 to-blue-500" },
];
