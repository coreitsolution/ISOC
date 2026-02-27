import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Papa from "papaparse";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Material UI
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { SelectChangeEvent } from "@mui/material/Select";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Chip from "@mui/material/Chip";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import { CarFront } from "lucide-react";
import CSVIcon from "../../assets/icons/csv.png";
import PDFIcon from "../../assets/icons/pdf.png";
import SearchHumanIcon from "../../assets/icons/search-human.png";
import { KeyboardArrowUp } from "@mui/icons-material";
import GenderIcon from "../../assets/svg/gender.svg?react";
import ShirtIcon from "../../assets/svg/shirt.svg?react";
import PantsIcon from "../../assets/svg/pants.svg?react";
import HatIcon from "../../assets/svg/hat.svg?react";
import BagIcon from "../../assets/svg/bag.svg?react";
import EmotionIcon from "../../assets/svg/emotion.svg?react";
import GlassesIcon from "../../assets/svg/glasses.svg?react";
import BreadIcon from "../../assets/svg/beard.svg?react";
import MaskIcon from "../../assets/svg/mask.svg?react";
import AgeIcon from "../../assets/svg/age.svg?react";

// Components
import AutoComplete from "../../components/auto-complete/AutoComplete";
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
import MultiSelectCameras from "../../components/multi-select/MultiSelectCameras";
import PaginationComponent from "../../components/pagination/Pagination";
import Image from "../../components/image/Image";
import Loading from "../../components/loading/Loading";
import ProgressBarWithLabel from "../../components/progress-bar/ProgressBarWithLabel";
import OutlinedContainer from "../../components/outlined-container/OutlinedContainer";
import Beehive from "../../components/hexagon/Beehive";

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Types
import { Camera, CameraFaceResponse } from "../../features/types";
import {
  MultiDetectData,
  MultiDetectDataResponse,
} from "../../features/search/SearchTypes";

