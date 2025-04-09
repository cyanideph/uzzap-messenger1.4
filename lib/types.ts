export type Activity = {
  id: string;
  activity_type: string;
  target_type?: string;
  target_id?: string;
  metadata: {
    user: string;
    message?: string;
    status?: string;
    [key: string]: any; // Allow additional metadata properties while requiring 'user'
  };
  created_at: string;
};