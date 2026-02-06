import React, {useState, useCallback, useRef, useEffect} from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import dayjs from 'dayjs';
import { useSelector } from "react-redux";
import { useAppDispatch } from '../../../app/hooks';
import { RootState } from "../../../app/store";

// Components
import TextBox from '../../../components/text-box/TextBox';
import AutoComplete from '../../../components/auto-complete/AutoComplete';
import DatePickerBuddhist from "../../../components/date-picker-buddhist/DatePickerBuddhist";

// Types
import {
  WatchListFileData,
  WatchListImageResponse,
  WatchListImageData,
  SuspectPeopleCreateResponse,
  FileFaceUploadResponse,
  SuspectPeople,
  WatchListFileResponse,
} from "../../../features/types";
import {
  DistrictsResponse,
  SubDistrictsResponse
} from "../../../features/dropdown/dropdownTypes";

// Icons
import { Save, Download, Trash2 } from "lucide-react";
import { Icon } from "../../../components/icons/Icon";
import UploadIcon from "../../../assets/icons/upload.png";

// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { 
  formatPhone, 
  formatThaiID, 
  getId, 
  getStringId, 
  getFilesDiff,
  // checkImageSize
} from '../../../utils/commonFunction';
import { PopupMessage, PopupMessageWithCancel } from '../../../utils/popupMessage';
import { fetchClient, combineURL } from "../../../utils/fetchClient";

// Config
import { getUrls } from '../../../config/runtimeConfig';

interface FormData {
  title_id: number
  firstname: string
  lastname: string
  id_card_number: string
  address: string
  province_code: string
  district_code: string
  subdistrict_code: string
  zipcode: string
  dss_orgcode: string
  dss_person_id: string
  person_class_id: number
  case_number: string
  image_url: string
  arrest_warrant_date: Date | null
  arrest_warrant_expire_date: Date | null
  behavior: string
  case_owner_name: string
  case_owner_phone: string
  images: WatchListImageData[]
  files: WatchListFileData[]
  active_status: number
};


interface ManageSuspectPersonProps {
  open: boolean;
  onClose: () => void;
  selectedRow: SuspectPeople | null; 
}

