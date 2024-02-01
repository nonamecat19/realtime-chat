import {ExternalToast, toast} from 'sonner';

export class NotificationService {
  public static error(message: string, options: ExternalToast = {}) {
    toast.error(message, options);
  }

  public static warn(message: string, options: ExternalToast = {}) {
    toast.warning(message, options);
  }

  public static success(message: string, options: ExternalToast = {}) {
    toast.success(message, options);
  }

  public static info(message: string, options: ExternalToast = {}) {
    toast.info(message, options);
  }
}
