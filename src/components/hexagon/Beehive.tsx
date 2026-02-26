import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";

// Components
import { Hexagon } from "./Hexagon";
import AutoComplete from "../auto-complete/AutoComplete";
import { Icon } from "../icons/Icon";

// i18n
import { useTranslation } from "react-i18next";

// Icons
import { X } from "lucide-react";

interface BeehiveItem {
  key: string;
  title: string;
  placeholder?: string;
  iconButton: React.ElementType;
  width?: number;
  height?: number;
  options?: { label: string; value: string, iconButton?: React.ElementType}[];
  typeText?: string;
  typePlaceholder?: string;
  types?: { label: string; value: string }[];
  colorOptions?: { label: string; value: string }[];
}

interface BeehiveProps {
  items: BeehiveItem[];
  values?: Record<string, any>;
  onChange?: (key: string, value: any, type?: any, color?: any) => void;
}

interface HexItemProps {
  item: BeehiveItem;
  isActive: boolean;
  selectedValue: any;
  selectedType: any;
  selectedColor: any;
  valueOption?: any;
  typeOption?: any;
  onHexClick: (
    e: React.MouseEvent<HTMLButtonElement>,
    item: BeehiveItem
  ) => void;
  onSelectChange: (
    e: React.SyntheticEvent,
    key: string,
    value: any
  ) => void;
  onTypeChange: (
    e: React.SyntheticEvent,
    key: string,
    value: any
  ) => void;
  onColorChange: (
    e: React.SyntheticEvent,
    key: string,
    value: any
  ) => void;
  onHexRightClick: (e: React.MouseEvent<HTMLButtonElement>, item: BeehiveItem) => void;
  getMinMaxAgeValues: () => any;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  detailRef: React.RefObject<HTMLDivElement | null>;
  isDetailOpen: boolean;
  dropdownPos: { top: number; left: number } | null;
  t: any;
}