const ManageSuspectPerson: React.FC<ManageSuspectPersonProps> = ({open, onClose, selectedRow}) => {
  const { CENTER_API, CENTER_FILE_URL } = getUrls();
  
  // i18n
  const { t, i18n } = useTranslation();

  const dispatch = useAppDispatch()

  // Ref
  const hiddenFileInput = useRef<HTMLInputElement | null>(null)

  // Options
  const [prefixOptions, setPrefixOptions] = useState<{ label: string ,value: number }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string ,value: number }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<{ label: string ,value: number }[]>([]);
  const [subDistrictOptions, setSubDistrictOptions] = useState<{ label: string ,value: number, [key: string]: any}[]>([]);
  const [personTypesOptions, setPersonTypesOptions] = useState<{ label: string ,value: number }[]>([]);
  
  // Data
  const [imageImportDataList, setImageImportDataList] = useState<WatchListImageData[]>([]);
  const [fileImportDataList, setFileImportDataList] = useState<WatchListFileData[]>([]);

  const bc = new BroadcastChannel("suspectPeopleChannel");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    clearErrors,
    setError,
  } = useForm();

  const [formData, setFormData] = useState<FormData>({
    title_id: 0,
    firstname: "",
    lastname: "",
    id_card_number: "",
    address: "",
    province_code: "",
    district_code: "",
    subdistrict_code: "",
    zipcode: "",
    image_url: "",
    dss_orgcode: "",
    dss_person_id: "",
    person_class_id: 0,
    case_number: "",
    arrest_warrant_date: null,
    arrest_warrant_expire_date: null,
    behavior: "",
    case_owner_name: "",
    case_owner_phone: "",
    images: [],
    files: [],
    active_status: 0,
  });

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const { authData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const prefix = sliceDropdown.prefix?.data.find((prefix) => prefix.id === authData?.userInfo?.title_id)
    const ownerName = authData.userInfo ? `${prefix ? i18n.language === "th" ? prefix.title_th : prefix.title_en : ""}${authData?.userInfo?.firstname} ${authData?.userInfo?.lastname}` : "-";
    const ownerPhone = authData.userInfo ? formatPhone(authData?.userInfo?.phone) : "-";
    if (selectedRow) {
      setFormData({
        title_id: selectedRow.title_id,
        firstname: selectedRow.firstname,
        lastname: selectedRow.lastname,
        id_card_number: selectedRow.idcard_number ? formatThaiID(selectedRow.idcard_number) : "",
        address: selectedRow.address,
        province_code: selectedRow.province_code,
        district_code: selectedRow.district_code,
        subdistrict_code: selectedRow.subdistrict_code,
        zipcode: selectedRow.zipcode,
        person_class_id: selectedRow.person_class_id,
        case_number: selectedRow.case_number,
        arrest_warrant_date: selectedRow.arrest_warrant_date ? new Date(selectedRow.arrest_warrant_date) : null,
        arrest_warrant_expire_date: selectedRow.arrest_warrant_expire_date ? new Date(selectedRow.arrest_warrant_expire_date) : null,
        behavior: selectedRow.behavior,
        case_owner_name: selectedRow.case_owner_name,
        case_owner_phone: selectedRow.case_owner_phone,
        images: selectedRow.images,
        files: selectedRow.files,
        image_url: selectedRow.image_url,
        dss_orgcode: selectedRow.dss_orgcode,
        dss_person_id: selectedRow.dss_person_id,
        active_status: selectedRow.active  ? 1 : 0,
      });
      setValue("prefix", selectedRow.title_id);
      setValue("firstname", selectedRow.firstname);
      setValue("lastname", selectedRow.lastname);
      setValue("id_card_number", selectedRow.idcard_number);
      setValue("address", selectedRow.address);
      setValue("province_code", selectedRow.province_code);
      setValue("district_code", selectedRow.district_code);
      setValue("subdistrict_code", selectedRow.subdistrict_code);
      setValue("zipcode", selectedRow.zipcode);
      setValue("personType", selectedRow.person_class_id);
      setValue("behavior", selectedRow.behavior);
      setValue("image", selectedRow.images ? "uploaded" : "");
      setValue("case_owner_name", ownerName);
      setValue("case_owner_phone", ownerPhone);
      setValue("case_number", selectedRow.case_number);
      setValue("arrest_date", selectedRow.arrest_warrant_date);
      setValue("end_arrest_date", selectedRow.arrest_warrant_expire_date);
      setValue("active_status", selectedRow.active  ? 1 : 0);
    }
    else {
      setFormData({
        title_id: 0,
        firstname: "",
        lastname: "",
        id_card_number: "",
        address: "",
        province_code: "",
        district_code: "",
        subdistrict_code: "",
        zipcode: "",
        person_class_id: 0,
        dss_orgcode: "",
        dss_person_id: "",
        case_number: "",
        arrest_warrant_date: null,
        arrest_warrant_expire_date: null,
        behavior: "",
        case_owner_name: ownerName,
        case_owner_phone: ownerPhone,
        images: [],
        files: [],
        image_url: "",
        active_status: 0,
      });
      setValue("prefix", "");
      setValue("firstname", "");
      setValue("lastname", "");
      setValue("id_card_number", "");
      setValue("address", "");
      setValue("province", "");
      setValue("district", "");
      setValue("subDistrict", "");
      setValue("zipcode", "");
      setValue("personType", "");
      setValue("behavior", "");
      setValue("image", "");
      setValue("case_owner_name", ownerName);
      setValue("case_owner_phone", ownerPhone);
      setValue("case_number", "");
      setValue("arrest_date", "");
      setValue("end_arrest_date", "");
      setValue("active_status", 0);
    }
  }, [selectedRow, authData.userInfo])

  useEffect(() => {
    if (sliceDropdown.provinces && sliceDropdown.provinces.data) {
      const options = sliceDropdown.provinces.data.map((row) => ({
        label: row.name_th,
        value: row.id,
      }));
      setProvinceOptions(options);
    }
  }, [sliceDropdown.provinces]);

  useEffect(() => {
    if (sliceDropdown.prefix && sliceDropdown.prefix.data) {
      const options = sliceDropdown.prefix.data.map((row) => ({
        label: row.title_th,
        value: row.id,
      }));
      setPrefixOptions(options);
    }
  }, [sliceDropdown.prefix]);

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
    const fetchData = async () => {
      if (formData.province_code) {
        const res = await fetchClient<DistrictsResponse>(combineURL(CENTER_API, "/districts/get"), {
          method: "GET",
          queryParams: {
            filter: `province_code=${formData.province_code}`,
            limit: "60",
          },
        });
        if (res && res.data) {
          const options = res.data.map((row) => ({
            label: row.name_th,
            value: row.id,
          }));
          setDistrictOptions(options);
        }
      }
      if (formData.district_code) {
        const res = await fetchClient<SubDistrictsResponse>(combineURL(CENTER_API, "/subdistricts/get"), {
          method: "GET",
          queryParams: {
            filter: `province_code=${formData.province_code},district_code=${formData.district_code}`,
            limit: "60",
          },
        });
        if (res && res.data) {
          const options = res.data.map((row) => ({
            label: row.name_th,
            value: row.id,
            zipcode: row.zipcode,
          }));
          setSubDistrictOptions(options);
        }
      }
    };
    fetchData();
  }, [dispatch, formData.province_code, formData.district_code]);

  const handleCancelClick = async () => {
    if (imageImportDataList.length > 0) {
      await deleteImportImageData(imageImportDataList);
    }
    if (fileImportDataList.length > 0) {
      await deleteImportFileData(fileImportDataList);
    }
    onClose();
  };

  const deleteImportFileData = async (list: WatchListFileData[]) => {
    await Promise.all(
      list.map(async (data) => {
        const body = JSON.stringify({
          urls: [data.file_url]
        })

        await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/upload/remove`), {
          method: "POST",
          body,
        })
      })
    )
  }

  const deleteImportImageData = async (list: WatchListImageData[]) => {
    await Promise.all(
      list.map(async (data) => {
        const body = JSON.stringify({
          urls: [data.image_url]
        })

        await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/upload/remove`), {
          method: "POST",
          body,
        })
      })
    )
  }

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
      handleDropdownChange("district_code", '');
      handleDropdownChange("subdistrict_code", '');
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
      handleDropdownChange("subdistrict_code", '');
    }
  };

  const handleSubDistrictChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string, [key: string]: string} | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("subdistrict_code", value.value);
      handleTextChange("zipcode", value.zipcode)
    }
    else {
      handleDropdownChange("subdistrict_code", '');
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

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrestWarrantDateChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      arrest_warrant_date: date,
    }));
  };

  const handleArrestWarrantExpireDateChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      arrest_warrant_expire_date: date,
    }));
  };

  const handlePrefixChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("title_id", value.value);
    }
    else {
      handleDropdownChange("title_id", '');
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value.replace(/\D/g, '');
    
    input = input.slice(0, 10);

    const formatted = formatPhone(input);

    handleTextChange("case_owner_phone", formatted);
  };

  const handleNationalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value.replace(/\D/g, '');

    input = input.slice(0, 13);

    const formatted = formatThaiID(input);

    handleTextChange("id_card_number", formatted);
  }

  const handleStatusChange = (status: number) => {
    setFormData((prevState) => ({
      ...prevState,
      active_status: status
    }));
    setValue("active_status", status);
  };

  const handleDeleteImage = async () => {
    setFormData((prev) => ({
      ...prev,
      images: []
    }))
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
        const images = {
          ...response.data,
          id: 0,
          uid: "",
          title: response.data.title,
          image_url: response.data.url,
          watchlist_uid: "",
          notes: "",
          created_at: "",
          updated_at: "",
        }
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, images]
        }))
        setValue("image", "uploaded");
        clearErrors("image");
        setImageImportDataList((prev) => ([...prev, images]));
      }
    } 
    catch (error) {
      PopupMessage(t('message.error.error-upload-file'), error instanceof Error ? error.message : String(error) , "error");
    }
    
  }, [formData.images])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles = Array.from(e.target.files).filter((file) =>
      /\.(pdf|docx|doc)$/i.test(file.name)
    )

    if (newFiles.length > 0) {
      try {
        const formData = new FormData()
        newFiles.forEach(file => {
          formData.append("file", file)
        })

        const response = await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, "/upload"), {
          method: "POST",
          isFormData: true,
          body: formData,
        })

        if (response.success) {
          setFormData((prev) => ({
            ...prev,
            files: [...prev.files, ...response.data],
          }))
          setFileImportDataList((prev) => ([...prev, ...response.data]));
        }
      }
      catch (error) {
        PopupMessage(t('message.error.error-upload-file'), error instanceof Error ? error.message : String(error) , "error");
      }
    }

    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = ""
    }
  }, [])

  const getFileName = (title:string, url:string):string => {
    try {
      const urlSplit = url.split('/')
      const fileNameWithExtension = urlSplit[urlSplit.length - 1] 
      const extensionSplit = fileNameWithExtension.split('.')
      const extension = extensionSplit.length > 1 ? extensionSplit.pop() : 'txt'
      return `${title}.${extension}`
    } 
    catch (error) {
      console.error("Error extracting file name:", error)
      return `${title}.txt`
    }
  }

  const onSubmit = async (data: any) => {
    if (formData.images.length === 0) {
      setError("image", {
        type: "manual",
        message: t("text.image-required"),
      });
      return;
    }
    if (selectedRow) {
      updateSuspectPerson(data);
    } 
    else {
      saveSuspectPerson(data);
    }
  }

  const saveSuspectPerson = async (data: any) => {
    let image_url = "";
    if (formData.images.length > 0) {
      image_url = formData.images[0].image_url;
    }
    try {
      const body = JSON.stringify({
        title_id: getId(data.prefix),
        firstname: data.firstname,
        lastname: data.lastname,
        ...(
          data.id_card_number && { idcard_number: data.id_card_number.replaceAll("-", "").slice(0, 13) }
        ),
        ...(
          data.address && { address: data.address }
        ),
        ...(
          data.province && { province_code: getId(data.province) }
        ),
        ...(
          data.district && { district_code: getId(data.district) }
        ),
        ...(
          data.subDistrict && { subdistrict_code: getId(data.subDistrict) }
        ),
        ...(
          data.zipcode && { zipcode: data.zipcode }
        ),
        image_url: image_url,
        person_class_id: getId(data.personType),
        dss_orgcode: getId(data.personType)?.toString(),
        ...(
          data.case_number && { case_number: data.case_number }
        ),
        arrest_warrant_date: data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format('YYYY-MM-DD') : null,
        arrest_warrant_expire_date: data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format('YYYY-MM-DD') : null,
        behavior: data.behavior,
        case_owner_name: data.case_owner_name,
        case_owner_phone: data.case_owner_phone ? data.case_owner_phone.replaceAll("-", "").slice(0, 10) : "",
        active: data.active_status,
      })

      const response = await fetchClient<SuspectPeopleCreateResponse>(combineURL(CENTER_API, "/watchlist/create"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      })

      if (response.success) {
        if (formData.images && Object.keys(formData.images).length > 0) {
          const body = JSON.stringify({
            watchlist_uid: response.data.uid,
            image_url: formData.images[0].image_url,
            title: formData.images[0].title
          });
          await fetchClient<WatchListImageResponse>(combineURL(CENTER_API, "/watchlist-images/create"), {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body,
          })
        }

        if (formData.files && formData.files.length > 0) {
          await Promise.all(
            formData.files.map(async (file) => {
              const body = JSON.stringify({
                watchlist_uid: response.data.uid,
                file_url: file.file_url,
                title: file.title
              });
              await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, "/watchlist-files/create"), {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body,
              })
            })
          )
        }

        const unusedImages = imageImportDataList.filter((image) => !formData.images.find((img) => img.image_url === image.image_url));
        if (unusedImages.length > 0) {
          await deleteImportImageData(unusedImages);
        }

        const unusedFiles = fileImportDataList.filter((file) => !formData.files.find((f) => f.file_url === file.file_url));
        if (unusedFiles.length > 0) {
          await deleteImportFileData(unusedFiles);
        }
        PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success");
        bc.postMessage("reload");
        clearData();
        onClose();
      }
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
  }

  const updateSuspectPerson = async (data: any) => {
    try {
      const { all, onlyStatus, isImageChanged, isFileChanged } = isDataChanged();
      if (!all) {
        PopupMessage(
          t('message.warning.no-change-found'),
          t('message.warning.data-not-change'),
          "warning"
        )
        return;
      }

      let titleMessage = t('message.warning.edit-confirmation');
      let message = t('message.warning.edit-confirmation-message');

      if (onlyStatus) {
        titleMessage = t('message.warning.update-status-confirmation');
        message = t('message.warning.update-status-confirmation-message');
      }

      const confirmed = await PopupMessageWithCancel(titleMessage, message, t('button.confirm'), t('button.cancel'), "warning", "#FDB600")

      if (!confirmed) return;

      if (!selectedRow) return;

      const arrestDate = data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format("YYYY-MM-DD") : null;
      const endArrestDate = data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format("YYYY-MM-DD") : null;

      let image_url = "";
      if (formData.images.length > 0) {
        image_url = formData.images[0].image_url;
      }

      const body = JSON.stringify({
        uid: selectedRow.uid,
        image_url: image_url,
        ...(
          getId(data.prefix) !== selectedRow?.title_id && { title_id: getId(data.prefix) }
        ),
        firstname: formData.firstname,
        lastname: formData.lastname,
        dss_orgcode: formData.dss_orgcode,
        dss_person_id: formData.dss_person_id,
        ...(
          data.id_card_number !== selectedRow?.idcard_number && { idcard_number: data.id_card_number.replaceAll("-", "").slice(0, 13) }
        ),
        ...(
          data.address !== selectedRow?.address && { address: data.address }
        ),
        ...(
          getStringId(data.province) !== selectedRow?.province_code && { province_code: getStringId(data.province) }
        ),
        ...(
          getStringId(data.district) !== selectedRow?.district_code && { district_code: getStringId(data.district) }
        ),
        ...(
          getStringId(data.subDistrict) !== selectedRow?.subdistrict_code && { subdistrict_code: getStringId(data.subDistrict) }
        ),
        ...(
          data.zipcode !== selectedRow?.zipcode && { zipcode: data.zipcode }
        ),
        ...(
          getId(data.personType) !== selectedRow?.person_class_id && { person_class_id: getId(data.personType) }
        ),
        ...(
          data.case_number !== selectedRow?.case_number && { case_number: data.case_number }
        ),
        ...(
          data.case_number !== selectedRow?.case_number && { case_number: data.case_number }
        ),
        ...(
          arrestDate !== selectedRow.arrest_warrant_date && { arrest_warrant_date: data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format('YYYY-MM-DD') : null }
        ),
        ...(
          endArrestDate !== selectedRow.arrest_warrant_expire_date && { arrest_warrant_expire_date: data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format('YYYY-MM-DD') : null }
        ),
        ...(
          data.behavior !== selectedRow.behavior && { behavior: data.behavior }
        ),
        case_owner_name: data.case_owner_name,
        case_owner_phone: data.case_owner_phone ? data.case_owner_phone.replaceAll("-", "").slice(0, 10) : "",
        ...(
          data.active_status !== selectedRow?.active && { active: data.active_status }
        ),
      })

      const response = await fetchClient<SuspectPeopleCreateResponse>(combineURL(CENTER_API, "/watchlist/update"), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      })

      if (isImageChanged) {
        const imageArray = getImagesArrayWithoutNulls(formData.images);
        const oldImageArray = selectedRow?.images ?? [];
        const { added, removed } = getFilesDiff(imageArray, oldImageArray);

        if (removed.length > 0) {
          await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-images/delete`), {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json'
            },
            queryParams: {
              ids: removed.map((image) => image.id).toString()
            }
          })
        }

        if (added.length > 0) {
          await Promise.all(
            added.map(async (image) => {
              const body = JSON.stringify({
                watchlist_uid: selectedRow.uid,
                url: image.url,
                title: image.title
              });

              await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-images/create`), {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body,
              });
            })
          );
        }
      }

      if (isFileChanged) {
        const { added, removed } = getFilesDiff(formData.files, selectedRow?.files ?? []);

        if (removed.length > 0) {
          await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-files/delete`), {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json'
            },
            queryParams: {
              ids: removed.map((file) => file.id).toString()
            }
          })
        }

        if (added.length > 0) {
          await Promise.all(
            added.map(async (file) => {
              const body = JSON.stringify({
                watchlist_uid: selectedRow.uid,
                url: file.url,
                title: file.title
              });

              await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-files/create`), {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body,
              });
            })
          );
        }
      }

      if (response.success) {
        PopupMessage(t('message.success.save-success'), "", "success");
        bc.postMessage("reload");
        clearData();
        onClose();
      }
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
  }

  const isDataChanged = () => {
    const status = selectedRow?.active ? 1 : 0;
    const isOnlyStatusChanged = formData.active_status !== status;

    const imageArray = getImagesArrayWithoutNulls(formData.images).map((image) => image.image_url);
    const oldImageArray = selectedRow?.images?.map((image) => image.image_url) ?? [];
    const isImageChanged = JSON.stringify(imageArray) !== JSON.stringify(oldImageArray);

    const fileArray = getFilesArrayWithoutNulls(formData.files).map((file) => file.file_url);
    const oldFileArray = selectedRow?.files?.map((file) => file.file_url) ?? [];
    const isFileChanged = JSON.stringify(fileArray) !== JSON.stringify(oldFileArray);

    const arrestDate = formData.arrest_warrant_date ? dayjs(formData.arrest_warrant_date).format("YYYY-MM-DD") : null;
    const endArrestDate = formData.arrest_warrant_expire_date ? dayjs(formData.arrest_warrant_expire_date).format("YYYY-MM-DD") : null;

    const idCardNumber = formData.id_card_number ? formData.id_card_number.replaceAll("-", "").slice(0, 13) : null;

    const isOtherDataChanged =
      formData.title_id !== selectedRow?.title_id ||
      formData.firstname !== selectedRow?.firstname ||
      formData.lastname !== selectedRow?.lastname ||
      idCardNumber !== selectedRow?.idcard_number ||
      formData.address !== selectedRow?.address ||
      getStringId(formData.province_code) !== selectedRow?.province_code ||
      getStringId(formData.district_code) !== selectedRow?.district_code ||
      getStringId(formData.subdistrict_code) !== selectedRow?.subdistrict_code ||
      formData.zipcode !== selectedRow?.zipcode ||
      getId(formData.person_class_id) !== selectedRow?.person_class_id ||
      formData.case_number !== selectedRow?.case_number ||
      arrestDate !== selectedRow.arrest_warrant_date ||
      endArrestDate !== selectedRow.arrest_warrant_date ||
      formData.behavior !== selectedRow.behavior

    const statusChangeOnly = isOnlyStatusChanged && !isImageChanged && !isFileChanged && !isOtherDataChanged;

    return { all: statusChangeOnly || isOtherDataChanged || isImageChanged || isFileChanged, onlyStatus: statusChangeOnly, isImageChanged, isFileChanged };
  };

  const handleImportFileClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  }

  const convertImagesToArray = (imagesObj: {
    [key: number]: WatchListImageData | null
  }): (WatchListImageData | null)[] => {
    const maxIndex = Math.max(...Object.keys(imagesObj).map(Number), -1)

    // Create array of that length + 1
    return Array.from({ length: maxIndex + 1 }, (_, index) => {
      return imagesObj[index] || null
    })
  }

  const getImagesArrayWithoutNulls = (imagesObj: {
    [key: number]: WatchListImageData | null
  }): WatchListImageData[] => {
    return convertImagesToArray(imagesObj).filter(
      (img): img is WatchListImageData => img !== null
    )
  }

  const convertFilesToArray = (imagesObj: {
    [key: number]: WatchListFileData | null
  }): (WatchListFileData | null)[] => {
    const maxIndex = Math.max(...Object.keys(imagesObj).map(Number), -1)

    // Create array of that length + 1
    return Array.from({ length: maxIndex + 1 }, (_, index) => {
      return imagesObj[index] || null
    })
  }

  const getFilesArrayWithoutNulls = (imagesObj: {
    [key: number]: WatchListFileData | null
  }): WatchListFileData[] => {
    return convertFilesToArray(imagesObj).filter(
      (img): img is WatchListFileData => img !== null
    )
  }

  const clearData = () => {
    const ownerName = authData.userInfo ? `${authData?.userInfo?.firstname} ${authData?.userInfo?.lastname}` : "-";
    const ownerPhone = authData.userInfo ? formatPhone(authData?.userInfo?.phone) : "-";
    setFormData({
      title_id: 0,
      firstname: "",
      lastname: "",
      id_card_number: "",
      address: "",
      province_code: "",
      district_code: "",
      subdistrict_code: "",
      zipcode: "",
      person_class_id: 0,
      dss_orgcode: "",
      dss_person_id: "",
      case_number: "",
      arrest_warrant_date: null,
      arrest_warrant_expire_date: null,
      behavior: "",
      case_owner_name: "",
      case_owner_phone: "",
      images: [],
      files: [],
      image_url: "",
      active_status: 0,
    });
    setValue("prefix", "");
    setValue("firstname", "");
    setValue("lastname", "");
    setValue("id_card_number", "");
    setValue("address", "");
    setValue("province", "");
    setValue("district", "");
    setValue("subDistrict", "");
    setValue("zipcode", "");
    setValue("personType", "");
    setValue("behavior", "");
    setValue("image", "");
    setValue("case_owner_name", ownerName);
    setValue("case_owner_phone", ownerPhone);
    setValue("case_number", "");
    setValue("arrest_date", "");
    setValue("end_arrest_date", "");
    setValue("active_status", 0);
    clearErrors();
  }

  const handleDeleteFile = async(index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog id='manage-suspect-people' open={open} maxWidth="xl" fullWidth>
      <DialogTitle className='bg-black'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.manage-suspect-people.title')}</Typography>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <form className='border border-[#2B9BED]' onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-[auto_25%] py-1'>
            {/* Column 1 */}
            <div className='grid grid-cols-3 gap-x-5 gap-y-3 px-4 py-2 border-r border-[#999999]'>
              <AutoComplete 
                id="prefix-select"
                sx={{ marginTop: "5px"}}
                value={formData.title_id}
                onChange={handlePrefixChange}
                options={prefixOptions}
                label={t("component.prefix")}
                placeholder={t("placeholder.prefix")}
                labelFontSize="15px"
                required={true}
                register={register("prefix", { 
                  required: true,
                })}
                error={!!errors.prefix}
              />
              
              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="first-name"
                label={t("component.first-name")}
                value={formData.firstname}
                onChange={(event) =>
                  handleTextChange("firstname", event.target.value)
                }
                required={true}
                register={register("firstname", { 
                  required: true,
                })}
                error={!!errors.firstname}
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="surname"
                label={t("component.last-name")}
                value={formData.lastname}
                onChange={(event) =>
                  handleTextChange("lastname", event.target.value)
                }
                required={true}
                register={register("lastname", { 
                  required: true,
                })}
                error={!!errors.lastname}
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="id-card-number"
                label={t("component.id-card-number")}
                value={formData.id_card_number}
                onChange={handleNationalIdChange}
                register={register("id_card_number", { 
                  required: false,
                })}
                error={!!errors.id_card_number}
              />

              <div className='col-span-2'>
                <TextBox
                  sx={{ marginTop: "5px", fontSize: "15px" }}
                  id="address"
                  label={t("component.address")}
                  value={formData.address}
                  onChange={(event) =>
                    handleTextChange("address", event.target.value)
                  }
                  register={register("address", { 
                    required: false,
                  })}
                  error={!!errors.address}
                />
              </div>

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
                error={!!errors.district}
              />

              <AutoComplete 
                id="subdistrict-select"
                sx={{ marginTop: "5px"}}
                value={formData.subdistrict_code}
                onChange={handleSubDistrictChange}
                options={subDistrictOptions}
                label={t("component.sub-district")}
                labelFontSize="15px"
                placeholder={t("placeholder.sub-district")}
                register={register("subDistrict", { 
                  required: false,
                })}
                error={!!errors.subDistrict}
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="zipcode"
                label={t("component.zipcode")}
                value={formData.zipcode}
                onChange={(event) =>
                  handleTextChange("zipcode", event.target.value)
                }
                register={register("zipcode", { 
                  required: false,
                })}
                error={!!errors.zipcode}
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
                  required: true,
                })}
                required={true}
                error={!!errors.personType}
              />

              <div className='col-start-1'>
                <TextBox
                  sx={{ marginTop: "5px", fontSize: "15px" }}
                  id="case-number"
                  label={t("component.case-number")}
                  value={formData.case_number}
                  onChange={(event) =>
                    handleTextChange("case_number", event.target.value)
                  }
                  register={register("case_number", { 
                    required: false,
                  })}
                  error={!!errors.case_number}
                />
              </div>

              <div>
                <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                  {t("component.date-arrest-warrant")}
                </Typography>
                <DatePickerBuddhist
                  value={formData.arrest_warrant_date}
                  sx={{
                    marginTop: "8px",
                    "& .MuiOutlinedInput-input": {
                      fontSize: 15
                    }
                  }}
                  className="w-full"
                  id="arrest-warrant-date"
                  onChange={(value) => handleArrestWarrantDateChange(value)}
                  error={!!errors.arrest_warrant_date}
                  register={register("arrest_warrant_date", { 
                    required: false,
                  })}
                >
                </DatePickerBuddhist>
              </div>

              <div>
                <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                  {t("component.date-expiration-arrest-warrant")}
                </Typography>
                <DatePickerBuddhist
                  value={formData.arrest_warrant_expire_date}
                  sx={{
                    marginTop: "8px",
                    "& .MuiOutlinedInput-input": {
                      fontSize: 15
                    }
                  }}
                  className="w-full"
                  id="arrest-warrant-expire-date"
                  onChange={(value) => handleArrestWarrantExpireDateChange(value)}
                  error={!!errors.arrest_warrant_expire_date}
                  register={register("arrest_warrant_expire_date", { 
                    required: false,
                  })}
                >
                </DatePickerBuddhist>
              </div>

              <div className='col-span-3'>
                <TextBox
                  sx={{ marginTop: "5px", fontSize: "15px" }}
                  id="behavior"
                  label={t("component.behavior")}
                  value={formData.behavior}
                  onChange={(event) =>
                    handleTextChange("behavior", event.target.value)
                  }
                  isMultiline={true}
                  rows={4}
                  required={true}
                  register={register("behavior", { 
                    required: true,
                  })}
                  error={!!errors.behavior}
                />
              </div>

              <TextBox
                sx={{ marginTop: "10px", fontSize: "15px" }}
                id="case-owner-name"
                label={t('component.owner-name')}
                value={formData.case_owner_name}
                onChange={(event) =>
                  handleTextChange("case_owner_name", event.target.value)
                }
                placeholder={t('placeholder.owner-name')}
                register={register("case_owner_name", { 
                  required: false,
                })}
                error={!!errors.case_owner_name}
                disabled={true}
              />

              <TextBox
                sx={{ marginTop: "10px", fontSize: "15px" }}
                id="case-owner-phone"
                label={t('component.phone')}
                value={formData.case_owner_phone}
                onChange={handlePhoneChange}
                placeholder={t('placeholder.phone-number')}
                register={register("case_owner_phone", { 
                  required: false,
                })}
                error={!!errors.case_owner_phone}
                disabled={true}
              />

              <div className='flex items-end justify-start h-full text-white'>
                <FormGroup>
                  <Controller
                    name="active_status"
                    control={control}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <FormControlLabel 
                        control={
                          <Checkbox
                            name={rest.name}
                            onBlur={rest.onBlur}
                            slotProps={{
                              input: {
                                ref: rest.ref
                              }
                            }}
                            checked={value === 1}
                            onChange={(e) => {
                              const newVal = e.target.checked ? 1 : 0;
                              onChange(newVal);
                              handleStatusChange(newVal)
                            }}
                            sx={{
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
                        label={t('component.active-status')}
                      />
                    )}
                  />
                </FormGroup>
              </div>

              <div className='col-start-3 row-start-9 flex items-center justify-end gap-3'>
                <Button
                  type='submit'
                  variant="contained"
                  className="primary-btn"
                  startIcon={ <Save />}
                  sx={{
                    width: "100px",
                    height: "40px",
                    textTransform: "capitalize",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    } 
                  }}
                >
                  {t('button.save')}
                </Button>

                <Button
                  variant="text"
                  className="cancel-btn"
                  sx={{
                    width: "100px",
                    height: "40px",
                    textTransform: "capitalize",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    } 
                  }}
                  onClick={handleCancelClick}
                >
                  {t('button.cancel')}
                </Button>
              </div>
            </div>

            {/* Column 2 */}
            <div
              id="file-import-container"
              className="h-full border-l-2 border-nobel px-[25px] py-2"
            >
              <label className="text-white text-[15px]">
                {t('text.image')} <span className="text-red-500">*</span>

                {/* ERROR TEXT */}
                {errors.image && (
                  <span className="text-red-500 ml-2">
                    {typeof errors.image.message === 'string'
                      ? errors.image.message
                      : t('text.image-required')}
                  </span>
                )}
              </label>
              <div className="h-full text-white">
                {/* Image Upload Section */}
                <div id="image-import-part" className="flex flex-col items-center">
                  <label
                    className="relative flex items-center justify-center w-full h-[250px] mt-[5px] bg-[#48494B] cursor-pointer overflow-hidden hover:bg-gray-800"
                  >
                    { formData.images.length > 0 && formData.images[0]?.image_url ? (
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0">
                          <img
                            src={`${CENTER_FILE_URL}${formData.images[0].image_url}`}
                            alt="Uploaded 1"
                            className="object-contain w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute z-52 top-2 right-2 text-white bg-red-500 rounded-full w-[30px] h-[30px] flex items-center justify-center hover:cursor-pointer"
                            onClick={handleDeleteImage}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* No Images */
                      <div className='flex flex-col justify-center items-center gap-2'>
                        <div className="flex flex-col justify-center items-center">
                          <Icon icon={Download} size={80} color="#999999" />
                          <span className="text-[18px] text-nobel mt-5">
                            {t('button.upload-image')}
                          </span>
                        </div>
                        <span className='text-[12px] text-nobel'>{t('text.image-size-detail')}</span>
                      </div>
                    )}
                    {/* Hidden File Input */}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      {...register("image", {
                        onChange: handleImageUpload,
                      })}
                    />
                  </label>
                </div>

                {/* File Upload Section */}
                <div
                  id="file-import-part"
                  className="flex justify-end mt-[25px] space-x-2"
                >
                  <Button
                    variant="contained"
                    className="primary-btn"
                    startIcon={
                      <img src={UploadIcon} className='w-5 h-5'></img>
                    }
                    sx={{
                      width: "130px",
                      textTransform: "capitalize",
                    }}
                    onClick={handleImportFileClick}
                  >
                    {t('button.upload-file')}
                  </Button>
                </div>

                <input
                  ref={hiddenFileInput}
                  name="files"
                  type="file"
                  accept=".docx, .pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* File List Section */}
                <div id="file-list-part" className="mt-[15px] h-[35vh] overflow-y-auto">
                  <table className="w-full">
                    <tbody>
                      {formData.files && formData.files.length > 0 ? (
                        formData.files.map((file, index) => (
                          <tr
                            key={`${file.title}-${index}`}
                            className={`h-10 ${
                              index % 2 === 0 ? "bg-[#393B3A]" : "bg-[#48494B]"
                            } ${
                              index === formData.files.length - 1
                                ? "border-b border-[#D9D9D9]"
                                : "border-b border-dashed border-[#D9D9D9]"
                            }`}
                          >
                            <td className="font-medium text-center">
                              {getFileName(file.title, file.file_url)}
                            </td>
                            <td className="font-medium text-center">
                              {dayjs(new Date(file.created_at)).format('DD/MM/YYYY (hh:mm)')}
                            </td>
                            <td className="w-[30px]">
                              <div className='flex items-center'>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(index)}
                                  className="hover:opacity-80 transition-opacity hover:cursor-pointer"
                                >
                                  <Icon icon={Trash2} size={20} color="white" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="font-medium h-10 bg-swamp border-b border-[#D9D9D9]">
                          <td className="text-start pl-2.5">{t('text.no-data')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ManageSuspectPerson;