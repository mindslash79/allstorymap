export type PinVisibility = "public_with_author" | "public_anonymous" | "private";

export type TimePrecision = "year" | "month" | "day" | "hour" | "minute" | "second";

export type PinRow = {
  id: string;                 // uuid or text
  user_id: string;            // owner (auth uid)
  lat: number;
  lng: number;

  // body/note (너 프로젝트에선 note를 쓰고 있으니 note 유지)
  note: string | null;

  // visibility (enum: public_with_author/public_anonymous/private)
  visibility: PinVisibility;

  // time range (new)
  time_from_key: number | null;   // bigint in DB, number in TS (14 digits safe)
  time_to_key: number | null;
  time_from_text: string | null;
  time_to_text: string | null;
  time_precision: TimePrecision | null;
  is_current: boolean;

  // legacy (있으면 유지)
  time_text?: string | null;
  time_key?: string | null;

  created_at: string;
  updated_at?: string | null;
};
