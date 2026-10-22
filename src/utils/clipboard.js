import { toast } from 'sonner';

export const copyText = (text, toastMessage) => {
  navigator.clipboard.writeText(text);
  if (toastMessage) {
    toast.info(toastMessage);
  }
};
