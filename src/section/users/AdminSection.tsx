import { DataView } from "primereact/dataview";
import { Message } from "primereact/message";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../store/store";
import { useAuthentication } from "../../hooks/use-authentication";
import { IUserModel } from "../../models/UserModel";
import { setLoading } from "../../store/reducer/reducer";
import { getAPI } from "../../services/apiFunction";
import DataViewListItem from "./DataViewListItem";
import DataViewGridItem from "./DataViewGridItem";
import DialogCreateUpdateUser from "./DialogCreateUpdateUser";
import DialogDeleteUser from "./DialogDeleteUser";
import DialogChangeRole from "./DialogChangeRole";
import DataViewHeader from "./DataViewHeader";

const AdminSection = () => {
  const dispatch = useAppDispatch();
  // false in iam mode: accounts and roles are managed in the VTK IAM console
  const { supportsLocalAccountManagement } = useAuthentication();

  const [userList, setUserList] = useState<IUserModel[]>([]);
  const [userListFilter, setUserListFilter] = useState<IUserModel[] | null>(
    null
  );
  const [layout, setLayout] = useState<
    "grid" | "list" | (string & Record<string, unknown>)
  >("grid");
  const [sortOrder, setSortOrder] = useState<0 | 1 | -1 | null>(null);
  const [sortField, setSortField] = useState("");

  const getAllUser = async () => {
    dispatch(setLoading(true));
    const data = await getAPI(import.meta.env.VITE_API_USER);

    if (data) {
      const dataSort = (data as IUserModel[]).sort((a, b) => b.role! - a.role!);

      setUserList(dataSort);
    }

    dispatch(setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    getAllUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEditClick = (item: IUserModel | null) => () => {
    setOpenEdit(true);
    setItemEdit(item);
  };

  const itemTemplate = (
    data: IUserModel,
    layout: "grid" | "list" | (string & Record<string, unknown>)
  ) => {
    if (!data) {
      return;
    }

    if (layout === "list") {
      return (
        <DataViewListItem
          data={data}
          onEditClick={onEditClick(data)}
          onDeleteClick={() => setIdDelete(data.id!)}
          onChangeRole={() => setUserChangeRole(data)}
          canChangeRole={supportsLocalAccountManagement}
          canDeleteUser={supportsLocalAccountManagement}
        />
      );
    } else if (layout === "grid") {
      return (
        <DataViewGridItem
          data={data}
          onEditClick={onEditClick(data)}
          onDeleteClick={() => setIdDelete(data.id!)}
          onChangeRole={() => setUserChangeRole(data)}
          canChangeRole={supportsLocalAccountManagement}
          canDeleteUser={supportsLocalAccountManagement}
        />
      );
    }
  };

  const [openEdit, setOpenEdit] = useState(false);
  const [itemEdit, setItemEdit] = useState<IUserModel | null>(null);

  const [idDelete, setIdDelete] = useState<string | null>(null);

  const [userChangeRole, setUserChangeRole] = useState<IUserModel | null>(null);

  return (
    <div className="card">
      <DialogCreateUpdateUser
        itemEdit={itemEdit}
        setItemEdit={setItemEdit}
        openEdit={openEdit}
        setOpenEdit={setOpenEdit}
        getAllUser={getAllUser}
      />

      {supportsLocalAccountManagement ? (
        <>
          <DialogDeleteUser
            idDelete={idDelete}
            setIdDelete={setIdDelete}
            getAllUser={getAllUser}
          />

          <DialogChangeRole
            item={userChangeRole}
            setItem={setUserChangeRole}
            getAllUser={getAllUser}
          />
        </>
      ) : (
        <Message
          severity="info"
          className="w-full justify-content-start mb-3"
          text="New accounts and roles are managed in the VTK IAM console. Removing a person's access is done there too."
        />
      )}

      <DataView
        value={userListFilter || userList}
        layout={layout}
        paginator
        rows={10}
        sortOrder={sortOrder}
        sortField={sortField}
        itemTemplate={itemTemplate}
        emptyMessage="No users found"
        header={
          <DataViewHeader
            userList={userList}
            layout={layout}
            setLayout={setLayout}
            setSortField={setSortField}
            setSortOrder={setSortOrder}
            setUserListFilter={setUserListFilter}
            onCreateClick={onEditClick(null)}
            canCreateUser={supportsLocalAccountManagement}
          />
        }
      ></DataView>
    </div>
  );
};

export default AdminSection;
