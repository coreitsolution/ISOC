import React from 'react';
import { ToastContentProps, Id } from 'react-toastify';

// Animation
import LicenseExpireAnimation from "../../assets/animation/license-expire.json";

// Components
import LottieAnimation from '../lottie-animation/LottieAnimation';

// i18n
import { useTranslation } from 'react-i18next';

type NotificationData = {
  title: string;
  content: string[];
  onUpdate?: (id: Id) => void;
  updateVisible?: boolean;
  isSuccess?: boolean;
  isOnline?: boolean;
};

interface LicenseExpirePopupProps extends Partial<ToastContentProps<NotificationData>> {
  data: NotificationData;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const LicenseExpirePopup: React.FC<LicenseExpirePopupProps> = ({
  closeToast = () => {},
  data,
  toastProps,
}) => {
  // i18n
  const { t } = useTranslation();

  const isColored = (toastProps?.theme ?? 'dark') === 'dark';

  return (
    <div
      className={'flex flex-col justify-center items-center w-full relative'}
    >
      <LottieAnimation 
        animationData={LicenseExpireAnimation}
        width={140}
        height={140}
      />
      <h3 className={`font-semibold text-[20px] absolute bottom-2 ${isColored ? 'text-white' : 'text-black'}`}>{data.content}</h3>
    </div>
  );
};

export default LicenseExpirePopup;