const HexItem = memo(
  ({
    item,
    isActive,
    valueOption,
    selectedValue,
    selectedType,
    selectedColor,
    typeOption,
    onHexClick,
    onSelectChange,
    onTypeChange,
    onColorChange,
    onHexRightClick,
    getMinMaxAgeValues,
    dropdownRef,
    detailRef,
    isDetailOpen,
    dropdownPos,
    t,
  }: HexItemProps) => {
    const isUnknown = selectedValue === "unknown" || selectedValue?.includes("no");
    const SelectedIcon = typeOption?.iconButton || valueOption?.iconButton || item.iconButton;

    const isValueActive = (selectedType && selectedType !== "all") || (selectedValue && selectedValue !== "all");

    let showValue = item.title;

    if (typeOption && typeOption.value !== "all") {
      showValue = typeOption.label;
    } 
    else if (valueOption && valueOption.value !== "all") {
      showValue = valueOption.label;
    } 

    return (
      <div className="relative mx-[26px]">
        <Hexagon
          title={showValue}
          onClick={(e) => onHexClick(e, item)}
          onContextMenu={(e) => onHexRightClick(e, item)}
        >
          <div
            className={`flex flex-col items-center transition-all text-[#B6B6B6]`}
          >
            {
              (item.key === "age" && selectedValue !== "all") ? (
                <div className="flex flex-col items-center">
                  {
                    (() => {
                      const { min, max } = getMinMaxAgeValues() || {};

                      if (max) {
                        return (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-0.5">
                              <span className={`${isValueActive ? "text-black" : "text-[#B6B6B6]"} text-lg`}>{min}</span>
                              <span className={`${isValueActive ? "text-black" : "text-[#B6B6B6]"} text-xs`}>{t('text.to')}</span>
                              <span className={`${isValueActive ? "text-black" : "text-[#B6B6B6]"} text-lg`}>{max}</span>
                            </div>
                            <span className={`${isValueActive ? "text-black" : "text-[#B6B6B6]"} text-xs`}>{t('text.years')}</span>
                          </div>
                        );
                      }
                      else {
                        return (
                          <>
                            <span className={`${isValueActive ? "text-black" : "text-[#B6B6B6]"} text-lg`}>{`${min}+`}</span>
                            <span className={`${isValueActive ? "text-black" : "text-[#B6B6B6]"} text-xs`}>{t('text.years')}</span>
                          </>
                        )
                      }
                    })()
                  }
                </div>
              ) : (
                <>
                  <SelectedIcon
                    style={{
                      color: selectedValue
                        ? (selectedColor?.value && (selectedColor?.value === "all" || selectedColor?.value === "unknown" || selectedValue.includes("no"))) ? "#000000" : selectedColor?.value || "#000000"
                        : "#B6B6B6",
                      width: `${item.width || 40}px`,
                      height: `${item.height || 40}px`,
                    }}
                  />
                  <span className={`${isValueActive ? "text-black" : "text-[#B6B6B6]"} text-xs max-w-[60px] truncate text-center mt-1`}>{showValue}</span>
                </>
              )
            }
          </div>
        </Hexagon>

        {isActive && (
          <div
            ref={dropdownRef}
            className="fixed bg-black rounded-xl shadow-lg p-4 w-52 z-50"
            style={{
              top: dropdownPos?.top,
              left: dropdownPos?.left,
              transform: "translateX(-50%)",
            }}
          >
            {/* Main Selection */}
            {item.options && (
              <AutoComplete
                id={`${item.key}-select`}
                value={selectedValue}
                onChange={(e, val: any) =>
                  onSelectChange(e, item.key, val)
                }
                options={item.options}
                label={item.title}
                placeholder={item.placeholder}
              />
            )}

            {/* Type Selection */}
            {item.types && !isUnknown && selectedValue && (
              <AutoComplete
                id={`${item.key}-type`}
                value={selectedType}
                onChange={(e, val: any) =>
                  onTypeChange(e, item.key, val)
                }
                options={item.types}
                label={item.typeText || ""}
                placeholder={item.typePlaceholder || ""}
              />
            )}

            {/* Color Selection */}
            {item.colorOptions && (
              <div className="mt-2">
                <label className="text-[15px] text-white">
                  {`${t("text.color")}${
                    selectedColor ? ` : ${selectedColor?.label}` : ""
                  }`}
                </label>

                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {item.colorOptions.map((colorOpt) => {
                    const isSelected =
                      selectedColor?.value === colorOpt.value;

                    const baseClass = isSelected
                      ? "w-6 h-6 border-2 border-[#2B9BED] cursor-pointer"
                      : "w-4 h-4 border border-white cursor-pointer";

                    if (colorOpt.value === "all") {
                      return (
                        <button
                          key={colorOpt.value}
                          title={colorOpt.label}
                          onClick={(e) =>
                            onColorChange(e, item.key, colorOpt)
                          }
                          className={baseClass}
                          style={{
                            background: "conic-gradient(from 45deg, red, orange, yellow, green, cyan, blue, violet)"
                          }}
                        />
                      );
                    }

                    if (colorOpt.value === "unknown") {
                      return (
                        <button
                          key={colorOpt.value}
                          title={colorOpt.label}
                          onClick={(e) =>
                            onColorChange(e, item.key, colorOpt)
                          }
                          className={`
                            ${baseClass}
                            flex items-center justify-center
                          `}
                        >
                          <Icon
                            icon={X}
                            color="#FF0000"
                          />
                        </button>
                      );
                    }

                    return (
                      <button
                        key={colorOpt.value}
                        title={colorOpt.label}
                        onClick={(e) =>
                          onColorChange(
                            e,
                            item.key,
                            colorOpt
                          )
                        }
                        className={baseClass}
                        style={{
                          backgroundColor:
                            colorOpt.value,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Click */}
        {isDetailOpen && (
          <div
            ref={detailRef}
            className="fixed bg-black rounded-xl shadow-lg p-4 w-52 z-50"
            style={{
              top: dropdownPos?.top,
              left: dropdownPos?.left,
              transform: "translateX(-50%)",
            }}
          >
            <h4 className="font-bold mb-2 text-sm">
              {`${t("text.detail")} : ${item.title}`}
            </h4>

            <div className="text-xs space-y-1">
              <div>
                <strong>{t(`component.${item.key}`)}</strong>{" : "}
                {valueOption?.label || "All"}
              </div>

              {typeOption && (
                <div>
                  <strong>{t(`component.${item.key}-type`)}</strong>{" : "}
                  {typeOption?.label || "All"}
                </div>
              )}

              {selectedColor && (
                <div className="flex items-center gap-2">
                  <strong>{`${t(`component.${item.key}-color`)} : `}</strong>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      background:
                        selectedColor.value === "all"
                          ? "conic-gradient(red,orange,yellow,green,blue,violet)"
                          : selectedColor.value,
                    }}
                  />
                  {selectedColor.label}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

HexItem.displayName = "HexItem";

const Beehive: React.FC<BeehiveProps> = ({
  items,
  values,
  onChange,
}) => {
  // Data
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<string, any>>({});
  const [selectedTypes, setSelectedTypes] = useState<Record<string, any>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, any>>({});
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // Ref
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  // i18n
  const { t } = useTranslation();

  const half = Math.ceil(items.length / 2);

  useEffect(() => {
    if (!values) return;

    const newValues: Record<string, any> = {};
    const newTypes: Record<string, any> = {};
    const newColors: Record<string, any> = {};

    items.forEach((item) => {
      if (values[item.key]) {
        const foundOption = item.options?.find(
          (opt) => opt.value === values[item.key]
        );

        if (foundOption) {
          newValues[item.key] = foundOption;
        }
      }

      if (values[`${item.key}_type`]) {
        const foundType = item.types?.find(
          (opt) => opt.value === values[`${item.key}_type`]
        );

        if (foundType) {
          newTypes[item.key] = foundType;
        }
      }

      if (values[`${item.key}_color`]) {
        const foundOption = item.colorOptions?.find(
          (opt) => opt.value === values[`${item.key}_color`]
        );

        if (foundOption) {
          newColors[item.key] = foundOption;
        }
      }
    });

    setSelectedValues(newValues);
    setSelectedTypes(newTypes);
    setSelectedColors(newColors);
  }, [values, items]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideDropdown =
        dropdownRef.current?.contains(target);

      const clickedInsideAutocomplete =
        (event.target as HTMLElement)?.closest(
          ".MuiAutocomplete-popper"
        );
      
      const insideDetail =
      detailRef.current?.contains(target);

      if (!clickedInsideDropdown && !clickedInsideAutocomplete && !insideDetail) {
        setActiveKey(null);
        setDetailKey(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHexClick = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      item: BeehiveItem
    ) => {
      e.stopPropagation();
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();

      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });

      setActiveKey((prev) =>
        prev === item.key ? null : item.key
      );
    },
    []
  );

  const handleSelectChange = useCallback(
    (
      event: React.SyntheticEvent,
      item: BeehiveItem,
      key: string,
      value: any
    ) => {
      event.preventDefault();

      const newValue = value ? value : item.options?.find((opt) => opt.value === "all") || null;

      setSelectedValues((prev) => ({
        ...prev,
        [key]: newValue,
      }));

      const newType = item.types?.find((opt) => opt.value === "all") || null;

      setSelectedTypes((prev) => ({
        ...prev,
        [key]: newType,
      }));

      onChange?.(key, newValue, newType, selectedColors[key]);
    },
    [onChange, selectedTypes, selectedColors]
  );

  const handleTypeChange = useCallback(
    (
      event: React.SyntheticEvent,
      item: BeehiveItem,
      key: string,
      value: any
    ) => {
      event.preventDefault();

      const newValue = value ? value : item.types?.find((opt) => opt.value === "all") || null

      setSelectedTypes((prev) => ({
        ...prev,
        [key]: newValue,
      }));

      onChange?.(
        key,
        selectedValues[key],
        newValue,
        selectedColors[key]
      );
    },
    [onChange, selectedValues, selectedTypes, selectedColors]
  );

  const handleColorChange = useCallback(
    (
      event: React.SyntheticEvent,
      item: BeehiveItem,
      key: string,
      value: any
    ) => {
      event.preventDefault();

      const newValue = value ? value : item.colorOptions?.find((opt) => opt.value === "all") || null
      
      setSelectedColors((prev) => ({
        ...prev,
        [key]: newValue,
      }));

      onChange?.(
        key,
        selectedValues[key],
        selectedTypes[key],
        newValue
      );
    },
    [onChange, selectedValues]
  );

  const handleHexRightClick = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      item: BeehiveItem
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();

      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });

      setActiveKey(null);
      setDetailKey((prev) =>
        prev === item.key ? null : item.key
      );
    },
    []
  );

  const getMinMaxAgeValues = () => {
    const ageValue = selectedValues["age"]?.value;

    if (ageValue) {
      const [minPart, maxPart] = ageValue.split(":");

      const min = minPart ? Number(minPart.split("_")[1]) : null;
      const max = maxPart ? Number(maxPart.split("_")[1]) : null;
      return { min, max };
    }
  };

  return (
    <div className="flex flex-col items-center py-2">
      <div className="flex">
        {items.slice(0, half).map((item) => (
          <HexItem
            key={item.key}
            item={item}
            isActive={activeKey === item.key}
            isDetailOpen={detailKey === item.key}
            detailRef={detailRef}
            valueOption={
              selectedValues[item.key]
            }
            selectedValue={
              selectedValues[item.key]?.value
            }
            selectedType={
              selectedTypes[item.key]?.value
            }
            typeOption={
              selectedTypes[item.key]
            }
            selectedColor={
              selectedColors[item.key]
            }
            onHexClick={handleHexClick}
            onSelectChange={(e, key, value) => handleSelectChange(e, item, key, value)}
            onTypeChange={(e, key, value) => handleTypeChange(e, item, key, value)}
            onColorChange={(e, key, value) => handleColorChange(e, item, key, value)}
            onHexRightClick={handleHexRightClick}
            getMinMaxAgeValues={getMinMaxAgeValues}
            dropdownRef={dropdownRef}
            dropdownPos={dropdownPos}
            t={t}
          />
        ))}
      </div>

      <div className="flex -mt-[52px] ml-[148px]">
        {items.slice(half).map((item) => (
          <HexItem
            key={item.key}
            item={item}
            isActive={activeKey === item.key}
            isDetailOpen={detailKey === item.key}
            detailRef={detailRef}
            valueOption={
              selectedValues[item.key]
            }
            selectedValue={
              selectedValues[item.key]?.value
            }
            typeOption={
              selectedTypes[item.key]
            }
            selectedType={
              selectedTypes[item.key]?.value
            }
            selectedColor={
              selectedColors[item.key]
            }
            onHexClick={handleHexClick}
            onSelectChange={(e, key, value) => handleSelectChange(e, item, key, value)}
            onTypeChange={(e, key, value) => handleTypeChange(e, item, key, value)}
            onColorChange={(e, key, value) => handleColorChange(e, item, key, value)}
            onHexRightClick={handleHexRightClick}
            getMinMaxAgeValues={getMinMaxAgeValues}
            dropdownRef={dropdownRef}
            dropdownPos={dropdownPos}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(Beehive);