import { useState, forwardRef, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

const LOAD_TIMEOUT = 20000; // 20 sec
const FALLBACK_IMAGE = "/images/no_image.png";

interface ImageProps {
  imageSrc: string;
  imageAlt: string;
  className?: string;
  onLoad?: () => void;
  backgroundColor?: string;
  isWithOutDiv?: boolean;
}

const getFormattedSrc = (src: string) => {
  const trimmed = src?.trim();
  if (!trimmed) return FALLBACK_IMAGE;

  if (
    trimmed.startsWith("data:image") || 
    trimmed.startsWith("blob:") || 
    trimmed.startsWith("http")
  ) {
    return trimmed;
  }

  const isRawBase64 = trimmed.length > 50 && !trimmed.includes(" ");

  if (isRawBase64) {
    let mimeType = "png"; // Default

    if (trimmed.startsWith("/9j/")) {
      mimeType = "jpeg";
    } 
    else if (trimmed.startsWith("iVBORw")) {
      mimeType = "png";
    } 
    else if (trimmed.startsWith("R0lGOD")) {
      mimeType = "gif";
    } 
    else if (trimmed.startsWith("UklGR")) {
      mimeType = "webp";
    }
    
    return `data:image/${mimeType};base64,${trimmed}`;
  }
  return trimmed;
};

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
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const safeSrc = useMemo(() => getFormattedSrc(imageSrc), [imageSrc]);

    const isBase64 = useMemo(() => safeSrc.startsWith("data:image"), [safeSrc]);

    const [currentSrc, setCurrentSrc] = useState<string>(safeSrc);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      setImageLoaded(false);
      setCurrentSrc(safeSrc);

      if (!isBase64 && safeSrc !== FALLBACK_IMAGE) {
        timerRef.current = setTimeout(() => {
          setCurrentSrc(FALLBACK_IMAGE);
          setImageLoaded(true);
        }, LOAD_TIMEOUT);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [safeSrc, isBase64]);

    const handleLoad = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setImageLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (currentSrc !== FALLBACK_IMAGE) {
        setCurrentSrc(FALLBACK_IMAGE);
      }
      setImageLoaded(true);
    };

    const imgElement = (
      <img
        ref={ref}
        src={currentSrc}
        alt={imageAlt}
        onLoad={handleLoad}
        onError={handleError}
        loading={isBase64 ? undefined : "lazy"}
        className={`${className} ${!imageLoaded ? "invisible" : "visible"}`}
      />
    );

    const loader = !imageLoaded && (
      <span className={isWithOutDiv ? "text-center text-[14px] text-white font-bold w-full" : "absolute text-[14px] text-white font-bold"}>
        {t("text.loading")}
      </span>
    );

    if (isWithOutDiv) {
      return (
        <>
          {loader}
          {imgElement}
        </>
      );
    }

    return (
      <div
        className="relative flex justify-center items-center"
        style={{ backgroundColor }}
      >
        {loader}
        {imgElement}
      </div>
    );
  }
);

export default Image;