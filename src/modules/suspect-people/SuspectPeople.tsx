import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'

// Material UI
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material';

// Components
import Loading from "../../components/loading/Loading";
import PaginationComponent from '../../components/pagination/Pagination';
import Image from '../../components/image/Image';

// Icons
import { Import, Plus, Pencil, Trash2, Download } from 'lucide-react';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Constant
import { SUSPECT_PEOPLE_ROW_PER_PAGES } from "../../constants/dropdown";

// Modules
import SearchFilter, { FormData } from './search-filter/SearchFilter';
import ManageSuspectPerson from './manage-suspect-person/ManageSuspectPerson';
import ImportFile from './import-file/ImportFile';

// Config
import { getUrls } from '../../config/runtimeConfig';

// i18n
import { useTranslation } from 'react-i18next';

// Types
import { SuspectPeople, WatchListFileResponse, SuspectPeopleResponse } from "../../features/types";

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage, PopupMessageWithCancel } from '../../utils/popupMessage';
import { formatNumber, downloadFile } from "../../utils/commonFunction";

dayjs.extend(buddhistEra)

interface SuspectPeopleProps {

}

const SuspectPeoplePage: React.FC<SuspectPeopleProps> = ({}) => {
  const { CENTER_API, CENTER_FILE_URL } = getUrls();
  const { isOpen } = useHamburger();

  // i18n
  const { t, i18n } = useTranslation();

  // State
  const [isFileImportOpen, setIsFileImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openManageSuspectPeople, setOpenManageSuspectPeople] = useState(false);
  const [importMenu, setImportMenu] = useState<null | HTMLElement>(null);
  const open = Boolean(importMenu);

  // Data
  const [suspectPeopleList, setSuspectPeopleList] = useState<SuspectPeople[]>([]);
  const [selectedRow, setSelectedRow] = useState<SuspectPeople | null>(null);
  const [searchFilter, setSearchFilter] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(SUSPECT_PEOPLE_ROW_PER_PAGES[SUSPECT_PEOPLE_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(SUSPECT_PEOPLE_ROW_PER_PAGES);

  // Options
  const [prefixOptions, setPrefixOptions] = useState<{ label: string ,value: number }[]>([]);

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const bc = new BroadcastChannel("suspectPeopleChannel");

  useEffect(() => {
    setTotalPages(1);
    fetchSuspectPeople(1, rowsPerPage);
  }, [])

  useEffect(() => {
    if (sliceDropdown.prefix && sliceDropdown.prefix.data) {
      const options = sliceDropdown.prefix.data.map((row) => ({
        label: row.title_th,
        value: row.id,
      }));
      setPrefixOptions(options);
    }
  }, [sliceDropdown.prefix]);

  const handleEdit = (data: SuspectPeople) => {
    setSelectedRow(data);
    setOpenManageSuspectPeople(true);
  }

  const handleDownload = (data: SuspectPeople) => {
    alert(data.id)
  }

  const handleDelete = async (id: number) => {
    try {
      const confirmed = await PopupMessageWithCancel(t('message.warning.delete-confirmation'), t('message.warning.delete-confirmation-message'), t('button.confirm'), t('button.cancel'), "warning", "#b91c1c")
      
      if (!confirmed) return;

      const imageResponse = await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-images/get`), {
        method: "GET"
      })

      if (!imageResponse.success) {
        PopupMessage(t('message.error.error-while-fetching-image'), "", "error");
        return;
      };

      if (imageResponse.data.length > 0) {
        await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-images/delete`), {
          method: "DELETE",
          queryParams: {
            ids: imageResponse.data.map(image => image.id).toString()
          },
        })

        await Promise.all(
          imageResponse.data.map(async (data) => {
            const body = JSON.stringify({
              urls: [data.url]
            })
    
            await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/upload/remove`), {
              method: "POST",
              body,
            })
          })
        )
      }

      const fileResponse = await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-files/get`), {
        method: "GET"
      })

      if (!fileResponse.success) {
        PopupMessage(t('message.error.error-while-fetching-file'), "", "error");
        return;
      };

      if (fileResponse.data.length > 0) {
        await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist-files/delete`), {
          method: "DELETE",
          queryParams: {
            ids: fileResponse.data.map(file => file.id).toString()
          },
        })

        await Promise.all(
          fileResponse.data.map(async (data) => {
            const body = JSON.stringify({
              urls: [data.url]
            })
    
            await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/upload/remove`), {
              method: "POST",
              body,
            })
          })
        )
      }

      const deleteSuspectPeople = await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, `/watchlist/delete`), {
        method: "DELETE",
        queryParams: {
          ids: [id].toString()
        },
      })

      if (!deleteSuspectPeople.success) {
        PopupMessage(t('message.error.error-while-deleting-data'), "", "error");
        return;
      };

      PopupMessage(t('message.success.delete-success'), "", "success");
      await fetchSuspectPeople(1, rowsPerPage);
      bc.postMessage("reload");
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-deleting-data'), errorMessage, "error");
    }
  }

  const handleImportMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setImportMenu(event.currentTarget);
  };
  const handleImportMenuClose = () => {
    setImportMenu(null);
  };

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value)
    setRowsPerPage(limit);
    await fetchSuspectPeople(page, limit, searchFilter.join(','));
  };
  
  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
    await fetchSuspectPeople(value, rowsPerPage, searchFilter.join(','));
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      setPage(pageInput);
      await fetchSuspectPeople(pageInput, rowsPerPage, searchFilter.join(','));
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

  const handleSearch = async (searchFilter: FormData) => {
    const filterParts = [];

    if (searchFilter.firstName.trim() !== "") {
      filterParts.push(`firstname~${searchFilter.firstName}`);
    }
    if (searchFilter.lastName.trim() !== "") {
      filterParts.push(`lastname~${searchFilter.lastName}`);
    }
    if (searchFilter.person_type !== 0) {
      filterParts.push(`person_class_id=${searchFilter.person_type}`);
    }
    if (searchFilter.status !== 2) {
      filterParts.push(`active=${searchFilter.status}`);
    }

    filterParts.push(`deleted=0`);

    setSearchFilter(filterParts);

    await fetchSuspectPeople(1, rowsPerPage, filterParts.join(','));
  }

  const handleManageSuspectPeopleClose = async () => {
    setOpenManageSuspectPeople(false);
    await fetchSuspectPeople(1, rowsPerPage);
    setSelectedRow(null);
  }

  const handleFileImportOpen = () => {
    setImportMenu(null);
    setIsFileImportOpen(true)
  }

  const fetchSuspectPeople = async (page: number, limit: number, filter?: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<SuspectPeopleResponse>(combineURL(CENTER_API, "/watchlist/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          page: page.toString(),
          limit: limit.toString(),
          ...(filter ? { filter } : {filter: "deleted=0"})
        }
      })

      if (response.success) {
        setSuspectPeopleList(response.data);
        await Promise.all(
          response.data.map(async (data) => {
            await fetchSuspectPeopleImages(data.id);
            await fetchSuspectPeopleFiles(data.id);
          })
        );
        setTotalPages(response.pagination.maxPage);
        setTotalData(response.pagination.countAll);
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

  const fetchSuspectPeopleImages = async (id: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, "/watchlist-images/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `watchlist_id=${id}`
        }
      })

      if (response.success) {
        setSuspectPeopleList((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, watchlist_images: response.data } : item
          )
        );
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-image'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const fetchSuspectPeopleFiles = async (id: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<WatchListFileResponse>(combineURL(CENTER_API, "/watchlist-files/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `watchlist_id=${id}`
        }
      })

      if (response.success) {
        setSuspectPeopleList((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, watchlist_files: response.data } : item
          )
        );
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-image'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const handleFileImportClose = async () => {
    setIsFileImportOpen(false);
    await fetchSuspectPeople(1, rowsPerPage);
  }

  const handleManageSuspectPeopleOpen = async () => {
    setSelectedRow(null);
    setOpenManageSuspectPeople(true);
  }

  const handleDownloadTemplateClick = () => {
    setImportMenu(null);
    downloadFile(
      "import_suspect_people_template.xlsx", 
      "/template/import_suspect_people_template.xlsx"
    );
  }

  return (
    <div id='suspect-people' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500`}>
      { isLoading && <Loading /> }
      <div className="grid grid-cols-[1fr_270px] gap-x-4">
        <div>
          {/* Header */}
          <Typography variant="h5" color="white" className="font-bold">{t('screen.suspect-people.title')}</Typography>
          {/* Body */}
          <div className='flex flex-col'>
            <div className='flex justify-between items-center'>
              <p className='text-[15px]'>{`${t('table.amount')} ${formatNumber(totalData)} ${t('table.list')}`}</p>
              {/* Button Part */}
              <div className='flex gap-2'>
                <Button
                  variant="contained"
                  className="secondary-btn-without-border"
                  startIcon={<Import />}
                  sx={{ 
                    width: t('button.add-new-plate'), 
                    height: "40px",
                    textTransform: "capitalize"
                  }}
                  onClick={handleImportMenuClick}
                >
                  {t('button.import')}
                </Button>
                <Menu
                  id="import-menu"
                  anchorEl={importMenu}
                  open={open}
                  onClose={handleImportMenuClose}
                  
                >
                  <MenuItem 
                    onClick={handleDownloadTemplateClick}
                    sx={{
                      color: "#2B9BED",
                      fontSize: "14px",
                    }}
                  >
                    {t('button.download-template')}
                  </MenuItem>
                  <MenuItem 
                    onClick={handleFileImportOpen}
                    sx={{
                      color: "#2B9BED",
                      fontSize: "14px",
                    }}
                  >
                    {t('button.import')}
                  </MenuItem>
                </Menu>

                <Button
                  variant="contained"
                  className="primary-btn"
                  startIcon={<Plus />}
                  sx={{ 
                    width: t('button.add-new-suspect-person-width'), 
                    height: "40px",
                    textTransform: "capitalize"
                  }}
                  onClick={handleManageSuspectPeopleOpen}
                >
                  {t('button.add-new-suspect-person')}
                </Button>
              </div>
            </div>

            {/* Table Part */}
            <div>
              <TableContainer 
                component={Paper} 
                className='mt-3'
                sx={{ height: "75vh", backgroundColor: "transparent" }}
              >
                <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
                  <TableHead>
                    <TableRow 
                      sx={{ 
                        backgroundColor: "#242727", 
                        position: "sticky", 
                        top: 0, 
                        zIndex: 1, 
                        '& td, & th': { borderBottom: 'none' } 
                      }}
                    >
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>{t("table.column.prefix")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "26%" }}>{t("table.column.full-name")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t("table.column.image")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "18%" }}>{t("table.column.person-type")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>{t("table.column.added-date")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>{t("table.column.edited-date")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>{t("table.column.document")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>{t("table.column.status")}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      suspectPeopleList.map((data, index) => (
                        <TableRow 
                          key={index} 
                          sx={{
                            '& td, & th': { borderBottom: '1px dashed #ADADAD' }
                          }}
                        >
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", textAlign: "center", height: "83px" }}>
                            {`${ prefixOptions.find((option) => option.value === data.title_id)?.label }`}
                          </TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>
                            {`${data.firstname} ${data.lastname}`}
                          </TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", padding: "6px", height: "83px" }}>
                            {
                              Array.isArray(data.watchlist_images) && data.watchlist_images.length > 0 ? 
                              (
                                <div>
                                  {
                                    data.watchlist_images.map((image, index) => (
                                      <Image
                                        key={index}
                                        imageSrc={`${CENTER_FILE_URL}${image.url}`} 
                                        imageAlt={`image-${index}`}
                                        className="inline-flex items-center justify-center align-middle h-[70px] w-[70px]" 
                                      />
                                    ))
                                  }
                                </div>
                              ) : 
                              (
                                <p className='text-white'>--</p>
                              )
                            }
                          </TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>
                            {
                              sliceDropdown.personTypes?.data.find(plateType => plateType.id === data.person_class_id)?.title_en || ""
                            }
                          </TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>{ dayjs(data.createdAt).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') }</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>{ dayjs(data.updatedAt).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') }</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>
                            <IconButton
                              sx={{
                                borderRadius: "4px !important",
                              }}
                              onClick={() => handleDownload(data)}
                            >
                              <Download color='#FFFFFF' size={25} />
                            </IconButton>
                          </TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>
                            {
                              (() => {
                                const color = data.active === 1 ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                                return (
                                  <label
                                    className={`w-20 h-[30px] inline-flex items-center justify-center rounded
                                    ${color}`}
                                  >
                                    { data.active === 1 ? "Active" : "Inactive" }
                                  </label>
                                )
                              })()
                            }
                          </TableCell>
                          <TableCell align="center"
                            sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}
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

                            <IconButton
                              sx={{
                                borderRadius: "4px !important",
                              }}
                              onClick={ () => handleDelete(data.id)}
                            >
                              <Trash2 color='#FFFFFF' size={20} />
                            </IconButton>
                          </div>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                    {
                      suspectPeopleList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>
                            {t('text.no-data')}
                          </TableCell>
                        </TableRow>
                      )
                    }
                  </TableBody>
                </Table>
              </TableContainer>

              <div className={`${totalData > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}>
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
        
        {/* Modules */}
        <SearchFilter onSearch={handleSearch}/>
        {
          openManageSuspectPeople && (
            <ManageSuspectPerson 
              open={openManageSuspectPeople} 
              onClose={handleManageSuspectPeopleClose} 
              selectedRow={selectedRow} 
            />
          )
        }
        <ImportFile open={isFileImportOpen} onClose={handleFileImportClose} />
      </div>
    </div>
  )
}

export default SuspectPeoplePage;