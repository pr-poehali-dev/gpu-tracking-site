export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
}

export interface QueueItem {
  id: number;
  user_id: number;
  username: string;
  gpu_name: string;
  duration_minutes: number;
  start_time: string | null;
  end_time: string | null;
  status: string;
  position: number;
}

export const API_URLS = {
  auth: 'https://functions.poehali.dev/fcb44185-d66a-4870-87b1-2bfa277fc778',
  queue: 'https://functions.poehali.dev/dbf44a9d-cbd1-4898-9632-5025ff48b329',
  admin: 'https://functions.poehali.dev/63a27393-625b-45d9-8528-151eadbebdc2'
};
