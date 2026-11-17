import type { GuestSide } from "@/types/guest";

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  description: string;
  icon: "sparkles" | "heart" | "utensils" | "moon";
}

export interface SideConfig {
  label: string;
  parentsLine: string;
  hostLead: string;
  relationWord: string;
  partnerRelationWord: string;
  otherParentsLine: string;
  warmNote: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorWhatsapp: string;
}

/**
 * Single configuration file for your brother's wedding.
 * Update these placeholders with the real names, date, venue, and coordinator details.
 * Note: There is intentionally no mention of gifts or a gift corner anywhere in the invitation.
 */
export const WEDDING_CONFIG = {
  couple: {
    groomFirstName: "Zayd",
    groomFullName: "Zayd Rahman",
    brideFirstName: "Amina",
    brideFullName: "Amina Chowdhury",
    monogram: "Z & A",
    arabicGreeting: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    bismillahTranslation:
      "In the name of Allah, the Most Gracious, the Most Merciful",
    quranicVerse:
      "“And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts.”",
    quranicReference: "Surah Ar-Rum · 30:21",
  },

  event: {
    title: "Nikah & Mutual Wedding Reception",
    dayLabel: "Saturday",
    dateDisplay: "January 16, 2027",
    hijriDateDisplay: "7 Rajab 1448 AH",
    /** ISO timestamp with local timezone offset for the live countdown & calendar links */
    startIso: "2027-01-16T16:30:00+06:00",
    endIso: "2027-01-16T22:30:00+06:00",
    rsvpDeadline: "January 2, 2027",
    venueName: "The Ivory Pavilion Ballroom",
    venueHall: "Grand Courtyard & Main Banquet Hall",
    venueAddressLine1: "42 Gulshan Avenue, Dhaka 1212",
    venueAddressLine2: "Valet & Basement Parking Available",
    googleMapsUrl: "https://maps.google.com/?q=Gulshan+Avenue+Dhaka",
    appleMapsUrl: "https://maps.apple.com/?q=Gulshan+Avenue+Dhaka",
  },

  dressCode: {
    title: "Attire Inspiration",
    subtitle: "Modest & Festive Formal",
    description:
      "We kindly invite you to celebrate with us in ivory, champagne, sage, or warm gold tones.",
    swatches: [
      { name: "Warm Ivory", hex: "#F5EFE6" },
      { name: "Champagne", hex: "#DFC8A2" },
      { name: "Antique Gold", hex: "#B8935A" },
      { name: "Soft Sage", hex: "#A8B2A1" },
      { name: "Espresso", hex: "#3D312A" },
    ],
  },

  timeline: [
    {
      id: "welcome",
      time: "4:30 PM",
      title: "Arrival & Warm Welcome",
      subtitle: "Courtyard Reception",
      description:
        "Guests gather with light refreshments and warm greetings before the ceremony begins.",
      icon: "sparkles",
    },
    {
      id: "nikah",
      time: "5:15 PM",
      title: "The Sacred Nikah",
      subtitle: "Islamic Wedding Ceremony",
      description:
        "The solemnization of the marriage contract, Khutbah-e-Nikah, Qubool, and collective Dua for the couple.",
      icon: "moon",
    },
    {
      id: "reception",
      time: "7:00 PM",
      title: "Joint Wedding Reception & Dinner",
      subtitle: "Hosted Together by Both Families",
      description:
        "A joyful mutual celebration uniting both families over a celebratory feast, warm conversations, and memories.",
      icon: "utensils",
    },
    {
      id: "farewell",
      time: "10:00 PM",
      title: "Rukhsati & Blessings",
      subtitle: "Final Dua & Farewell",
      description:
        "Sending off the newlyweds with heartfelt prayers for barakah, love, and lifelong companionship.",
      icon: "heart",
    },
  ] satisfies TimelineItem[],

  sides: {
    groom: {
      label: "Groom's Side",
      parentsLine: "Mr. Tariq Rahman & Mrs. Salma Rahman",
      hostLead: "Together with the family of the bride, joyfully invite you to",
      relationWord: "their beloved son",
      partnerRelationWord: "daughter of",
      otherParentsLine: "Mr. Kamal Chowdhury & Mrs. Yasmin Chowdhury",
      warmNote:
        "Your presence and heartfelt duas from our family and friends mean the world to us as Zayd begins this blessed chapter.",
      coordinatorName: "Nasim Rahman (Groom's Brother)",
      coordinatorPhone: "+880 1700-000001",
      coordinatorWhatsapp: "8801700000001",
    },
    bride: {
      label: "Bride's Side",
      parentsLine: "Mr. Kamal Chowdhury & Mrs. Yasmin Chowdhury",
      hostLead: "Together with the family of the groom, joyfully invite you to",
      relationWord: "their beloved daughter",
      partnerRelationWord: "son of",
      otherParentsLine: "Mr. Tariq Rahman & Mrs. Salma Rahman",
      warmNote:
        "We are deeply honored to share Amina's joyful day with our cherished family and friends in one united celebration.",
      coordinatorName: "Fahim Chowdhury (Bride's Family)",
      coordinatorPhone: "+880 1700-000002",
      coordinatorWhatsapp: "8801700000002",
    },
  } satisfies Record<GuestSide, SideConfig>,
};
