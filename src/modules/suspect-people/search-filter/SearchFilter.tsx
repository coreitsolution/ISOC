import React, { useState, useEffect, useRef } from 'react'
import { 
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

// Components
import TextBox from '../../../components/text-box/TextBox';
import AutoComplete from '../../../components/auto-complete/AutoComplete';

// Icons
import PeopleSearchIcon from "../../../assets/icons/warning-person.png";
import { Search } from 'lucide-react';

// i18n
import { useTranslation } from 'react-i18next';

export interface FormData {
  firstName: string
  lastName: string
  person_type: number
  status: number
};

interface SearchFilterProps {
  onSearch: (formData: FormData) => void
}

const SearchFilter: React.FC<SearchFilterProps> = ({onSearch}) => {
  
  // Ref
  const lastSearchData = useRef<FormData | null>(null);

  // i18n
  const { t, i18n } = useTranslation();

  // Options
  const [personTypesOptions, setPersonTypesOptions] = useState<{ label: string ,value: number }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string ,value: number }[]>([]);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    person_type: 0,
    status: 2,
  });

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

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
    if (sliceDropdown.status && sliceDropdown.status.data) {
      const options = sliceDropdown.status.data.map((row) => ({
        label: row.status,
        value: row.id,
      }));
      setStatusOptions([{label: t('dropdown.all-status'), value: 2}, ...options]);
    }
  }, [sliceDropdown.status, i18n.language, i18n.isInitialized]);

  const handleDropdownChange = (key: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePersonTypesChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("person_type", value.value);
    }
    else {
      handleDropdownChange("person_type", 0);
    }
  };

  const handleStatusChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("status", value.value);
    }
    else {
      handleDropdownChange("status", 2);
    }
  };

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    if (JSON.stringify(formData) !== JSON.stringify(lastSearchData.current)) {
      onSearch(formData);
      lastSearchData.current = formData;
    }
  }

  const handleCancelClick = () => {
    resetData();
  }

  const resetData = () => {
    setFormData({
      firstName: "",
      lastName: "",
      person_type: 0,
      status: 2,
    })
  }

  return (
    <div id='search-filter' className='h-screen w-[270px] pt-5'>
      <div 
        className='h-[91%] bg-[#2B9BED] p-px'
        style={{
          clipPath: 'polygon(0 0, 160px 0, 170px 24px, 100% 24px, 100% 100%, 0% 100%, 0 0)',
        }}
      >
        <div 
          className='flex flex-col h-full bg-black'
          style={{
            clipPath: 'polygon(0 0, 158px 0, 168px 24px, 100% 24px, 100% 100%, 0% 100%, 0 0)',
          }}
        >
          <div className='flex space-x-2 text-white px-2 pt-1'>
            <img src={PeopleSearchIcon} alt="Car Search Icon" className='w-5 h-5' />
            <label>{t('search-filter.search-condition')}</label>
          </div>

          <div className='flex flex-col py-4 px-2 space-y-2 overflow-y-auto'>
            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="first-name"
              label={t('component.first-name')}
              placeholder={t('placeholder.first-name')}
              value={formData.firstName}
              onChange={(event) =>
                handleTextChange("firstName", event.target.value)
              }
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="last-name"
              label={t('component.last-name')}
              placeholder={t('placeholder.last-name')}
              value={formData.lastName}
              onChange={(event) =>
                handleTextChange("lastName", event.target.value)
              }
            />

            <AutoComplete 
              id="person-type-select"
              sx={{ marginTop: "10px"}}
              value={formData.person_type}
              onChange={handlePersonTypesChange}
              options={personTypesOptions}
              label={t('component.person-type')}
              placeholder={t('placeholder.person-type')}
              labelFontSize="15px"
            />

            <AutoComplete 
              id="plate-type-select"
              sx={{ marginTop: "10px"}}
              value={formData.status}
              onChange={handleStatusChange}
              options={statusOptions}
              label={t('component.status-data')}
              placeholder={t('placeholder.status-data')}
              labelFontSize="15px"
            />

            <div className='flex items-center justify-center gap-2 mt-5'>
              <Button
                variant="contained"
                className="primary-btn"
                startIcon={<Search />}
                sx={{ 
                  width: t('button.search-width'), 
                  height: "40px",
                  textTransform: "capitalize",
                }}
                onClick={handleSearch}
              >
                {t('button.search')}
              </Button>

              <Button
                variant="outlined"
                className="secondary-btn-without-border"
                sx={{ 
                  width: t('button.clear-width'), 
                  height: "40px",
                  textTransform: "capitalize",
                }}
                onClick={handleCancelClick}
              >
                {t('button.clear-data')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default SearchFilter;