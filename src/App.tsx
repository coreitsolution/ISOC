import './App.css';
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Nav from "./layout/nav";
import "./styles/Main.scss";
import { useRef, useEffect, useCallback } from "react";
import { useAppDispatch } from './app/hooks';
import { useSelector } from "react-redux";
import { RootState } from "./app/store";
// import { RootState } from "./app/store";
// import { useSelector } from "react-redux";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

// Screen
import Login from './modules/login/Login';
import RealTimeMonitor from './modules/real-time-monitor/RealTimeMonitor';
import SearchPlateWithCondition from './modules/search-plate-with-condition/SearchPlateWithCondition';
import SearchSuspectPerson from './modules/search-suspect-person/SearchSuspectPerson';
// import SearchPlateBeforeAfter from './modules/search-plate-before-after/SearchPlateBeforeAfter';
import ManageUser from './modules/manage-user/ManageUser';
import AddEditUser from './modules/add-edit-user/AddEditUser';
import SpecialPlateScreen from './modules/special-plate/SpecialPlate';
import UserInfo from './modules/user-info/UserInfo';
import Setting from './modules/setting/Setting';
// import ManageLog from './modules/manage-log/ManageLog';
// import UsageStatisticsGraph from './modules/usage-statistics-graph/UsageStatisticsGraph';
// import EndUser from './modules/end-user/EndUser';
// import CameraInstallationPoints from './modules/camera-installation-points/CameraInstallationPoints';
// import CameraStatus from './modules/camera-status/CameraStatus';
// import ManageCheckpointCameras from './modules/manage-checkpoint-cameras/ManageCheckpointCameras';
import SuspectPeoplePage from './modules/suspect-people/SuspectPeople';

// API
import { clearError } from './features/auth/authSlice';
import { 
  fetchAreasThunk,
  fetchProvincesThunk,
  fetchStationsThunk,
  fetchVehicleColorsThunk,
  fetchVehicleMakesThunk,
  fetchDepartmentsThunk,
  fetchOfficerPositionsThunk,
  fetchPrefixThunk,
  fetchStatusThunk,
  fetchPersonTypesThunk,
  fetchPlateTypesThunk,
  fetchRegionsThunk,
  fetchUserGroupsThunk,
  fetchGeoRegionsThunk,
  fetchStreamEncodesThunk,
  fetchVehicleBodyTypesThunk,
  fetchVehicleModelThunk,
  fetchCheckpointsThunk,
  updateLicenseExpire,
} from './features/dropdown/dropdownSlice';
import {
  fetchSpecialPlatesThunk,
} from "./features/special-plate/specialPlateSlice";
import {
  fetchSuspectPeopleThunk,
} from "./features/suspect-people/suspectPeopleSlice";
import {
  upsertRealtimeData,
  addToastMessage,
} from './features/realtime-data/realtimeDataSlice';
import { addListNotification, NotificationType, removeNotification } from "./features/notification/notificationSlice";
import { triggerCameraRefresh, triggerRequestDeleteCamera } from "./features/refresh/refreshSlice";
import {
  fetchVehicleCountThunk,
  setCameraSelected,
} from "./features/vehicle-count/VehicleCountSlice";
import {
  setMachineId
} from "./features/license-verify/licenseVerifySlice";

// Components
import AuthListener from './components/auth-listener/AuthListener';
import UpdateAlertPopup from './components/update-alert-popup/UpdateAlertPopup';
import RequestDeleteCameraAlert from './components/request-delete-camera-alert/RequestDeleteCameraAlert';
import ProtectedRoute from './components/protected-route/ProtectedRoute';
import CameraStatusPopup from './components/camera-status-popup/CameraStatusPopup';
import Watermark from "./components/watermark/WaterMark";
import LicenseExpirePopup from './components/license-expire-popup/LicenseExpirePopup';

// Config
import { getUrls } from './config/runtimeConfig';

// utils
import { getPlateTypeColor, checkSpecialPlate, getPlateClassName } from './utils/commonFunction'
import { toastChannel } from "./utils/channel";
import { useSse } from "./utils/useSse";
import { createNotificationToast } from "./utils/notification";
import { fetchClient, combineURL } from "./utils/fetchClient";
import { PopupMessage } from './utils/popupMessage';

