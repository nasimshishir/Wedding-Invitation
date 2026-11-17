export type GuestSide = "groom" | "bride";

export type GuestStatus = "Not Opened" | "Opened" | "Attending" | "Declined";

export interface GuestRecord {
  slug: string;
  displayName: string;
  side: GuestSide;
  maxSeats: number;
  status: GuestStatus;
  openedAt: string | null;
  openCount: number;
  attendingCount: number;
  respondedAt: string | null;
  message: string;
  phone: string;
  addedBy?: string;
}

export interface DashboardSummary {
  totalHouseholds: number;
  totalReservedSeats: number;
  notOpenedCount: number;
  openedNoResponseCount: number;
  attendingHouseholds: number;
  declinedHouseholds: number;
  totalAttendingGuests: number;
  groomSideAttendingGuests: number;
  brideSideAttendingGuests: number;
  groomSideHouseholds: number;
  brideSideHouseholds: number;
}
