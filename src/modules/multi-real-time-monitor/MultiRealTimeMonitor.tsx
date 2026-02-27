import React, { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { Map as LeafletMap } from 'leaflet';
import { AnimatePresence } from "framer-motion";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useAppDispatch } from '../../app/hooks';

// Material UI
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// Icons
import SearchIcon from '@mui/icons-material/Search';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import MultiSelectCameras from '../../components/multi-select/MultiSelectCameras';
import BaseMap from '../../components/base-map/BaseMap';
import FeedCard from '../../components/feed-card/FeedCard';
import FeedImages from '../../components/feed-images/FeedImages';
import Scene from '../../components/scene/Scene';
import Loading from "../../components/loading/Loading";

// Types
import {
  Camera,
  CameraFaceResponse,
  NotificationList,
  HumanDetection,
  VehicleDetection,
} from "../../features/types";

// Images
import PinGoogleMap from "../../assets/icons/pin_google-maps.png";

// Utils
import { 
  reformatString,
} from "../../utils/commonFunction";
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage } from '../../utils/popupMessage';

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

// Modules
import SearchAllCameras from "../search-cameras/SearchAllCameras";

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

// Constant
import {
  GENDER,
  COAT,
  COAT_COLORS,
  TROUSER,
  TROUSER_COLORS,
  HAT,
  HAT_TYPE,
  BAG,
  BAG_TYPE,
  EMOTION,
  GLASSES,
  BEARD,
  MASK,
  VEHICLE_MAKE,
  VEHICLE_COLOR,
  VEHICLE_TYPE,
} from "../../constants/dropdown";

dayjs.extend(buddhistEra);
dayjs.extend(utc);
dayjs.extend(timezone);

interface MultiRealTimeMonitorProps {

}

