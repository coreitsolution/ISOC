// Types
import { DetectDropdown } from "../features/types";

// Icons
import UnknownIcon from "../assets/svg/unknown.svg?react";
import MaleIcon from "../assets/svg/male.svg?react";
import FemaleIcon from "../assets/svg/female.svg?react";
import LongSleeveIcon from "../assets/svg/long-sleeve.svg?react";
import ShortSleeveIcon from "../assets/svg/short-sleeve.svg?react";
import SleevelessIcon from "../assets/svg/sleeveless.svg?react";
import PantsIcon from "../assets/svg/trousers.svg?react";
import ShortsIcon from "../assets/svg/shorts.svg?react";
import SkirtIcon from "../assets/svg/skirt.svg?react";
import WearingHatIcon from "../assets/svg/man-with-hat.svg?react";
import NotWearingHatIcon from "../assets/svg/man-without-hat.svg?react";
import NoHatIcon from "../assets/svg/no-hat.svg?react";
import HatIcon from "../assets/svg/wear-hat.svg?react";
import HelmetIcon from "../assets/svg/helmet.svg?react";
import SafetyHelmetIcon from "../assets/svg/safety-helmet.svg?react";
import WearBagIcon from "../assets/svg/wear-bag.svg?react";
import NoLuggageIcon from "../assets/svg/no-luggage.svg?react";
import HandBagIcon from "../assets/svg/handbag.svg?react";
import ShoulderBagIcon from "../assets/svg/shoulder-bag.svg?react";
import BackpackIcon from "../assets/svg/backpack.svg?react";
import SuitcaseIcon from "../assets/svg/suitcase.svg?react";
import WaistBagIcon from "../assets/svg/waist-bag.svg?react";
import NoBagIcon from "../assets/svg/no-bag.svg?react";
import SmilingIcon from "../assets/svg/smiling.svg?react";
import AngryIcon from "../assets/svg/angry.svg?react";
import SadIcon from "../assets/svg/sad.svg?react";
import DisgustedIcon from "../assets/svg/disgusted.svg?react";
import ScaredIcon from "../assets/svg/scared.svg?react";
import SurprisedIcon from "../assets/svg/surprised.svg?react";
import NormalIcon from "../assets/svg/normal.svg?react";
import LaughingIcon from "../assets/svg/laughing.svg?react";
import HappyIcon from "../assets/svg/happy.svg?react";
import ConfusedIcon from "../assets/svg/confused.svg?react";
import ScreamingIcon from "../assets/svg/screaming.svg?react";
import NoIcon from "../assets/svg/no.svg?react";
import NormalGlassesIcon from "../assets/svg/normal-glasses.svg?react";
import NoGlassesIcon from "../assets/svg/no-glasses.svg?react";
import SunglassesIcon from "../assets/svg/sunglasses.svg?react";
import BeardIcon from "../assets/svg/have-beard.svg?react";
import NoBeardIcon from "../assets/svg/no-beard.svg?react";
import MaskedIcon from "../assets/svg/masked.svg?react";
import FaceMaskOffIcon from "../assets/svg/face-mask-off.svg?react";

export const PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES = [20, 50, 100];
export const PLATE_SEARCH_BEFORE_AFTER_ROW_PER_PAGES = [20, 50, 100];
export const SUSPECT_PERSON_SEARCH_ROW_PER_PAGES = [20, 50, 100];
export const SPECIAL_PLATE_ROW_PER_PAGES = [20, 50, 100];
export const SUSPECT_PEOPLE_ROW_PER_PAGES = [20, 50, 100];
export const MANAGE_USER_ROW_PER_PAGES = [20, 50, 100];
export const MANAGE_LOG_ROW_PER_PAGES = [20, 50, 100];
export const USAGE_STATISTICS_GRAPH_ROW_PER_PAGES = [20, 50, 100];
export const SETTING_ROW_PER_PAGES = [20, 50, 100];
export const MANAGE_CHECKPOINT_CAMERAS_ROW_PER_PAGES = [20, 50, 100];
export const SEARCH_MULTI_DETECT_ROW_PER_PAGES = [20, 50, 100];

export const AGE: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "0-10 ปี", text_en: "0-10 years", value: "min_0:max_10" },
  { id: 3, text_th: "11-20 ปี", text_en: "11-20 years", value: "min_11:max_20" },
  { id: 4, text_th: "21-30 ปี", text_en: "21-30 years", value: "min_21:max_30" },
  { id: 5, text_th: "31-40 ปี", text_en: "31-40 years", value: "min_31:max_40" },
  { id: 6, text_th: "41-50 ปี", text_en: "41-50 years", value: "min_41:max_50" },
  { id: 7, text_th: "51-60 ปี", text_en: "51-60 years", value: "min_51:max_60" },
  { id: 8, text_th: "61-70 ปี", text_en: "61-70 years", value: "min_61:max_70" },
  { id: 9, text_th: "71-80 ปี", text_en: "71-80 years", value: "min_71:max_80" },
  { id: 10, text_th: "81-90 ปี", text_en: "81-90 years", value: "min_81:max_90" },
  { id: 11, text_th: "91-100 ปี", text_en: "91-100 years", value: "min_91:max_100" },
  { id: 12, text_th: "100+ ปี", text_en: "100+ years", value: "min_101" },
]

