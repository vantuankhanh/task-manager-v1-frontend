import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { editUser } from "../../services/userService";
import { IUserModel } from "../../models/UserModel";

interface IDialogCreateUpdateUser {
  itemEdit: IUserModel | null;
  setItemEdit: (value: React.SetStateAction<IUserModel | null>) => void;
  openEdit: boolean;
  setOpenEdit: (value: React.SetStateAction<boolean>) => void;
  getAllUser: () => Promise<void>;
}

// Renames a user. Accounts are created at VTK IAM, so there is no create here.
const DialogCreateUpdateUser = ({
  itemEdit,
  setItemEdit,
  openEdit,
  setOpenEdit,
  getAllUser,
}: IDialogCreateUpdateUser) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const onConfirmModal = useCallback(async () => {
    if (nameRef.current && emailRef.current && itemEdit) {
      const name = nameRef.current.value;
      const email = emailRef.current.value;

      if (!name) {
        toast.error("Please enter a name");
      } else {
        const res = await editUser({ email: email, name: name });

        if (res) {
          onCloseEdit();
          await getAllUser();
        }
      }
    } else {
      toast.error("Something went wrong");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemEdit]);

  const onCloseEdit = () => {
    setOpenEdit(false);
    setItemEdit(null);
  };

  return (
    <Dialog
      visible={openEdit}
      onHide={() => setOpenEdit(false)}
      resizable={false}
      draggable={false}
      header={<h4 className="m-0">Edit User</h4>}
      footer={
        <div className="flex justify-content-end gap-3">
          <Button label="Edit" size="small" onClick={onConfirmModal} />
          <Button
            label="Close"
            size="small"
            severity="secondary"
            onClick={onCloseEdit}
          />
        </div>
      }
      onShow={() => {
        if (nameRef.current && emailRef.current && itemEdit) {
          nameRef.current.value = itemEdit.name;
          emailRef.current.value = itemEdit.email;
        }
      }}
    >
      <div className="flex flex-column gap-2">
        <label htmlFor="EmailUserCreate">Email</label>
        <InputText
          className="mb-2"
          type="text"
          id="EmailUserCreate"
          ref={emailRef}
          disabled
          autoComplete="one-time-code"
          placeholder="Email address"
        />

        <label htmlFor="NameUser">Name</label>
        <InputText id="NameUser" ref={nameRef} autoComplete="off" />
      </div>
    </Dialog>
  );
};

export default DialogCreateUpdateUser;