// Types
import { 
  EventNotifyResponse, 
  EventNotify, 
  Checkpoint, 
  CameraResponse,
  MachineIdResponse,
  VerifyLicenseResponse,
} from "./features/types";

// i18n
import { useTranslation } from "react-i18next";

const PrivateRouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { CENTER_SERVER_SENT_EVENTS_URL, CENTER_SERVER_SENT_EVENTS_TOKEN, CENTER_API } = getUrls();

  // i18n
  const { t, i18n } = useTranslation();

  const { authData } = useSelector((state: RootState) => state.auth);
  const { cameraSelected } = useSelector((state: RootState) => state.vehicleCountData);

  const sliceSpecialPlate = useSelector((state: RootState) => state.specialPlateData);
  const sliceDropdown = useSelector((state: RootState) => state.dropdownData);

  // Ref
  const cameraSelectedRef = useRef<string[]>([]);
  const lastFetchRef = useRef(0);
  
  const enabled = Boolean(authData.token);

  toastChannel.onmessage = ({data}) => {
    const { id, toastId, messageId, action, data: updatedData } = data;
    if (action === "closeUpdateAlert" && toastId) {
      toast.update(toastId, {
        render: (props) => <UpdateAlertPopup {...props} data={updatedData} />,
        autoClose: 3000,
        progressClassName: "success-progress-bar",
        containerId: "notification-list-toast",
        toastId: id,
        hideProgressBar: false,
        theme: updatedData.theme,
        style: updatedData.style,
      });
    } 
    else if (action === "closeRequestDeleteCameraAlert" && id) {
      toast.update(toastId, {
        render: (props) => <RequestDeleteCameraAlert {...props} data={updatedData} />,
        autoClose: 3000,
        progressClassName: "success-progress-bar",
        containerId: "notification-list-toast",
        toastId: id,
        hideProgressBar: false,
        theme: updatedData.theme,
        style: updatedData.style,
      });
    }
    else if (action === "closeCameraStatusAlert" && id) {
      toast.update(toastId, {
        render: (props) => <CameraStatusPopup {...props} data={updatedData} />,
        autoClose: 3000,
        progressClassName: "success-progress-bar",
        containerId: "notification-list-toast",
        toastId: id,
        hideProgressBar: false,
        theme: updatedData.theme,
        style: updatedData.style,
      });
    }
    if (action === "clear-all") {
      dispatch(addListNotification([]));
      return;
    }
    dispatch(removeNotification(messageId));
  };

  useEffect(() => {
    dispatch(clearError())
    // handleLicenseExpire({
    //   id: 1,
    //   timestampUtc: new Date().toISOString(),
    // });
    if (authData && !authData.token) {
      navigate('/login', { replace: true })
    }
    else {
      dispatch(fetchAreasThunk());
      dispatch(fetchProvincesThunk(
        {
          orderBy: i18n.language === "th" ? "name_th" : "name_en",
          limit: "100"
        }
      ));
      dispatch(fetchStationsThunk());
      dispatch(fetchVehicleColorsThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchVehicleMakesThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchVehicleBodyTypesThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchVehicleModelThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchDepartmentsThunk());
      dispatch(fetchOfficerPositionsThunk());
      dispatch(fetchPrefixThunk(
        {
          orderBy: i18n.language === "th" ? "title_th" : "title_en",
          limit: "100"
        }
      ));
      dispatch(fetchStatusThunk());
      dispatch(fetchPersonTypesThunk());
      dispatch(fetchPlateTypesThunk());
      dispatch(fetchRegionsThunk(
        {
          orderBy: i18n.language === "th" ? "name_th" : "name_en",
          limit: "100"
        }
      ));
      dispatch(fetchGeoRegionsThunk(
        {
          orderBy: "id.asc",
          limit: "100"
        }
      ));
      dispatch(fetchUserGroupsThunk(
        {
          orderBy: "id.asc",
          limit: "100"
        }
      ));
      dispatch(fetchSpecialPlatesThunk(
        {
          filter: "deleted=false",
          limit: "1000"
        }
      ));
      dispatch(fetchStreamEncodesThunk());
      dispatch(fetchCheckpointsThunk({
        limit: "100"
      }));
      fetchNotification();
      dispatch(fetchSuspectPeopleThunk(
        {
          filter: "deleted=false",
          limit: "1000"
        }
      ));
      fetchCameraData();
    }
  }, [dispatch, navigate, authData]);

  useEffect(() => {
    const bc = new BroadcastChannel("specialPlateChannel");
    bc.onmessage = (event) => {
      if (event.data === "reload") {
        dispatch(fetchSpecialPlatesThunk({ filter: "deleted=false", limit: "1000" }));
      }
    };
    return () => bc.close();
  }, [dispatch]);

  useEffect(() => {
    if (enabled) {
      fetchMachineId();
    }
  }, [sliceDropdown.checkpoints, enabled])

  useEffect(() => {
    cameraSelectedRef.current = cameraSelected;
  }, [cameraSelected]);

  const fetchMachineId = async () => {
    try {
      const res = await fetchClient<MachineIdResponse>(combineURL(CENTER_API, "/checkpoints/machine-id"), {
        method: "GET",
      });

      if (res.success) {
        dispatch(setMachineId(res.machineId));
        sliceDropdown?.checkpoints?.data.forEach(async (checkpoint) => {
          await checkVerifyLicense(
            checkpoint.uid,
            res.machineId,
            checkpoint.serial_number,
            checkpoint.license_key
          );
        });
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
  }

  const checkVerifyLicense = async (checkpointUid: string, machineId: string, serialNumber: string, licenseKey: string) => {
    try {
      const body = {
        machineId: machineId,
        serialNumber: serialNumber,
        licenseKey: licenseKey,
      };
      const res = await fetchClient<VerifyLicenseResponse>(combineURL(CENTER_API, "/checkpoints/verify-license"), {
        method: "POST",
        body: JSON.stringify(body),
      });

      let isLicenseExpire = true;

      if (res.success) {
        isLicenseExpire = false;
      }

      dispatch(updateLicenseExpire({
        checkpointUid: checkpointUid,
        machineId: machineId,
        isLicenseExpire: isLicenseExpire,
      }));
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
  }

  const fetchCameraData = async () => {
    try {
      const res = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
        method: "GET",
        queryParams: {
          filter: `deleted=false`,
          limit: "1000",
        },
      });

      if (res.success) {
        dispatch(setCameraSelected(res.data.length > 0 ? res.data.map((c) => c.uid) : []));
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
  };

  const createCameraNotification = async (cameraData: any) => {
    const isOnline = cameraData.current_status.toString().toLowerCase() === "online" ? true : false;
    const type: NotificationType = isOnline
      ? "cameraOnline"
      : "cameraOffline"

    createNotificationToast({
      dispatch,
      component: CameraStatusPopup,
      theme: "dark",
      type,
      title: isOnline ? "alert.camera-online" : "alert.camera-offline",
      content: isOnline
        ? [cameraData.camera_name, cameraData.camera_ip]
        : [
            "alert.camera-offline-content-2",
            cameraData.camera_name,
            cameraData.camera_ip,
          ],
      isOnline,
      messageId: `${cameraData.event_id}_${cameraData.timestamp}`,
      style: { 
        minHeight: isOnline ? "220px" : "250px",
        maxHeight: isOnline ? "220px" : "250px",
      },
      closeAction: "closeCameraStatusAlert",
      id: cameraData.event_id
    });
  };

  const handleRealtimeMessage = useCallback(async (message: any) => {   
    dispatch(upsertRealtimeData({
      ...message,
      detect_type: "lpr",
    }));
    const now = Date.now();

    if (now - lastFetchRef.current > 1000) {
      lastFetchRef.current = now;

      const uids = cameraSelectedRef.current;

      if (uids.length > 0) {
        dispatch(fetchVehicleCountThunk({
          cameraUids: uids.join(","),
          _t: now.toString()
        }));
      }
    }

    if (!message.is_special_plate) return;

    const specialPlateName = await getPlateClassName(message.special_plate_id, sliceDropdown.plateTypes);

    const specialPlateData = await checkSpecialPlate(message.special_plate_uid, sliceSpecialPlate.specialPlates);
    
    const { backgroundColor, title, pinBackgroundColor, showAlert, textShadow } = await getPlateTypeColor(specialPlateName);
    
    if (!showAlert) return; 

    const isBlacklist = specialPlateName.toLowerCase() === "blacklist";

    const updatedData = {
      ...message,
      plate_class_name: specialPlateName,
      special_plate_remark: specialPlateData?.behavior || "-",
      special_plate_owner_name: specialPlateData?.case_owner_name || "-",
      special_plate_owner_agency: specialPlateData?.case_owner_agency || "-",
      title_name: title,
      color: isBlacklist ? backgroundColor : "#FDCC0A",
      pin_background_color: isBlacklist ? pinBackgroundColor : "#FDCC0A",
      text_shadow: textShadow,
    }
    dispatch(addToastMessage(updatedData));
  }, [dispatch, sliceDropdown.plateTypes, sliceSpecialPlate.specialPlates]);

  const handleCheckpointDataMessage = (message: Checkpoint) => {
    createNotificationToast({
      dispatch,
      type: "newCheckpoint",
      component: UpdateAlertPopup,
      title: "alert.new-checkpoint-update",
      content: "alert.new-checkpoint-update-content",
      variables: { checkpointName: message.checkpoint_name || "-" },
      messageId: message.created_at,
      style: { minHeight: "108px", maxHeight: "108px" },
      updateAction: () => dispatch(triggerCameraRefresh()),
      id: message.id
    });
  };

  const handleCameraDataMessage = (message: any) => {
    createNotificationToast({
      dispatch,
      type: "newCamera",
      component: UpdateAlertPopup,
      title: "alert.new-camera-update",
      content: "alert.new-camera-update-content",
      variables: { cameraName: message.camera_name || "-" },
      messageId: message.timestampUtc,
      style: { minHeight: "108px", maxHeight: "108px" },
      updateAction: () => dispatch(triggerCameraRefresh()),
      id: message.id
    });
  };

  const listener = (message: any) => {
    const isUpdatePage = location.pathname.includes('/manage-checkpoint-cameras');

    createNotificationToast({
      dispatch,
      type: "requestDelete",
      component: RequestDeleteCameraAlert,
      theme: "light",
      content: "alert.request-delete-camera-content",
      variables: { number: message.data.all_request_count + 1 },
      messageId: message.timestampUtc,
      style: {
        paddingTop: "45px",
        minHeight: "161px",
        maxHeight: "161px",
      },
      updateAction: () => {
        if (isUpdatePage) dispatch(triggerRequestDeleteCamera());
        else navigate("/center/manage-checkpoint-cameras", { replace: true });
      },
      closeAction: "closeRequestDeleteCameraAlert",
      id: message.id
    });
  };

  const handleLicenseExpire = (message: any) => {
    createNotificationToast({
      dispatch,
      type: "licenseExpire",
      component: LicenseExpirePopup,
      content: t("text.license-expire"),
      messageId: message.timestampUtc,
      style: {
        minHeight: "130px",
        maxHeight: "130px",
      },
      closeAction: "closeRequestDeleteCameraAlert",
      id: message.id
    });
  }

  const fetchNotification = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<EventNotifyResponse>(combineURL(CENTER_API, "/event-notify/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          page: "1",
          limit: "100",
          filter: `is_confirm=false,event_timestamp>=${dayjs(authData.userInfo?.created_at).toISOString()}`,
          orderBy: "id.desc"
        }
      })

      if (response.success) {
        const data = response.data.map((row: EventNotify) => {
          const isOnline = row.data.current_status.toString().toLowerCase() === "online" ? true : false;
          const type: NotificationType = isOnline
              ? "cameraOnline"
              : "cameraOffline"
          
          return {
            id: row.id,
            theme: "dark" as "dark",
            userId: "",
            type,
            title: isOnline ? "alert.camera-online" : "alert.camera-offline",
            content: isOnline
              ? [row.data.camera_name, row.data.camera_ip]
              : [
                  "alert.camera-offline-content-2",
                  row.data.camera_name,
                  row.data.camera_ip,
                ],
            isOnline,
            messageId: `${row.id}_${row.event_timestamp}`,
            closeAction: "closeCameraStatusAlert",
            style: { 
              minHeight: isOnline ? "220px" : "250px",
              maxHeight: isOnline ? "220px" : "250px",
            },
          }
        });

        dispatch(
          addListNotification(data)
        );
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(errorMessage)
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  useSse(
    CENTER_SERVER_SENT_EVENTS_URL,
    CENTER_SERVER_SENT_EVENTS_TOKEN,
    "lpr_data_event",
    handleRealtimeMessage,
    enabled
  );

  useSse(
    CENTER_SERVER_SENT_EVENTS_URL,
    CENTER_SERVER_SENT_EVENTS_TOKEN,
    "camera_status_event",
    createCameraNotification,
    enabled,
    false
  );

  useSse(
    CENTER_SERVER_SENT_EVENTS_URL,
    CENTER_SERVER_SENT_EVENTS_TOKEN,
    "camera-data",
    handleCheckpointDataMessage,
    enabled,
  );

  useSse(
    CENTER_SERVER_SENT_EVENTS_URL,
    CENTER_SERVER_SENT_EVENTS_TOKEN,
    "checkpoint-data",
    handleCameraDataMessage,
    enabled,
  );

  useSse(
    CENTER_SERVER_SENT_EVENTS_URL,
    CENTER_SERVER_SENT_EVENTS_TOKEN,
    "delete-camera-request",
    listener,
    enabled,
  );

  return <>{children}</>;
}

function Layout() {
  return (
    <>
      <ToastContainer 
        containerId="notification-list-toast"
        position="top-right"
        newestOnTop={true}
        style={{ 
          top: '70px', 
          right: '10px',
          width: '400px',
          minHeight: '90vh',
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        closeButton={true}
        pauseOnFocusLoss={false}
      />
      <Nav />
      <Outlet />
    </>
  )
}

function App() {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const { authData } = useSelector((state: RootState) => state.auth);
  const { checkpoints } = useSelector((state: RootState) => state.dropdownData);
  
  // i18n
  const { t } = useTranslation();

  return (
    <div ref={constraintsRef} className='min-h-screen min-w-screen'>
      <AuthListener />
      {
        (authData && checkpoints?.data.every(checkpoint => checkpoint.is_license_expire)) && <Watermark text={t("text.license-expire")} />
      }
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
          <PrivateRouteWrapper>
            <Layout />
          </PrivateRouteWrapper>
          }
        >
          <Route path='center/real-time-monitor' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
              ? authData.userInfo.permissions.center.realtime.select
              : undefined
              }
            >
              <RealTimeMonitor />
            </ProtectedRoute>
          } />
          <Route path='center/search-plate-with-condition' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.conditionSearch.select
                : undefined
              }
            >
              <SearchPlateWithCondition />
            </ProtectedRoute>
          }></Route>
          <Route path='center/manage-user' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.manageUser.select
                : undefined
              }
            >
              <ManageUser />
            </ProtectedRoute>
          }></Route>
          <Route path="center/special-plate" element={
            <ProtectedRoute
              permission={authData?.userInfo?.permissions
              ? authData.userInfo.permissions.center.specialPlateManage.select
              : undefined
              }
            >
              <SpecialPlateScreen />
            </ProtectedRoute>
          } />
          <Route path="center/suspect-people" element={
            <ProtectedRoute
              permission={authData?.userInfo?.permissions
              ? authData.userInfo.permissions.center.suspectPersonManage.select
              : undefined
              }
            >
              <SuspectPeoplePage />
            </ProtectedRoute>
          } />
          <Route path="center/search-suspect-people" element={
            <ProtectedRoute
              permission={authData?.userInfo?.permissions
              ? authData.userInfo.permissions.center.suspectPersonSearch.select
              : undefined
              }
            >
              <SearchSuspectPerson />
            </ProtectedRoute>
          } />
          <Route path='center/manage-user/add-edit-user' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.manageUser.select
                : undefined
              }
            >
              <AddEditUser />
            </ProtectedRoute>
          }></Route>
          <Route path='center/user-info' element={
            <UserInfo />
          }></Route>
          <Route path='center/setting' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.setting.select
                : undefined
              }
            >
              <Setting />
            </ProtectedRoute>
          }></Route>
          {/*  
            <Route path='center/manage-checkpoint-cameras' element={
              <ProtectedRoute 
                permission={
                  authData?.userInfo?.permissions
                  ? authData.userInfo.permissions.center?.manageCheckpointCameras?.select
                  : undefined
                }>
                <ManageCheckpointCameras />
              </ProtectedRoute>
            }></Route>
          */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