export const GENDER: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "ชาย", text_en: "male", value: "1", iconButton: MaleIcon },
  { id: 3, text_th: "หญิง", text_en: "female", value: "2", iconButton: FemaleIcon },
  { id: 4, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
]

export const COAT: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "แขนยาว", text_en: "long sleeve", value: "1", iconButton: LongSleeveIcon },
  { id: 3, text_th: "แขนสั้น", text_en: "short sleeve", value: "2", iconButton: ShortSleeveIcon },
  { id: 4, text_th: "แขนกุด", text_en: "sleeveless", value: "3", iconButton: SleevelessIcon },
  { id: 5, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
]

export const COAT_COLORS: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "สีขาว", text_en: "white", value: "1" },
  { id: 3, text_th: "สีส้ม", text_en: "orange", value: "2" },
  { id: 4, text_th: "สีชมพู", text_en: "pink", value: "3" },
  { id: 5, text_th: "สีดำ", text_en: "black", value: "4" },
  { id: 6, text_th: "สีแดง", text_en: "red", value: "5" },
  { id: 7, text_th: "สีเหลือง", text_en: "yellow", value: "6" },
  { id: 8, text_th: "สีเทา", text_en: "gray", value: "7" },
  { id: 9, text_th: "สีน้ำเงิน", text_en: "blue", value: "8" },
  { id: 10, text_th: "สีเขียว", text_en: "green", value: "9" },
  { id: 11, text_th: "สีม่วง", text_en: "purple", value: "10" },
  { id: 12, text_th: "สีน้ำตาล", text_en: "brown", value: "11" },
  { id: 13, text_th: "สีเงิน", text_en: "silver", value: "12" },
  { id: 14, text_th: "สีทอง", text_en: "gold", value: "13" },
  { id: 15, text_th: "ไม่ระบุ", text_en: "unknown", value: "0" },
];

export const TROUSER: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "กางเกงขายาว", text_en: "pants", value: "1", iconButton: PantsIcon },
  { id: 3, text_th: "กางเกงขาสั้น", text_en: "shorts", value: "2", iconButton: ShortsIcon },
  { id: 4, text_th: "กระโปรง", text_en: "skirt", value: "3", iconButton: SkirtIcon },
  { id: 5, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
];

export const TROUSER_COLORS: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "สีขาว", text_en: "white", value: "1" },
  { id: 3, text_th: "สีส้ม", text_en: "orange", value: "2" },
  { id: 4, text_th: "สีชมพู", text_en: "pink", value: "3" },
  { id: 5, text_th: "สีดำ", text_en: "black", value: "4" },
  { id: 6, text_th: "สีแดง", text_en: "red", value: "5" },
  { id: 7, text_th: "สีเหลือง", text_en: "yellow", value: "6" },
  { id: 8, text_th: "สีเทา", text_en: "gray", value: "7" },
  { id: 9, text_th: "สีน้ำเงิน", text_en: "blue", value: "8" },
  { id: 10, text_th: "สีเขียว", text_en: "green", value: "9" },
  { id: 11, text_th: "สีม่วง", text_en: "purple", value: "10" },
  { id: 12, text_th: "สีน้ำตาล", text_en: "brown", value: "11" },
  { id: 13, text_th: "สีเงิน", text_en: "silver", value: "12" },
  { id: 14, text_th: "สีทอง", text_en: "gold", value: "13" },
  { id: 15, text_th: "สีเขียว", text_en: "green", value: "14" },
  { id: 16, text_th: "ไม่ระบุ", text_en: "unknown", value: "0" },
];

export const HAT: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "ไม่สวมหมวก", text_en: "no", value: "1", iconButton: NotWearingHatIcon },
  { id: 3, text_th: "สวมหมวก", text_en: "bands", value: "2", iconButton: WearingHatIcon },
  { id: 4, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
];

export const HAT_TYPE: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "หมวกทั่วไป", text_en: "normal hat", value: "1", iconButton: HatIcon },
  { id: 3, text_th: "หมวกกันน็อค", text_en: "helmet", value: "2", iconButton: HelmetIcon },
  { id: 4, text_th: "หมวกเซฟตี้", text_en: "safety helmet", value: "3", iconButton: SafetyHelmetIcon },
  { id: 5, text_th: "ไม่สวมหมวก", text_en: "no hat", value: "10", iconButton: NoHatIcon },
  { id: 6, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
];

export const BAG: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "ไม่มีสัมภาระ", text_en: "no package", value: "1", iconButton: NoLuggageIcon },
  { id: 3, text_th: "มีสัมภาระ", text_en: "with package", value: "2", iconButton: WearBagIcon },
  { id: 4, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
];

export const BAG_TYPE: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "กระเป๋าถือ", text_en: "handbag", value: "1", iconButton: HandBagIcon },
  { id: 3, text_th: "กระเป๋าสะพายไหล่", text_en: "shoulder bag", value: "2", iconButton: ShoulderBagIcon },
  { id: 4, text_th: "กระเป๋าเป้", text_en: "backpack", value: "3", iconButton: BackpackIcon },
  { id: 5, text_th: "กระเป๋าเดินทาง (ล้อลาก)", text_en: "trolley case", value: "4", iconButton: SuitcaseIcon },
  { id: 6, text_th: "กระเป๋าคาดเอว", text_en: "waist bag", value: "5", iconButton: WaistBagIcon },
  { id: 7, text_th: "ไม่มีกระเป๋า", text_en: "no bag", value: "6", iconButton: NoBagIcon },
  { id: 8, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
];

