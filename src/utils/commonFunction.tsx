import bcrypt from 'bcryptjs';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Types
import { 
  Option,
  SpecialPlate,
  SpecialPlateResponse,
  SuspectPeopleResponse,
  SuspectPeople,
} from '../features/types';
import {
  PlateTypesResponse,
  PersonResponse,
} from "../features/dropdown/dropdownTypes"

dayjs.extend(utc);

// Constants
const SALT_ROUNDS = 10;

export const reformatString = (input: string): string => {
  if (!input) return "";

  return input
    .split('_') // Split the string by underscores
    .map(word => 
        word
            .split('-') // Split the string by hyphens
            .map(subWord => 
                /^[A-Z]+$/.test(subWord) ? subWord : subWord.charAt(0).toUpperCase() + subWord.slice(1).toLowerCase()
            )
            .join('-') // Rejoin the hyphenated parts
    )
    .join(' ') // Rejoin the parts with spaces
}

export const formatThaiID = (value: string) => {
  return value.replace(
    /(\d{1})(\d{0,4})?(\d{0,5})?(\d{0,2})?(\d{0,1})?/,
    (_, p1, p2, p3, p4, p5) => [p1, p2, p3, p4, p5].filter(Boolean).join('-')
  )
}

export const formatNumber = (price: number) => {
  return new Intl.NumberFormat('en-US').format(price)
}

export const formatPhone = (value: string) => {
  return value.replace(
    /(\d{0,3})?(\d{0,3})?(\d{0,4})?/,
    (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join('-')
  )
}

export const isEquals = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const isNumber = (value: string) => {
  return /^[0-9]*$/.test(value)
}

export const getFileNameWithoutExtension = (filePath: string): string => {
  if (!filePath) return "";
  const fileName = filePath.split('/').pop()?.split('\\').pop() || ""
  return fileName.split('.').slice(0, -1).join('.') || fileName 
}

export const makeRandomText = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => 
    characters[Math.floor(Math.random() * characters.length)]
  ).join('');
};

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hashed;
};

export const getId = (val: number | Option) => {
  if (!val) return null;
  return typeof val === "number" ? val : val.value;
};

export const getStringId = (val: string | Option) => {
  if (!val) return null;
  return typeof val === "string" ? val : val.value;
};

export const isStringMatch = (base: string, newString: string) => {
  if (!newString || !base) return false;

  // Except for "*"
  const escaped = base.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
  // Replace "*" with ".*" for matching
  const pattern = '^' + escaped.replace(/\*/g, '.*') + '$';
  const regex = new RegExp(pattern);

  return regex.test(newString);
};

export const getPlateTypeColor = (typeName: string) => {
  let color = "white";
  let backgroundColor = "white";
  let pinBackgroundColor = "black";
  let feedBackgroundColor = "#161817";
  let textShadow = "";
  let title = "";
  let showAlert = false;

  switch (typeName.toLowerCase()) {
    case "normal":
      title = "Normal";
      break;
    case "guest":
      title = "Guest";
      break;
    case "member":
      color = "white";
      backgroundColor = "#0099ff";
      pinBackgroundColor = "#0099ff";
      feedBackgroundColor = "#0099ff";
      title = "Member";
      showAlert = true;
      break;
    case "vip":
      color = "white";
      backgroundColor = "#009900";
      pinBackgroundColor = "#009900";
      feedBackgroundColor = "#009900";
      title = "VIP";
      showAlert = true;
      break;
    case "blacklist":
      color = "white";
      backgroundColor = "#FF0000";
      pinBackgroundColor = "#FF0000";
      feedBackgroundColor = "#FF0000";
      title = "BlackList";
      textShadow = "2px 0 #fff, -2px 0 #fff, 0 2px #fff, 0 -2px #fff, 1px 1px #fff, -1px -1px #fff, 1px -1px #fff, -1px 1px #fff";
      showAlert = true;
      break;
    case "watchList":
      color = "white";
      backgroundColor = "#FDB600";
      pinBackgroundColor = "#FDB600";
      feedBackgroundColor = "#FDB600";
      title = "WatchList";
      showAlert = true;
      break;
    default:
      color = "white";
      backgroundColor = "white";
      pinBackgroundColor = "black";
      feedBackgroundColor = "#161817";
      title = "";
      break;
  }
  return { color, backgroundColor, feedBackgroundColor, pinBackgroundColor, title, showAlert, textShadow }
}

