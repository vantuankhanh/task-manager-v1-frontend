import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Nullable } from "primereact/ts-helpers";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRole } from "../../hooks/use-role";
import { IProjectModel } from "../../models/ProjectModel";
import { ITaskModel } from "../../models/TaskModel";
import { IUserModel } from "../../models/UserModel";
import { updateTask } from "../../services/taskService";
import { setLoading } from "../../store/reducer/reducer";
import { useAppDispatch } from "../../store/store";

interface IDialogUpdateTaskProps {
  taskUpdate: ITaskModel | null;
  setTaskUpdate: React.Dispatch<React.SetStateAction<ITaskModel | null>>;
  getTaskData: () => Promise<void>;
  userList: IUserModel[];
  projectList: IProjectModel[];
}

const DialogUpdateTask = ({
  taskUpdate,
  setTaskUpdate,
  getTaskData,
  userList,
  projectList,
}: IDialogUpdateTaskProps) => {
  const dispatch = useAppDispatch();

  const role = useRole();

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [selectedProject, setSelectedProject] = useState<IProjectModel | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<IUserModel | null>(null);
  const [timeStart, setTimeStart] = useState<Nullable<Date>>(null);
  const [timeEnd, setTimeEnd] = useState<Nullable<Date>>(null);
  const [status, setStatus] = useState<number | undefined>(0);

  const handleUpdate = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
    if (!status) {
      toast.error("Please select a status");
      return;
    }
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    if (timeStart && timeEnd && timeStart > timeEnd) {
      toast.error("Please select time start before time end");
      return;
    }

    if (taskUpdate && noteRef.current) {
      const updatedTask: ITaskModel = {
        user_mail: selectedUser.email,
        project_id: selectedProject.id!,
        time_start: timeStart!.toDateString(),
        time_end: timeEnd!.toDateString(),
        status: status,
        note: noteRef.current.value,
        id: taskUpdate.id,
      };

      dispatch(setLoading(true));

      const data = await updateTask(updatedTask);

      dispatch(setLoading(false));

      if (data) {
        setTaskUpdate(null);
        await getTaskData();
      }
    } else {
      toast.error("Somthing went wrong");
    }
  };

  const setValue = async () => {
    if (noteRef.current) {
      if (taskUpdate) {
        setSelectedUser(
          userList.find((u: IUserModel) => u.email === taskUpdate.user_mail) ??
            null
        );
        setSelectedProject(
          projectList.find(
            (p: IProjectModel) => p.id === taskUpdate.project_id
          ) ?? null
        );
        setTimeStart(new Date(taskUpdate.time_start));
        setTimeEnd(new Date(taskUpdate.time_end));
        setStatus(taskUpdate.status);
        noteRef.current.value = taskUpdate.note;
      } else {
        setTimeStart(new Date(Date.now()));
        setTimeEnd(new Date(Date.now()));
      }
    }
  };

  return (
    <Dialog
      visible={taskUpdate !== null}
      style={{ width: "52vw", fontSize: "1rem", minWidth: "20rem" }}
      draggable={false}
      resizable={false}
      onHide={() => setTaskUpdate(null)}
      onShow={setValue}
      header="Update Task"
      footer={
        <Button label="Update" onClick={handleUpdate} className="border-none" />
      }
    >
      <div className="flex flex-column gap-3">
        <div className="flex gap-4 w-full flex-column lg:flex-row">
          <div className="w-full lg:w-6 flex flex-column gap-3">
            <div>
              <p className="font-bold mb-2">User Email</p>
              <Dropdown
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.value)}
                options={userList}
                optionLabel="email"
                placeholder="Select a User"
                className="w-full"
                disabled={role === 0}
              />
            </div>

            <div>
              <p className="font-bold mb-2">Project</p>
              <Dropdown
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.value)}
                options={projectList}
                optionLabel="name"
                placeholder="Select a Project"
                className="w-full"
                disabled={role === 0}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-column gap-3">
            <div>
              <p className="font-bold mb-2">Time Start</p>
              <Calendar
                value={timeStart}
                onChange={(e) => setTimeStart(e.value)}
                dateFormat="dd/mm/yy"
                className="w-full"
                disabled={role === 0}
              />
            </div>

            <div>
              <p className="font-bold mb-2">Time End</p>
              <Calendar
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.value)}
                dateFormat="dd/mm/yy"
                minDate={timeStart ?? new Date(Date.now())}
                className="w-full"
                disabled={role === 0}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <div className="w-6">
            <div>
              <p className="font-bold mb-2">Status</p>
              <Dropdown
                value={status}
                onChange={(e) => setStatus(e.value)}
                options={[
                  { label: "Not Started", value: 1 },
                  { label: "In Progress", value: 2 },
                  { label: "Done", value: 3 },
                ]}
                placeholder="Select a Status"
                disabled={role !== 0}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="font-bold mb-2">Note</p>
          <InputTextarea
            placeholder="Note"
            className="w-full"
            ref={noteRef}
            disabled={role === 0}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogUpdateTask;
