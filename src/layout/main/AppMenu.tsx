import { useMemo } from "react";
import { useRole } from "../../hooks/use-role";
import { AppMenuItem } from "../../types";
import { MenuProvider } from "../context/menucontext";
import AppMenuitem from "./AppMenuitem";

const AppMenu = () => {
  const role = useRole();

  const page = useMemo(() => {
    const temp = [
      {
        label: "Project",
        icon: "pi pi-fw pi-file-o",
        to: "/projects",
      },
      {
        label: "Task",
        icon: "pi pi-fw pi-book",
        to: "/tasks",
      },
    ];
    role !== 0 &&
      temp.unshift({
        label: "User",
        icon: "pi pi-fw pi-user",
        to: "/users",
      });
    return temp;
  }, [role]);

  const model: AppMenuItem[] = [
    {
      label: "Home",
      items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
    },
    {
      label: "Pages",
      icon: "pi pi-fw pi-briefcase",
      items: page,
    },
  ];

  return (
    <MenuProvider>
      <div className="flex flex-column h-full">
        <ul className="layout-menu flex-1">
          {model.map((item, i) => {
            return !item?.seperator ? (
              <AppMenuitem item={item} root={true} index={i} key={item.label} />
            ) : (
              <li className="menu-separator"></li>
            );
          })}
        </ul>
        <div>
          <hr />
          <ul className="layout-menu">
            <ul>
              <AppMenuitem
                index={0}
                item={{
                  label: "Logout",
                  icon: "pi pi-fw pi-sign-out",
                  to: "/auth/logout",
                }}
              />
            </ul>
          </ul>
        </div>
      </div>
    </MenuProvider>
  );
};

export default AppMenu;