export const getPersonTypeColor = (typeName: string) => {
  let color = "white";
  let backgroundColor = "";
  let pinBackgroundColor = "black";
  let feedBackgroundColor = "#161817";
  let textShadow = "";
  let title = "";
  let showAlert = false;

  switch (typeName.toLowerCase()) {
    case "member":
      title = "Normal";
      color = "white";
      backgroundColor = "#0099ff";
      pinBackgroundColor = "#0099ff";
      feedBackgroundColor = "#0099ff";
      showAlert = true;
      break;
    case "vip":
      title = "VIP";
      color = "white";
      backgroundColor = "#009900";
      pinBackgroundColor = "#009900";
      feedBackgroundColor = "#009900";
      showAlert = true;
      break;
    case "blacklist":
      title = "BlackList";
      color = "white";
      backgroundColor = "#E5252A";
      pinBackgroundColor = "#E5252A";
      feedBackgroundColor = "#E5252A";
      textShadow = "2px 0 #fff, -2px 0 #fff, 0 2px #fff, 0 -2px #fff, 1px 1px #fff, -1px -1px #fff, 1px -1px #fff, -1px 1px #fff";
      showAlert = true;
      break;
    case "watchlist":
      title = "WatchList";
      color = "white";
      backgroundColor = "#FDCC0A";
      pinBackgroundColor = "#FDCC0A";
      feedBackgroundColor = "#FDCC0A";
      showAlert = true;
      break;
    default:
      color = "white";
      backgroundColor = "white";
      pinBackgroundColor = "white";
      feedBackgroundColor = "white";
      showAlert = true;
      break;
  }
  return { color, backgroundColor, feedBackgroundColor, pinBackgroundColor, title, showAlert, textShadow }
}

export const getImageFormat = (src: string) => {
  if (src.startsWith("data:image/png")) return "PNG";
  if (src.startsWith("data:image/jpeg") || src.startsWith("data:image/jpg")) return "JPEG";
  return "JPEG";
};

export const loadFont = async (fontPath: string): Promise<string> => {
  const response = await fetch(fontPath);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

export const showToast = (Component: any, data: any, theme: 'light' | 'dark', toastId: string, style?: React.CSSProperties) => {
  toast((props) => (
    <Component {...props} data={{ ...data, toastId }} />
  ), {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    theme,
    containerId: "notification-list-toast",
    toastId,
    style,
  });

  return toastId;
};

export const parseExcelDate = (dateValue: any) => {
  if (!dateValue) {
    return ""
  }
  if (typeof dateValue === "number") {
    const date = new Date((dateValue - 25569) * 86400 * 1000);
    const year = date.getFullYear();
    const correctedYear = year >= 2500 ? year - 543 : year;

    return `${correctedYear}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    let year = dateValue.getFullYear();
    if (year >= 2500) year -= 543;

    return `${year}-${String(dateValue.getMonth() + 1).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}`;
  }

  if (typeof dateValue === "string" && dateValue.includes("T")) {
    const date = new Date(dateValue);

    let year = date.getFullYear();
    if (year >= 2500) year -= 543;

    return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  if (typeof dateValue === "string") {
    const clean = dateValue.trim().replace(/[-.]/g, "/");

    const parts = clean.split("/");
    if (parts.length !== 3) return "";

    let [day, month, year] = parts;

    if (!day || !month || !year) return "";

    let numericYear = parseInt(year, 10);

    if (numericYear >= 2500) numericYear -= 543;

    return `${numericYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return "";
}

export const isValidNationId = (id: string) => {
  if (!/^\d{13}$/.test(id)) {
    return false;
  }
  return true;
}

export const downloadFile = (fileName: string, url: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const getFilesDiff = (newArray: any[], oldFileArray: any[]) => {
  const currentURLs = newArray.map(data => data.url);
  const oldURLs = oldFileArray.map(data => data.url);

  // Find removed: in old but not in current
  const removed = oldFileArray.filter(data => !currentURLs.includes(data.url));

  // Find added: in current but not in old
  const added = newArray.filter(data => !oldURLs.includes(data.url));

  return { added, removed };
};

export const getWeekday = (dateString: string, i18n: any) => {
  const date = dayjs.utc(dateString);

  const day = date.get('day');
  const weekdaysEng = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
  const weekdaysTh = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  return i18n.language === "th" ? weekdaysTh[day] : weekdaysEng[day];
};

export const checkSpecialPlate = (uid: string, specialPlateList: SpecialPlateResponse | null): SpecialPlate | undefined => {
  const specialPlate = specialPlateList?.data.find(sp => sp.uid === uid && sp.deleted === false && sp.active === true);
  return specialPlate
};

export const checkSpecialPerson = (uid: string, suspectPeopleList: SuspectPeopleResponse | null): SuspectPeople | undefined => {
  const suspectPerson = suspectPeopleList?.data.find(sp => sp.uid === uid && sp.deleted === false && sp.active === true);
  return suspectPerson
};

export const getPlateClassName = (classId: number, plateTypeList: PlateTypesResponse | null) => {
  const plateType = plateTypeList?.data.find(type => type.id === classId);
  return plateType?.title_en || "-";
}

export const getPersonClassName = (classId: number, personTypeList: PersonResponse | null) => {
  const personType = personTypeList?.data.find(type => type.id === classId);
  return personType?.title_en || "-";
}

export const checkImageSize = (file: File, width: number, height: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const isOverSize = img.width > width || img.height > height
      resolve(isOverSize)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Invalid image file"))
    }

    img.src = url
  })
}

const NO_IMAGE = "data:image/png;base64,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";

export const loadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); 

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) throw new Error("404");

    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string || NO_IMAGE);
      reader.onerror = () => resolve(NO_IMAGE);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Image load failed:", url, e);
    return NO_IMAGE;
  }
}