export const EMOTION: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "ยิ้ม", text_en: "smiling", value: "0", iconButton: SmilingIcon },
  { id: 3, text_th: "โกรธ", text_en: "angry", value: "1", iconButton: AngryIcon },
  { id: 4, text_th: "เศร้า", text_en: "sad", value: "2", iconButton: SadIcon },
  { id: 5, text_th: "รังเกียจ", text_en: "disgusted", value: "3", iconButton: DisgustedIcon },
  { id: 6, text_th: "กลัว", text_en: "feared", value: "4", iconButton: ScaredIcon },
  { id: 7, text_th: "ตกใจ", text_en: "surprised", value: "5", iconButton: SurprisedIcon },
  { id: 8, text_th: "ปกติ", text_en: "normal", value: "6", iconButton: NormalIcon },
  { id: 9, text_th: "หัวเราะ", text_en: "laughing", value: "7", iconButton: LaughingIcon },
  { id: 10, text_th: "มีความสุข", text_en: "happy", value: "8", iconButton: HappyIcon },
  { id: 11, text_th: "สับสน", text_en: "confused", value: "9", iconButton: ConfusedIcon },
  { id: 12, text_th: "กรีดร้อง", text_en: "screaming", value: "10", iconButton: ScreamingIcon },
  { id: 13, text_th: "ไม่ทราบ", text_en: "unknown", value: "unknown", iconButton: NoIcon },
  { id: 14, text_th: "ไม่สามารถระบุได้", text_en: "unrecognized", value: "999", iconButton: UnknownIcon },
];

export const GLASSES: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "ไม่สวมแว่น", text_en: "no", value: "0", iconButton: NoGlassesIcon },
  { id: 3, text_th: "แว่นสายตา", text_en: "glasses", value: "1", iconButton: NormalGlassesIcon },
  { id: 4, text_th: "แว่นกันแดด", text_en: "sunglasses", value: "2", iconButton: SunglassesIcon },
  { id: 5, text_th: "ไม่ระบุ", text_en: "unknown", value: "-1", iconButton: NoIcon },
];

export const BEARD: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "ไม่มีหนวดเครา", text_en: "no beard", value: "2", iconButton: NoBeardIcon },
  { id: 3, text_th: "มีหนวดเครา", text_en: "with beard", value: "3", iconButton: BeardIcon },
  { id: 4, text_th: "ไม่สามารถระบุได้", text_en: "unrecognized", value: "1", iconButton: UnknownIcon },
  { id: 5, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
];

export const MASK: DetectDropdown[] = [
  { id: 1, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 2, text_th: "ไม่สวมหน้ากาก", text_en: "no mask", value: "2", iconButton: FaceMaskOffIcon },
  { id: 3, text_th: "สวมหน้ากาก", text_en: "wearing mask", value: "3", iconButton: MaskedIcon },
  { id: 4, text_th: "ไม่สามารถระบุได้", text_en: "unrecognized", value: "1", iconButton: UnknownIcon },
  { id: 5, text_th: "ไม่ระบุ", text_en: "unknown", value: "0", iconButton: NoIcon },
];

