export type Activity = {
  id: string;
  activity_type: string;
  target_type?: string;
  target_id?: string;
  metadata: Record<string, any>;
  created_at: string;
};