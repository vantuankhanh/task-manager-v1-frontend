import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { deleteUser } from "../../services/userService";
import { useAppDispatch } from "../../store/store";
import { setLoading } from "../../store/reducer/reducer";

interface IDialogDeleteUser {
  idDelete: string | null;
  setIdDelete: (value: React.SetStateAction<string | null>) => void;
  getAllUser: () => Promise<void>;
}

const DialogDeleteUser = ({
  idDelete,
  setIdDelete,
  getAllUser,
}: IDialogDeleteUser) => {
  const dispatch = useAppDispatch();

  const onDeleteItem = async () => {
    dispatch(setLoading(true));
    setIdDelete(null);
    if (idDelete) await deleteUser(idDelete);
    await getAllUser();
    dispatch(setLoading(false));
  };

  return (
    <Dialog
      visible={idDelete !== null}
      draggable={false}
      resizable={false}
      onHide={() => setIdDelete(null)}
      header="Delete"
      footer={
        <div className="flex justify-content-end gap-3">
          <Button label="Yes" size="small" onClick={onDeleteItem} />
          <Button
            label="Close"
            size="small"
            severity="secondary"
            onClick={() => setIdDelete(null)}
          />
        </div>
      }
    >
      <div>
        <p>Do you want to delete this user?</p>
      </div>
    </Dialog>
  );
};

export default DialogDeleteUser;