// Constant
import {
  SEARCH_MULTI_DETECT_ROW_PER_PAGES,
  AGE,
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

// Modules
import SearchCameras from "../search-cameras/SearchCameras";
import ShowLargeImage from "../show-large-image/ShowLargeImage";

// i18n
import { useTranslation } from "react-i18next";

// Utils
import {
  formatNumber,
  reformatString,
  downloadFile,
} from "../../utils/commonFunction";
import {
  PopupMessage,
  PopupMessageCustomTextWithCancel,
} from "../../utils/popupMessage";
import { fetchClient, combineURL } from "../../utils/fetchClient";

// Config
import { getUrls } from "../../config/runtimeConfig";

// PDF
import {
  downloadSearchResultPdf,
  generateSearchResultPdfBlob,
} from "./search-result-pdf/SearchResultPdf";

interface FormData {
  car_brand: string;
  car_type: string;
  car_color: string;
  age: string;
  glasses: string;
  bag: string;
  bag_type: string;
  hat: string;
  hat_type: string;
  coat: string;
  coat_color: string;
  mask: string;
  beard: string;
  trousers: string;
  trousers_color: string;
  gender: string;
  emotion: string;
  start_date_time: Date | null;
  end_date_time: Date | null;
  checkpoints_id: number[];
}

interface SearchMultiDetectProps {}

const SearchMultiDetect: React.FC<SearchMultiDetectProps> = ({}) => {
  const { CENTER_API, CENTER_FILE_URL } = getUrls();
  const { isOpen } = useHamburger();

  // Constants
  const CHUNK_SIZE = 500;
  const REQUEST_LIMIT = 5000;

  // Options
  const [carColorsOptions, setCarColorsOptions] = useState<{ label: string; value: string }[]>([]);
  const [carMakesOptions, setCarMakesOptions] = useState<{ label: string; value: string }[]>([]);
  const [carTypesOptions, setCarTypesOptions] = useState<{ label: string; value: string }[]>([]);
  const [glassesOptions, setGlassesOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType}[]>([]);
  const [bagOptions, setBagOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [bagTypesOptions, setBagTypesOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [hatOptions, setHatOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [hatTypesOptions, setHatTypesOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [coatOptions, setCoatOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [coatColorOptions, setCoatColorOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [maskOptions, setMaskOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [beardOptions, setBeardOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [trousersOptions, setTrousersOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [trousersColorOptions, setTrousersColorOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [ageOptions, setAgeOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [genderOptions, setGenderOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [emotionOptions, setEmotionOptions] = useState<{ label: string; value: string, iconButton?: React.ElementType }[]>([]);
  const [camerasOption, setCamerasOption] = useState<{ label: string; value: any }[]>([]);
  const optionMap: Record<string, { label: string; value: string }[]> = {
    age: ageOptions,
    glasses: glassesOptions,
    bag: bagOptions,
    bag_type: bagTypesOptions,
    hat: hatOptions,
    hat_type: hatTypesOptions,
    coat: coatOptions,
    coat_color: coatColorOptions,
    mask: maskOptions,
    beard: beardOptions,
    trousers: trousersOptions,
    trousers_color: trousersColorOptions,
    gender: genderOptions,
    emotion: emotionOptions,
    car_brand: carMakesOptions,
    car_type: carTypesOptions,
    car_color: carColorsOptions,
  }
  // States
  const [searchCamerasVisible, setSearchCamerasVisible] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // Data
  const [multiDetectDataList, setMultiDetectDataList] = useState<MultiDetectData[]>([]);
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<{ value: any; label: string }[]>([]);
  const [cameraList, setCameraList] = useState<Camera[]>([]);
  const [largeImageList, setLargeImageList] = useState<{ name: string; url: string; className: string }[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [formats, setFormats] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(
    SEARCH_MULTI_DETECT_ROW_PER_PAGES[
      SEARCH_MULTI_DETECT_ROW_PER_PAGES.length - 1
    ],
  );
  const [rowsPerPageOptions] = useState(
    SEARCH_MULTI_DETECT_ROW_PER_PAGES,
  );

  // i18n
  const { t, i18n } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  const cameraRefreshKey = useSelector(
    (state: RootState) => state.refresh.cameraRefreshKey,
  );

  const [formData, setFormData] = useState<FormData>({
    car_brand: "all",
    car_type: "all",
    car_color: "all",
    age: "all",
    glasses: "all",
    bag: "all",
    bag_type: "all",
    hat: "all",
    hat_type: "all",
    coat: "all",
    coat_color: "all",
    mask: "all",
    beard: "all",
    trousers: "all",
    trousers_color: "all",
    gender: "all",
    emotion: "all",
    start_date_time: null,
    end_date_time: null,
    checkpoints_id: [],
  });

  useEffect(() => {
    const startDateTime = dayjs().subtract(1, "day").toDate();
    const endDateTime = dayjs().toDate();
    setFormData((prevState) => ({
      ...prevState,
      start_date_time: startDateTime,
      end_date_time: endDateTime,
    }));
    setValue("start_date_time", startDateTime);
    setValue("end_date_time", endDateTime);
  }, []);

  useEffect(() => {
    setSelectedCameraObjects([{ label: t("dropdown.all"), value: "0" }]);
    setCarColorsOptions(
      VEHICLE_COLOR.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
      }))
    );
    setCarMakesOptions(
      VEHICLE_MAKE.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
      }))
    );
    setCarTypesOptions(
      VEHICLE_TYPE.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
      }))
    );

    setBagOptions(
      BAG.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setBagTypesOptions(
      BAG_TYPE.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setAgeOptions(
      AGE.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.value,
        iconButton: row.iconButton,
      })),
    );
    setGenderOptions(
      GENDER.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setCoatOptions(
      COAT.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setCoatColorOptions(
      COAT_COLORS.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
      })),
    );
    setTrousersOptions(
      TROUSER.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setTrousersColorOptions(
      TROUSER_COLORS.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
      })),
    );
    setHatOptions(
      HAT.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setHatTypesOptions(
      HAT_TYPE.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setGlassesOptions(
      GLASSES.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setMaskOptions(
      MASK.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setBeardOptions(
      BEARD.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
    setEmotionOptions(
      EMOTION.map((row) => ({
        label: i18n.language === "th" ? row.text_th : reformatString(row.text_en),
        value: row.text_en,
        iconButton: row.iconButton,
      })),
    );
  }, [i18n.language, i18n.isInitialized]);

  useEffect(() => {
    if (multiDetectDataList) {
      setTotalPages(
        multiDetectDataList.length === 0
          ? 1
          : Math.ceil(multiDetectDataList.length / rowsPerPage),
      );
    }

    return () => {
      clearData();
    };
  }, []);

  useEffect(() => {
    if (cameraList) {
      const options = cameraList.map((row) => ({
        label: row.camera_name,
        value: row.uid,
      }));
      setCamerasOption([{ label: t("dropdown.all"), value: "0" }, ...options]);
    }
  }, [cameraList, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchClient<CameraFaceResponse>(
          combineURL(CENTER_API, "/base-cameras/get"),
          {
            method: "GET",
            queryParams: {
              filter: `active=true`,
              limit: "1000",
              orderBy: "id.asc",
            },
          },
        );

        if (res.success) {
          const updated = res.data.map((row) => ({
            ...row,
            mjpeg_stream_url: row.live_stream_url,
          })) as any;
          setCameraList(updated);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        PopupMessage(
          t("message.error.error-while-fetching-data"),
          errorMessage,
          "error",
        );
      }
    };

    fetchData();
  }, [cameraRefreshKey]);

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDropdownChange = (
    key: keyof typeof formData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleCarBrandChange = (
    event: React.SyntheticEvent,
    value: { value: any; label: string } | null,
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("car_brand", value.value);
    } else {
      handleDropdownChange("car_brand", "all");
    }
  };

  const handleCarColorChange = (
    event: React.SyntheticEvent,
    value: { value: any; label: string } | null,
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("car_color", value.value);
    } else {
      handleDropdownChange("car_color", "all");
    }
  };

  const handleCarTypeChange = (
    event: React.SyntheticEvent,
    value: { value: any; label: string } | null,
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("car_type", value.value);
    } else {
      handleDropdownChange("car_type", "all");
    }
  };

  const handleStartDateTimeChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      start_date_time: date,
    }));
    setValue("start_date_time", date);
  };

  const handleEndDateTimeChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      end_date_time: date,
    }));
    setValue("end_date_time", date);
  };

  const handleCameraChange = (ids: string[]) => {
    let newIds: string[];

    if (ids.length === 0 || ids.includes("0")) {
      newIds = ["0"];
    } else {
      newIds = ids;
    }

    const selectedObjects = camerasOption.filter((camera) =>
      newIds.includes(camera.value),
    );

    setSelectedCameraObjects(selectedObjects);
  };

  const handleClearSearch = async () => {
    resetData();
  };

  const resetData = () => {
    const startDateTime = dayjs().subtract(1, "day").toDate();
    const endDateTime = dayjs().toDate();
    setFormData({
      car_brand: "all",
      car_type: "all",
      car_color: "all",
      age: "all",
      glasses: "all",
      bag: "all",
      bag_type: "all",
      hat: "all",
      hat_type: "all",
      coat: "all",
      coat_color: "all",
      mask: "all",
      beard: "all",
      trousers: "all",
      trousers_color: "all",
      gender: "all",
      emotion: "all",
      start_date_time: startDateTime,
      end_date_time: endDateTime,
      checkpoints_id: [],
    });
    setValue("start_date_time", startDateTime);
    setValue("end_date_time", endDateTime);
    setSelectedCameraObjects([{ label: t("dropdown.all"), value: "0" }]);
    setMultiDetectDataList([]);
    setTotalPages(1);
    setTotalData(0);
    clearErrors();
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value);
    setRowsPerPage(parseInt(event.target.value));
    await fetchSearchData(page, limit);
  };

  const handlePageChange = async (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    event.preventDefault();
    setPage(value);
    await fetchSearchData(value, rowsPerPage);
  };

  const handlePageInputKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      setPage(pageInput);
      await fetchSearchData(pageInput, rowsPerPage);
    }
  };

  const handlePageInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, "");

    if (cleaned) {
      const numberInput = Number(cleaned);
      if (numberInput > 0 && numberInput <= totalPages) {
        setPageInput(numberInput);
      }
    } else if (cleaned === "") {
      setPageInput(1);
    }
    return cleaned;
  };

  const handleCamerasSelected = (
    cameraSelected: { value: any; label: string }[],
  ) => {
    setSelectedCameraObjects(cameraSelected);
  };

  const exportToCsv = async () => {
    try {
      if (totalData > CHUNK_SIZE) {
        const confirmed = await PopupMessageCustomTextWithCancel(
          t("message.warning.export-all-confirmation"),
          t("message.warning.export-all-confirmation-message", {
            totalNumber: totalData,
          }),
          t("button.confirm"),
          t("button.cancel"),
          "warning",
          "#FDB600",
        );

        if (!confirmed) return;

        await handleExportAllDataInCsvConfirm();
        return;
      }

      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t("progress-bar.data-downloading"));

      const response = await fetchNewData(1, CHUNK_SIZE);

      setProgress(80);
      setProgressMessage(t("progress-bar.csv-file-preparing"));

      const csvBlob = await generateDataToExport(response.data);
      const date = dayjs().format(
        i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD",
      );
      const csvName = `${t("file.search-multi-detect")}_${date}.csv`;

      downloadFile(csvName, URL.createObjectURL(csvBlob));

      setProgress(100);
      setProgressMessage(t("progress-bar.file-download-complete"));
      setPageLoading(false);
    } catch (error) {
      setProgress(0);
      setProgressMessage("");
      setPageLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      PopupMessage(
        t("message.error.error-while-export-data"),
        errorMessage,
        "error",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const handleExportAllDataInCsvConfirm = async () => {
    try {
      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t("progress-bar.data-downloading"));

      let allData: MultiDetectData[] = [];
      const allPage = Math.ceil(totalData / REQUEST_LIMIT);
      setProgress(20);

      for (let i = 1; i <= allPage; i++) {
        const downloadedData = (i - 1) * REQUEST_LIMIT;
        setProgressMessage(
          t("progress-bar.data-downloading-with-total", {
            downloadedData: downloadedData,
            totalData: totalData,
          }),
        );

        const response = await fetchNewData(i, REQUEST_LIMIT);
        allData.push(...response.data);
        setProgress(20 + (i / allPage) * 60);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chunks: MultiDetectData[][] = [];
      for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
        chunks.push(allData.slice(i, i + CHUNK_SIZE));
      }

      const date = dayjs().format(
        i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD",
      );
      const zip = new JSZip();

      setProgress(80);
      setProgressMessage(
        t("progress-bar.csv-file-preparing-with-total", {
          chunksLength: chunks.length,
        }),
      );

      for (let i = 0; i < chunks.length; i++) {
        const chunkData = chunks[i];
        const csvBlob = await generateDataToExport(chunkData);
        const csvFileName = `${t("file.search-multi-detect")}_${date}_${i + 1}.csv`;
        zip.file(csvFileName, csvBlob);

        setProgress(80 + ((i + 1) / chunks.length) * 15);
        setProgressMessage(
          t("progress-bar.file-creating-with-total", {
            currentNumber: i + 1,
            chunksLength: chunks.length,
          }),
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setProgressMessage(t("progress-bar.zip-file-creating"));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${t("file.search-multi-detect")}_${date}.zip`;
      saveAs(zipBlob, zipName);

      setProgress(100);
      setProgressMessage(t("progress-bar.file-download-complete"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      PopupMessage(
        t("message.error.error-while-export-data"),
        errorMessage,
        "error",
      );
    } finally {
      setProgress(0);
      setProgressMessage("");
      setPageLoading(false);
    }
  };

  const exportToPdf = async () => {
    try {
      if (totalData > CHUNK_SIZE) {
        const confirmed = await PopupMessageCustomTextWithCancel(
          t("message.warning.export-all-confirmation"),
          t("message.warning.export-all-confirmation-message", {
            totalNumber: totalData,
          }),
          t("button.confirm"),
          t("button.cancel"),
          "warning",
          "#FDB600",
        );

        if (!confirmed) return;

        await handleExportAllDataInPdfConfirm();
        return;
      }

      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t("progress-bar.data-downloading"));

      const response = await fetchNewData(1, CHUNK_SIZE);

      setProgress(80);
      setProgressMessage(t("progress-bar.pdf-file-preparing"));

      const updateData = response.data.map((item) => {
        return {
          ...item,
          details: {
            car_brand: getLabelFromValue("car_brand", item.details.car_brand || "") || "-",
            car_color: getLabelFromValue("car_color", item.details.car_color || "") || "-",
            car_type: getLabelFromValue("car_type", item.details.car_type || "") || "-",
            age: item.details.age,
            glasses: getLabelFromValue("glasses", item.details.glasses || "") || "-",
            bag: getLabelFromValue("bag", item.details.bag || "") || "-",
            bag_type: getLabelFromValue("bag_type", item.details.bag_type || "") || "-",
            hat: getLabelFromValue("hat", item.details.hat || "") || "-",
            hat_type: getLabelFromValue("hat_type", item.details.hat_type || "") || "-",
            coat: getLabelFromValue("coat", item.details.coat || "") || "-",
            coat_color: getLabelFromValue("coat_color", item.details.coat_color || "") || "-",
            mask: getLabelFromValue("mask", item.details.mask || "") || "-",
            beard: getLabelFromValue("beard", item.details.beard || "") || "-",
            trousers: getLabelFromValue("trousers", item.details.trousers || "") || "-",
            trousers_color: getLabelFromValue("trousers_color", item.details.trousers_color || "") || "-",
            gender: getLabelFromValue("gender", item.details.gender || "") || "-",
            emotion: getLabelFromValue("emotion", item.details.emotion || "") || "-",
          }
        };
      });

      const date = dayjs().format(
        i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD",
      );
      const pdfName = `${t("file.search-multi-detect")}_${date}.pdf`;
      await downloadSearchResultPdf(
        updateData,
        pdfName,
        t,
        i18n,
        CENTER_FILE_URL,
      );

      setProgress(100);
      setProgressMessage(t("progress-bar.file-download-complete"));
      setPageLoading(false);
    }
    catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      PopupMessage(
        t("message.error.error-while-export-data"),
        errorMessage,
        "error",
      );
    }
    finally {
      setProgress(0);
      setProgressMessage("");
      setPageLoading(false);
    }
  };

  const handleExportAllDataInPdfConfirm = async () => {
    try {
      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t("progress-bar.data-downloading"));

      let allData: MultiDetectData[] = [];
      const allPage = Math.ceil(totalData / REQUEST_LIMIT);
      setProgress(20);

      for (let i = 1; i <= allPage; i++) {
        const downloadedData = (i - 1) * REQUEST_LIMIT;
        setProgressMessage(
          t("progress-bar.data-downloading-with-total", {
            downloadedData: downloadedData,
            totalData: totalData,
          }),
        );

        const response = await fetchNewData(i, REQUEST_LIMIT);
        allData.push(...response.data);
        setProgress(20 + (i / allPage) * 60);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const updateData = allData.map((item) => {
        return {
          ...item,
          details: {
            car_brand: getLabelFromValue("car_brand", item.details.car_brand || "") || "-",
            car_color: getLabelFromValue("car_color", item.details.car_color || "") || "-",
            car_type: getLabelFromValue("car_type", item.details.car_type || "") || "-",
            age: item.details.age,
            glasses: getLabelFromValue("glasses", item.details.glasses || "") || "-",
            bag: getLabelFromValue("bag", item.details.bag || "") || "-",
            bag_type: getLabelFromValue("bag_type", item.details.bag_type || "") || "-",
            hat: getLabelFromValue("hat", item.details.hat || "") || "-",
            hat_type: getLabelFromValue("hat_type", item.details.hat_type || "") || "-",
            coat: getLabelFromValue("coat", item.details.coat || "") || "-",
            coat_color: getLabelFromValue("coat_color", item.details.coat_color || "") || "-",
            mask: getLabelFromValue("mask", item.details.mask || "") || "-",
            beard: getLabelFromValue("beard", item.details.beard || "") || "-",
            trousers: getLabelFromValue("trousers", item.details.trousers || "") || "-",
            trousers_color: getLabelFromValue("trousers_color", item.details.trousers_color || "") || "-",
            gender: getLabelFromValue("gender", item.details.gender || "") || "-",
            emotion: getLabelFromValue("emotion", item.details.emotion || "") || "-",
          }
        };
      });

      const chunks: MultiDetectData[][] = [];
      for (let i = 0; i < updateData.length; i += CHUNK_SIZE) {
        chunks.push(updateData.slice(i, i + CHUNK_SIZE));
      }

      const date = dayjs().format(
        i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD",
      );
      const zip = new JSZip();

      setProgress(80);
      setProgressMessage(
        t("progress-bar.pdf-file-preparing-with-total", {
          chunksLength: chunks.length,
        }),
      );

      for (let i = 0; i < chunks.length; i++) {
        const chunkData = chunks[i];
        const pdfBlob = await generateSearchResultPdfBlob(
          chunkData,
          t,
          i18n,
          CENTER_FILE_URL,
        );
        const pdfFileName = `${t("file.search-multi-detect")}_${date}_${i + 1}.pdf`;
        zip.file(pdfFileName, pdfBlob);

        setProgress(80 + ((i + 1) / chunks.length) * 15);
        setProgressMessage(
          t("progress-bar.file-creating-with-total", {
            currentNumber: i + 1,
            chunksLength: chunks.length,
          }),
        );
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setProgressMessage(t("progress-bar.zip-file-creating"));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${t("file.search-multi-detect")}_${date}.zip`;
      saveAs(zipBlob, zipName);

      setProgress(100);
      setProgressMessage(t("progress-bar.file-download-complete"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      PopupMessage(
        t("message.error.error-while-export-data"),
        errorMessage,
        "error",
      );
    } finally {
      setProgress(0);
      setProgressMessage("");
      setPageLoading(false);
    }
  };

  const handleSearchClick = async () => {
    await fetchSearchData(1, rowsPerPage);
  };

  const fetchSearchData = async (
    currentPage: number = page,
    limit: number = rowsPerPage,
  ) => {
    try {
      setIsLoading(true);

      const maxAge = getMinMaxAgeValues()?.max;
      const minAge = getMinMaxAgeValues()?.min;

      const body = {
        // Common
        ...((selectedCameraObjects.length > 0 && selectedCameraObjects.some((v) => v.value !== "0")) && { 
          checkpoint_uid_list: selectedCameraObjects.filter((v) => v.value !== 0).map((v) => v.value).join(",")
        }),
        begin_time: dayjs(formData.start_date_time).toISOString(),
        end_time: dayjs(formData.end_date_time).toISOString(),
        // Vehicle
        ...((formData.car_brand && formData.car_brand !== "all") && {
          car_brand: formData.car_brand,
        }),
        ...((formData.car_color && formData.car_color !== "all") && {
          car_color: formData.car_color,
        }),
        ...((formData.car_type && formData.car_type !== "all") && {
          car_type: formData.car_type,
        }),
        // Human
        ...(maxAge && {
          max_age: maxAge,
        }),
        ...(minAge && {
          min_age: minAge,
        }),
        ...((formData.gender && formData.gender !== "all") && {
          gender: formData.gender,
        }),
        ...((formData.emotion && formData.emotion !== "all") && {
          emotion: formData.emotion,
        }),
        ...((formData.glasses && formData.glasses !== "all") && {
          glasses: formData.glasses,
        }),
        ...((formData.bag && formData.bag !== "all") && {
          bag: formData.bag,
        }),
        ...((formData.bag_type && formData.bag_type !== "all") && {
          bag_type: formData.bag_type,
        }),
        ...((formData.hat && formData.hat !== "all") && {
          hat: formData.hat,
        }),
        ...((formData.hat_type && formData.hat_type !== "all") && {
          hat_type: formData.hat_type,
        }),
        ...((formData.coat && formData.coat !== "all") && {
          coat: formData.coat,
        }),
        ...((formData.coat_color && formData.coat_color !== "all") && {
          coat_color: formData.coat_color,
        }),
        ...((formData.mask && formData.mask !== "all") && {
          mask: formData.mask,
        }),
        ...((formData.beard && formData.beard !== "all") && {
          beard: formData.beard,
        }),
        ...((formData.trousers && formData.trousers !== "all") && {
          trousers: formData.trousers,
        }),
        ...((formData.trousers_color && formData.trousers_color !== "all") && {
          trousers_color: formData.trousers_color,
        }),
        page: currentPage,
        limit: limit,
        order: [["capture_time", "desc"]],
      };

      const res = await fetchClient<MultiDetectDataResponse>(
        combineURL(CENTER_API, "/object-detections/get-detections"),
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );

      if (res.success) {
        setTotalPages(res.pagination.maxPage);
        setTotalData(res.pagination.countAll);
        setMultiDetectDataList(res.data);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      PopupMessage(
        t("message.error.error-while-fetching-data"),
        errorMessage,
        "error",
      );
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const fetchNewData = async (
    currentPage: number = page,
    limit: number = rowsPerPage,
  ) => {
    try {
      const maxAge = getMinMaxAgeValues()?.max;
      const minAge = getMinMaxAgeValues()?.min;

      const body = {
        // Common
        ...((selectedCameraObjects.length > 0 && selectedCameraObjects.some((v) => v.value !== "0")) && { 
          checkpoint_uid_list: selectedCameraObjects.filter((v) => v.value !== 0).map((v) => v.value).join(",")
        }),
        begin_time: dayjs(formData.start_date_time).toISOString(),
        end_time: dayjs(formData.end_date_time).toISOString(),
        // Vehicle
        ...((formData.car_brand && formData.car_brand !== "all") && {
          car_brand: formData.car_brand,
        }),
        ...((formData.car_color && formData.car_color !== "all") && {
          car_color: formData.car_color,
        }),
        ...((formData.car_type && formData.car_type !== "all") && {
          car_type: formData.car_type,
        }),
        // Human
        ...(maxAge && {
          max_age: maxAge,
        }),
        ...(minAge && {
          min_age: minAge,
        }),
        ...((formData.gender && formData.gender !== "all") && {
          gender: formData.gender,
        }),
        ...((formData.emotion && formData.emotion !== "all") && {
          emotion: formData.emotion,
        }),
        ...((formData.glasses && formData.glasses !== "all") && {
          glasses: formData.glasses,
        }),
        ...((formData.bag && formData.bag !== "all") && {
          bag: formData.bag,
        }),
        ...((formData.bag_type && formData.bag_type !== "all") && {
          bag_type: formData.bag_type,
        }),
        ...((formData.hat && formData.hat !== "all") && {
          hat: formData.hat,
        }),
        ...((formData.hat_type && formData.hat_type !== "all") && {
          hat_type: formData.hat_type,
        }),
        ...((formData.coat && formData.coat !== "all") && {
          coat: formData.coat,
        }),
        ...((formData.coat_color && formData.coat_color !== "all") && {
          coat_color: formData.coat_color,
        }),
        ...((formData.mask && formData.mask !== "all") && {
          mask: formData.mask,
        }),
        ...((formData.beard && formData.beard !== "all") && {
          beard: formData.beard,
        }),
        ...((formData.trousers && formData.trousers !== "all") && {
          trousers: formData.trousers,
        }),
        ...((formData.trousers_color && formData.trousers_color !== "all") && {
          trousers_color: formData.trousers_color,
        }),
        page: currentPage,
        limit: limit,
        order: [["capture_time", "desc"]],
      };

      const res = await fetchClient<MultiDetectDataResponse>(
        combineURL(CENTER_API, "/object-detections/get-detections"),
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw errorMessage;
    }
  };

  const generateDataToExport = async (data: MultiDetectData[]) => {
    const columnLabels = {
      detectMode: t("csv.column.detect-mode"),
      cameraName: t("csv.column.camera-name"),
      age: t("csv.column.age"),
      glasses: t("csv.column.glasses"),
      bag: t("csv.column.bag"),
      bagType: t("csv.column.bag-type"),
      hat: t("csv.column.hat"),
      hatType: t("csv.column.hat-type"),
      coat: t("csv.column.coat"),
      coatColor: t("csv.column.coat-color"),
      mask: t("csv.column.mask"),
      beard: t("csv.column.beard"),
      trousers: t("csv.column.trousers"),
      trousersColor: t("csv.column.trousers-color"),
      gender: t("csv.column.gender"),
      emotion: t("csv.column.emotion"),
      carType: t("csv.column.car-type"),
      carColor: t("csv.column.car-color"),
      carBrand: t("csv.column.car-brand"),
      dayRange: t("csv.column.day-range"),
      time: t("csv.column.time"),
    };

    const emptyHumanFields = {
      [columnLabels.age]: "-",
      [columnLabels.gender]: "-",
      [columnLabels.emotion]: "-",
      [columnLabels.glasses]: "-",
      [columnLabels.bag]: "-",
      [columnLabels.bagType]: "-",
      [columnLabels.hat]: "-",
      [columnLabels.hatType]: "-",
      [columnLabels.coat]: "-",
      [columnLabels.coatColor]: "-",
      [columnLabels.mask]: "-",
      [columnLabels.beard]: "-",
      [columnLabels.trousers]: "-",
      [columnLabels.trousersColor]: "-",
    };

    const emptyVehicleFields = {
      [columnLabels.carBrand]: "-",
      [columnLabels.carType]: "-",
      [columnLabels.carColor]: "-",
    };

    const dataRows = data.map((data) => ({
      [columnLabels.detectMode]: data.object_type === "human" ? t("text.human") : t("text.vehicle"),
      [columnLabels.cameraName]: data.camera_name || "-",
      ...(
        data.object_type === "human"
          ? {
              [columnLabels.age]: `${data.details.age || 0} ${t("text.years")}`,
              [columnLabels.gender]: data.details.gender || "-",
              [columnLabels.emotion]: getLabelFromValue("emotion", data.details.emotion || "") || "-",
              [columnLabels.glasses]: getLabelFromValue("glasses", data.details.glasses || "") || "-",
              [columnLabels.bag]: getLabelFromValue("bag", data.details.bag || "") || "-",
              [columnLabels.bagType]: getLabelFromValue("bag_type", data.details.bag_type || "") || "-",
              [columnLabels.hat]: getLabelFromValue("hat", data.details.hat || "") || "-",
              [columnLabels.hatType]: getLabelFromValue("hat_type", data.details.hat_type || "") || "-",
              [columnLabels.coat]: getLabelFromValue("coat", data.details.coat || "") || "-",
              [columnLabels.coatColor]: getLabelFromValue("coat_color", data.details.coat_color || "") || "-",
              [columnLabels.mask]: getLabelFromValue("mask", data.details.mask || "") || "-",
              [columnLabels.beard]: getLabelFromValue("beard", data.details.beard || "") || "-",
              [columnLabels.trousers]: getLabelFromValue("trousers", data.details.trousers || "") || "-",
              [columnLabels.trousersColor]: getLabelFromValue("trousers_color", data.details.trousers_color || "") || "-",
              ...emptyVehicleFields,
            }
          : {
              [columnLabels.carBrand]: getLabelFromValue("car_brand", data.details.car_brand || "") || "-",
              [columnLabels.carType]: getLabelFromValue("car_type", data.details.car_type || "") || "-",
              [columnLabels.carColor]: getLabelFromValue("car_color", data.details.car_color || "") || "-",
              ...emptyHumanFields,
            }
      ),
      [columnLabels.dayRange]: dayjs(data.capture_time).format("DD/MM/YYYY"),
      [columnLabels.time]: dayjs(data.capture_time).format("HH:mm:ss"),
    }));

    const csvString =
      t("file.search-multi-detect") +
      "\n" +
      Papa.unparse(dataRows, { columns: Object.values(columnLabels) });

    const csvWithBOM = "\uFEFF" + csvString;
    return new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  };

  const clearData = () => {
    setFormData({
      car_brand: "all",
      car_type: "all",
      car_color: "all",
      age: "all",
      glasses: "all",
      bag: "all",
      bag_type: "all",
      hat: "all",
      hat_type: "all",
      coat: "all",
      coat_color: "all",
      mask: "all",
      beard: "all",
      trousers: "all",
      trousers_color: "all",
      gender: "all",
      emotion: "all",
      start_date_time: dayjs().subtract(1, "day").toDate(),
      end_date_time: dayjs().toDate(),
      checkpoints_id: [],
    });
    setSearchCamerasVisible(false);
    setIsAccordionOpen(true);
    setCarColorsOptions([]);
    setCarMakesOptions([]);
    setCamerasOption([]);
    setValue("start_date_time", null);
    setValue("end_date_time", null);

    setSelectedCameraObjects([{ label: t("dropdown.all"), value: "0" }]);

    // Pagination
    setPage(1);
    setPageInput(1);
    setTotalPages(1);
    setRowsPerPage(
      SEARCH_MULTI_DETECT_ROW_PER_PAGES[
        SEARCH_MULTI_DETECT_ROW_PER_PAGES.length - 1
      ],
    );
  };

  const handleImageClick = (
    event: React.MouseEvent<HTMLDivElement>,
    data: MultiDetectData,
  ) => {
    event.stopPropagation();
    setShowLargeImage(true);
    setLargeImageList([
      {
        name: "Image",
        url: `${CENTER_FILE_URL}${data.image_url}`,
        className: "",
      },
      {
        name: "Overview",
        url: `${CENTER_FILE_URL}${data.picture_url}`,
        className: "",
      },
    ]);
  };

  const handleFormat = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[],
  ) => {
    event.preventDefault();
    setFormats(newFormats);
  };

  const handleBeehiveChange = (
    key: string,
    value: any,
    type?: any,
    color?: any
  ) => {
    if (value?.value) {
      handleDropdownChange(key as keyof typeof formData, value.value);
    }

    if (type?.value) {
      handleDropdownChange(`${key}_type` as keyof typeof formData, type?.value);
    }

    if (color?.value) {
      handleDropdownChange(`${key}_color` as keyof typeof formData, color?.value);
    }
  };

  const getLabelFromValue = (key: string, value: string) => {
    const options = optionMap[key]

    if (!options) return value

    const found = options.find((opt) => opt.value === value.toLowerCase())
    return found?.label || value
  }

  const selectedHumanEntries = Object.entries(formData).filter(([key, value]) => {
    if (!value) return false
    if (key === "start_date_time" || key === "end_date_time") return false
    if (key === "checkpoints_id") return false
    if (key === "plate_group" || key === "plate_number" || key === "group_province_code" || key === "car_brand" || key === "car_type" || key === "car_color") return false
    if (value === "all") return false
    return true
  })

  const selectedVehicleEntries = Object.entries(formData).filter(([key, value]) => {
    if (!value) return false
    if (key === "start_date_time" || key === "end_date_time") return false
    if (key === "checkpoints_id") return false
    if (key === "age" || key === "glasses" || key === "bag" || 
      key === "bag_type" || key === "hat" || key === "hat_type" || 
      key === "coat" || key === "coat_color" || key === "mask" || 
      key === "beard" || key === "trousers" || key === "trousers_color" || 
      key === "gender" || key === "emotion") return false
    if (value === "all") return false
    return true
  })

  const getMinMaxAgeValues = () => {
    const ageValue = formData.age;

    if (ageValue) {
      const [minPart, maxPart] = ageValue.split(":");

      const min = minPart ? Number(minPart.split("_")[1]) : null;
      const max = maxPart ? Number(maxPart.split("_")[1]) : null;
      return { min, max };
    }
  };

  const createDetectDetail = (data: MultiDetectData): React.ReactNode => {
    if (data.object_type === "human") {
      return createHumanDetail(data)
    } 
    else {
      return createVehicleDetail(data)
    }
  }

  const createHumanDetail = (data: MultiDetectData): React.ReactNode => {
    const fields: (keyof MultiDetectData["details"])[] = [
      "age",
      "gender",
      "hat",
      "hat_type",
      "coat",
      "coat_color",
      "trousers",
      "trousers_color",
      "beard",
      "mask",
      "glasses",
      "emotion",
      "bag",
      "bag_type",
    ];

    const detailList = fields
      .filter((key) => data.details[key] !== undefined && data.details[key] !== "")
      .map((key) => ({
        name: key,
        value: data.details[key] ?? "",
      }));

    return (
      <div className="grid grid-cols-2 gap-2">
        {detailList.map((detail, index) => (
          <div key={index} className="flex gap-1">
            <p className="text-white text-sm underline">{`${t(`component.${detail.name.replace("_", "-")}`)}`}<span className="text-gray-400 text-sm">{`: `}</span></p>
            <p className="text-white">
              {detail.name === "age"
                ? `${detail.value} ${t("text.years")}`
                : getLabelFromValue(detail.name, detail.value.toString())}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const createVehicleDetail = (data: MultiDetectData): React.ReactNode => {
    const fields: (keyof MultiDetectData["details"])[] = [
      "car_brand",
      "car_type",
      "car_color",
    ];

    const detailList = fields
      .filter((key) => data.details[key])
      .map((key) => ({
        name: key,
        value: data.details[key] || "",
      }));
    
    return (
      <div className="grid grid-cols-2 gap-2">
        {detailList.map((detail, index) => (
          <div key={index} className="flex gap-1">
            <p className="text-white text-sm underline">{`${t(`component.${detail.name.replace("_", "-")}`)}`}<span className="text-gray-400 text-sm">{`: `}</span></p>
            <p className="text-white">{getLabelFromValue(detail.name, detail.value.toString().toLowerCase().includes("unrecognized") ? "-1" : detail.value.toString())}</p>
          </div>
        ))}
      </div>
    )
  };

  return (
    <div
      id="search-multi-detect"
      className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} transition-all duration-500`}
    >
      {isLoading && <Loading />}
      {pageLoading && (
        <ProgressBarWithLabel message={progressMessage} value={progress} />
      )}
      <div className="w-full h-full overflow-x-auto">
        <div
          className={`flex flex-col w-full h-full overflow-auto ${isOpen ? "min-w-[660px]" : "min-w-[1200px]"}`}
        >
          {/* Header */}
          <Typography variant="h5" color="white" className="font-bold">
            {t("screen.search-multi-detect.title")}
          </Typography>

          {/* Filter Part */}
          <Accordion
            disableGutters
            sx={{
              boxShadow: "none",
              "&.Mui-expanded": { margin: 0 },
              pr: "30px",
              backgroundColor: "transparent",
              mt: "10px",
            }}
            expanded={isAccordionOpen}
            onChange={() => setIsAccordionOpen((prev) => !prev)}
          >
            <AccordionSummary
              expandIcon={
                <KeyboardArrowUp sx={{ fontSize: 28, color: "white" }} />
              }
              sx={{
                backgroundColor: "#242727",
                color: "#FFFFFF",
                borderBottom: "1px solid #FFFFFF",
              }}
            >
              {t("accordion.search-condition")}
            </AccordionSummary>

            <AccordionDetails
              sx={{
                backgroundColor: "#111111",
                px: 0,
              }}
            >
              <form
                onSubmit={handleSubmit(handleSearchClick)}
                className="flex-none"
              >
                <div className={`flex flex-col overflow-auto`}>
                  <div className="flex flex-col flex-1 px-2 gap-2">
                    <div className="flex flex-col px-3">
                      <div className="grid grid-cols-5 gap-3">
                        <div className="flex flex-col w-full col-span-2">
                          <Typography
                            sx={{ fontSize: "15px" }}
                            variant="subtitle1"
                            color="white"
                          >
                            {t("component.checkpoint-2")}
                          </Typography>
                          <div className="w-full items-center justify-center mt-2">
                            <div className="flex-1">
                              <MultiSelectCameras
                                limitTags={1}
                                options={camerasOption}
                                onChange={handleCameraChange}
                                selectedValues={selectedCameraObjects}
                                placeHolder={t("placeholder.checkpoint-2")}
                                isLocationButton={true}
                                onIconClick={() =>
                                  setSearchCamerasVisible(true)
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Typography
                            sx={{ fontSize: "15px" }}
                            variant="subtitle1"
                            color="white"
                          >
                            {t("component.start-time")}
                            {<span className="text-red-500"> *</span>}
                          </Typography>
                          <DatePickerBuddhist
                            value={formData.start_date_time}
                            sx={{
                              marginTop: "8px",
                              borderRadius: "5px",
                              backgroundColor: "white",
                              "& .MuiTextField-root": {
                                height: "fit-content",
                              },
                              "& .MuiOutlinedInput-input": {
                                fontSize: 14,
                              },
                            }}
                            className="w-full"
                            id="start-date-time"
                            onChange={(value) =>
                              handleStartDateTimeChange(value)
                            }
                            isWithTime={true}
                            error={!!errors.start_date_time}
                            register={register("start_date_time", {
                              required: true,
                            })}
                          ></DatePickerBuddhist>
                        </div>

                        <div>
                          <Typography
                            sx={{ fontSize: "15px" }}
                            variant="subtitle1"
                            color="white"
                          >
                            {t("component.end-time")}
                            {<span className="text-red-500"> *</span>}
                          </Typography>
                          <DatePickerBuddhist
                            value={formData.end_date_time}
                            sx={{
                              marginTop: "8px",
                              borderRadius: "5px",
                              backgroundColor: "white",
                              "& .MuiTextField-root": {
                                height: "fit-content",
                              },
                              "& .MuiOutlinedInput-input": {
                                fontSize: 14,
                              },
                            }}
                            className="w-full"
                            id="end-date-time"
                            onChange={(value) => handleEndDateTimeChange(value)}
                            isWithTime={true}
                            error={!!errors.end_date_time}
                            register={register("end_date_time", {
                              required: true,
                            })}
                          ></DatePickerBuddhist>
                        </div>
                        <div className="flex justify-end items-end gap-2">
                          <div className="flex items-center h-full pt-5">
                            <p className="text-white">{`${t("component.suspect-list")} :`}</p>
                          </div>
                          <ToggleButtonGroup
                            value={formats}
                            onChange={handleFormat}
                            sx={{
                              backgroundColor: "#242727",
                              "& .MuiToggleButton-root": {
                                "&.Mui-selected": {
                                  backgroundColor: "#2B9BED",
                                  ":hover": {
                                    backgroundColor: "#227CBE",
                                  },
                                },
                                ":hover": {
                                  backgroundColor: "#227CBE",
                                },
                              },
                            }}
                          >
                            <ToggleButton
                              value="vehicle"
                              title={t("button.vehicle")}
                            >
                              <CarFront color="#FFF" size={30} />
                            </ToggleButton>
                            <ToggleButton
                              value="human"
                              title={t("button.human")}
                            >
                              <img
                                src={SearchHumanIcon}
                                alt="Search Human Icon"
                                className="w-[30px] h-[30px]"
                              />
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full">
                      {(!formats.includes("vehicle") && selectedVehicleEntries.length > 0) && (
                        <div className="flex flex-col w-full px-3">
                          <OutlinedContainer title={t("text.detect-vehicle-selected-detail")} height={formats.includes("human") ? 203 : "5vh"}>
                            <div className="flex flex-wrap gap-2">
                              {selectedVehicleEntries.map(([key, value]) => {
                                  const displayValue =
                                    typeof value === "string"
                                      ? getLabelFromValue(key, value)
                                      : value

                                  return (
                                    <Chip
                                      key={key}
                                      label={`${t(`component.${key.replace("_", "-")}`)} : ${displayValue}`}
                                      onDelete={() => handleTextChange(key as keyof FormData, "")}
                                      sx={{
                                        backgroundColor: "#227CBE",
                                        color: "#fff",
                                        fontSize: "13px",
                                      }}
                                    />
                                  )
                                })}
                            </div>
                          </OutlinedContainer>
                        </div>
                      )}
                      {(!formats.includes("human") && selectedHumanEntries.length > 0) && (
                        <div className="flex flex-col w-full px-3">
                          <OutlinedContainer title={t("text.detect-human-selected-detail")} height={formats.includes("vehicle") ? 203 : "5vh"}>
                            <div className="flex flex-wrap gap-2">
                              {selectedHumanEntries.map(([key, value]) => {
                                  const displayValue =
                                    typeof value === "string"
                                      ? key === "age"
                                        ? getMinMaxAgeValues()?.max ? `${getMinMaxAgeValues()?.min}-${getMinMaxAgeValues()?.max} ${t('text.years')}` : `${getMinMaxAgeValues()?.min}+ ${t('text.years')}`
                                        : getLabelFromValue(key, value)
                                      : value

                                  return (
                                    <Chip
                                      key={key}
                                      label={`${t(`component.${key.replace("_", "-")}`)} : ${displayValue}`}
                                      onDelete={() => handleTextChange(key as keyof FormData, "")}
                                      sx={{
                                        backgroundColor: "#1B6398",
                                        color: "#fff",
                                        fontSize: "13px",
                                      }}
                                    />
                                  )
                                })}
                            </div>
                          </OutlinedContainer>
                        </div>
                      )}
                      {formats.includes("vehicle") && (
                        <div className="px-3 w-full">
                          <OutlinedContainer
                            title={t("text.detect-vehicle-detail")}
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <AutoComplete
                                id="car-brand-select"
                                sx={{ marginTop: "10px" }}
                                value={formData.car_brand}
                                onChange={handleCarBrandChange}
                                options={carMakesOptions}
                                label={t("component.car-brand")}
                                placeholder={t("placeholder.car-brand")}
                                labelFontSize="15px"
                              />

                              <AutoComplete
                                id="car-color-select"
                                sx={{ marginTop: "10px" }}
                                value={formData.car_color}
                                onChange={handleCarColorChange}
                                options={carColorsOptions}
                                label={t("component.car-color")}
                                placeholder={t("placeholder.car-color")}
                                labelFontSize="15px"
                              />

                              <AutoComplete
                                id="car-type-select"
                                sx={{ marginTop: "10px" }}
                                value={formData.car_type}
                                onChange={handleCarTypeChange}
                                options={carTypesOptions}
                                label={t("component.car-type")}
                                placeholder={t("placeholder.car-type")}
                                labelFontSize="15px"
                              />
                            </div>
                          </OutlinedContainer>
                        </div>
                      )}
                      {formats.includes("human") && (
                        <div className="w-full">
                          <OutlinedContainer
                            title={t("text.detect-human-detail")}
                          >
                            <Beehive
                              items={[
                                {
                                  key: "age",
                                  title: t("component.age"),
                                  placeholder: t("placeholder.age"),
                                  iconButton: AgeIcon,
                                  width: 48,
                                  height: 48,
                                  options: ageOptions,
                                },
                                {
                                  key: "gender",
                                  title: t("component.gender"),
                                  placeholder: t("placeholder.gender"),
                                  iconButton: GenderIcon,
                                  width: 40,
                                  height: 40,
                                  options: genderOptions,
                                },
                                {
                                  key: "coat",
                                  title: t("component.coat"),
                                  placeholder: t("placeholder.coat"),
                                  iconButton: ShirtIcon,
                                  width: 43,
                                  height: 43,
                                  options: coatOptions,
                                  colorOptions: coatColorOptions,
                                },
                                {
                                  key: "trousers",
                                  title: t("component.trousers"),
                                  placeholder: t("placeholder.trousers"),
                                  iconButton: PantsIcon,
                                  width: 43,
                                  height: 43,
                                  options: trousersOptions,
                                  colorOptions: trousersColorOptions,
                                },
                                {
                                  key: "hat",
                                  title: t("component.hat"),
                                  placeholder: t("placeholder.hat"),
                                  iconButton: HatIcon,
                                  width: 50,
                                  height: 50,
                                  options: hatOptions,
                                  types: hatTypesOptions,
                                  typeText: t("component.hat-type"),
                                  typePlaceholder: t("placeholder.hat-type"),
                                },
                                {
                                  key: "bag",
                                  title: t("component.bag"),
                                  placeholder: t("placeholder.bag"),
                                  iconButton: BagIcon,
                                  width: 50,
                                  height: 50,
                                  options: bagOptions,
                                  types: bagTypesOptions,
                                  typeText: t("component.bag-type"),
                                  typePlaceholder: t("placeholder.bag-type"),
                                },
                                {
                                  key: "emotion",
                                  title: t("component.emotion"),
                                  placeholder: t("placeholder.emotion"),
                                  iconButton: EmotionIcon,
                                  width: 43,
                                  height: 43,
                                  options: emotionOptions,
                                },
                                {
                                  key: "glasses",
                                  title: t("component.glasses"),
                                  placeholder: t("placeholder.glasses"),
                                  iconButton: GlassesIcon,
                                  width: 43,
                                  height: 43,
                                  options: glassesOptions,
                                },
                                {
                                  key: "beard",
                                  title: t("component.beard"),
                                  placeholder: t("placeholder.beard"),
                                  iconButton: BreadIcon,
                                  width: 43,
                                  height: 43,
                                  options: beardOptions,
                                },
                                {
                                  key: "mask",
                                  title: t("component.mask"),
                                  placeholder: t("placeholder.mask"),
                                  iconButton: MaskIcon,
                                  width: 60,
                                  height: 60,
                                  options: maskOptions,
                                },
                              ]}
                              values={formData}
                              onChange={(key, value, type, color) => {
                                handleBeehiveChange(key, value, type, color);
                              }}
                            />
                          </OutlinedContainer>
                        </div>
                      )}
                    </div>
                    <div className='flex gap-2 justify-end h-10'>
                      <Button
                        type='submit'
                        variant="contained"
                        className="primary-btn"
                        startIcon={<SearchIcon />}
                        sx={{
                          width: t('button.search-width'),
                          textTransform: "capitalize",
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
                          textTransform: "capitalize",
                        }}
                      >
                        {t('button.clear')}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </AccordionDetails>
          </Accordion>

          {/* Footer Part */}
          <div
            className={`flex justify-between mt-5 pr-[30px]`}
          >
            <div className="flex items-end">
              <label>{`${t("table.amount")} ${formatNumber(totalData)} ${t("table.list")}`}</label>
            </div>
            {/* Button Part */}
            <div className="flex gap-5">
              <div className="flex gap-2">
                <IconButton
                  className="tertiary-btn"
                  sx={{
                    borderRadius: "4px !important",
                  }}
                  onClick={exportToCsv}
                  disabled={multiDetectDataList.length === 0}
                >
                  <img src={CSVIcon} alt="CSV Icon" className="w-5 h-5" />
                </IconButton>

                <IconButton
                  className="tertiary-btn"
                  sx={{
                    borderRadius: "4px !important",
                  }}
                  onClick={exportToPdf}
                  disabled={multiDetectDataList.length === 0}
                >
                  <img src={PDFIcon} alt="PDF Icon" className="w-5 h-5" />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Result Table */}
          <div className={`pr-[30px]`}>
            <TableContainer
              component={Paper}
              className="mt-1"
              sx={{
                height: isAccordionOpen ? formats.length > 0 ? "32vh" : selectedVehicleEntries.length > 0 || selectedHumanEntries.length > 0 ? "42vh" : "53vh" : "68vh",
                backgroundColor: "#000",
              }}
            >
              <Table
                sx={{ minWidth: 650, backgroundColor: "#48494B" }}
                stickyHeader
              >
                <TableHead
                  sx={{
                    "& .MuiTableCell-head": {
                      color: "white",
                      backgroundColor: "#242727",
                    },
                  }}
                >
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ color: "#FFFFFF", width: "2%" }}
                    >
                      {t("table.column.no")}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#FFFFFF", width: "8%" }}
                    >
                      {t("table.column.detect-mode")}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#FFFFFF", width: "12%" }}
                    >
                      {t("table.column.camera-name")}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#FFFFFF", width: "18%" }}
                    >
                      {t("table.column.detail")}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#FFFFFF", width: "3%" }}
                    >
                      {t("table.column.image")}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#FFFFFF", width: "10%" }}
                    >
                      {t("table.column.date-time-range")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: "#48494B" }}>
                  {multiDetectDataList.map((data, index) => (
                    <TableRow
                      key={index}
                    >
                      <TableCell
                        sx={{
                          backgroundColor: "#48494B",
                          color: "#FFFFFF",
                          borderBottom: "1px dashed #ADADAD",
                          textAlign: "center",
                        }}
                      >
                        {((page - 1) * rowsPerPage) + index + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#393B3A",
                          color: "#FFFFFF",
                          borderBottom: "1px dashed #ADADAD",
                          textAlign: "center",
                        }}
                      >
                        {data.object_type === "human" ? t("text.human") : t("text.vehicle")}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#48494B",
                          color: "#FFFFFF",
                          borderBottom: "1px dashed #ADADAD",
                        }}
                      >
                        {data.camera_name || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#393B3A",
                          color: "#FFFFFF",
                          borderBottom: "1px dashed #ADADAD",
                        }}
                      >
                        {createDetectDetail(data)}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#48494B",
                          color: "#FFFFFF",
                          width: "10%",
                          textAlign: "center",
                          borderBottom: "1px dashed #ADADAD",
                        }}
                      >
                        <div
                          style={{
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={(e) => handleImageClick(e, data)}
                        >
                          <Image
                            imageSrc={`${CENTER_FILE_URL}${data.image_url}`}
                            imageAlt={"Detect Image"}
                            className="w-[70px] h-[50px]"
                          />
                        </div>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: "#393B3A",
                          color: "#FFFFFF",
                          borderBottom: "1px dashed #ADADAD",
                        }}
                      >
                        {dayjs(data.capture_time).format("DD/MM/YYYY (HH:mm:ss)")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div
              className={`flex items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}
            >
              <PaginationComponent
                page={page}
                onChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
                handleRowsPerPageChange={handleRowsPerPageChange}
                totalPages={totalPages}
                pageInput={pageInput.toString()}
                handlePageInputKeyDown={handlePageInputKeyDown}
                handlePageInputChange={handlePageInputChange}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Dialog */}
      <SearchCameras
        open={searchCamerasVisible}
        selectedCameras={handleCamerasSelected}
        onClose={() => setSearchCamerasVisible(false)}
      />

      <ShowLargeImage
        images={largeImageList}
        onClose={() => setShowLargeImage(false)}
        open={showLargeImage}
      />
    </div>
  );
};

export default SearchMultiDetect;
