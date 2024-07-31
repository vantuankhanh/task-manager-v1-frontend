import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createUser, editUser } from "../../services/userService";
import { IUserModel } from "../../models/UserModel";

interface IDialogCreateUpdateUser {
  itemEdit: IUserModel | null;
  setItemEdit: (value: React.SetStateAction<IUserModel | null>) => void;
  openEdit: boolean;
  setOpenEdit: (value: React.SetStateAction<boolean>) => void;
  getAllUser: () => Promise<void>;
}

const DialogCreateUpdateUser = ({
  itemEdit,
  setItemEdit,
  openEdit,
  setOpenEdit,
  getAllUser,
}: IDialogCreateUpdateUser) => {
  const [checkedAdmin, setCheckedAdmin] = useState(false);
  const [passwordCreate, setPasswordCreate] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const onConfirmModal = useCallback(async () => {
    if (nameRef.current && emailRef.current) {
      const name = nameRef.current.value;
      const email = emailRef.current.value;

      if (!name) {
        toast.error("Please enter a name");
      } else {
        if (itemEdit) {
          const res = await editUser({ email: email, name: name });

          if (res) {
            onCloseEdit();
            await getAllUser();
          }
        } else {
          if (!email) {
            toast.error("Please enter an email");
          } else if (!passwordCreate) {
            toast.error("Please enter a password");
          } else {
            const res = await createUser({
              email: email,
              name: name,
              role: checkedAdmin ? 1 : 0,
              password: passwordCreate,
            });

            if (res) {
              setPasswordCreate("");
              setCheckedAdmin(false);

              onCloseEdit();
              await getAllUser();
            }
          }
        }
      }
    } else {
      toast.error("Something went wrong");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedAdmin, itemEdit, passwordCreate]);

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
      header={
        itemEdit ? (
          <h4 className="m-0">Edit User</h4>
        ) : (
          <h4 className="m-0">Create User</h4>
        )
      }
      footer={
        <div className="flex justify-content-end gap-3">
          <Button
            label={itemEdit ? "Edit" : "Create"}
            size="small"
            onClick={onConfirmModal}
          />
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
          disabled={itemEdit !== null}
          autoComplete="one-time-code"
          placeholder="Email address"
        />

        {!itemEdit && (
          <>
            <label htmlFor="PasswordUser">Password</label>
            <Password
              className="mb-2"
              id="PasswordUser"
              placeholder="Password"
              toggleMask
              autoComplete="off"
              value={passwordCreate}
              onChange={(e) => setPasswordCreate(e.target.value)}
            />
          </>
        )}

        <label htmlFor="NameUser">Name</label>
        <InputText id="NameUser" ref={nameRef} autoComplete="off" />

        {!itemEdit && (
          <div className="flex gap-3 mt-2 align-items-center">
            <label htmlFor="admin_check">Admin</label>
            <Checkbox
              inputId="admin_check"
              checked={checkedAdmin}
              onChange={(e) => setCheckedAdmin(e.checked ?? false)}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DialogCreateUpdateUser;
