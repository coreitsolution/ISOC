import React, {useRef, useState, useEffect} from 'react'
import ExcelJS from "exceljs";
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

// Icon
import { Icon } from '../../../components/icons/Icon'
import { Trash2 } from 'lucide-react'

// Types
import {
  ImportSuspectPeople,
} from '../../../features/types';

// Utils
import { PopupMessage } from "../../../utils/popupMessage"
import { getFileNameWithoutExtension, formatPhone, parseExcelDate } from "../../../utils/commonFunction"

// Component
import Loading from "../../../components/loading/Loading"

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra)

interface TextUploadProps {
  setTextsDataList: (data: ImportSuspectPeople[]) => void
  textsDataList: ImportSuspectPeople[]
}

const TextUpload: React.FC<TextUploadProps> = ({setTextsDataList, textsDataList}) => {

  // Data
  const hiddenFileInput = useRef<HTMLInputElement | null>(null)
  const [textsData, setTextsData] = useState<ImportSuspectPeople[]>(textsDataList)

  // State
  const [isLoading, setIsLoading] = useState(false)

  // i18n
  const { t, i18n } = useTranslation();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const { authData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setTextsDataList(textsData)
  }, [textsData, setTextsDataList])
  
  const handleClickImport = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0]; // first sheet
      const headers: string[] = [];

      // Extract headers from first row
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(String(cell.value ?? "").trim());
      });

      // Convert rows into JSON objects
      const jsonData: ImportSuspectPeople[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header row
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          rowData[header] = cell.value ?? "";
        });
        jsonData.push(rowData);
      });

      let fileImportError = "";
      const requiredFields = [
        "title",
        "first_name",
        "last_name",
        "behavior",
        "person_class",
        "image",
      ];

      const fileNames = new Set<string>();
      const duplicateFiles: string[] = [];
      const imageNames = new Set<string>();
      const duplicateImages: string[] = [];

      const validatedData = jsonData
        .map((row, index) => {
          const missingFields = requiredFields.filter(
            (field) => !row[field as keyof ImportSuspectPeople]
          );

          if (missingFields.length > 0) {
            fileImportError = t("text.important-field", {
              field: missingFields.join(", "),
            });
            return null;
          }

          // Check duplicate image
          const imageName = row.image ? getFileNameWithoutExtension(row.image) : "";
          if (imageName && imageNames.has(imageName)) {
            duplicateImages.push(imageName);
            fileImportError = t("text.duplicate-file-found", {
              fileName: duplicateImages.join(", "),
            });
            return null;
          }
          if (imageName) {
            imageNames.add(imageName);
          }

          // Check duplicate filename
          const fileName = row.file ?  getFileNameWithoutExtension(row.file) : "";
          if (fileName && fileNames.has(fileName)) {
            duplicateFiles.push(fileName);
            fileImportError = t("text.duplicate-file-found", {
              fileName: duplicateFiles.join(", "),
            });
            return null;
          }
          if (fileName) {
            fileNames.add(fileName);
          }

          const prefix = sliceDropdown.prefix?.data.find((prefix) => prefix.id === authData?.userInfo?.title_id)
          const ownerName = authData.userInfo ? `${prefix ? i18n.language === "th" ? prefix.title_th : prefix.title_en : ""}${authData?.userInfo?.firstname} ${authData?.userInfo?.lastname}` : "-";
          const ownerPhone = authData.userInfo ? formatPhone(authData?.userInfo?.phone) : "-";

          return {
            id: index + 1,
            title: row.title,
            first_name: row.first_name,
            last_name: row.last_name,
            id_card_number: row.id_card_number || "",
            province: row.province || "",
            district: row.district || "",
            subdistrict: row.subdistrict || "",
            zipcode: row.zipcode || "",
            person_class: row.person_class || "",
            case_number: row.case_number || "",
            arrest_warrant_date: parseExcelDate(row.arrest_warrant_date),
            arrest_warrant_expire_date: parseExcelDate(row.arrest_warrant_expire_date),
            behavior: row.behavior,
            case_owner_name: ownerName,
            case_owner_phone: ownerPhone,
            image: row.image,
            file: row.file,
            active: row.active,
            address: row.address
          } as ImportSuspectPeople;
        })
        .filter(Boolean) as ImportSuspectPeople[];

      if (fileImportError) {
        PopupMessage(t("message.error.error-import-file"), fileImportError, "error");
      } else if (!fileImportError && validatedData && validatedData.length > 0) {
        setTextsData(validatedData);
      }
    } 
    catch (error) {
      PopupMessage(t("message.error.error-import-file"), String(error), "error");
    }

    setIsLoading(false);

    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = "";
    }
  };

  const handleDeleteData = (indexToDelete: number) => {
    setTextsData(prevData => prevData.filter((_, index) => index !== indexToDelete));
  };

  return (
    <div id='text-upload'>
      {isLoading && <Loading />}
      <div className='flex flex-col h-full'>
        <div className='flex justify-end'>
          <Button
            variant="contained"
            className="tertiary-btn"
            sx={{ 
              width: t('button.import-excel-width'), 
              height: "30px",
              textTransform: "capitalize",
            }}
            onClick={handleClickImport}
          >
            {t('button.import-excel')}
          </Button>
          {/* Hidden File Input */}
          <input
            ref={hiddenFileInput}
            name="files"
            type="file"
            id="file-input"
            className="hidden"
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
          />
        </div>
        <div className="grow overflow-x-auto">
          <TableContainer component={Paper} className="mt-4 h-[56.3vh] w-[2500px]"
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
                  textsData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{index + 1}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.title}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.first_name}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.last_name}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{data.id_card_number || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.address || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{data.province || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>{data.district || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{data.subdistrict || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>{data.zipcode || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{data.person_class}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>{data.case_number || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') : "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>{data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') : "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{data.behavior || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.case_owner_name}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textWrap: "nowrap", textAlign: "center" }}>{data.case_owner_phone}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>{data.image}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{data.file || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>{data.active}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>
                        <IconButton onClick={() => handleDeleteData(index)}>
                          <Icon icon={Trash2} size={20} color="#FFFFFF" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  )
}

export default TextUpload