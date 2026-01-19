import React, {useState, useEffect} from 'react'
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from "@mui/material/IconButton"
import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"

// Icon
import { Icon } from '../../../components/icons/Icon'
import { Trash2 } from 'lucide-react'

// Types
import {
  ImportSuspectPeople,
  FileUpload
} from '../../../features/types';
import {
  DistrictsResponse,
  SubDistrictsResponse,
} from "../../../features/dropdown/dropdownTypes";

// Config
import { getUrls } from '../../../config/runtimeConfig';

// Component
import Loading from "../../../components/loading/Loading"

// Utils
import { getFileNameWithoutExtension, isValidNationId } from "../../../utils/commonFunction";
import { fetchClient, combineURL } from "../../../utils/fetchClient";

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra)

interface ConfirmationProps {
  setFinalDataList: (data: ImportSuspectPeople[]) => void
  filesDataList: FileUpload[]
  imagesDataList: FileUpload[]
  textsDataList: ImportSuspectPeople[]
}

const Confirmation: React.FC<ConfirmationProps> = ({setFinalDataList, filesDataList, imagesDataList, textsDataList}) => {
  const { CENTER_FILE_URL, CENTER_API } = getUrls();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  // Data
  const [confirmationData, setConfirmationData] = useState<ImportSuspectPeople[]>([]);
  const [convertedData, setConvertedData] = useState<ImportSuspectPeople[]>([]);

  // State
  const [isLoading, setIsLoading] = useState(false)

  // i18n
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!textsDataList.length) {
      setConvertedData([]);
      return;
    }

    const convertData = async () => {
      const results = await Promise.all(
        textsDataList.map(async (data) => {
          const matchedImage = imagesDataList.find((image) =>
            getFileNameWithoutExtension(image.originalName) ===
            getFileNameWithoutExtension(data.image)
          );

          const matchedFile = filesDataList.find((file) =>
            getFileNameWithoutExtension(file.originalName) ===
            getFileNameWithoutExtension(data.file)
          );

          const provinceName =
            data.province === "กทม" || data.province === "กทม."
              ? "กรุงเทพมหานคร"
              : data.province;

          const province = sliceDropdown.provinces?.data?.find((r) =>
            i18n.language === "th"
              ? r.name_th.toLowerCase() === provinceName.toLowerCase()
              : r.name_en.toLowerCase() === provinceName.toLowerCase()
          );

          const personType = sliceDropdown.personTypes?.data?.find(
            (type) =>
              type.title_en.toLowerCase() === data.person_class.toLowerCase()
          );

          const status = sliceDropdown.status?.data?.find(
            (st) => st.status.toLowerCase() === data.active.toLowerCase()
          );

          const personPrefix = sliceDropdown.prefix?.data.find((prefix) =>
            i18n.language === "th"
              ? prefix.title_th === data.title
              : prefix.title_en === data.title
          );

          const districts = province ? await fetchDistricts(province.province_code) : [];
          const districtsInfo = districts.find(
            (d) => d.name_th === data.district || d.name_en === data.district
          );

          const subdistricts =
            province && districtsInfo
              ? await fetchSubDistricts(province.province_code, districtsInfo.district_code)
              : [];

          const subdistrictsInfo = subdistricts.find(
            (sd) => sd.name_th === data.subdistrict || sd.name_en === data.subdistrict
          );

          const isValidNationIdRes = isValidNationId(data.id_card_number.toString().replaceAll("-", ""));

          const zipcode = subdistrictsInfo?.zipcode && data.zipcode == subdistrictsInfo.zipcode
                ? subdistrictsInfo.zipcode
                : ""

          return {
            id: data.id,
            title: personPrefix
              ? i18n.language === "th"
                ? personPrefix.title_th
                : personPrefix.title_en
              : t("text.data-not-found"),
            title_id: personPrefix?.id || 0,
            first_name: data.first_name,
            last_name: data.last_name,
            id_card_number: isValidNationIdRes ? data.id_card_number : "-",
            address: data.address,
            province:
              i18n.language === "th"
                ? province?.name_th || t("text.data-not-found")
                : province?.name_en || t("text.data-not-found"),
            district:
              i18n.language === "th"
                ? districtsInfo?.name_th || t("text.data-not-found")
                : districtsInfo?.name_en || t("text.data-not-found"),
            subdistrict:
              i18n.language === "th"
                ? subdistrictsInfo?.name_th || t("text.data-not-found")
                : subdistrictsInfo?.name_en || t("text.data-not-found"),
            province_id: province?.id || 0,
            district_id: districtsInfo?.id || 0,
            subdistrict_id: subdistrictsInfo?.id || 0,
            zipcode: zipcode,
            zipcodeString: zipcode || t("text.data-not-found"),
            person_class: personType?.title_en || t("text.data-not-found"),
            person_class_id: personType?.id || 0,
            case_number: data.case_number,
            arrest_warrant_date: data.arrest_warrant_date,
            arrest_warrant_expire_date: data.arrest_warrant_expire_date,
            behavior: data.behavior,
            case_owner_name: data.case_owner_name,
            case_owner_phone: data.case_owner_phone,
            image: data.image,
            file: data.file,
            active_id: status?.id || 0,
            active: status?.status || t("text.data-not-found"),
            imagesUploadedData: matchedImage,
            fileUploadedData: matchedFile,
            cannotImport:
              !personType ||
              !personPrefix ||
              !data.first_name ||
              !data.last_name ||
              !data.image ||
              !data.behavior,
          } as ImportSuspectPeople;
        })
      );

      setConvertedData(results);
    };

    convertData();
  }, [
    textsDataList,
    sliceDropdown,
    imagesDataList,
    filesDataList,
    i18n.language,
  ]);
  
  useEffect(() => {
    if (JSON.stringify(confirmationData) !== JSON.stringify(convertedData)) {
      setConfirmationData(convertedData)
      setFinalDataList(convertedData)
    }
  }, [convertedData, setFinalDataList])

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  const handleDeleteData = (indexToDelete: number) => {
    const updatedData = confirmationData.filter((_, index) => index !== indexToDelete)
    setConfirmationData(updatedData)
    setFinalDataList(updatedData)
  }

  const fetchDistricts = async (province_code: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<DistrictsResponse>(combineURL(CENTER_API, "/districts/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `province_code=${province_code}`,
          limit: "60",
        }
      })

      return response.data;
    }
    catch (error) {
      return [];
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const fetchSubDistricts = async (province_code: string, district_code: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<SubDistrictsResponse>(combineURL(CENTER_API, "/subdistricts/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `province_code=${province_code},district_code=${district_code}`,
            limit: "60",
        }
      })

      return response.data;
    }
    catch (error) {
      return [];
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  return (
    <div id='import-confirmation'>
      {isLoading && <Loading />}
      <div className='flex flex-col h-full'>
        <div className="grow overflow-x-auto">
          <TableContainer component={Paper} className="mt-4 h-[60vh] w-[2500px]"
            sx={{
              backgroundColor: "#000000"
            }}
          >
            <Table stickyHeader>
              <TableHead 
                sx={{
                  "& .MuiTableCell-head": {
                    color: "white",
                    backgroundColor: "#242727"
                  },
                }}
              >
                <TableRow>
                  <TableCell sx={{ minWidth: 100, textAlign: "center" }}>{t('table.column.no')}</TableCell>
                  <TableCell sx={{ minWidth: 100, textAlign: "center" }}>{t('table.column.prefix')}</TableCell>
                  <TableCell sx={{ minWidth: i18n.language === "th" ? 100 : 150, textAlign: "center" }}>{t('table.column.first-name')}</TableCell>
                  <TableCell sx={{ minWidth: i18n.language === "th" ? 100 : 150, textAlign: "center" }}>{t('table.column.last-name')}</TableCell>
                  <TableCell sx={{ minWidth: 200, textAlign: "center" }}>{t('table.column.id-card-number')}</TableCell>
                  <TableCell sx={{ minWidth: 250, textAlign: "center" }}>{t('table.column.address')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.province')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.district')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.sub-district')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.zipcode')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.person-type-2')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.case-number')}</TableCell>
                  <TableCell sx={{ minWidth: i18n.language === "th" ? 180 : 250, textAlign: "center" }}>{t('table.column.date-arrest-warrant')}</TableCell>
                  <TableCell sx={{ minWidth: i18n.language === "th" ? 180 : 250, textAlign: "center" }}>{t('table.column.date-expiration-arrest-warrant')}</TableCell>
                  <TableCell sx={{ minWidth: 200, textAlign: "center" }}>{t('table.column.behavior')}</TableCell>
                  <TableCell sx={{ minWidth: 150, textAlign: "center" }}>{t('table.column.owner-name')}</TableCell>
                  <TableCell sx={{ minWidth: i18n.language === "th" ? 100 : 150, textAlign: "center" }}>{t('table.column.phone')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.suspect-person-image')}</TableCell>
                  <TableCell sx={{ minWidth: 120, textAlign: "center" }}>{t('table.column.file')}</TableCell>
                  <TableCell sx={{ minWidth: 100, textAlign: "center" }}>{t('table.column.status')}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& .MuiTableCell-body": {
                    color: "white",
                  }
                }}
              >
                {
                  confirmationData.map((data, index) => {
                    const imageUrl = data.imagesUploadedData ? `${CENTER_FILE_URL}${data.imagesUploadedData.url}` : ""
                    const fileUrl = data.fileUploadedData ? data.fileUploadedData.originalName : ""

                    return (
                      <TableRow key={index} className="relative" sx={{ opacity: data.cannotImport ? 0.8 : 1 }}>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{index + 1}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.title}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.first_name}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.last_name}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.id_card_number || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.address || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.province || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.district || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.subdistrict || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.zipcodeString || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.person_class || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.case_number || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>
                          {data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format("DD/MM/YYYY") : "-"}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>
                          {data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format("DD/MM/YYYY") : "-"}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.behavior || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.case_owner_name}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A", textWrap: "nowrap" }}>{data.case_owner_phone}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>
                          {imageUrl ? (
                            <div>
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`image-${index}`}
                                className="inline-flex items-center justify-center align-middle h-[50px] w-[60px]"
                              />
                            </div>
                          ) : (
                            t('text.data-not-found')
                          )}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{fileUrl || t('text.data-not-found')}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.active}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>
                          <IconButton 
                            onClick={() => handleDeleteData(index)}
                            >
                            <Icon icon={Trash2} size={20} color="#FFFFFF" />
                          </IconButton>
                        </TableCell>

                        {data.cannotImport && (
                          <TableCell
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(72, 73, 75, 0.8)", // Semi-transparent overlay
                            display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontWeight: "bold",
                              color: "#F0B70E !important",
                              zIndex: 1,
                            }}
                            colSpan={15}
                          >
                            {t('text.data-cannot-add')}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  )
}

export default Confirmation