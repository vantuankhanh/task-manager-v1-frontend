import { Dialog } from "primereact/dialog";
import { IUserInfo, IUserModel } from "../../models/UserModel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface IDialogUserDataDashboard {
  userInfo: IUserInfo;
  setUserData: (data: IUserInfo) => void;
}

export const DialogUserDataDashboard = ({
  userInfo,
  setUserData,
}: IDialogUserDataDashboard) => {
  const hideDialog = () => {
    setUserData({
      label: "",
      IUserData: [],
    });
  };
  return (
    <>
      <Dialog
        header={
          <div className="flex justify-content-between align-items-center pr-4">
            <div>{userInfo.label}</div>
          </div>
        }
        visible={userInfo.IUserData.length > 0}
        style={{ width: "75vw", fontSize: "1rem" }}
        onHide={hideDialog}
        draggable={false}
        resizable={false}
      >
        <DataTable value={userInfo.IUserData} paginator rows={10} rowHover>
          <Column field="email" header="Email"></Column>
          <Column field="name" header="Name"></Column>
          <Column
            field="role"
            header="Role"
            body={(value: IUserModel) => {
              return <p>{value.role === 0 ? "User" : "Admin"}</p>;
            }}
          ></Column>
        </DataTable>
      </Dialog>
    </>
  );
};
