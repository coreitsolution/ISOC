import React from "react";

interface HexagonProps {
  title: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onContextMenu?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

export const Hexagon: React.FC<HexagonProps> = ({
  title,
  onClick,
  onContextMenu,
  children,
}) => {
  return (
    <button
      title={title}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="
        w-24 h-24
        bg-[#E4E4E4]
        clip-hexagon
        flex items-center justify-center
        text-sm font-semibold
        hover:bg-[#2B9BED]
        hover:scale-105
        transition-all duration-300
        active:scale-95
        cursor-pointer
        overflow-hidden
      "
    >
      {children}
    </button>
  );
};