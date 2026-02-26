// Types
import { Region} from "../dropdown/dropdownTypes";
import { RealTimeLprData, Pagination, WatchListImageData } from "../types";

export interface FilterRealTimeBody {
  checkpointId: number
  checkpointName: string
}

export interface RealTimeLprDataResponse {
  message?: string
  status?: string
  success?: string
  countAll?: number
  filteredCount?: number
  data?: RealTimeLprData[]
}

export interface PlateSearchResponse {
  message?: string
  status?: string
  success?: string
  countAll?: number
  filteredCount?: number
  data?: PlateSearch[]
}

export interface PlateSearch {
  id: number
  isCompare?: boolean
  plateGroupNumber: string
  plateCharacter: string
  plateProvince: string
  plateProvinceId: number
  plate: string
  vehicleImage: string
  plateImage: string
  vehicleRouteList: VehicleRoute[]
  dateTimeRange: string
  vehicleMake: string
  vehicleMakeId: number
  vehicleColor: string
  vehicleColorId: number
  vehicleType: string
  vehicleModel: string
  ownerName: string
  ownerNationalId: string
  ownerAddress: string
  ownershipName: string
  ownershipNationalId: string
  ownershipAddress: string
  remark: string
}

export interface VehicleRoute {
  id: number
  vehicleRoute: string
  dateTime: string
  lat: string
  lon: string
  order?: number
}

export interface FileData {
  title: string
  url: string
}

export interface FileDataResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: FileData[];
}

export interface SuspectPersonSearch {
  id: number;
  uid: string;
  checkpoint_uid: string | null;
  dss_orgcode: string | null;
  dss_person_id: string | null;
  title_id: number | null;
  title_name?: string;
  firstname: string;
  lastname: string;
  idcard_number: string | null;
  image_url: string | null;
  address: string | null;
  province_code: string | null;
  district_code: string | null;
  subdistrict_code: string | null;
  zipcode: string | null;
  person_class_id: number | null;
  person_class?: string;
  case_number: string | null;
  images: WatchListImageData[];
  files: any[];
  arrest_warrant_date: string | null;
  arrest_warrant_expire_date: string | null;
  behavior: string | null;
  case_owner_name: string | null;
  case_owner_agency: string | null;
  case_owner_phone: string | null;
  sync_state: "pending" | "success" | "failed" | string;
  sync_date: string | null;
  visible: boolean;
  active: boolean;
  deleted: boolean;
  deleted_by_uid: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  dss_data: DSSData[];
  dss_error: DSSError | null;
}

export interface DSSData {
  id: string;
  age: string | null;
  gender: string | null;
  similarity: string | null;
  captureTime: string;
  channelId: string;
  channelName: string;
  eventCode: string;
  personId: string | null;
  personName: string | null;
  personSimilarity: string | null;
  faceBase64: string | null;
  pictureBase64: string | null;
  faceImageUrl: string | null;
  pictureUrl: string | null;
  recordSource: string | null;
  baseCamera: FaceCamera;
}

export interface FaceCamera {
  id: number;
  uid: string;
  camera_name: string;
  camera_ip: string;
  camera_type: string;
  channel_id: string;
  center_uid: string;
  checkpoint_uid: string | null;
  province_code: string | null;
  district_code: string | null;
  subdistrict_code: string | null;
  latitude: number | null;
  longitude: number | null;
  rtsp_url: string | null;
  live_stream_url: string | null;
  visible: boolean;
  active: boolean;
  alive: boolean;
  last_online: string | null;
  last_check: string | null;
  created_at: string;
  updated_at: string;
}

export interface DSSError {
  code: number;
  data: any;
  desc: string;
}

export interface VehicleModelDetail {
  id: number;
  make_id: number;
  make_name: string;
  model: string;
  model_en: string;
  model_th: string;
  visible: boolean;
  active: boolean;
}

export interface VehicleMakeDetail {
  id: number;
  make_id: number;
  make_en: string;
  make_th: string;
  visible: boolean;
  active: boolean;
}

export interface VehicleColorDetail {
  id: number;
  color_id: number;
  color_en: string;
  color_th: string;
  visible: boolean;
  active: boolean;
}

export interface VehicleBodyTypeDetail {
  id: number;
  body_type: number;
  body_type_en: string;
  body_type_th: string;
  details: string;
  visible: boolean;
  active: boolean;
}

export interface CheckpointInfo {
  checkpoint_name: string;
}

export interface SearchPlateCondition {
  id: string;
  ref_id: string;
  camera_uid: string;
  camera_name: string;
  plate: string;
  plate_prefix: string;
  plate_number: string;
  region_code: string;
  region: Region;
  epoch_end: string;
  overview_image_url: string;
  vehicle_image_url: string;
  plate_image_url: string;
  remark: string;
  vehicle_make: string;
  vehicle_make_details: VehicleMakeDetail;
  vehicle_model: string;
  vehicle_model_details: VehicleModelDetail;
  vehicle_color: string;
  vehicle_color_details: VehicleColorDetail;
  vehicle_body_type: string;
  vehicle_body_type_details: VehicleBodyTypeDetail;
  ownerName: string;
  ownerNationalId: string;
  ownerAddress: string;
  ownershipName: string;
  ownershipNationalId: string;
  ownershipAddress: string;
  is_special_plate: number,
  special_plate_id: number | null,
  special_plate_uid: string;
  checkpoint: CheckpointInfo;
  plate_class_en: string;
  plate_class_th: string;
  behavior: string,
  isBlackList?: boolean,
  special_plate_name?: string;
  plateRoute?: PlateRoute[];
  currentRoute?: Route;
  province?: string;
  district?: string;
  subDistrict?: string;
}

export interface SearchPlateConditionResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: SearchPlateCondition[];
}

export interface Route {
  epoch_end: string;
  camera_name: string;
  latitude: string;
  longitude: string;
  checkpoint_name: string;
}

export interface PlateRoute {
  plate: string;
  region_code: string;
  routes: Route[];
}

export interface PlateRouteResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: PlateRoute[];
}

export interface SuspectPersonSearchResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: SuspectPersonSearch[];
}

export interface MultiDetectData {
  id: string;
  capture_time: string;
  channel_id: string;
  object_type: string;
  camera_name: string | null;
  details: MultiDetectDetail;
  image_url: string;
  picture_url: string; // Overview
  created_at: string;
}

export interface MultiDetectDetail {
  // Human
  gender?: string | null;
  age?: number | null;
  bag?: string | null;
  bag_type?: string | null;
  coat?: string | null;
  coat_color?: string | null;
  trousers?: string | null;
  trousers_color?: string | null;
  beard?: string | null;
  hat?: string | null;
  hat_type?: string | null;
  mask?: string | null;
  glasses?: string | null;
  emotion?: string | null;
  // Vehicle
  car_brand?: string;
  car_color?: string;
  car_type?: string;
  plate?: string;
}

export interface MultiDetectDataResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: MultiDetectData[];
}