interface MenuIconProps {
  iconUrl: string;
  menuName: string;
  isActive: boolean;
  isSubMenu: boolean;
  title?: string;
}

function MenuIcon(props: MenuIconProps) {
  const { iconUrl, menuName, isActive, isSubMenu, title } = props;

  let bgColor = "";
  if (isActive && isSubMenu) {
    bgColor = "bg-icon-active-sub-menu";
  }
  else if (!isActive && isSubMenu) {
    bgColor = "bg-icon-inactive-sub-menu";
  }
  else if (isActive && !isSubMenu) {
    bgColor = "bg-icon-active";
  }
  else  if (!isActive && !isSubMenu) {
    bgColor = "bg-default-color";
  }

  return (
    <div
      className={`h-[60px] w-full rounded-full flex items-center justify-center border-2 menu-icon-container ${bgColor}`}
      title={title}
    >
      <img src={iconUrl} alt={menuName} className="h-10 w-10" />
    </div>
  );
}

export default MenuIcon;
