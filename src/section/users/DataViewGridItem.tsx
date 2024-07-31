import { MouseEventHandler } from "react";
import { IUserModel } from "../../models/UserModel";
import ActionButton from "./ActionButton";
import "../../style/ribbon.scss";

interface IDataViewGridItemProps {
  data: IUserModel;
  onEditClick: MouseEventHandler<HTMLButtonElement>;
  onDeleteClick: MouseEventHandler<HTMLButtonElement>;
  onChangeRole: MouseEventHandler<HTMLButtonElement>;
}

const DataViewGridItem = ({
  data,
  onEditClick,
  onDeleteClick,
  onChangeRole,
}: IDataViewGridItemProps) => {
  return (
    <div className="col-12 lg:col-4 relative">
      {data.role !== 0 && (
        <div className="ribbon ribbon-top-right">
          <span>Admin</span>
        </div>
      )}

      <div className="card m-3 border-1 surface-border">
        <div className="flex flex-column align-items-center text-center mb-3">
          <div className="w-10rem h-10rem p-3 shadow-2 my-3 mx-0 flex align-items-center justify-content-center">
            <span className="pi pi-user text-black-alpha-90 text-8xl"></span>
          </div>

          <div className="text-2xl font-bold">{data.name}</div>

          <div className="mb-4">{data.email}</div>

          <div className="flex gap-3">
            <ActionButton
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              role={data.role!}
              onChangeRole={onChangeRole}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataViewGridItem;
