import { Divider } from "primereact/divider";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { classNames } from "primereact/utils";
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useUser } from "../../hooks/use-users";
import { AppTopbarRef } from "../../types";
import { LayoutContext } from "../context/layoutcontext";

const AppTopbar = forwardRef<AppTopbarRef>((_props, ref) => {
  const nav = useNavigate();

  const { layoutState, onMenuToggle, showProfileSidebar } =
    useContext(LayoutContext);

  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);

  useImperativeHandle(ref, () => ({
    menubutton: menubuttonRef.current,
    topbarmenu: topbarmenuRef.current,
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  const username = useUser().name;

  // const [themeCheck, setThemeCheck] = useState<boolean>(true);
  // const _changeTheme = (theme: string, colorScheme: string) => {
  //   changeTheme?.(layoutConfig.theme, theme, "theme-link", () => {
  //     setLayoutConfig((prevState: LayoutConfig) => ({
  //       ...prevState,
  //       theme,
  //       colorScheme,
  //     }));
  //   });
  // };

  // const onChangeTheme = (e: InputSwitchChangeEvent) => {
  //   setThemeCheck(e.value);
  //   e.value
  //     ? _changeTheme("lara-light-cyan", "light")
  //     : _changeTheme("lara-dark-cyan", "dark");
  // };

  const menuRef = useRef<Menu>(null);
  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: () => nav("/auth/logout"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="layout-topbar">
      <Link to="/" className="layout-topbar-logo">
        <img src={logo} alt="logo" />
        <span>TASK MANAGER</span>
      </Link>

      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars" />
      </button>

      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible,
        })}
      >
        {/* <span
          className={classNames("align-items-center gap-1 px-2 py-2", {
            "inline-flex": !layoutState.profileSidebarVisible,
            hidden: layoutState.profileSidebarVisible,
          })}
        >
          <InputSwitch checked={themeCheck} onChange={onChangeTheme} />
        </span> */}

        <div
          className="p-2 flex gap-3 align-items-center layout-topbar-button"
          style={{
            minWidth: "14rem",
            maxWidth: "16rem",
            backgroundColor: "transparent",
            justifyContent: "flex-start",
          }}
          onClick={(e) => menuRef.current?.toggle(e)}
        >
          <div
            className="text-white border-circle inline-flex align-items-center justify-content-center w-2rem h-2rem"
            style={{ backgroundColor: "#2196F3" }}
          >
            <p>{username.slice(0, 1)}</p>
          </div>
          <p>{username}</p>
        </div>

        <Menu
          model={menuItems}
          popup
          ref={menuRef}
          id="popup_menu_right"
          popupAlignment="right"
        />

        <Divider
          className={classNames("", {
            hidden: !layoutState.profileSidebarVisible,
          })}
        />

        <button
          type="button"
          className={classNames("p-link layout-topbar-button", {
            hidden: !layoutState.profileSidebarVisible,
          })}
          onClick={() => nav("/auth/logout")}
        >
          <i className="pi pi-sign-out"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
