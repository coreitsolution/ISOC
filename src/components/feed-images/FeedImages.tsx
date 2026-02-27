import Image from "../image/Image";
import FaceImage from "../image/FaceImage";
import { getUrls } from "../../config/runtimeConfig";

interface FeedImagesProps {
  image1: string;
  image1Alt: string;
  image2: string;
  image2Alt: string;
  isShowOnlyImage1?: boolean;
  isFace?: boolean;
  isMulti?: boolean;
}

const FeedImages: React.FC<FeedImagesProps> = ({
  image1,
  image1Alt,
  image2,
  image2Alt,
  isShowOnlyImage1 = false,
  isFace = false,
  isMulti = false,
}) => {
  const { CENTER_FILE_URL } = getUrls();

  return (
    <div
      className={`grid ${
        isShowOnlyImage1 ? "grid-cols-1" : "grid-cols-2"
      } h-[130px] w-full`}
    >
      {
        isFace ? (
          <>
            <FaceImage
              imageSrc={`${CENTER_FILE_URL}${image1}`}
              imageAlt={image1Alt}
              className={`${isShowOnlyImage1 ? "w-[142px]" : "w-full"} h-[130px] object-cover`}
            />

            {!isShowOnlyImage1 && (
              <FaceImage
                imageSrc={`${CENTER_FILE_URL}${image2}`}
                imageAlt={image2Alt}
                className="h-[130px] w-full object-cover"
              />
            )}
          </>
        ) :
        (
          <>
            <Image
              imageSrc={`${CENTER_FILE_URL}${image1}`}
              imageAlt={image1Alt}
              className="h-[130px] w-full object-cover"
            />

            <Image
              imageSrc={`${CENTER_FILE_URL}${image2}`}
              imageAlt={image2Alt}
              className={`${isMulti ? "h-[130px]" : "h-[65px]"} w-full object-cover`}
            />
          </>
        )
      }
    </div>
  );
};

export default FeedImages;
