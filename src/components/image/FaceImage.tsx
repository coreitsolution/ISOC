import { useState, forwardRef, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const LOAD_TIMEOUT = 20000;

interface ImageProps {
  imageSrc: string;
  imageAlt: string;
  className?: string;
  onLoad?: () => void;
  backgroundColor?: string;
  isWithOutDiv?: boolean;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      imageSrc,
      imageAlt,
      className,
      onLoad,
      backgroundColor = "#383A39",
      isWithOutDiv = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(
      imageSrc?.trim() || "/images/no_image.png"
    );

    const fallbackImage = "/images/no_image.png";
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      setImageLoaded(false);
      setCurrentSrc(imageSrc?.trim() || fallbackImage);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [imageSrc]);

    const handleError = () => {
      if (currentSrc === fallbackImage) {
        setImageLoaded(true);
        return;
      }

      timerRef.current = setTimeout(() => {
        setCurrentSrc(fallbackImage);
        setImageLoaded(true);
      }, LOAD_TIMEOUT);
    };

    if (isWithOutDiv) {
      return (
        <img
          ref={ref}
          src={currentSrc}
          loading="lazy"
          onLoad={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setImageLoaded(true);
            onLoad?.();
          }}
          onError={handleError}
          className={className}
          alt={imageAlt}
        />
      );
    }

    return (
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ backgroundColor }}
      >
        {!imageLoaded && (
          <span className="absolute text-[14px] text-white font-bold">
            {t("text.loading")}
          </span>
        )}

        <img
          ref={ref}
          src={currentSrc}
          loading="lazy"
          onLoad={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setImageLoaded(true);
            onLoad?.();
          }}
          onError={handleError}
          className={`${className} ${
            imageLoaded ? "visible" : "invisible"
          }`}
          alt={imageAlt}
        />
      </div>
    );
  }
);

export default Image;
