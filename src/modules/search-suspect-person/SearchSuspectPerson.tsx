import React, { useState, useEffect, useCallback} from 'react'
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";
import Papa from "papaparse";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Material UI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';

// Icons
import CSVIcon from "../../assets/icons/csv.png";
import PDFIcon from "../../assets/icons/pdf.png";
import SearchIcon from '@mui/icons-material/Search';
import { Upload, X, ChevronRight, ChevronDown } from "lucide-react";
import { Icon } from '../../components/icons/Icon'

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import Loading from "../../components/loading/Loading";
import TextBox from '../../components/text-box/TextBox';
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
import AutoComplete from '../../components/auto-complete/AutoComplete';
import MultiSelectCameras from '../../components/multi-select/MultiSelectCameras';
import Image from '../../components/image/Image';
import ProgressBarWithLabel from "../../components/progress-bar/ProgressBarWithLabel";

// Utils
import { PopupMessage, PopupMessageCustomTextWithCancel } from '../../utils/popupMessage';
import { 
  formatThaiID, 
  formatNumber, 
  getPersonTypeColor,
  downloadFile, 
  formatPhone, 
  getId, 
  getStringId 
} from "../../utils/commonFunction"
import { fetchClient, combineURL } from "../../utils/fetchClient"

// i18n
import { useTranslation } from 'react-i18next';

// Types
import {
  DistrictsResponse,
  Districts,
} from "../../features/dropdown/dropdownTypes";
import {
  SuspectPersonSearchResponse,
  SuspectPersonSearch,
  FileData,
} from "../../features/search/SearchTypes";
import {
  FileFaceUploadResponse,
  FileUploadResponse,
  CameraFaceResponse,
  CameraFace,
} from "../../features/types";

// Config
import { getUrls } from '../../config/runtimeConfig';
import dayjs from 'dayjs';

// PDF
import { downloadSearchResultPdf, generateSearchResultPdfBlob } from "./suspect-people-pdf/SuspectPeoplePdf";

// Modules
import SearchCameras from "../search-cameras/SearchCameras";

interface FormData {
  firstName: string
  lastName: string
  nationalId: string
  start_date_time: Date | null
  end_date_time: Date | null
  province_code: string
  district_code: string
  person_class_id: number
  cameras_uid: string[]
  imagesData: FileData | null
};

interface SearchSuspectPersonProps {

}

