import { MouseEventHandler } from "react";
import { IUserModel } from "../../models/UserModel";
import ActionButton from "./ActionButton";

interface IDataViewListItemProps {
  data: IUserModel;
  onEditClick: MouseEventHandler<HTMLButtonElement>;
  onDeleteClick: MouseEventHandler<HTMLButtonElement>;
  onChangeRole: MouseEventHandler<HTMLButtonElement>;
}

const DataViewListItem = ({
  data,
  onEditClick,
  onDeleteClick,
  onChangeRole,
}: IDataViewListItemProps) => {
  return (
    <div className="col-12 hover:bg-gray-100">
      <div className="flex flex-column md:flex-row align-items-center p-3 w-full">
        <div className="my-4 md:my-0 md:w-5rem md:h-5rem w-10rem h-10rem shadow-2 mx-5 flex justify-content-center align-items-center">
          <span className="pi pi-user text-5xl"></span>
        </div>

        <div className="flex-1 flex px-4">
          <div className="font-bold text-2xl">{data.name}</div>
        </div>

        <div className="flex-1 flex px-4">
          <div className="mb-2">{data.email}</div>
        </div>

        <div className="flex-1 flex px-4 justify-content-center">
          <div className="mb-2">{data.role === 0 ? "User" : "Admin"}</div>
        </div>

        <div className="flex flex-row gap-3 w-full md:w-auto justify-content-center align-items-center mt-3 md:mt-0">
          <ActionButton
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            role={data.role!}
            onChangeRole={onChangeRole}
          />
        </div>
      </div>
    </div>
  );
};

export default DataViewListItem;
