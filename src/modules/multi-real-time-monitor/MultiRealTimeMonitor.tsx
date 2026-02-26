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
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';

// Icons
import SearchIcon from '@mui/icons-material/Search';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import MultiGroupSelectCameras, { GroupedOption } from '../../components/multi-select/MultiGroupSelectCameras';
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
  RealTimeLprData,
} from "../../features/types";

// Images
import PinGoogleMap from "../../assets/icons/pin_google-maps.png";

// Utils
import { 
  reformatString,
  formatNumber, 
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

// API
import {
  setCameraSelected
} from '../../features/vehicle-count/VehicleCountSlice';
import {
  fetchVehicleCountThunk
} from "../../features/vehicle-count/VehicleCountSlice";

dayjs.extend(buddhistEra);
dayjs.extend(utc);
dayjs.extend(timezone);

interface RealTimeMonitorProps {

}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = () => {
  const dispatch = useAppDispatch();
  const { CENTER_API, DETAIL_INFORMATION } = getUrls();

  // i18n
  const { t, i18n } = useTranslation();

  const { isOpen } = useHamburger()

  // Data
  const [prevCameraIds, setPrevCameraIds] = useState<Camera[]>([]);
  const [selectedCameraIds, setSelectedCameraIds] = useState<Camera[]>([]);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [cameraList, setCameraList] = useState<Camera[]>([]);
  const todayMidnight = dayjs().startOf('day');
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  // State
  const [searchCheckpointsVisible, setSearchCheckpointsVisible] = useState(false);
  const [isSearchClicked, setIsSearchClicked] = useState(true); 
  const [hasInitialSearchRun, setHasInitialSearchRun] = useState(false);
  const [isShowLicensePlate, setIsShowLicensePlate] = useState(true);
  const [isShowFace, setIsShowFace] = useState(true);
  const [isShowRealtimeCamera, setIsShowRealtimeCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const [camerasOption, setCamerasOption] = useState<GroupedOption[]>([]);
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<GroupedOption[]>([]);

  // Redux
  const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);
  const sliceDropdown = useSelector((state: RootState) => state.dropdownData)
  const { multiRealtimeData } = useSelector((state: RootState) => state.realTimeData)
  const { vehicleCount } = useSelector((state: RootState) => state.vehicleCountData)
  
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
    if (camerasOption.length > 0) {
      setSelectedCameraObjects(camerasOption);
      setSelectedCameraIds(cameraList);
    }
  }, [camerasOption, cameraList]);

  useEffect(() => {
    if (cameraList) {
      const options = buildCameraOptions(cameraList);
      setCamerasOption(options);
      
      handleCameraChange(options); 
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
          camera_uid: camera.uid,
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
    if (map && cameraList.length > 0 && selectedCameraIds.length > 0 && !hasInitialSearchRun) {
      handleInitialSearch();
      setHasInitialSearchRun(true);
    }
  }, [map, cameraList, selectedCameraIds, hasInitialSearchRun]);


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
    }
    finally {
      setCameraList([]);
    }
  };

  const drawBaseMapPins = async (cameras: Camera[]) => {
    // Clear previous checkpoints first
    clearSearchPlaces();
    
    const data = cameras.map((camera) => {
      const iconColor = "#FDCC0A"; // Default color
      const isLocationWithLabel = true;
      const isSpecialLocation = false;

      return {
        id: camera.id,
        camera_uid: camera.uid,
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

  const handleCameraChange = (selected: GroupedOption[]) => {
    setSelectedCameraObjects(selected);

    const selectedUids = selected.map(s => s.value);
    const filtered = cameraList.filter(c => selectedUids.includes(c.uid));

    setSelectedCameraIds(filtered);
    setIsSearchClicked(false);
  };


  const handleInitialSearch = async () => {
    if (selectedCameraIds.length === 0) return;

    setIsSearchClicked(true); 
    
    const cameraUidList = selectedCameraIds.map((c) => c.uid);
    dispatch(setCameraSelected(cameraUidList));
    setPrevCameraIds(selectedCameraIds);
    await dispatch(fetchVehicleCountThunk({ cameraUids: cameraUidList.join(",") }));

    await drawBaseMapPins(selectedCameraIds);
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeSearch(selectedCameraIds);
  };

  const executeSearch = useCallback(async (cameraData: Camera[]) => {
    if (cameraData.length === 0) {
      await clearSearchPlaces();
      dispatch(setCameraSelected(cameraList.map((c) => c.uid)));
      setPrevCameraIds([]);
      setSelectedCameraObjects(camerasOption);

      setIsSearchClicked(false);
      await dispatch(fetchVehicleCountThunk({ cameraUids: cameraList.map(c => c.uid).join(",") }));
      return;
    }

    setIsSearchClicked(true);

    const removedIds = prevCameraIds.filter(
      (prev) => !cameraData.some((curr) => curr.uid === prev.uid)
    );

    await Promise.all(
      removedIds.map(async (camera) => {
        clearPlaceMarkerWithLocation({
          lat: parseFloat(camera.latitude),
          lng: parseFloat(camera.longitude),
        });
      })
    )

    dispatch(setCameraSelected(cameraData.map((c) => c.uid)));
    setPrevCameraIds(cameraData);

    // Refresh Map Pins
    await drawBaseMapPins(cameraData);
    await dispatch(fetchVehicleCountThunk({ cameraUids: cameraData.map(c => c.uid).join(",") }));
  }, [dispatch, prevCameraIds, clearSearchPlaces, clearPlaceMarkerWithLocation, t]);

  const handleClearSearch = async () => {
    setSelectedCameraObjects(camerasOption);
    setSelectedCameraIds(cameraList);
    clearSearchPlaces();
    setIsSearchClicked(false);

    dispatch(setCameraSelected(cameraList.map(c => c.uid)));
  };

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleCamerasSelected = useCallback(async (cameraSelected: GroupedOption[]) => {
    setSelectedCameraObjects(cameraSelected);

    const selectedUids = cameraSelected.map(c => c.value);
    const filtered = cameraList.filter(c => selectedUids.includes(c.uid));

    setSelectedCameraIds(filtered);
    await executeSearch(filtered);
  }, [cameraList, executeSearch]);

  const getProvinceName = (regionCode: string) => {
    const province = sliceDropdown.regions?.data.find(region => region.region_code === regionCode);
    return province?.name_th || "";
  }

  const createFeedVehicleInfo = (data: RealTimeLprData, index: number, key: string) => {
    const provinceName = getProvinceName(data.region_code);
    
    const vehicleColor = sliceDropdown.vehicleColors?.data.find(color => color.color === data.vehicle_color);

    let newVehicleColor = "-";
    if (vehicleColor) {
      newVehicleColor = i18n.language === "th"
        ? vehicleColor.color_th || "-"
        : vehicleColor.color_en || "-";
    } 
    else {
      newVehicleColor = data.vehicle_color || "-";
    }
    return (
      <FeedCard key={key} id={data.id} index={index}>
        <p
          className="text-center"
          style={{ backgroundColor: data.feedBackgroundColor, color: data.feedColor }}
        >
          {`${data.plate}${provinceName && ` ${provinceName}`}`}
        </p>

        <p className='bg-[#383A39] text-center'>
          {dayjs(data.epoch_end).format(i18n.language === 'th' ? 'DD-MM-BBBB HH:mm:ss' : 'DD-MM-YYYY HH:mm:ss')} | <span className='font-bold'>{`${data.plate_confidence}%`}</span>
        </p>

        {/* Checkpoint */}
        <div className='pl-[30px] col-span-2'>{`${t('text.checkpoint')}: ${cameraList.find(cp => cp.uid === data.camera_uid)?.camera_name || "-"}`}</div>

        {/* Images */}
        <FeedImages 
          image1={data.vehicle_image_url}
          image1Alt={"Vehicle Image"}
          image2={data.plate_image_url}
          image2Alt={"Plate Image"}
        />

        {/* Vehicle Info */}
        <div className="w-full h-full bg-[#161817]">
          <div className="h-full flex flex-col p-1 pl-3 space-y-2">
            {
              [
                { label: t('feed-data.type'), value: data.vehicle_body_type },
                { label: t('feed-data.brand'), value: data.vehicle_make },
                { label: t('feed-data.color'), value: newVehicleColor },
                { label: t('feed-data.model'), value: data.vehicle_model },
              ].map(({ label, value }, idx) => (
                <div className="flex" key={idx}>
                  <span className="w-[55px] text-left">{label}</span>
                  <span className="mx-1">:</span>
                  <span className="w-[135px] truncate" title={reformatString(value)}>
                    {reformatString(value)}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </FeedCard>
    )
  }

  const createFeedFaceInfo = (data: any, index: number, key: string) => {
    const watchList = data.watchlist || undefined;
    let prefix = undefined;
    let newPrefix = "";
    if (watchList) {
      prefix = sliceDropdown.prefix?.data.find(prefix => prefix.id === watchList?.title_id);
      newPrefix = i18n.language === "th"
        ? prefix?.title_th || ""
        : prefix?.title_en || "";
    }
    
    return (
      <FeedCard key={key} id={data.id} index={index}>
        <p
          className="text-center"
          style={{ ...(data.feedBackgroundColor && { backgroundColor: data.feedBackgroundColor }), color: data.feedColor }}
        >
          {`${t('text.name')} : ${!newPrefix && !watchList?.firstname && !watchList?.lastname ? "-" : `${newPrefix}${watchList?.firstname} ${watchList?.lastname}`}`}
        </p>

        <p className='bg-[#383A39] text-center'>
          {dayjs(data.epoch_end).format(i18n.language === 'th' ? 'DD-MM-BBBB HH:mm:ss' : 'DD-MM-YYYY HH:mm:ss')} | <span className='font-bold'>{`${data.similarity || 0}%`}</span>
        </p>

        {/* Checkpoint */}
        <div className='pl-[30px] col-span-2'>{`${t('text.checkpoint')}: ${data.base_camera?.camera_name || "-"}`}</div>

        {/* Images */}
        <FeedImages 
          image1={data.capture_image_url}
          image1Alt={"Detect Image"}
          image2={data.person_image_url}
          image2Alt={"Upload Image"}
          isShowOnlyImage1={watchList ? false : true}
          isFace={true}
        />

        {/* Behavior Info */}
        <div className="w-full h-full bg-[#161817]">
          <div className="h-full flex flex-col p-1 pl-3 space-y-2">
            <span className="w-full text-left">{`${t('text.behavior')} :`}</span>
            <div className="flex w-full">
              <span className="w-full text-left">{watchList?.behavior || "-"}</span>
            </div>
          </div>
        </div>
      </FeedCard>
    )
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(e);
  }

  const buildCameraOptions = (cameras: Camera[]): GroupedOption[] => {
    const lpr = cameras.filter(c => c.group === "lpr");
    const face = cameras.filter(c => c.group === "face");

    return [
      ...lpr.map(c => ({
        value: c.uid,
        label: c.camera_name,
        group: "lpr" as const,
      })),
      ...face.map(c => ({
        value: c.uid,
        label: c.camera_name,
        group: "face" as const,
      })),
    ];
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
                    <MultiGroupSelectCameras 
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
          <div className='flex items-end justify-end'>
            {
              DETAIL_INFORMATION?.FILTER_FACE_AND_LICENSE_PLATE && (
                <FormGroup row>
                  <FormControlLabel 
                    control={
                    <Checkbox 
                      checked={isShowLicensePlate} 
                      onChange={(e) => setIsShowLicensePlate(e.target.checked)}
                      sx={{
                        fontSize: 16,
                        color: "#FFFFFF",
                        "&.Mui-checked": {
                          color: "#FFFFFF",
                        },
                        "& .MuiSvgIcon-root": {
                          fontSize: 30
                        }
                      }}
                    />
                    } 
                    label={t('checkbox.license-plate')} 
                  />
                  <FormControlLabel 
                    control={
                    <Checkbox 
                      checked={isShowFace} 
                      onChange={(e) => setIsShowFace(e.target.checked)}
                      sx={{
                        fontSize: 16,
                        color: "#FFFFFF",
                        "&.Mui-checked": {
                          color: "#FFFFFF",
                        },
                        "& .MuiSvgIcon-root": {
                          fontSize: 30
                        }
                      }}
                    />
                    } 
                    label={t('checkbox.face')} 
                  />
                </FormGroup>
              )
            }
            {
              DETAIL_INFORMATION?.TOTAL_VEHICLE_COUNT && (
                <div 
                  className='flex flex-col gap-1 bg-[#384043] w-[230px] px-3 py-2'
                  style={{
                    borderRadius: "0 20px 0 20px"
                  }}
                >
                  <p className='text-[12px] text-[#CCD0CF]'>{`${t('text.start-from')} : ${
                    i18n.language === "th" ? todayMidnight.format("DD-MM-BBBB HH:mm:ss") : todayMidnight.format("DD-MM-YYYY HH:mm:ss")}`}</p>
                  <div className='flex h-[50px] justify-end items-end gap-1 text-white'>
                    <p className='text-[38px]'>{formatNumber(vehicleCount?.data?.count || 0)}<span className='text-[12px] ml-1'>{t('text.list')}</span></p>
                  </div>
                  <Divider sx={{ borderColor: "#FFFFFF", width: "100%" }} />
                  <p className='text-[15px] text-[#CCD0CF] text-center'>{t('text.current-number-detections')}</p>
                </div>
              )
            }
          </div>
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
                    const isCameraMatched = prevCameraIds.some((cam) => cam.uid === (data.detect_type === "face" ? (data as any).base_camera?.uid : data.camera_uid));
                    if (!isCameraMatched) return false;

                    const isFaceMatch = data.detect_type === "face" && isShowFace;
                    const isLprMatch = (data.detect_type === "lpr" || !data.detect_type) && isShowLicensePlate;

                    return isFaceMatch || isLprMatch;
                  })
                  .slice(0, 20) 
                  .map((data, index) => {
                    const key = data.detect_type === "face"
                                  ? `face_${data.id}`
                                  : `lpr_${(data as RealTimeLprData).id}`;

                    if (data.detect_type === "face" && isShowFace) {
                      return createFeedFaceInfo((data), index, key)
                    }
                    
                    return createFeedVehicleInfo((data as RealTimeLprData), index, key)
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

export default RealTimeMonitor;