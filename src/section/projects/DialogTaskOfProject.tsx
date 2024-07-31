import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { ITaskModel } from "../../models/TaskModel";
import { memo, useCallback, useEffect, useState } from "react";
import { getTaskByProjectId } from "../../services/taskService";
import { Button } from "primereact/button";
import DialogCreateTask from "./DialogCreateTask";
import { IUserModel } from "../../models/UserModel";
import { getUser } from "../../services/userService";

interface IDialogTaskOfProject {
  setIdProject: (value: React.SetStateAction<string | null>) => void;
  idProject: string | null;
}

const DialogTaskOfProject = memo(
  ({ idProject, setIdProject }: IDialogTaskOfProject) => {
    const [loading, setLoading] = useState(false);
    const [taskList, setTaskList] = useState<ITaskModel[]>([]);

    const getTaskByProject = useCallback(async () => {
      if (idProject) {
        setLoading(true);

        const data = await getTaskByProjectId(idProject);

        if (data) {
          setTaskList(data);
        }

        setLoading(false);
      }
    }, [idProject]);

    useEffect(() => {
      getTaskByProject();
    }, [getTaskByProject]);

    const hideDialog = () => {
      setTaskList([]);
      setIdProject(null);
    };

    const [visibleCreateTask, setVisibleCreateTask] = useState(false);

    const [userList, setUserList] = useState<IUserModel[]>([]);
    const getDataList = async () => {
      if (!userList.length) {
        setLoading(true);
        const data = await getUser();
        if (data) setUserList(data);

        setLoading(false);
      }
    };

    const showCreateDialog = async () => {
      await getDataList();
      setVisibleCreateTask(true);
    };

    return (
      <Dialog
        header={
          <div className="flex justify-content-between align-items-center pr-4">
            <div>Task of Project</div>
            <Button
              className="cursor-pointer bg-green-500"
              label="Create"
              icon="pi pi-external-link"
              onClick={showCreateDialog}
            />
          </div>
        }
        visible={idProject !== null}
        style={{ width: "75vw", fontSize: "1rem" }}
        onHide={hideDialog}
        draggable={false}
        resizable={false}
      >
        <DialogCreateTask
          visible={visibleCreateTask}
          setVisible={setVisibleCreateTask}
          getTask={getTaskByProject}
          idProject={idProject}
          userList={userList}
        />

        <DataTable
          value={taskList}
          paginator
          rows={10}
          loading={loading}
          rowHover
          emptyMessage="No tasks found"
        >
          <Column field="user_mail" header="Email"></Column>
          <Column
            field="time_start"
            header="TimeStart"
            align="center"
            body={(rowDate) =>
              new Date(rowDate.time_start).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }
          ></Column>
          <Column
            field="time_end"
            header="TimeEnd"
            align="center"
            body={(rowDate) =>
              new Date(rowDate.time_end).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }
          />
          <Column field="note" header="Note" style={{ minWidth: "15rem" }} />
          <Column
            align="center"
            body={(d: ITaskModel) => {
              return (
                <div>
                  {d.status === 1
                    ? "Not Start"
                    : d.status === 2
                    ? "In Progress"
                    : d.status === 3
                    ? "Done"
                    : "Undefined"}
                </div>
              );
            }}
            header="Status"
          />
        </DataTable>
      </Dialog>
    );
  }
);

export default DialogTaskOfProject;