export const VEHICLE_MAKE: DetectDropdown[] = [
  {
    "id": 1,
    "text_th": "ทั้งหมด",
    "text_en": "all",
    "value": "all"
  },
  {
    "id": 2,
    "text_th": "Audi",
    "text_en": "Audi",
    "value": "1"
  },
  {
    "id": 3,
    "text_th": "Honda",
    "text_en": "Honda",
    "value": "2"
  },
  {
    "id": 4,
    "text_th": "Buick",
    "text_en": "Buick",
    "value": "3"
  },
  {
    "id": 5,
    "text_th": "Volkswagen",
    "text_en": "Volkswagen",
    "value": "4"
  },
  {
    "id": 6,
    "text_th": "Toyota",
    "text_en": "Toyota",
    "value": "5"
  },
  {
    "id": 7,
    "text_th": "BMW",
    "text_en": "BMW",
    "value": "6"
  },
  {
    "id": 8,
    "text_th": "Peugeot",
    "text_en": "Peugeot",
    "value": "7"
  },
  {
    "id": 9,
    "text_th": "Ford",
    "text_en": "Ford",
    "value": "8"
  },
  {
    "id": 10,
    "text_th": "Mazda",
    "text_en": "Mazda",
    "value": "9"
  },
  {
    "id": 11,
    "text_th": "Nissan",
    "text_en": "Nissan",
    "value": "10"
  },
  {
    "id": 12,
    "text_th": "Hyundai",
    "text_en": "Hyundai",
    "value": "11"
  },
  {
    "id": 13,
    "text_th": "Suzuki",
    "text_en": "Suzuki",
    "value": "12"
  },
  {
    "id": 14,
    "text_th": "Citroën",
    "text_en": "Citroën",
    "value": "13"
  },
  {
    "id": 15,
    "text_th": "Mercedes-Benz",
    "text_en": "Mercedes-Benz",
    "value": "14"
  },
  {
    "id": 16,
    "text_th": "BYD",
    "text_en": "BYD",
    "value": "15"
  },
  {
    "id": 17,
    "text_th": "Geely",
    "text_en": "Geely",
    "value": "16"
  },
  {
    "id": 18,
    "text_th": "Leapmotor",
    "text_en": "Leapmotor",
    "value": "372"
  },
  {
    "id": 19,
    "text_th": "Lexus",
    "text_en": "Lexus",
    "value": "17"
  },
  {
    "id": 20,
    "text_th": "Chevrolet",
    "text_en": "Chevrolet",
    "value": "18"
  },
  {
    "id": 21,
    "text_th": "Chery",
    "text_en": "Chery",
    "value": "19"
  },
  {
    "id": 22,
    "text_th": "Kia",
    "text_en": "Kia",
    "value": "20"
  },
  {
    "id": 23,
    "text_th": "Xiali",
    "text_en": "Xiali",
    "value": "21"
  },
  {
    "id": 24,
    "text_th": "Dongfeng",
    "text_en": "Dongfeng",
    "value": "22"
  },
  {
    "id": 25,
    "text_th": "Iveco",
    "text_en": "Iveco",
    "value": "23"
  },
  {
    "id": 26,
    "text_th": "Wuling",
    "text_en": "Wuling",
    "value": "24"
  },
  {
    "id": 27,
    "text_th": "JinBei",
    "text_en": "JinBei",
    "value": "25"
  },
  {
    "id": 28,
    "text_th": "Porsche",
    "text_en": "Porsche",
    "value": "26"
  },
  {
    "id": 29,
    "text_th": "Ferrari",
    "text_en": "Ferrari",
    "value": "27"
  },
  {
    "id": 30,
    "text_th": "Lamborghini",
    "text_en": "Lamborghini",
    "value": "28"
  },
  {
    "id": 31,
    "text_th": "JAC",
    "text_en": "JAC",
    "value": "29"
  },
  {
    "id": 32,
    "text_th": "Changan",
    "text_en": "Changan",
    "value": "30"
  },
  {
    "id": 33,
    "text_th": "Great Wall",
    "text_en": "Great Wall",
    "value": "31"
  },
  {
    "id": 34,
    "text_th": "Škoda",
    "text_en": "Škoda",
    "value": "32"
  },
  {
    "id": 35,
    "text_th": "Baojun",
    "text_en": "Baojun",
    "value": "33"
  },
  {
    "id": 36,
    "text_th": "Subaru",
    "text_en": "Subaru",
    "value": "34"
  },
  {
    "id": 37,
    "text_th": "Landwind",
    "text_en": "Landwind",
    "value": "35"
  },
  {
    "id": 38,
    "text_th": "Luxgen",
    "text_en": "Luxgen",
    "value": "36"
  },
  {
    "id": 39,
    "text_th": "Renault",
    "text_en": "Renault",
    "value": "37"
  },
  {
    "id": 40,
    "text_th": "Mitsubishi",
    "text_en": "Mitsubishi",
    "value": "38"
  },
  {
    "id": 41,
    "text_th": "Roewe",
    "text_en": "Roewe",
    "value": "39"
  },
  {
    "id": 42,
    "text_th": "Cadillac",
    "text_en": "Cadillac",
    "value": "40"
  },
  {
    "id": 43,
    "text_th": "MG",
    "text_en": "MG",
    "value": "41"
  },
  {
    "id": 44,
    "text_th": "Zotye",
    "text_en": "Zotye",
    "value": "42"
  },
  {
    "id": 45,
    "text_th": "CMC",
    "text_en": "CMC",
    "value": "43"
  },
  {
    "id": 46,
    "text_th": "Foton",
    "text_en": "Foton",
    "value": "44"
  },
  {
    "id": 47,
    "text_th": "Songhuajiang",
    "text_en": "Songhuajiang",
    "value": "45"
  },
  {
    "id": 48,
    "text_th": "Opel",
    "text_en": "Opel",
    "value": "46"
  },
  {
    "id": 49,
    "text_th": "Hongqi",
    "text_en": "Hongqi",
    "value": "47"
  },
  {
    "id": 50,
    "text_th": "Fiat",
    "text_en": "Fiat",
    "value": "48"
  },
  {
    "id": 51,
    "text_th": "Jaguar",
    "text_en": "Jaguar",
    "value": "49"
  },
  {
    "id": 52,
    "text_th": "Volvo",
    "text_en": "Volvo",
    "value": "50"
  },
  {
    "id": 53,
    "text_th": "Acura",
    "text_en": "Acura",
    "value": "51"
  },
  {
    "id": 54,
    "text_th": "Emgrand",
    "text_en": "Emgrand",
    "value": "52"
  },
  {
    "id": 55,
    "text_th": "Jeep",
    "text_en": "Jeep",
    "value": "53"
  },
  {
    "id": 56,
    "text_th": "Bentley",
    "text_en": "Bentley",
    "value": "54"
  },
  {
    "id": 57,
    "text_th": "Bugatti",
    "text_en": "Bugatti",
    "value": "55"
  },
  {
    "id": 58,
    "text_th": "Trumpchi",
    "text_en": "Trumpchi",
    "value": "56"
  },
  {
    "id": 59,
    "text_th": "Daewoo",
    "text_en": "Daewoo",
    "value": "57"
  },
  {
    "id": 60,
    "text_th": "Soueast",
    "text_en": "Soueast",
    "value": "58"
  },
  {
    "id": 61,
    "text_th": "Foday",
    "text_en": "Foday",
    "value": "59"
  },
  {
    "id": 62,
    "text_th": "Maple",
    "text_en": "Maple",
    "value": "60"
  },
  {
    "id": 63,
    "text_th": "Hawtai",
    "text_en": "Hawtai",
    "value": "61"
  },
  {
    "id": 64,
    "text_th": "JMC",
    "text_en": "JMC",
    "value": "62"
  },
  {
    "id": 65,
    "text_th": "King Long",
    "text_en": "King Long",
    "value": "63"
  },
  {
    "id": 66,
    "text_th": "Joylong",
    "text_en": "Joylong",
    "value": "64"
  },
  {
    "id": 67,
    "text_th": "Karry",
    "text_en": "Karry",
    "value": "65"
  },
  {
    "id": 68,
    "text_th": "Chrysler",
    "text_en": "Chrysler",
    "value": "66"
  },
  {
    "id": 69,
    "text_th": "Rolls-Royce",
    "text_en": "Rolls-Royce",
    "value": "67"
  },
  {
    "id": 70,
    "text_th": "Everus",
    "text_en": "Everus",
    "value": "68"
  },
  {
    "id": 71,
    "text_th": "Lifan",
    "text_en": "Lifan",
    "value": "69"
  },
  {
    "id": 72,
    "text_th": "Leopaard",
    "text_en": "Leopaard",
    "value": "70"
  },
  {
    "id": 73,
    "text_th": "Lincoln",
    "text_en": "Lincoln",
    "value": "71"
  },
  {
    "id": 74,
    "text_th": "Land Rover",
    "text_en": "Land Rover",
    "value": "72"
  },
  {
    "id": 75,
    "text_th": "Lotus",
    "text_en": "Lotus",
    "value": "73"
  },
  {
    "id": 76,
    "text_th": "Maserati",
    "text_en": "Maserati",
    "value": "74"
  },
  {
    "id": 77,
    "text_th": "Maybach",
    "text_en": "Maybach",
    "value": "75"
  },
  {
    "id": 78,
    "text_th": "McLaren",
    "text_en": "McLaren",
    "value": "76"
  },
  {
    "id": 79,
    "text_th": "Youngman",
    "text_en": "Youngman",
    "value": "77"
  },
  {
    "id": 80,
    "text_th": "Tesla",
    "text_en": "Tesla",
    "value": "78"
  },
  {
    "id": 81,
    "text_th": "Rely",
    "text_en": "Rely",
    "value": "79"
  },
  {
    "id": 82,
    "text_th": "ISUZU",
    "text_en": "ISUZU",
    "value": "80"
  },
  {
    "id": 83,
    "text_th": "FAW",
    "text_en": "FAW",
    "value": "81"
  },
  {
    "id": 84,
    "text_th": "Infiniti",
    "text_en": "Infiniti",
    "value": "82"
  },
  {
    "id": 85,
    "text_th": "Yutong",
    "text_en": "Yutong",
    "value": "83"
  },
  {
    "id": 86,
    "text_th": "Ankai",
    "text_en": "Ankai",
    "value": "84"
  },
  {
    "id": 87,
    "text_th": "Changhe",
    "text_en": "Changhe",
    "value": "85"
  },
  {
    "id": 88,
    "text_th": "Haima",
    "text_en": "Haima",
    "value": "86"
  },
  {
    "id": 89,
    "text_th": "Toyota Crown",
    "text_en": "Toyota Crown",
    "value": "87"
  },
  {
    "id": 90,
    "text_th": "Huanghai",
    "text_en": "Huanghai",
    "value": "88"
  },
  {
    "id": 91,
    "text_th": "Golden Dragon",
    "text_en": "Golden Dragon",
    "value": "89"
  },
  {
    "id": 92,
    "text_th": "Smart",
    "text_en": "Smart",
    "value": "90"
  },
  {
    "id": 93,
    "text_th": "Dodge Caliber",
    "text_en": "Dodge Caliber",
    "value": "91"
  },
  {
    "id": 94,
    "text_th": "Europestar",
    "text_en": "Europestar",
    "value": "92"
  },
  {
    "id": 95,
    "text_th": "MINI",
    "text_en": "MINI",
    "value": "93"
  },
  {
    "id": 96,
    "text_th": "Gleagle",
    "text_en": "Gleagle",
    "value": "94"
  },
  {
    "id": 97,
    "text_th": "Forland",
    "text_en": "Forland",
    "value": "95"
  },
  {
    "id": 98,
    "text_th": "Shuanghuan",
    "text_en": "Shuanghuan",
    "value": "96"
  },
  {
    "id": 99,
    "text_th": "Tianye",
    "text_en": "Tianye",
    "value": "97"
  },
  {
    "id": 100,
    "text_th": "Yaris",
    "text_en": "Yaris",
    "value": "98"
  },
  {
    "id": 101,
    "text_th": "Englon",
    "text_en": "Englon",
    "value": "99"
  },
  {
    "id": 102,
    "text_th": "Zhongtong",
    "text_en": "Zhongtong",
    "value": "100"
  },
  {
    "id": 103,
    "text_th": "Yuejin",
    "text_en": "Yuejin",
    "value": "102"
  },
  {
    "id": 104,
    "text_th": "Taurus",
    "text_en": "Taurus",
    "value": "103"
  },
  {
    "id": 105,
    "text_th": "Alto",
    "text_en": "Alto",
    "value": "104"
  },
  {
    "id": 106,
    "text_th": "Weiwang",
    "text_en": "Weiwang",
    "value": "105"
  },
  {
    "id": 107,
    "text_th": "Chenglong",
    "text_en": "Chenglong",
    "value": "106"
  },
  {
    "id": 108,
    "text_th": "Higer",
    "text_en": "Higer",
    "value": "107"
  },
  {
    "id": 109,
    "text_th": "Shaolin",
    "text_en": "Shaolin",
    "value": "108"
  },
  {
    "id": 110,
    "text_th": "NORTHBUS",
    "text_en": "NORTHBUS",
    "value": "109"
  },
  {
    "id": 111,
    "text_th": "BAIC Motor",
    "text_en": "BAIC Motor",
    "value": "110"
  },
  {
    "id": 112,
    "text_th": "Haval",
    "text_en": "Haval",
    "value": "111"
  },
  {
    "id": 113,
    "text_th": "Jonway",
    "text_en": "Jonway",
    "value": "182"
  },
  {
    "id": 114,
    "text_th": "Maxus",
    "text_en": "Maxus",
    "value": "183"
  },
  {
    "id": 115,
    "text_th": "BAW",
    "text_en": "BAW",
    "value": "184"
  },
  {
    "id": 116,
    "text_th": "Mustang",
    "text_en": "Mustang",
    "value": "185"
  },
  {
    "id": 117,
    "text_th": "Gonow",
    "text_en": "Gonow",
    "value": "186"
  },
  {
    "id": 118,
    "text_th": "Hummer",
    "text_en": "Hummer",
    "value": "187"
  },
  {
    "id": 119,
    "text_th": "Polarsun",
    "text_en": "Polarsun",
    "value": "188"
  },
  {
    "id": 120,
    "text_th": "Ssangyong",
    "text_en": "Ssangyong",
    "value": "189"
  },
  {
    "id": 121,
    "text_th": "Victory Auto",
    "text_en": "Victory Auto",
    "value": "190"
  },
  {
    "id": 122,
    "text_th": "Aston Martin",
    "text_en": "Aston Martin",
    "value": "191"
  },
  {
    "id": 123,
    "text_th": "TECHART",
    "text_en": "TECHART",
    "value": "192"
  },
  {
    "id": 124,
    "text_th": "Carlsson",
    "text_en": "Carlsson",
    "value": "193"
  },
  {
    "id": 125,
    "text_th": "SEAT",
    "text_en": "SEAT",
    "value": "194"
  },
  {
    "id": 126,
    "text_th": "Wiesmann",
    "text_en": "Wiesmann",
    "value": "195"
  },
  {
    "id": 127,
    "text_th": "Alfa Romeo",
    "text_en": "Alfa Romeo",
    "value": "196"
  },
  {
    "id": 128,
    "text_th": "Spyker",
    "text_en": "Spyker",
    "value": "197"
  },
  {
    "id": 129,
    "text_th": "Mercury",
    "text_en": "Mercury",
    "value": "198"
  },
  {
    "id": 130,
    "text_th": "Scania",
    "text_en": "Scania",
    "value": "199"
  },
  {
    "id": 131,
    "text_th": "Proton",
    "text_en": "Proton",
    "value": "200"
  },
  {
    "id": 132,
    "text_th": "Lancia",
    "text_en": "Lancia",
    "value": "201"
  },
  {
    "id": 133,
    "text_th": "Panoz",
    "text_en": "Panoz",
    "value": "202"
  },
  {
    "id": 134,
    "text_th": "Holden",
    "text_en": "Holden",
    "value": "203"
  },
  {
    "id": 135,
    "text_th": "Ascari",
    "text_en": "Ascari",
    "value": "204"
  },
  {
    "id": 136,
    "text_th": "Dacia",
    "text_en": "Dacia",
    "value": "205"
  },
  {
    "id": 137,
    "text_th": "Renault Samsung",
    "text_en": "Renault Samsung",
    "value": "206"
  },
  {
    "id": 138,
    "text_th": "Vauxhall",
    "text_en": "Vauxhall",
    "value": "207"
  },
  {
    "id": 139,
    "text_th": "Venturi",
    "text_en": "Venturi",
    "value": "208"
  },
  {
    "id": 140,
    "text_th": "Morgan",
    "text_en": "Morgan",
    "value": "209"
  },
  {
    "id": 141,
    "text_th": "Hino",
    "text_en": "Hino",
    "value": "210"
  },
  {
    "id": 142,
    "text_th": "Pontiac",
    "text_en": "Pontiac",
    "value": "211"
  },
  {
    "id": 143,
    "text_th": "Abarth",
    "text_en": "Abarth",
    "value": "212"
  },
  {
    "id": 144,
    "text_th": "Saturn",
    "text_en": "Saturn",
    "value": "213"
  },
  {
    "id": 145,
    "text_th": "Tianma",
    "text_en": "Tianma",
    "value": "214"
  },
  {
    "id": 146,
    "text_th": "Daihatsu",
    "text_en": "Daihatsu",
    "value": "215"
  },
  {
    "id": 147,
    "text_th": "Oldsmobile",
    "text_en": "Oldsmobile",
    "value": "216"
  },
  {
    "id": 148,
    "text_th": "Saibao",
    "text_en": "Saibao",
    "value": "217"
  },
  {
    "id": 149,
    "text_th": "Moskvich",
    "text_en": "Moskvich",
    "value": "218"
  },
  {
    "id": 150,
    "text_th": "Citroën DS",
    "text_en": "Citroën DS",
    "value": "219"
  },
  {
    "id": 151,
    "text_th": "Venucia",
    "text_en": "Venucia",
    "value": "220"
  },
  {
    "id": 152,
    "text_th": "Mitsuoka",
    "text_en": "Mitsuoka",
    "value": "221"
  },
  {
    "id": 153,
    "text_th": "Gumpert",
    "text_en": "Gumpert",
    "value": "222"
  },
  {
    "id": 154,
    "text_th": "Polonez",
    "text_en": "Polonez",
    "value": "223"
  },
  {
    "id": 155,
    "text_th": "Jiangnan",
    "text_en": "Jiangnan",
    "value": "224"
  },
  {
    "id": 156,
    "text_th": "Lada",
    "text_en": "Lada",
    "value": "225"
  },
  {
    "id": 157,
    "text_th": "Scion",
    "text_en": "Scion",
    "value": "226"
  },
  {
    "id": 158,
    "text_th": "DAF",
    "text_en": "DAF",
    "value": "227"
  },
  {
    "id": 159,
    "text_th": "Enranger",
    "text_en": "Enranger",
    "value": "228"
  },
  {
    "id": 160,
    "text_th": "Xinkai",
    "text_en": "Xinkai",
    "value": "229"
  },
  {
    "id": 161,
    "text_th": "Dadi",
    "text_en": "Dadi",
    "value": "230"
  },
  {
    "id": 162,
    "text_th": "Tata Motors",
    "text_en": "Tata Motors",
    "value": "231"
  },
  {
    "id": 163,
    "text_th": "Kamaz",
    "text_en": "Kamaz",
    "value": "232"
  },
  {
    "id": 164,
    "text_th": "Datsun",
    "text_en": "Datsun",
    "value": "233"
  },
  {
    "id": 165,
    "text_th": "Foden",
    "text_en": "Foden",
    "value": "234"
  },
  {
    "id": 166,
    "text_th": "Austin",
    "text_en": "Austin",
    "value": "235"
  },
  {
    "id": 167,
    "text_th": "Ginetta",
    "text_en": "Ginetta",
    "value": "236"
  },
  {
    "id": 168,
    "text_th": "CHTC",
    "text_en": "CHTC",
    "value": "237"
  },
  {
    "id": 169,
    "text_th": "Denza",
    "text_en": "Denza",
    "value": "238"
  },
  {
    "id": 170,
    "text_th": "Zinoro",
    "text_en": "Zinoro",
    "value": "239"
  },
  {
    "id": 171,
    "text_th": "Fornasari",
    "text_en": "Fornasari",
    "value": "240"
  },
  {
    "id": 172,
    "text_th": "Keyton",
    "text_en": "Keyton",
    "value": "241"
  },
  {
    "id": 173,
    "text_th": "Qoros",
    "text_en": "Qoros",
    "value": "242"
  },
  {
    "id": 174,
    "text_th": "Huasong",
    "text_en": "Huasong",
    "value": "243"
  },
  {
    "id": 175,
    "text_th": "Cowin",
    "text_en": "Cowin",
    "value": "244"
  },
  {
    "id": 176,
    "text_th": "Levdeo",
    "text_en": "Levdeo",
    "value": "245"
  },
  {
    "id": 177,
    "text_th": "Leahead",
    "text_en": "Leahead",
    "value": "246"
  },
  {
    "id": 178,
    "text_th": "GreenWheel EV",
    "text_en": "GreenWheel EV",
    "value": "247"
  },
  {
    "id": 179,
    "text_th": "Nanjing Golden Dragon",
    "text_en": "Nanjing Golden Dragon",
    "value": "248"
  },
  {
    "id": 180,
    "text_th": "RUF",
    "text_en": "RUF",
    "value": "249"
  },
  {
    "id": 181,
    "text_th": "Shaanxi Tongjia",
    "text_en": "Shaanxi Tongjia",
    "value": "250"
  },
  {
    "id": 182,
    "text_th": "Ciimo",
    "text_en": "Ciimo",
    "value": "251"
  },
  {
    "id": 183,
    "text_th": "Yogomo",
    "text_en": "Yogomo",
    "value": "252"
  },
  {
    "id": 184,
    "text_th": "Zhidou",
    "text_en": "Zhidou",
    "value": "253"
  },
  {
    "id": 185,
    "text_th": "BAC",
    "text_en": "BAC",
    "value": "254"
  },
  {
    "id": 186,
    "text_th": "Borgward",
    "text_en": "Borgward",
    "value": "255"
  },
  {
    "id": 187,
    "text_th": "Conquest",
    "text_en": "Conquest",
    "value": "256"
  },
  {
    "id": 188,
    "text_th": "DMC",
    "text_en": "DMC",
    "value": "257"
  },
  {
    "id": 189,
    "text_th": "GAZ",
    "text_en": "GAZ",
    "value": "258"
  },
  {
    "id": 190,
    "text_th": "GMC",
    "text_en": "GMC",
    "value": "259"
  },
  {
    "id": 191,
    "text_th": "KTM",
    "text_en": "KTM",
    "value": "260"
  },
  {
    "id": 192,
    "text_th": "nanoFlowcell",
    "text_en": "nanoFlowcell",
    "value": "261"
  },
  {
    "id": 193,
    "text_th": "Noble",
    "text_en": "Noble",
    "value": "262"
  },
  {
    "id": 194,
    "text_th": "SSC",
    "text_en": "SSC",
    "value": "263"
  },
  {
    "id": 195,
    "text_th": "Tramontana",
    "text_en": "Tramontana",
    "value": "264"
  },
  {
    "id": 196,
    "text_th": "Zenvo",
    "text_en": "Zenvo",
    "value": "265"
  },
  {
    "id": 197,
    "text_th": "Brabus",
    "text_en": "Brabus",
    "value": "266"
  },
  {
    "id": 198,
    "text_th": "G. Patton",
    "text_en": "G. Patton",
    "value": "267"
  },
  {
    "id": 199,
    "text_th": "Melkus",
    "text_en": "Melkus",
    "value": "268"
  },
  {
    "id": 200,
    "text_th": "BAIC Huansu",
    "text_en": "BAIC Huansu",
    "value": "269"
  },
  {
    "id": 201,
    "text_th": "ไม่สามารถระบุได้",
    "text_en": "Unrecognized",
    "value": "-1"
  },
  {
    "id": 202,
    "text_th": "ไม่ระบุ",
    "text_en": "unknown",
    "value": "unknown"
  },
];