const MultiRealTimeMonitor: React.FC<MultiRealTimeMonitorProps> = () => {
  const dispatch = useAppDispatch();
  const { CENTER_API } = getUrls();

  // i18n
  const { t, i18n } = useTranslation();

  const { isOpen } = useHamburger()

  // Data
  const [prevCameraIds, setPrevCameraIds] = useState<Camera[]>([]);
  const [selectedCameraIds, setSelectedCameraIds] = useState<Camera[]>([]);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [cameraList, setCameraList] = useState<Camera[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // State
  const [searchCheckpointsVisible, setSearchCheckpointsVisible] = useState(false);
  const [isSearchClicked, setIsSearchClicked] = useState(true);
  const [hasInitialSearchRun, setHasInitialSearchRun] = useState(false);
  const [isShowRealtimeCamera, setIsShowRealtimeCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const [camerasOption, setCamerasOption] = useState<{ label: string ,value: any }[]>([]);
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<{value: any, label: string}[]>([]);

  // Redux
  const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);
  const { multiRealtimeData } = useSelector((state: RootState) => state.realTimeData)
  
  const handleSelectPoint = (uid: string) => {
    setIsShowRealtimeCamera(true);
    setSelectedUid(uid);
  };

  const {
    searchSpecialCheckpoint,
    clearSearchPlaces,
    clearPlaceMarkerWithLocation,
  } = useMapSearch(map, true, handleSelectPoint);

  useEffect(() => {
    return () => {
      setSearchCheckpointsVisible(false);
      setSelectedCameraIds([]);
      setSelectedCameraObjects([]);
      setPrevCameraIds([]);
    }
  }, [])

  useEffect(() => {
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
  }, [i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (cameraList.length > 0) {
      const hasAll = selectedCameraObjects.some((v) => v.value === "0");
      const newCameraList = hasAll ? cameraList : cameraList.filter(c => selectedCameraObjects.map(sc => sc.value).includes(c.channel_id));
      setSelectedCameraIds(newCameraList);
      if (prevCameraIds.length === 0 && hasAll) {
        setPrevCameraIds(cameraList);
      }
    }
  }, [selectedCameraObjects, cameraList])

  useEffect(() => {
    if (cameraList) {
      const options = cameraList.map((row) => ({
        label: row.camera_name,
        value: row.channel_id,
      }))
      setCamerasOption([{ label: t('dropdown.all'), value: "0" }, ...options])
    }
  }, [cameraList, i18n.language]);

  useEffect(() => {
    fetchData();
  }, [cameraRefreshKey]);

  useEffect(() => {
    if (!isSearchClicked || !map) return;

    const runSearch = async () => {
      const camerasToProcess = isSearchClicked ? selectedCameraIds : prevCameraIds;

      const allNotificationItems: NotificationList[] = [];
      const defaultColor = "#FDCC0A";
      const isLocationWithLabel = true;

      for (const camera of camerasToProcess) {
        allNotificationItems.push({
          id: camera.id,
          camera_uid: camera.channel_id,
          camera_name: camera.camera_name || "",
          plate_number: "",
          plate_prefix: "",
          region_code: "",
          prefix_title: "",
          first_name: "",
          last_name: "",
          iconColor: defaultColor,
          bgColor: defaultColor,
          textShadow: "",
          isLocationWithLabel,
          isSpecialLocation: false,
          detectTime: "",
          camera_latitude: camera.latitude,
          camera_longitude: camera.longitude,
          detect_type: "",
        } as NotificationList);
      }

      const locationMap = new Map<string, NotificationList[]>();

      for (const item of allNotificationItems) {
        const key = `${item.camera_latitude},${item.camera_longitude}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, []);
        }
        locationMap.get(key)!.push(item);
      }

      const mergedItems: NotificationList[] = [];

      for (const [, items] of locationMap) {
        const hasSpecial = items.some(i => i.isSpecialLocation);

        mergedItems.push(
          ...items.map(i => ({
            ...i,
            isSpecialLocation: hasSpecial,
          }))
        );
      }

      if (mergedItems.length > 0) {
        await searchSpecialCheckpoint(mergedItems);
      }
    };

    runSearch();
  }, [isSearchClicked, map]);

  useEffect(() => {
    if (map && cameraList.length > 0 && !hasInitialSearchRun) {
      handleInitialSearch();
      setHasInitialSearchRun(true);
    }
  }, [map, cameraList, hasInitialSearchRun]);

  const fetchData = async () => {
    try {
      const res = await fetchClient<CameraFaceResponse>(combineURL(CENTER_API, "/base-cameras/get"), {
        method: "GET",
        queryParams: {
          limit: "1000",
          orderBy: "id.asc",
        },
      });

      if (res.success) {
        const updated = res.data.map((row) => ({
          ...row,
          mjpeg_stream_url: row.live_stream_url,
        })) as any;
        setCameraList(updated);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
      setCameraList([]);
    }
  };

  const handleInitialSearch = useCallback(async () => {
    if (cameraList.length === 0) return;

    setIsSearchClicked(true);
    setSelectedCameraIds(cameraList);
    setPrevCameraIds(cameraList);

    await drawBaseMapPins(cameraList);
  }, [cameraList]);

  const drawBaseMapPins = async (cameras: Camera[]) => {
    // Clear previous checkpoints first
    clearSearchPlaces();
    
    const data = cameras.map((camera) => {
      const iconColor = "#FDCC0A"; // Default color
      const isLocationWithLabel = true;
      const isSpecialLocation = false;

      return {
        id: camera.id,
        camera_uid: camera.channel_id,
        camera_name: camera.camera_name,
        plate_number: "",
        plate_prefix: "",
        region_code: "",
        prefix_title: "",
        first_name: "",
        last_name: "",
        iconColor,
        bgColor: iconColor,
        textShadow: "",
        isLocationWithLabel,
        isSpecialLocation,
        detectTime: "",
        camera_latitude: camera.latitude,
        camera_longitude: camera.longitude,
        detect_type: "",
      }
    })
    
    await searchSpecialCheckpoint(data);
  }

  const handleCameraChange = (ids: string[]) => {
    let newIds: string[];

    if (ids.length === 0 || ids.includes("0")) {
      newIds = ["0"];
    } else {
      newIds = ids;
    }

    const selectedObjects = camerasOption.filter(c => newIds.includes(c.value));
    setSelectedCameraObjects(selectedObjects);

    const hasAll = selectedObjects.some((v) => v.value === "0");
    setSelectedCameraIds(hasAll ? cameraList : cameraList.filter(c => newIds.includes(c.channel_id)));

    if (isSearchClicked) {
      setIsSearchClicked(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeSearch(selectedCameraIds);
  };

  const executeSearch = useCallback(async (cameraData: Camera[]) => {
    if (cameraData.length === 0) {
      await clearSearchPlaces();
      setPrevCameraIds([]);
      setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
      setIsSearchClicked(false);
      return;
    }

    setIsSearchClicked(true);

    const removedIds = prevCameraIds.filter(
      (prev) => !cameraData.some((curr) => curr.channel_id === prev.channel_id)
    );

    for (const camera of removedIds) {
      clearPlaceMarkerWithLocation({
        lat: parseFloat(camera.latitude),
        lng: parseFloat(camera.longitude),
      });
    }

    setPrevCameraIds(cameraData);

    // Refresh Map Pins
    await drawBaseMapPins(cameraData);
  }, [dispatch, prevCameraIds, clearSearchPlaces, clearPlaceMarkerWithLocation, t]);


  const handleClearSearch = async () => {
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
    clearSearchPlaces();
    setIsSearchClicked(false); 
    setPrevCameraIds([]);
  };

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleCamerasSelected = useCallback(async (cameraSelected: { value: any, label: string }[]) => {
    const syncSelectedObjects = camerasOption.filter(option => 
      cameraSelected.some(selected => selected.value === option.value)
    );

    const hasAll = syncSelectedObjects.some((v) => v.value === "0");

    if (hasAll || syncSelectedObjects.length === 0) {
      const allObj = camerasOption.find(o => o.value === "0") || { label: t('dropdown.all'), value: "0" };
      setSelectedCameraObjects([allObj]);
      setSelectedCameraIds(cameraList);
      await executeSearch(cameraList);
    } 
    else {
      setSelectedCameraObjects(syncSelectedObjects);
      
      const filtered = cameraList.filter((c) => 
          syncSelectedObjects.some((sc) => sc.value === c.channel_id)
      );
      setSelectedCameraIds(filtered);
      await executeSearch(filtered);
    }
  }, [camerasOption, cameraList, t, executeSearch]);

  const createFeedVehicleInfo = (data: VehicleDetection, index: number, key: string) => {
    const vehicleType = getLocalizedText(VEHICLE_TYPE, data.car_type);
    const vehicleColor = getLocalizedText(VEHICLE_COLOR, data.car_color);
    const vehicleBrand = getLocalizedText(VEHICLE_MAKE, data.car_brand?.toLowerCase().includes("unrecognized") ? "-1" : data.car_brand);

    return (
      <FeedCard key={key} id={data.id} index={index}>
        <p
          className="text-center"
          style={{ backgroundColor: data.feedBackgroundColor, color: data.feedColor }}
        >
          {t("text.vehicle")}
        </p>

        <p className='bg-[#383A39] text-center'>
          {dayjs(data.capture_time).format(i18n.language === 'th' ? 'DD-MM-BBBB HH:mm:ss' : 'DD-MM-YYYY HH:mm:ss')}
        </p>

        {/* Checkpoint */}
        <div className='pl-[30px] col-span-2'>{`${t('text.checkpoint')}: ${cameraList.find(cp => cp.channel_id === data.channel_id)?.camera_name|| "-"}`}</div>

        {/* Images */}
        <FeedImages 
          image1={data.vehicle_image_url || ""}
          image1Alt={"Detect Image"}
          image2={data.picture_url || ""}
          image2Alt={"Overview Image"}
          isMulti={true}
        />

        {/* Vehicle Info */}
        <div className="w-full h-full bg-[#161817]">
          <div className="h-full flex flex-col p-1 pl-3 space-y-2">
            {
              [
                { label: t('feed-data.car-type'), value: vehicleType },
                { label: t('feed-data.car-brand'), value: vehicleBrand },
                { label: t('feed-data.car-color'), value: vehicleColor },
              ].map(({ label, value }, idx) => (
                <div className="flex" key={idx}>
                  <span className="w-[70px] text-left">{label}</span>
                  <span className="mx-1">:</span>
                  <span className="w-[135px] truncate" title={value}>
                    {value}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </FeedCard>
    )
  }

  const createFeedFaceInfo = (data: HumanDetection, index: number, key: string) => {
    const age = `${data.age} ${t("text.years")}`;
    const gender = getLocalizedText(GENDER, data.gender);
    const coat = getLocalizedText(COAT, data.coat);
    const coat_color = getLocalizedText(COAT_COLORS, data.coat_color);
    const trousers = getLocalizedText(TROUSER, data.trousers);
    const trousers_color = getLocalizedText(TROUSER_COLORS, data.trousers_color);
    const hat = getLocalizedText(HAT, data.hat);
    const hat_type = getLocalizedText(HAT_TYPE, data.hat_type);
    const bag = getLocalizedText(BAG, data.bag);
    const bag_type = getLocalizedText(BAG_TYPE, data.bag_type);
    const emotion = getLocalizedText(EMOTION, data.emotion);
    const glasses = getLocalizedText(GLASSES, data.glasses);
    const beard = getLocalizedText(BEARD, data.beard);
    const mask = getLocalizedText(MASK, data.mask);
    
    return (
      <FeedCard key={key} id={data.id} index={index}>
        <p
          className="text-center"
          style={{ ...(data.feedBackgroundColor && { backgroundColor: data.feedBackgroundColor }), color: data.feedColor }}
        >
          {t("text.human")}
        </p>

        <p className='bg-[#383A39] text-center'>
          {dayjs(data.capture_time).format(i18n.language === 'th' ? 'DD-MM-BBBB HH:mm:ss' : 'DD-MM-YYYY HH:mm:ss')}
        </p>

        {/* Checkpoint */}
        <div className='pl-[30px] col-span-2'>{`${t('text.checkpoint')}: ${cameraList.find(cp => cp.channel_id === data.channel_id)?.camera_name|| "-"}`}</div>

        {/* Images */}
        <div className='flex justify-center items-center h-full w-full'>
          <FeedImages 
            image1={data.human_image_url || ""}
            image1Alt={"Detect Image"}
            image2={data.picture_url || ""}
            image2Alt={"Overview Image"}
            isFace={true}
          />
        </div>

        {/* Behavior Info */}
        <div className="w-full h-full bg-[#161817]">
          <div className="h-full flex flex-col p-1 pl-3 space-y-2">
            {
              [
                { label: t('feed-data.age'), value: age },
                { label: t('feed-data.gender'), value: gender },
                { label: t('feed-data.emotion'), value: emotion },
                { label: t('feed-data.glasses'), value: glasses },
                { label: t('feed-data.beard'), value: beard },
                { label: t('feed-data.mask'), value: mask },
                { label: t('feed-data.coat'), value: coat },
                { label: t('feed-data.coat-color'), value: coat_color },
                { label: t('feed-data.trousers'), value: trousers },
                { label: t('feed-data.trousers-color'), value: trousers_color },
                { label: t('feed-data.hat'), value: hat },
                { label: t('feed-data.hat-type'), value: hat_type },
                { label: t('feed-data.bag'), value: bag },
                { label: t('feed-data.bag-type'), value: bag_type },
              ].map(({ label, value }, idx) => (
                <div className="flex" key={idx}>
                  <span className="w-[70px] text-left">{label}</span>
                  <span className="mx-1">:</span>
                  <span className="w-[135px] truncate" title={value}>
                    {value}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </FeedCard>
    )
  }

  const getLocalizedText = <
    T extends { value: string; text_th: string; text_en: string }
  >(
    list: T[],
    value?: string | null
  ) => {
    const item = list.find(
      (i) => i.text_en.toLowerCase() === value?.toLowerCase()
    );

    if (!item) return "-";

    return i18n.language === "th"
      ? item.text_th
      : reformatString(item.text_en);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div id="multi-detect-real-time-monitor" className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500`}>
      {isLoading && <Loading />}
      <div className='flex flex-col w-full h-full overflow-y-auto'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.multi-realtime.title')}</Typography>
        
        {/* Search Filter Part */}
        <div className='flex lg:flex-row flex-col justify-between h-[100px] gap-2'>
          <form onSubmit={onSubmit}>
            <div className='flex mt-3 w-full'>
              <div className='flex w-[60vw] space-x-3'>
                <div className='flex flex-col w-full space-y-2'>
                  <p className='text-[15px]'>{t('component.checkpoint-2')}</p>
                  <div className='w-full items-center justify-center'>
                    <MultiSelectCameras 
                      limitTags={3} 
                      selectedValues={selectedCameraObjects}
                      options={camerasOption} 
                      onChange={handleCameraChange}
                      placeHolder={t('placeholder.checkpoint-2')}
                    />
                  </div>
                </div>
                <div className='flex items-end'>
                  <button 
                    type="button"
                    className="flex items-center justify-center bg-[#797979] w-[60px] h-10 rounded-[5px] cursor-pointer"
                    onClick={() => setSearchCheckpointsVisible(true)}>
                    <img src={PinGoogleMap} alt="Pin Google map" className='w-[25px] h-[25px]' />
                  </button>
                </div>

                <div className='flex items-end gap-2 ml-2'>
                  <Button
                    type='submit'
                    variant="contained"
                    className="primary-btn"
                    startIcon={<SearchIcon />}
                    sx={{
                      width: t('button.search-width'),
                      height: "40px",
                      textTransform: 'capitalize',
                      '& .MuiSvgIcon-root': { 
                        fontSize: 26 
                      } 
                    }}
                    >
                    {t('button.search')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    className="secondary-btn" 
                    onClick={handleClearSearch}
                    sx={{
                      width: t('button.clear-width'),
                      height: "40px",
                      textTransform: 'capitalize',
                    }}
                  >
                    {t('button.clear')}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Content Part */}
        <div className='grid grid-cols-[70%_30%] lg:mt-3 mt-30 border border-[#2B9BED]'>
          {/* Map Part */}
          <div id="realtime-map-container" className='relative h-[75.5vh] w-full'>
            <BaseMap 
              onMapLoad={handleMapLoad}
              onRealtimeCameraChange={(open) => {
                setIsLoading(true);
                setSelectedUid(null);
                setTimeout(() => {
                  setIsShowRealtimeCamera(open);
                }, 500);
              }}
              realtimeCamera={true}
            />
          </div>
          {/* Real Time Result */}
          <div className='h-[75.5vh] overflow-y-auto'>
            <AnimatePresence mode="popLayout" initial={false}>
              {
                multiRealtimeData
                  .filter((data) => {
                    const isCameraMatched = prevCameraIds.some(
                      (cam) => cam.channel_id === (data as any).channel_id
                    );
                    return isCameraMatched;
                  })
                  .slice(0, 20) 
                  .map((data, index) => {
                    const key = data.detect_type === "human"
                                  ? `human_${(data as HumanDetection).id}`
                                  : `vehicle_${(data as VehicleDetection).id}`;

                    if (data.detect_type === "human") {
                      return createFeedFaceInfo((data as HumanDetection), index, key)
                    }
                    
                    return createFeedVehicleInfo((data as VehicleDetection), index, key)
                  })
              }
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dialog */}
      {
        searchCheckpointsVisible && (
          <SearchAllCameras 
            open={searchCheckpointsVisible}
            selectedCameras={handleCamerasSelected}
            onClose={() => setSearchCheckpointsVisible(false)}
          />
        )
      }

      {
        isShowRealtimeCamera && (
          <Scene 
            open={isShowRealtimeCamera} 
            onClose={() => setIsShowRealtimeCamera(false)} 
            cameraList={cameraList} 
            setLoading={(e) => setIsLoading(e)}
            selectedUid={selectedUid}
          />
        )
      }

    </div>
  )
}

export default MultiRealTimeMonitor;