const SearchSuspectPerson: React.FC<SearchSuspectPersonProps> = ({}) => {
  const { isOpen } = useHamburger();
  const dispatch: AppDispatch = useDispatch()
  const { CENTER_API, CENTER_FILE_URL } = getUrls();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [searchCamerasVisible, setSearchCamerasVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [openRows, setOpenRows] = React.useState<Record<string, boolean>>({});

  // Data
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<{value: any, label: string}[]>([]);
  const [suspectPersonSearchList, setSuspectPersonSearchList] = useState<SuspectPersonSearch[]>([]);
  const [cameraList, setCameraList] = useState<CameraFace[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [districtsList, setDistrictsList] = useState<Districts[]>([]);
  const [dssPage, setDssPage] = useState<Record<string, number>>({});

  // Option
  const [camerasOption, setCamerasOption] = useState<{ label: string ,value: any }[]>([]);
  const [personTypesOptions, setPersonTypesOptions] = useState<{ label: string ,value: number }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string ,value: string }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<{ label: string ,value: string }[]>([]);

  // Pagination
  const [totalData, setTotalData] = useState(0);

  // i18n
  const { t, i18n } = useTranslation();

  // Constants
  const CHUNK_SIZE = 500;
  const REQUEST_LIMIT = 5000;

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );
  const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    nationalId: "",
    start_date_time: null,
    end_date_time: null,
    province_code: "",
    district_code: "",
    person_class_id: 0,
    cameras_uid: [],
    imagesData: null,
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
  }, [])

  useEffect(() => {
    setProvinceOptions([{ label: t('dropdown.all'), value: "0" }]);
    setDistrictOptions([{ label: t('dropdown.all'), value: "0" }]);
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
  }, [i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (cameraList) {
      const options = cameraList.map((row) => ({
        label: row.camera_name,
        value: row.uid,
      }))
      setCamerasOption([{ label: t('dropdown.all'), value: "0" }, ...options])
    }
  }, [cameraList, i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (sliceDropdown.provinces && sliceDropdown.provinces.data) {
      const options = sliceDropdown.provinces.data.map((row) => ({
        label: row.name_th,
        value: row.province_code,
      }));
      setProvinceOptions(options);
    }
  }, [sliceDropdown.provinces]);
  
  useEffect(() => {
    if (sliceDropdown.personTypes && sliceDropdown.personTypes.data) {
      const options = sliceDropdown.personTypes.data.map((row) => ({
        label: row.title_en,
        value: row.id,
      }));
      setPersonTypesOptions(options);
    }
  }, [sliceDropdown.personTypes]);

  useEffect(() => {
    if (districtsList) {
      const options = districtsList.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.district_code,
      }))
      setDistrictOptions([{ label: t('dropdown.all'), value: "" }, ...options])
    }
  }, [districtsList, i18n.language, i18n.isInitialized])

  useEffect(() => {
    const fetchData = async () => {
      if (formData.province_code) {
        const res = await fetchClient<DistrictsResponse>(combineURL(CENTER_API, "/districts/get"), {
          method: "GET",
          queryParams: { 
              filter: `province_code=${formData.province_code}`,
              limit: "100",
            },
        });
        if (res.success) {
          setDistrictsList(res.data);
        }
      }
    };
    fetchData();
  }, [dispatch, formData.province_code]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filters: string[] = [];

        filters.push("active=true");

        if (formData.province_code) {
          filters.push(`province_code=${formData.province_code}`);
        }
        if (formData.district_code) {
          filters.push(`district_code=${formData.district_code}`);
        }

        const res = await fetchClient<CameraFaceResponse>(combineURL(CENTER_API, "/base-cameras/get"), {
          method: "GET",
          queryParams: {
            filter: `${filters.join(",")}`,
            limit: "1000",
            orderBy: "id.asc",
          },
        });

        if (res.success) {
          setCameraList(res.data);
        }
      }
      catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
      }
    };

    fetchData();
  }, [formData.province_code, formData.district_code, cameraRefreshKey]);

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
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

  const handleProvinceChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("province_code", value.value);
    }
    else {
      handleDropdownChange("province_code", '');
    }
  };

  const handleDistrictChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("district_code", value.value);
    }
    else {
      handleDropdownChange("district_code", '');
    }
  };

  const handlePersonTypesChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("person_class_id", value.value);
    }
    else {
      handleDropdownChange("person_class_id", '');
    }
  };

  const handleClearSearch = async () => {
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
    if (formData.imagesData) {
      await handleDeleteImage(formData.imagesData.url);
    }
    const startDateTime = dayjs().subtract(1, "day").toDate();
    const endDateTime = dayjs().toDate();
    setFormData({
      firstName: "",
      lastName: "",
      nationalId: "",
      start_date_time: startDateTime,
      end_date_time: endDateTime,
      province_code: "",
      district_code: "",
      person_class_id: 0,
      cameras_uid: [],
      imagesData: null,
    })
    setValue("start_date_time", startDateTime);
    setValue("end_date_time", endDateTime);
  };

  const handleDeleteImage = useCallback(async (url: string) => {
    try {
      if (!url) return;

      await deleteImportImageData(url)
    }
    catch (error) {
      PopupMessage(t("message.error.error-delete-image"), error instanceof Error ? error.message : String(error), "error");
    }
    setFormData((prev) => ({
      ...prev,
      imagesData: null,
    }))
    setValue("image", "");
  }, [dispatch])

  const deleteImportImageData = async (url: string) => {
    const body = JSON.stringify({
      urls: [url]
    })

    await fetchClient<FileUploadResponse>(combineURL(CENTER_API, `/upload/remove`), {
      method: "POST",
      body,
    })
  }

  const handleNationalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 13) {
      const formatted = formatThaiID(cleaned)
      handleTextChange("nationalId", formatted)
    }
    return cleaned
  }

  const handleCameraChange = (ids: string[]) => {
    let newIds: string[];

    if (ids.length === 0 || ids.includes("0")) {
      newIds = ["0"];
    } else {
      newIds = ids;
    }

    const selectedObjects = camerasOption.filter((camera) =>
      newIds.includes(camera.value)
    );

    setSelectedCameraObjects(selectedObjects);

    setFormData(prev => ({
      ...prev,
      cameras_uid: selectedObjects.map(c => c.value)
    }));
  };

  const exportToCsv = async () => {
    try {
      if (totalData > CHUNK_SIZE) {
        const confirmed = await PopupMessageCustomTextWithCancel(t('message.warning.export-all-confirmation'), t('message.warning.export-all-confirmation-message', { totalNumber: totalData }), t('button.confirm'), t('button.cancel'), "warning", "#FDB600")
        
        if (!confirmed) return;

        await handleExportAllDataInCsvConfirm();
        return;
      }

      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t('progress-bar.data-downloading'));

      const response = await fetchNewData(
        1,
        CHUNK_SIZE
      );

      setProgress(80);
      setProgressMessage(t('progress-bar.csv-file-preparing'));

      const csvBlob = await generateDataToExport(response.data);
      const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
      const csvName = `${t('file.suspect-people')}_${date}.csv`;

      downloadFile(csvName, URL.createObjectURL(csvBlob));

      setProgress(100);
      setProgressMessage(t('progress-bar.file-download-complete'));
      setPageLoading(false);
    }
    catch (error) {
      setProgress(0);
      setProgressMessage("");
      setPageLoading(false);
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-export-data'), errorMessage, "error");
    }
  }

  const handleExportAllDataInCsvConfirm = async () => {
    try {
      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t('progress-bar.data-downloading'));

      let allData: SuspectPersonSearch[] = [];
      const allPage = Math.ceil(totalData / REQUEST_LIMIT);
      setProgress(20);

      for (let i = 1; i <= allPage; i++) {
        const downloadedData = (i - 1) * REQUEST_LIMIT;
        setProgressMessage(t('progress-bar.data-downloading-with-total', { downloadedData: downloadedData, totalData: totalData}));

        const response = await fetchNewData(
          i,
          REQUEST_LIMIT
        );
        allData.push(...response.data);
        setProgress(20 + (i / allPage) * 60);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chunks: SuspectPersonSearch[][] = [];
      for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
        chunks.push(allData.slice(i, i + CHUNK_SIZE));
      }

      const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
      const zip = new JSZip();

      setProgress(80);
      setProgressMessage(t('progress-bar.csv-file-preparing-with-total', { chunksLength: chunks.length }));

      for (let i = 0; i < chunks.length; i++) {
        const chunkData = chunks[i];
        const csvBlob = await generateDataToExport(chunkData);
        const csvFileName = `${t('file.suspect-people')}_${date}_${i + 1}.csv`;
        zip.file(csvFileName, csvBlob);

        setProgress(80 + ((i + 1) / chunks.length) * 15);
        setProgressMessage(t('progress-bar.file-creating-with-total', { currentNumber: i + 1, chunksLength: chunks.length }));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setProgressMessage(t('progress-bar.zip-file-creating'));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${t('file.suspect-people')}_${date}.zip`;
      saveAs(zipBlob, zipName);

      setProgress(100);
      setProgressMessage(t('progress-bar.file-download-complete'));
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-export-data'), errorMessage, "error");
    }
    finally {
      setPageLoading(false);
    }
  }

  const exportToPdf = async () => {
    if (totalData > CHUNK_SIZE) {
      const confirmed = await PopupMessageCustomTextWithCancel(t('message.warning.export-all-confirmation'), t('message.warning.export-all-confirmation-message', { totalNumber: totalData }), t('button.confirm'), t('button.cancel'), "warning", "#FDB600")
      
      if (!confirmed) return;

      await handleExportAllDataInPdfConfirm();
      return;
    }

    setPageLoading(true);
    setProgress(0);
    setProgressMessage(t('progress-bar.data-downloading'));

    const response = await fetchNewData(
      1,
      CHUNK_SIZE
    );

    setProgress(80);
    setProgressMessage(t('progress-bar.pdf-file-preparing'));

    const updateData = response.data.map((item) => {
      const personType = sliceDropdown.personTypes?.data.find(
        (pt) => pt.id === item.person_class_id
      );
      const prefix = sliceDropdown?.prefix?.data.find(pf => pf.id === item.title_id);
      const newPrefix = i18n.language === "th" ? prefix?.title_th || "-" : prefix?.title_en || "-";

      return {
        ...item,
        title_name: newPrefix,
        person_class: personType?.title_en,
        isBlackList:
          personType?.title_en?.trim().toLowerCase() === "blacklist" || false,
      };
    });

    const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
    const pdfName = `${t('file.suspect-people')}_${date}.pdf`;
    await downloadSearchResultPdf(updateData, pdfName, t, i18n);

    setProgress(100);
    setProgressMessage(t('progress-bar.file-download-complete'));
    setPageLoading(false);
  }

  const handleExportAllDataInPdfConfirm = async () => {
    try {
      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t('progress-bar.data-downloading'));

      let allData: SuspectPersonSearch[] = [];
      const allPage = Math.ceil(totalData / REQUEST_LIMIT);
      setProgress(20);

      for (let i = 1; i <= allPage; i++) {
        const downloadedData = (i - 1) * REQUEST_LIMIT;
        setProgressMessage(t('progress-bar.data-downloading-with-total', { downloadedData: downloadedData, totalData: totalData}));

        const response = await fetchNewData(
          i,
          REQUEST_LIMIT
        );
        allData.push(...response.data);
        setProgress(20 + (i / allPage) * 60);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chunks: SuspectPersonSearch[][] = [];
      for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
        chunks.push(allData.slice(i, i + CHUNK_SIZE));
      }

      const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
      const zip = new JSZip();

      setProgress(80);
      setProgressMessage(t('progress-bar.pdf-file-preparing-with-total', { chunksLength: chunks.length }));

      for (let i = 0; i < chunks.length; i++) {
        const chunkData = chunks[i];
        const pdfBlob = await generateSearchResultPdfBlob(chunkData, t, i18n);
        const pdfFileName = `${t('file.suspect-people')}_${date}_${i + 1}.pdf`;
        zip.file(pdfFileName, pdfBlob);

        setProgress(80 + ((i + 1) / chunks.length) * 15);
        setProgressMessage(t('progress-bar.file-creating-with-total', { currentNumber: i + 1, chunksLength: chunks.length }));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setProgressMessage(t('progress-bar.zip-file-creating'));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${t('file.suspect-people')}_${date}.zip`;
      saveAs(zipBlob, zipName);

      setProgress(100);
      setProgressMessage(t('progress-bar.file-download-complete'));
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-export-data'), errorMessage, "error");
    }
    finally {
      setPageLoading(false);
    }
  }

  const generateDataToExport = async (data: SuspectPersonSearch[]) => {
    const columnLabels = {
      prefix: t("csv.column.prefix"),
      firstName: t("csv.column.first-name"),
      lastName: t("csv.column.last-name"),
      accuracy: t("csv.column.percent-match"),
      checkpoint: t("csv.column.checkpoint"),
      date: t("csv.column.date"),
      time: t("csv.column.time"),
      personType: t("csv.column.person-type"),
      behavior: t("csv.column.behavior"),
      ownerName: t("csv.column.owner-name"),
      phone: t("csv.column.phone-2"),
    };

    const dataRows = data.flatMap((parent) => {
      const personType = sliceDropdown?.personTypes?.data.find(
        (pf) => pf.id === parent.person_class_id
      );

      const prefix = sliceDropdown?.prefix?.data.find(
        (pf) => pf.id === parent.title_id
      );

      const newPrefix =
        i18n.language === "th"
          ? prefix?.title_th || "-"
          : prefix?.title_en || "-";

      return parent.dss_data.sort((a, b) => Number(b.captureTime) * 1000 - Number(a.captureTime) * 1000).map((child) => ({
        [columnLabels.prefix]: newPrefix,
        [columnLabels.firstName]: parent.firstname || "-",
        [columnLabels.lastName]: parent.lastname || "-",
        [columnLabels.accuracy]: child.similarity ? Number.parseFloat(child.similarity).toFixed(2) : "-",
        [columnLabels.checkpoint]: child.baseCamera?.camera_name || "-",
        [columnLabels.date]: child.captureTime
          ? dayjs.unix(Number(child.captureTime)).format(
              i18n.language === "th" ? "DD/MM/BBBB" : "DD/MM/YYYY"
            )
          : "-",
        [columnLabels.time]: child.captureTime
          ? dayjs.unix(Number(child.captureTime)).format("HH:mm:ss")
          : "-",
        [columnLabels.personType]: personType
          ? personType.title_en
          : "-",
        [columnLabels.behavior]: parent.behavior || "-",
        [columnLabels.ownerName]: parent.case_owner_name || "-",
        [columnLabels.phone]: parent.case_owner_phone
          ? formatPhone(parent.case_owner_phone)
          : "-",
      }));
    });

    const csvString =
      t("file.suspect-people") +
      "\n" +
      Papa.unparse(dataRows, {
        columns: Object.values(columnLabels),
      });

    const csvWithBOM = "\uFEFF" + csvString;

    return new Blob([csvWithBOM], {
      type: "text/csv;charset=utf-8;",
    });
  };

  const handleSearch = async () => {
    await fetchSearchData();
  }

  const fetchSearchData = async (currentPage: number = 1, limit: number = 100) => {
    try {
      setIsLoading(true);
      const body = {
        ...(formData.imagesData && {
          image_url: formData.imagesData?.url
        }),
        ...(formData.firstName && { 
          firstname: formData.firstName 
        }),
        ...(formData.lastName && { 
          lastname: formData.lastName 
        }),
        ...((formData.nationalId) && { 
          idcard_number: formData.nationalId 
        }),
        ...((formData.person_class_id && getId(formData.person_class_id)) != 0 && { 
          person_class_id: getId(formData.person_class_id)
        }),
        ...((formData.province_code && getStringId(formData.province_code)) && { 
          province_code: getStringId(formData.province_code)
        }),
        ...((formData.district_code && getStringId(formData.district_code)) && { 
          district_code: getStringId(formData.district_code)
        }),
        ...((selectedCameraObjects.length > 0 && selectedCameraObjects.some((v) => v.value !== "0")) && { 
          base_camera_uids: selectedCameraObjects.filter((v) => v.value !== 0).map((v) => v.value)
        }),
        startdate: dayjs(formData.start_date_time).toISOString(),
        enddate: dayjs(formData.end_date_time).toISOString(),
        page: currentPage,
        limit: limit,
        order: [
          [
            "startdate",
            "desc"
          ]
        ] 
      }

      const res = await fetchClient<SuspectPersonSearchResponse>(combineURL(CENTER_API, "/watchlist/search-dss"), {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (res.success) {
        setTotalData(res.pagination.countAll);
        setSuspectPersonSearchList(res.data);
        if (res.data.length === 0) {
          setSuspectPersonSearchList([]);
          return;
        };
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const fetchNewData = async (currentPage: number = 1, limit: number = 100) => {
    try {
      const body = {
        ...(formData.imagesData && {
          image_url: formData.imagesData?.url
        }),
        ...(formData.firstName && { 
          first_name: formData.firstName 
        }),
        ...(formData.lastName && { 
          last_name: formData.lastName 
        }),
        ...((formData.nationalId) && { 
          idcard_number: formData.nationalId 
        }),
        ...((formData.person_class_id && getId(formData.person_class_id)) != 0 && { 
          person_class_id: getId(formData.person_class_id)
        }),
        ...((formData.province_code && getStringId(formData.province_code)) && { 
          province_code: getStringId(formData.province_code)
        }),
        ...((formData.district_code && getStringId(formData.district_code)) && { 
          province_code: getStringId(formData.district_code)
        }),
        ...((selectedCameraObjects.length > 0 && selectedCameraObjects.some((v) => v.value !== "0")) && { 
          base_camera_uids: selectedCameraObjects.filter((v) => v.value !== 0).map((v) => v.value)
        }),
        startdate: dayjs(formData.start_date_time).toISOString(),
        enddate: dayjs(formData.end_date_time).toISOString(),
        page: currentPage,
        limit: limit,
        order: [
          [
            "startdate",
            "desc"
          ]
        ] 
      }

      const res = await fetchClient<SuspectPersonSearchResponse>(combineURL(CENTER_API, "/watchlist/search-dss"), {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw errorMessage;
    }
  }

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)

    // for (const file of fileArray) {
    //   if (!file.type.startsWith("image/")) continue

    //   const isOverSize = await checkImageSize(file, 540, 1080);

    //   if (isOverSize) {
    //     PopupMessage(
    //       t("message.error.image-size"),
    //       t("message.error.image-size-detail"),
    //       "error"
    //     )
    //     return
    //   }
    // }

    try {
      const formData = new FormData()
      fileArray.forEach(file => {
        formData.append("file", file)
      })

      const response = await fetchClient<FileFaceUploadResponse>(combineURL(CENTER_API, "/upload/crop"), {
        method: "POST",
        isFormData: true,
        body: formData,
      })

      if (response.success) {
        const image = response.data;
        setFormData((prev) => ({
          ...prev,
          imagesData: image,
        }))
        setValue("image", "uploaded");
        clearErrors("image");
      }
    } 
    catch (error) {
      PopupMessage(t('message.error.error-upload-file'), error instanceof Error ? error.message : String(error) , "error");
    }
    
  }, [formData.imagesData])

  const handleCamerasSelected = useCallback(async (cameraSelected: { value: any, label: string }[]) => {
    const syncSelectedObjects = camerasOption.filter(option => 
      cameraSelected.some(selected => selected.value === option.value)
    );

    const hasAll = syncSelectedObjects.some((v) => v.value === "0");

    if (hasAll || syncSelectedObjects.length === 0) {
      const allObj = camerasOption.find(o => o.value === "0") || { label: t('dropdown.all'), value: "0" };
      setSelectedCameraObjects([allObj]);
    } 
    else {
      setSelectedCameraObjects(syncSelectedObjects);
    }
  }, [camerasOption, cameraList, t]);

  const toggleRow = (uid: string) => {
    setOpenRows(prev => ({
      ...prev,
      [uid]: !prev[uid],
    }));
  };


  return (
    <div id='search-suspect-person' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} transition-all duration-500`}>
      { isLoading && <Loading /> }
      {
        pageLoading && <ProgressBarWithLabel message={progressMessage} value={progress} />
      }
      <form className='flex flex-col w-full' onSubmit={handleSubmit(handleSearch)}>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.search-suspect-people.title')}</Typography>

        {/* Filter Part */}
        <div className='grid grid-cols-5 gap-y-3 gap-3 pr-[60px]'>
          <div className='row-span-3'>
            {/* Image Upload Section */}
            <div id="image-import-part" className="flex flex-col items-center">
              <div className="flex items-center justify-center w-full h-[240px] mt-[5px] bg-[#D9D9D9] overflow-hidden px-3">

                {formData.imagesData ? (
                  /* Image Preview */
                  <div className="relative flex items-center justify-center w-full h-full">
                    <Image
                      imageSrc={`${CENTER_FILE_URL}${formData.imagesData.url}`} 
                      imageAlt={`Upload Image`}
                      className="object-contain w-full h-[250px]" 
                    />

                    <button
                      type="button"
                      className="absolute z-[52] top-1 right-1 text-white bg-white border border-[#2B9BED] rounded-[5px] w-[25px] h-[25px] flex items-center justify-center hover:cursor-pointer"
                      onClick={() => handleDeleteImage(formData.imagesData?.url ?? "")}
                    >
                      <Icon icon={X} size={15} color="#2B9BED" />
                    </button>
                  </div>
                ) : (
                  /* No Image - upload prompt */
                  <div className="flex flex-col justify-center items-center gap-3">
                    {errors.image && (
                      <span className="text-red-500 ml-2">
                        {typeof errors.image.message === 'string'
                          ? errors.image.message
                          : t('text.image-required')}
                      </span>
                    )}
                    <label className="text-[#2A2C2E] text-[14px]">
                      {t('text.search-with-image')}
                    </label>

                    <label
                      htmlFor="image-upload"
                      className="relative flex flex-col gap-2 items-center justify-center
                                w-[130px] h-[130px] rounded-[5px] border border-[#C5C8CB]
                                bg-white overflow-hidden cursor-pointer hover:bg-gray-100"
                    >
                      <Icon icon={Upload} size={50} color="#2F5552" />
                      <span className="text-[#2F5552] text-[14px]">
                        {t('text.upload-image')}
                      </span>

                      {/* Hidden File Input */}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        // {...register("image", {
                        //   onChange: handleImageUpload,
                        // })}
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}
                
              </div>
            </div>

          </div>

          <TextBox
            sx={{ marginTop: "5px", fontSize: "15px" }}
            id="first-name"
            label={t("component.first-name")}
            value={formData.firstName}
            onChange={(event) =>
              handleTextChange("firstName", event.target.value)
            }
            register={register("firstName", { 
              required: false,
            })}
            error={!!errors.firstName}
          />

          <TextBox
            sx={{ marginTop: "5px", fontSize: "15px" }}
            id="surname"
            label={t("component.last-name")}
            value={formData.lastName}
            onChange={(event) =>
              handleTextChange("lastName", event.target.value)
            }
            register={register("lastName", { 
              required: false,
            })}
            error={!!errors.lastName}
          />

          <TextBox
            sx={{ marginTop: "5px", fontSize: "15px" }}
            id="id-card-number"
            label={t("component.id-card-number")}
            value={formData.nationalId}
            onChange={handleNationalIdChange}
            register={register("nationalId", { 
              required: false,
            })}
            error={!!errors.nationalId}
          />

          <AutoComplete 
            id="person-type-select"
            sx={{ marginTop: "5px"}}
            value={formData.person_class_id}
            onChange={handlePersonTypesChange}
            options={personTypesOptions}
            label={t("component.person-type")}
            placeholder={t("placeholder.person-type")}
            labelFontSize="15px"
            register={register("personType", { 
              required: false,
            })}
            error={!!errors.personType}
          />

          <AutoComplete 
            id="province-select"
            sx={{ marginTop: "5px"}}
            value={formData.province_code}
            onChange={handleProvinceChange}
            options={provinceOptions}
            label={t("component.province")}
            labelFontSize="15px"
            placeholder={t("placeholder.province")}
            register={register("province", { 
              required: false,
            })}
            error={!!errors.province}
          />

          <AutoComplete 
            id="district-select"
            sx={{ marginTop: "5px"}}
            value={formData.district_code}
            onChange={handleDistrictChange}
            options={districtOptions}
            label={t("component.district")}
            labelFontSize="15px"
            placeholder={t("placeholder.district")}
            register={register("district", { 
              required: false,
            })}
            disabled={!formData.province_code}
            error={!!errors.district}
          />

          <div className='col-span-2'>
            <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>{t('component.checkpoint-2')}</Typography>
            <div className='flex gap-3 mt-[5px]'>
              <div className='flex-1'>
                <MultiSelectCameras 
                  limitTags={2} 
                  options={camerasOption} 
                  onChange={handleCameraChange}
                  selectedValues={selectedCameraObjects}
                  placeHolder={t('placeholder.checkpoint-2')}
                  isLocationButton={true}
                  onIconClick={() => setSearchCamerasVisible(true)}
                />
              </div>
            </div>
          </div>

          <div>
            <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
              {t('component.start-time')}
              {
                <span className="text-red-500"> *</span>
              }
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
                  fontSize: 14
                }
              }}
              className="w-full"
              id="start-date-time"
              onChange={(value) => handleStartDateTimeChange(value)}
              isWithTime={true}
              error={!!errors.start_date_time}
              register={register("start_date_time", { 
                required: true,
              })}
            >
            </DatePickerBuddhist>
          </div>

          <div>
            <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
              {t('component.end-time')}
              {
                <span className="text-red-500"> *</span>
              }
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
                  fontSize: 14
                }
              }}
              className="w-full"
              id="end-date-time"
              onChange={(value) => handleEndDateTimeChange(value)}
              isWithTime={true}
              error={!!errors.end_date_time}
              register={register("end_date_time", { 
                required: true,
              })}
            >
            </DatePickerBuddhist>
          </div>
        </div>

        {/* Footer Part */}
        <div className={`flex justify-between mt-5 pr-[30px]`}>
          <div className='flex items-end'>
            <label>{`${t('table.amount')} ${formatNumber(totalData)} ${t('table.list')}`}</label>
          </div>
          {/* Button Part */}
          <div className='flex gap-2'>
            <div className='flex gap-1'>
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

            <div className='flex gap-1'>
              <IconButton 
                className="tertiary-btn"
                sx={{
                  borderRadius: "4px !important",
                }}
                onClick={exportToCsv}
                disabled={suspectPersonSearchList.length === 0}
              >
                <img src={CSVIcon} alt='CSV Icon' className='w-5 h-5' />
              </IconButton>

              <IconButton 
                className="tertiary-btn"
                sx={{
                  borderRadius: "4px !important",
                }}
                onClick={exportToPdf}
                disabled={suspectPersonSearchList.length === 0}
              >
                <img src={PDFIcon} alt='PDF Icon' className='w-5 h-5' />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Result Table */}
        <div className="pr-[30px]">
          <TableContainer 
            component={Paper} 
            className='mt-1'
            sx={{ height: "55vh", backgroundColor: "transparent" }}
          >
            <Table 
              sx={{ 
                minWidth: 650, 
                backgroundColor: "#48494B",
                "& .MuiTableHead-root .MuiTableCell-root": {
                  backgroundColor: "#242727",
                  color: "#FFFFFF",
                },
              }} 
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell align="center" sx={{ color: "#FFFFFF" }}>{t('table.column.no')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF" }}>{t('table.column.prefix')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: 250 }}>{t('table.column.full-name')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF" }}>{t('table.column.image')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF" }}>{t('table.column.percentage-match')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: 200 }}>{t('table.column.checkpoint')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF" }}>{t('table.column.date-time-range')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF" }}>{t('table.column.person-type-2')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: 450 }}>{t('table.column.behavior')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "#48494B" }}>
                {suspectPersonSearchList.map((data, index) => {
                  if (data.dss_data.length === 0) return null;

                  const isOpen = openRows[data.uid];

                  return (
                    <React.Fragment key={data.uid}>
                      <TableRow>
                        <TableCell
                          sx={{ textAlign: "center", backgroundColor: index % 2 === 0 ? "#1D1F1F" : "#121414", color: "#FFF", borderBottom: "1px dashed #ADADAD" }}
                        >
                          <IconButton size="small" onClick={() => toggleRow(data.uid)}>
                            {isOpen ? (
                              <Icon icon={ChevronDown} size={30} color="#FFF" />
                            ) : (
                              <Icon icon={ChevronRight} size={30} color="#FFF" />
                            )}
                          </IconButton>
                        </TableCell>

                        {
                          (() => {
                            const prefix = sliceDropdown?.prefix?.data.find(pf => pf.id === data.title_id);
                            const newPrefix = i18n.language === "th" ? prefix?.title_th || "" : prefix?.title_en || "";
                            const personType = personTypesOptions.find(pt => pt.value === data.person_class_id);
                            const { color, backgroundColor } = getPersonTypeColor(personType?.label || "");
                            return (
                              <TableCell colSpan={9} sx={{ backgroundColor: index % 2 === 0 ? "#1D1F1F" : "#121414", color: "#FFF", borderBottom: "1px dashed #ADADAD" }}>
                                <div className='flex justify-between'>
                                  <div className='flex justify-start items-center gap-5'>
                                    <Image
                                      imageSrc={`${CENTER_FILE_URL}${data.image_url}`}
                                      imageAlt={`face${index + 1}`}
                                      className="w-[60px] h-[60px] rounded-[5px]"
                                    />
                                    <span className='text-[16px]'>{`${newPrefix}${data.firstname} ${data.lastname}`}</span>
                                    <div className='flex justify-center items-center'>
                                      <label
                                        className={`w-20 h-[30px] inline-flex items-center justify-center rounded font-bold`}
                                        style={{ color: color, backgroundColor: backgroundColor }}
                                      >
                                        { personType?.label || "-" }
                                      </label>
                                    </div>
                                  </div>
                                  <div className='flex justify-end items-center gap-5'>
                                    <label className='text-[16px]'>{`${t("text.detect")}: ${data.dss_data.length}`}</label>
                                  </div>
                                </div>
                              </TableCell>
                            )
                          })()
                        }
                      </TableRow>

                      {isOpen && (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            sx={{
                              padding: 0,
                              borderBottom: "none",
                              backgroundColor: "#121414",
                            }}
                          >
                            {(() => {
                              const page = dssPage[data.uid] || 0;
                              const rowsPerPage = 50;

                              const sortedData = [...data.dss_data].sort(
                                (a, b) =>
                                  Number(b.captureTime) * 1000 -
                                  Number(a.captureTime) * 1000
                              );

                              const paginatedData = sortedData.slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                              );

                              return (
                                <>
                                  {/* Scrollable Content */}
                                  <Box
                                    sx={{
                                      maxHeight: 300,
                                      overflowY: "auto",
                                    }}
                                  >
                                    {paginatedData.map((dss, dssIndex) => {
                                      const prefix =
                                        sliceDropdown?.prefix?.data.find(
                                          (pf) => pf.id === data.title_id
                                        );

                                      const personType =
                                        personTypesOptions.find(
                                          (pt) => pt.value === data.person_class_id
                                        );

                                      const { color, backgroundColor } =
                                        getPersonTypeColor(personType?.label || "");

                                      return (
                                        <Box
                                          key={dss.id}
                                          sx={{
                                            display: "grid",
                                            gridTemplateColumns:
                                              "80px 90px 125px 250px 65px 190px 195px 150px 160px 1fr",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            borderBottom: "1px dashed #ADADAD",
                                            color: "#FFF",
                                          }}
                                        >
                                          <div />
                                          <div className="text-center">
                                            {`${index + 1}.${page * rowsPerPage + dssIndex + 1}`}
                                          </div>
                                          <div className="text-center">
                                            {prefix
                                              ? i18n.language === "th"
                                                ? prefix.title_th
                                                : prefix.title_en
                                              : "-"}
                                          </div>
                                          <div className="px-1">{`${data.firstname} ${data.lastname}`}</div>

                                          <div>
                                            <Image
                                              imageSrc={dss.faceBase64 || ""}
                                              imageAlt="image"
                                              className="w-[60px] h-[60px]"
                                              backgroundColor="#121414"
                                            />
                                          </div>

                                          <div className="text-center">
                                            {dss.similarity ? `${dss.similarity} %` : "-"}
                                          </div>

                                          <div className="px-1">
                                            {dss.baseCamera?.camera_name || "-"}
                                          </div>

                                          <div className="text-center">
                                            {dayjs
                                              .unix(Number(dss.captureTime))
                                              .format(
                                                i18n.language === "th"
                                                  ? "DD/MM/BBBB HH:mm:ss"
                                                  : "DD/MM/YYYY HH:mm:ss"
                                              )}
                                          </div>

                                          <div className="flex justify-center">
                                            <label
                                              className="w-20 h-[30px] inline-flex items-center justify-center rounded font-bold"
                                              style={{ color, backgroundColor }}
                                            >
                                              {personType?.label || "-"}
                                            </label>
                                          </div>

                                          <div className="px-1">{data.behavior || "-"}</div>
                                        </Box>
                                      );
                                    })}
                                  </Box>

                                  {/* Pagination */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      padding: "8px 16px",
                                      backgroundColor: "#1D1F1F",
                                    }}
                                  >
                                    <TablePagination
                                      component="div"
                                      count={data.dss_data.length}
                                      page={page}
                                      onPageChange={(_, newPage) =>
                                        setDssPage((prev) => ({
                                          ...prev,
                                          [data.uid]: newPage,
                                        }))
                                      }
                                      rowsPerPage={rowsPerPage}
                                      rowsPerPageOptions={[50]}
                                      sx={{
                                        color: "#FFF",
                                        "& .MuiSvgIcon-root": { color: "#FFF" },
                                      }}
                                    />
                                  </Box>
                                </>
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </form>
      {
        searchCamerasVisible && (
          <SearchCameras 
            open={searchCamerasVisible}
            selectedCameras={handleCamerasSelected}
            onClose={() => setSearchCamerasVisible(false)}
            isFace={true}
          />
        )
      }
    </div>
  )
};

export default SearchSuspectPerson;