import { Button } from "primereact/button";
import { DataViewLayoutOptions } from "primereact/dataview";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useEffect, useMemo, useState } from "react";
import { IUserModel } from "../../models/UserModel";

interface IDataViewHeaderProps {
  userList: IUserModel[];
  setUserListFilter: React.Dispatch<React.SetStateAction<IUserModel[] | null>>;
  layout: (string & Record<string, unknown>) | "list" | "grid";
  setLayout: React.Dispatch<
    React.SetStateAction<"list" | "grid" | (string & Record<string, unknown>)>
  >;
  setSortOrder: React.Dispatch<React.SetStateAction<0 | 1 | -1 | null>>;
  setSortField: React.Dispatch<React.SetStateAction<string>>;
  onCreateClick: React.MouseEventHandler<HTMLButtonElement>;
}

const DataViewHeader = ({
  userList,
  setUserListFilter,
  layout,
  setLayout,
  setSortOrder,
  setSortField,
  onCreateClick,
}: IDataViewHeaderProps) => {
  const sortOptions = useMemo(
    () => [
      { label: "Sort By Role", value: "" },
      { label: "Ascending", value: "email" },
      { label: "Descending", value: "!email" },
    ],
    []
  );

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [sortKey, setSortKey] = useState<string>(sortOptions[0].value);

  const onSortChange = (event: DropdownChangeEvent) => {
    const value = event.value;

    if (value === "") {
      setSortOrder(0);
      setSortField("");
      setSortKey(value);
    } else if (value.indexOf("!") === 0) {
      setSortOrder(-1);
      setSortField(value.substring(1, value.length));
      setSortKey(value);
    } else {
      setSortOrder(1);
      setSortField(value);
      setSortKey(value);
    }
  };

  const onFilter = (value: string) => {
    if (value.length === 0) {
      setUserListFilter(null);
    } else {
      const filtered = userList?.filter((user) => {
        const searchValueLowercase = value.toLowerCase();
        const userNameLowercase = user.name.toLowerCase();
        const userEmailLowercase = user.email.toLowerCase();
        return (
          userNameLowercase.includes(searchValueLowercase) ||
          userEmailLowercase.includes(searchValueLowercase)
        );
      });

      setUserListFilter(filtered);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => onFilter(globalFilterValue), 200);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilterValue]);

  return (
    <div className="flex flex-column md:flex-row md:justify-content-between gap-2">
      <Dropdown
        className="w-full md:w-auto"
        style={{ minWidth: "10rem" }}
        value={sortKey}
        options={sortOptions}
        optionLabel="label"
        onChange={onSortChange}
      />

      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          className="w-full md:w-auto"
          autoComplete="one-time-code"
          value={globalFilterValue}
          onChange={(e) => setGlobalFilterValue(e.target.value)}
          placeholder="Search by Name or Email"
        />
      </span>

      <Button label="Create" icon="pi pi-user-plus" onClick={onCreateClick} />

      <div className="hidden md:block">
        <DataViewLayoutOptions
          layout={layout}
          onChange={(e) => setLayout(e.value)}
        />
      </div>
    </div>
  );
};

export default DataViewHeader;