export const VEHICLE_TYPE: DetectDropdown[] = [
  { id: 0, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 1, text_th: "อื่น ๆ", text_en: "other", value: "-1" },
  { id: 2, text_th: "ไม่สามารถระบุได้", text_en: "unrecognized", value: "0" },
  { id: 3, text_th: "รถโดยสารสาธารณะ", text_en: "public_bus", value: "17" },
  { id: 4, text_th: "รถจักรยานยนต์", text_en: "motorcycle", value: "18" },
  { id: 5, text_th: "รถบัส", text_en: "bus", value: "19" },
  { id: 6, text_th: "รถบรรทุกขนาดใหญ่", text_en: "large_truck", value: "20" },
  { id: 7, text_th: "รถบรรทุกขนาดกลาง", text_en: "medium_truck", value: "21" },
  { id: 8, text_th: "รถเก๋ง", text_en: "sedan", value: "22" },
  { id: 9, text_th: "รถตู้", text_en: "van", value: "23" },
  { id: 10, text_th: "รถบรรทุกขนาดเล็ก", text_en: "small_truck", value: "24" },
  { id: 11, text_th: "รถบัสขนาดกลาง", text_en: "medium_bus", value: "26" },
  { id: 12, text_th: "รถ SUV", text_en: "suv", value: "27" },
  { id: 13, text_th: "รถ MPV", text_en: "mpv", value: "28" },
  { id: 14, text_th: "รถกระบะ", text_en: "pickup", value: "29" },
  { id: 15, text_th: "รถเก๋งขนาดเล็ก", text_en: "mini_sedan", value: "32" },
  { id: 16, text_th: "ไม่ระบุ", text_en: "unknown", value: "999" },
];

