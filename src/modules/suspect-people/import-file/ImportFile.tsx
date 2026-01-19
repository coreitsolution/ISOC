import React, { useState } from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
} from '@mui/material';
import dayjs from 'dayjs';

// Components
import Loading from "../../../components/loading/Loading";
import FileImportBreadCrumbs from '../../../components/breadcrumbs/FileImportBreadCrumbs';
import ImagesUpload from '../../../components/import-files/ImagesUpload';
import FilesUpload from '../../../components/import-files/FilesUpload';

// Modules
import TextUpload from './TextUpload';
import Confirmation from './Confirmation';

// Types
import { 
  FileUpload, 
  ImportSuspectPeople,
  SuspectPeopleCreateResponse,
  WatchListFileResponse,
} from '../../../features/types';

// Icons
import { CircleX } from "lucide-react";

// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { fetchClient, combineURL } from "../../../utils/fetchClient";
import { PopupMessage } from "../../../utils/popupMessage"

// Config
import { getUrls } from '../../../config/runtimeConfig';

interface ImportFileProps {
  open: boolean;
  onClose: () => void;
}

const ImportFile: React.FC<ImportFileProps> = ({open, onClose}) => {
  const { CENTER_API } = getUrls();
  // i18n
  const { t } = useTranslation();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationClick, setIsConfirmationClick] = useState(false);
  
  // Data
  const [step, setStep] = useState(0);
  const [imagesList, setImagesList] = useState<FileUpload[]>([]);
  const [filesList, setFilesList] = useState<FileUpload[]>([]);
  const [textsList, setTextsList] = useState<ImportSuspectPeople[]>([]);
  const [finalList, setFinalList] = useState<ImportSuspectPeople[]>([]);
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [errorFile, setErrorFile] = useState<FileUpload[]>([]);

  // Constants
  const breadcrumbItems = [
    { label: t('bread-crumb.upload-image'), isCompleted: step > 0, isActive: step === 0 },
    { label: t('bread-crumb.upload-file'), isCompleted: step > 1, isActive: step === 1 },
    { label: t('bread-crumb.upload-excel'), isCompleted: step > 2, isActive: step === 2 },
    { label: t('bread-crumb.confirmation'), isCompleted: step > 3, isActive: step === 3 },
  ]

  const nextStep = () => {
    if (step < breadcrumbItems.length - 1) {
      setStep(step + 1)
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  };

  const handleConfirmClick = async () => {
    setIsConfirmationClick(true);
    const importableData = finalList.filter(item => !item.cannotImport)
    setIsLoading(true)

    // Add Suspect People
    for (const data of importableData) {
      await addSuspectPeople(data)
    }
    
    // Delete unused images
    const usedImages = new Set(importableData.flatMap(item => item.imagesUploadedData?.url || []))
    const unusedImages = imagesList.filter(image => !usedImages.has(image.url))
    if (unusedImages.length > 0) {
      await handleDeleteFile(unusedImages)
    }

    // Delete unused files
    const usedFiles = new Set(importableData.flatMap(item => item.fileUploadedData?.url || []))
    const unusedFiles = filesList.filter(file => !usedFiles.has(file.url))
    if (unusedFiles.length > 0) {
      await handleDeleteFile(unusedFiles)
    }

    if (errorFile.length > 0) {
      await handleDeleteFile(errorFile)
    }

    if (errorMessage.length > 0) {
      PopupMessage(t('message.error.error-while-saving'), errorMessage.join(","), "error");
    }
    else {
      PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success");
    }
    
    setIsLoading(false);

    clearData();
    onClose();
  }

  const addSuspectPeople = async (data: ImportSuspectPeople) => {
    try {
      const body = JSON.stringify({
        title_id: data.title_id,
        firstname: data.first_name,
        lastname: data.last_name,
        person_class_id: data.person_class_id,
        ...(
          data.id_card_number && { id_card_number: data.id_card_number }
        ),
        ...(
          data.address && { address: data.address }
        ),
        ...(
          data.province_code && { province_code: data.province_code }
        ),
        ...(
          data.district_code && { district_code: data.district_code }
        ),
        ...(
          data.subdistrict_code && { subdistrict_code: data.subdistrict_code }
        ),
        ...(
          data.zipcode && { zipcode: data.zipcode }
        ),
        ...(
          data.case_number && { case_number: data.case_number }
        ),
        arrest_warrant_date: data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format('YYYY-MM-DD') : null,
        arrest_warrant_expire_date: data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format('YYYY-MM-DD') : null,
        behavior: data.behavior,
        case_owner_name: data.case_owner_name,
        case_owner_phone: data.case_owner_phone ? data.case_owner_phone.replaceAll("-", "").slice(0, 10) : "",
        active: data.active_id ?? 0,
      })

      const response = await fetchClient<SuspectPeopleCreateResponse>(combineURL(CENTER_API, "/watchlist/create"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      })

      if (response.success) {
        if (data.imagesUploadedData && Object.keys(data.imagesUploadedData).length > 0) {
          const body = JSON.stringify({
            watchlist_uid: response.data.uid,
            image_url: data.imagesUploadedData.url,
            title: data.imagesUploadedData.title
          });
          await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, "/watchlist-images/create"), {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body,
          })
        }

        if (data.fileUploadedData && Object.keys(data.fileUploadedData).length > 0) {
          const body = JSON.stringify({
            watchlist_uid: response.data.uid,
            file_url: data.fileUploadedData.url,
            title: data.fileUploadedData.title
          });
          await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, "/watchlist-files/create"), {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body,
          })
        }
      }
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setErrorMessage((prevData) => [...prevData, errorMessage]);
      setErrorFile(prev => [
        ...prev,
        ...(data.imagesUploadedData ? [data.imagesUploadedData] : []),
        ...(data.fileUploadedData ? [data.fileUploadedData] : [])
      ]);
    }
  }

  const deleteFileUpload = async (url: string[]) => {
    try {
      const body = JSON.stringify({
        urls: url
      })

      await fetchClient(combineURL(CENTER_API, `/upload/remove`), {
        method: "POST",
        body,
      })
    }
    catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }

  const handleDeleteFile = async (fileData: FileUpload[]) => {
    try {
      const urls = fileData.map(item => item.url);
      await deleteFileUpload(urls)
    }
    catch (error) {
      PopupMessage(t("message.error.error-delete-file"), error instanceof Error ? error.message : String(error), "error");
    }
  }

  const setFinalDataList = (data: ImportSuspectPeople[]) => {
    const dataIds = new Set(data.map(item => item.id))
    setTextsList((prevData) => prevData.filter(item => dataIds.has(item.id)))
    setFinalList(data)
  }

  const setImagesDataList = (data: FileUpload[]) => {
    setImagesList(data)
  }

  const setFilesDataList = (data: FileUpload[]) => {
    setFilesList(data)
  }

  const setTextsDataList = (data: ImportSuspectPeople[]) => {
    setTextsList(data)
  }

  const handleClosePopUp = async () => {
    if (!isConfirmationClick) {
      deleteUploadFiles();
    }
    clearData();
    onClose();
  };

  const deleteUploadFiles = async () => {
    if (imagesList.length > 0) {
      await handleDeleteFile(imagesList);
    }

    if (filesList.length > 0) {
      await handleDeleteFile(filesList)
    }
  }

  const clearData = () => {
    setImagesList([]);
    setFilesList([]);
    setTextsList([]);
    setFinalList([]);
    setStep(0);
    setErrorMessage([]);
    setIsConfirmationClick(false);
  }

  return (
    <Dialog 
      id='import-suspect-people' 
      open={open} 
      maxWidth="xl" 
      fullWidth 
      sx={{
        '& .MuiDialog-paperFullWidth': {
          border: '1px solid white'
        },
        zIndex: 1000
      }}
    >
      { isLoading && <Loading /> }
      <DialogTitle className='flex items-center justify-between bg-black'>
        {/* Header */}
        <div>
          <Typography variant="h5" color="white" className="font-bold">{t('screen.import-data.title')}</Typography>
        </div>
        <button
          onClick={handleClosePopUp}
        >
          <CircleX size={20} color="white" />
        </button>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <FileImportBreadCrumbs items={breadcrumbItems} />
        <div className="mt-4">
          {step === 0 && <ImagesUpload setImagesDataList={setImagesDataList} imagesDataList={imagesList}/>}
          {step === 1 && <FilesUpload setFilesDataList={setFilesDataList} filesDataList={filesList}/>}
          {step === 2 && <TextUpload setTextsDataList={setTextsDataList} textsDataList={textsList} />}
          {step === 3 && 
          <Confirmation 
            setFinalDataList={setFinalDataList} 
            textsDataList={textsList}
            imagesDataList={imagesList}
            filesDataList={filesList}
          />}
        </div>
        <div className="flex justify-end mt-4 gap-2">
          {step > 0 && (
            <Button
              variant="contained"
              className="secondary-btn"
              sx={{ 
                width: t('button.previous-width'), 
                height: "40px",
                textTransform: "capitalize",
              }}
              onClick={prevStep}
            >
              {t('button.previous')}
            </Button>
          )}
          {step < breadcrumbItems.length - 1 && (
            <Button
              variant="contained"
              className="primary-btn"
              sx={{ 
                width: t('button.next-width'), 
                height: "40px",
                textTransform: "capitalize",
              }}
              onClick={nextStep}
            >
              {t('button.next')}
            </Button>
          )}
          {step === breadcrumbItems.length - 1 && (
            <Button
              variant="contained"
              className="primary-btn"
              sx={{ 
                width: t('button.confirm-width'), 
                height: "40px",
                textTransform: "capitalize",
              }}
              onClick={handleConfirmClick}
              disabled={!finalList.some(item => !item.cannotImport)}
            >
              {t('button.confirm')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ImportFile;