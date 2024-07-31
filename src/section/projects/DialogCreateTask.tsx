import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { IUserModel } from "../../models/UserModel";
import { createTask } from "../../services/taskService";
import { useAppDispatch } from "../../store/store";
import { setLoading } from "../../store/reducer/reducer";

interface IDialogCreateTask {
  visible: boolean;
  setVisible: (value: React.SetStateAction<boolean>) => void;
  getTask: () => Promise<void>;
  idProject: string | null;
  userList: IUserModel[];
}

const DialogCreateTask = ({
  visible,
  setVisible,
  getTask,
  idProject,
  userList,
}: IDialogCreateTask) => {
  const dispatch = useAppDispatch();

  const noteRef = useRef<HTMLTextAreaElement>(null);

  const [userSelected, setUserSelected] = useState<IUserModel>();
  const [dateFrom, setDateFrom] = useState<Date | null>(new Date(Date.now()));
  const [dateTo, setDateTo] = useState<Date | null>(new Date(Date.now()));

  const handleCreateNewTask = async () => {
    if (noteRef.current) {
      if (!userSelected) {
        toast.error("Please choose a user");
        return;
      }
      if (dateFrom && dateTo && dateFrom > dateTo) {
        toast.error("Please select time start before time end");
        return;
      }

      setVisible(false);
      dispatch(setLoading(true));

      const data = await createTask({
        user_mail: userSelected!.email,
        project_id: idProject!,
        time_start: dateFrom!.toDateString(),
        time_end: dateTo!.toDateString(),
        status: 1,
        note: noteRef.current.value,
      });

      if (data) await getTask();

      dispatch(setLoading(false));
    }
  };

  return (
    <Dialog
      visible={visible}
      draggable={false}
      resizable={false}
      style={{ width: "50vw", minWidth: "20rem" }}
      onHide={() => setVisible(false)}
      header="Add New Task"
      footer={
        <Button label="Create" onClick={handleCreateNewTask} className="mt-4" />
      }
    >
      <div className="flex flex-column gap-3">
        <div className="flex gap-4 w-full flex-column lg:flex-row">
          <div className="w-full lg:w-6 flex flex-column gap-3">
            <div>
              <p className="font-bold mb-2">User Email</p>
              <Dropdown
                className="w-full"
                value={userSelected}
                options={userList}
                optionLabel="email"
                placeholder="Select User"
                onChange={(e) => setUserSelected(e.value)}
                filter
              />
            </div>

            <div className="hidden lg:block">
              <div>
                <p className="font-bold mb-2">Status</p>
                <InputText className="w-full" value="Not Started" disabled />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-column gap-3">
            <div>
              <p className="font-bold mb-2">Time Start</p>
              <Calendar
                value={dateFrom}
                className="w-full"
                dateFormat="dd/mm/yy"
                showIcon
                onChange={(e) => setDateFrom(e.value!)}
              />
            </div>

            <div>
              <p className="font-bold mb-2">Time End</p>
              <Calendar
                value={dateTo}
                className="w-full"
                dateFormat="dd/mm/yy"
                minDate={dateFrom ?? new Date(Date.now())}
                showIcon
                onChange={(e) => setDateTo(e.value!)}
              />
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <p className="font-bold mb-2">Status</p>
          <InputText className="w-full" value="Not Started" disabled />
        </div>

        <div>
          <p className="font-bold mb-2">Note</p>
          <InputTextarea placeholder="Note" className="w-full" ref={noteRef} />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogCreateTask;