export const VEHICLE_COLOR: DetectDropdown[] = [
  { id: 0, text_th: "ทั้งหมด", text_en: "all", value: "all" },
  { id: 1, text_th: "สีขาว", text_en: "white", value: "0" },
  { id: 2, text_th: "สีดำ", text_en: "black", value: "1" },
  { id: 3, text_th: "สีแดง", text_en: "red", value: "2" },
  { id: 4, text_th: "สีเหลือง", text_en: "yellow", value: "3" },
  { id: 5, text_th: "สีเทา", text_en: "gray", value: "4" },
  { id: 6, text_th: "สีน้ำเงิน", text_en: "blue", value: "5" },
  { id: 7, text_th: "สีเขียว", text_en: "green", value: "6" },
  { id: 8, text_th: "สีม่วง", text_en: "purple", value: "8" },
  { id: 9, text_th: "สีชมพู", text_en: "pink", value: "10" },
  { id: 10, text_th: "สีน้ำตาล", text_en: "brown", value: "11" },
  { id: 11, text_th: "สีเงิน", text_en: "silver", value: "17" },
  { id: 12, text_th: "สีส้มเข้ม", text_en: "dark_orange", value: "21" },
  { id: 13, text_th: "ไม่สามารถระบุได้", text_en: "unrecognized", value: "99" },
  { id: 14, text_th: "อื่น ๆ", text_en: "other", value: "100" },
  { id: 15, text_th: "ไม่ระบุ", text_en: "unknown", value: "999" },
];