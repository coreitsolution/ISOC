import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

// Material UI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { SelectChangeEvent } from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';

// Constant
import { SETTING_ROW_PER_PAGES } from "../../constants/dropdown";

// Icon
// import CSVIcon from "../../assets/icons/csv.png";
import { Pencil } from 'lucide-react';

// i18n
import { useTranslation } from 'react-i18next';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import Loading from "../../components/loading/Loading";
import PaginationComponent from '../../components/pagination/Pagination';

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { formatNumber } from '../../utils/commonFunction';
import { PopupMessage } from '../../utils/popupMessage';

// Types
import {
  CameraFace,
  CameraFaceResponse,
} from "../../features/types";

// Modules
import CameraSetting from "./camera-setting/CameraSetting";

// Config
import { getUrls } from '../../config/runtimeConfig';

interface SettingFaceProps {

}

const SettingFace: React.FC<SettingFaceProps> = ({}) => {
  const { isOpen } = useHamburger();
  const { CENTER_API } = getUrls();

  // i18n
  const { t } = useTranslation();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [openCameraSetting, setOpenCameraSetting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Data
  const [cameraList, setCameraList] = useState<CameraFace[]>([])
  const [selectedRow, setSelectedRow] = useState<CameraFace | null>(null)

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(SETTING_ROW_PER_PAGES[SETTING_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(SETTING_ROW_PER_PAGES);

  const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);

  useEffect(() => {
    fetchCameras(page, rowsPerPage);
    return () => {
      setCameraList([]);
    }
  }, [cameraRefreshKey]);

  const fetchCameras = async (page: number, limit: number, filter?: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<CameraFaceResponse>(combineURL(CENTER_API, "/base-cameras/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          page: page.toString(),
          limit: limit.toString(),
          ...(filter ? { filter } : {})
        }
      })

      if (response.success) {
        setCameraList(response.data);
        setTotalPages(prev => {
          if (prev > response.pagination.maxPage) {
            return response.pagination.maxPage;
          }
          else {
            return prev;
          }
        })
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const handleEdit = (data: CameraFace) => {
    setIsEdit(true);
    setOpenCameraSetting(true);
    setSelectedRow(data);
  }

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    setRowsPerPage(parseInt(event.target.value));
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      setPage(pageInput);
    }
  };

  const handlePageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');

    if (cleaned) {
      const numberInput = Number(cleaned);
      if (numberInput > 0 && numberInput <= totalPages) {
        setPageInput(numberInput);
      }
    }
    else if (cleaned === "") {
      setPageInput(1);
    }
    return cleaned;
  }

  const handleCameraSettingClose = async () => {
    setOpenCameraSetting(false);
    setCameraList([]);
    await fetchCameras(page, rowsPerPage);
  }

  return (
    <div id='setting-face' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} transition-all duration-500`}>
      { isLoading && <Loading /> }
      <div className='flex flex-col w-full gap-3 pr-5'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.setting-face.title')}</Typography>

        <div className='flex flex-col gap-3 mt-2'>
          <Typography variant="h6" color="white" className="font-bold">{t('text.camera-list')}</Typography>
          <label>{`${t('table.amount')} ${formatNumber(cameraList.length)} ${t('table.list')}`}</label>
        </div>

        {/* Result Table */}
        <div>
          <TableContainer
            component={Paper} 
            className='mt-2'
            sx={{ height: "70vh", backgroundColor: "transparent" }}
          >
            <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#242727", position: "sticky", top: 0, zIndex: 1 }}>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>{t('table.column.no')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.camera-status')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-name')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-location')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.camera-detect')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "#48494B" }}>
                {
                  cameraList.map((data, index) => 
                    <TableRow 
                      key={index} 
                      sx={{
                        '& td, & th': { borderBottom: '1px dashed #ADADAD' }
                      }}
                    >
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        {
                          (() => {
                            const color = data.active ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                            return (
                              <label
                                className={`w-[80px] h-[30px] inline-flex items-center justify-center rounded
                                ${color}`}
                              >
                                { data.active ? t('text.active') : t('text.inactive') }
                              </label>
                            )
                          })()
                        }
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        {data.channel_name || "-"}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        { !data.latitude || !data.longitude ? "-" : `${data.latitude}, ${data.longitude}`}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "end" }}>
                        {formatNumber(data.detection_count || 0)}
                      </TableCell>
                      <TableCell align="center"
                        sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}
                        className='flex justify-center items-center'
                      >
                        <div className='flex items-center justify-center gap-1'>
                          <IconButton
                            sx={{
                              borderRadius: "4px !important",
                            }}
                            onClick={() => handleEdit(data)}
                          >
                            <Pencil color='#FFFFFF' size={20} />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Part */}
          <div className={`${cameraList.length > 0 ? "flex" : "hidden"} items-center justify-between bg-[var(--background-color)] py-3 pl-1 sticky bottom-0`}>
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

        {/* Modules */}
        {
          openCameraSetting && (
            <CameraSetting open={openCameraSetting} onClose={handleCameraSettingClose} selectedRow={selectedRow} isEdit={isEdit} />
          )
        }
      </div>
    </div>
  )
}

export default SettingFace;