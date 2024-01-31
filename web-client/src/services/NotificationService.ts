import {toast} from 'sonner';

export class NotificationService {
  public static error(message: string) {
    toast.error(message);
  }

  public static warn(message: string) {
    toast.warning(message);
  }

  public static success(message: string) {
    toast.success(message);
  }

  public static info(message: string) {
    toast.info(message);
  }
}
