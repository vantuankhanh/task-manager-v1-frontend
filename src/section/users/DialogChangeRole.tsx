import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../../hooks/use-users";
import { IUserModel } from "../../models/UserModel";
import { changeRoleUser } from "../../services/userService";
import { setLoading } from "../../store/reducer/reducer";
import { useAppDispatch } from "../../store/store";

interface IDialogChangeRole {
  item: IUserModel | null;
  setItem: (value: React.SetStateAction<IUserModel | null>) => void;
  getAllUser: () => Promise<void>;
}

const DialogChangeRole = ({ item, setItem, getAllUser }: IDialogChangeRole) => {
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const email = useUser().email;

  const onChangeRole = async () => {
    if (item && item.role === 0) {
      try {
        dispatch(setLoading(true));

        const res = await changeRoleUser(item);
        setItem(null);

        if (res) {
          await getAllUser();
          if (email === item.email) nav("/auth/logout");
        }

        dispatch(setLoading(false));
      } catch {
        toast.error("Something went wrong");
        dispatch(setLoading(false));
      }
    }
  };

  return (
    <>
      <Dialog
        visible={item !== null && item.role !== 0}
        onHide={() => setItem(null)}
        draggable={false}
        resizable={false}
        header="Warning"
        footer={
          <div className="flex justify-content-end gap-3">
            <Button label="Close" size="small" onClick={() => setItem(null)} />
          </div>
        }
      >
        <p className="m-0">You can't change role of an admin!</p>
      </Dialog>

      <Dialog
        visible={item !== null && item.role === 0}
        onHide={() => setItem(null)}
        draggable={false}
        resizable={false}
        header="Change Role"
        footer={
          <div className="flex justify-content-end gap-3">
            <Button label="Yes" size="small" onClick={onChangeRole} />
            <Button
              label="Close"
              size="small"
              severity="secondary"
              onClick={() => setItem(null)}
            />
          </div>
        }
      >
        <div>
          <p>
            Do you want to change role of {item?.email} to{" "}
            {item?.role === 0 ? "admin" : "normal user"}?
          </p>
        </div>
      </Dialog>
    </>
  );
};

export default DialogChangeRole;
