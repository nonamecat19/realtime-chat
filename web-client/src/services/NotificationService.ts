import {ExternalToast, toast} from 'sonner';

class NotificationService {
  public error(message: string, options: ExternalToast = {}) {
    toast.error(message, options);
  }

  public warn(message: string, options: ExternalToast = {}) {
    toast.warning(message, options);
  }

  public success(message: string, options: ExternalToast = {}) {
    toast.success(message, options);
  }

  public info(message: string, options: ExternalToast = {}) {
    toast.info(message, options);
  }
}
const notificationService = new NotificationService();
Object.freeze(notificationService);
export {notificationService};
