import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useState } from "react";
import { ITaskModel } from "../../models/TaskModel";
import DialogDeleteTask from "./DialogDeleteTask";
import DialogUpdateTask from "./DialogUpdateTask";
import { IUserModel } from "../../models/UserModel";
import { IProjectModel } from "../../models/ProjectModel";
import { useAppDispatch } from "../../store/store";
import { setLoading } from "../../store/reducer/reducer";
import { getUser } from "../../services/userService";
import { getProject } from "../../services/projectService";
import { useRole } from "../../hooks/use-role";

interface ITableTask {
  listTask: ITaskModel[];
  resetTaskList: () => Promise<void>;
}

const TableTask = ({ listTask, resetTaskList }: ITableTask) => {
  const dispatch = useAppDispatch();

  const role = useRole();

  const [taskUpdate, setTaskUpdate] = useState<ITaskModel | null>(null);
  const [taskDelete, setTaskDelete] = useState<ITaskModel | null>(null);

  const [userList, setUserList] = useState<IUserModel[]>([]);
  const [projectList, setProjectList] = useState<IProjectModel[]>([]);

  const getUserProjectList = async () => {
    if (!userList.length || !projectList.length) {
      dispatch(setLoading(true));
      const [userData, projectData] = await Promise.all([
        getUser(),
        getProject(),
      ]);
      if (userData) {
        setUserList(userData);
      }
      if (projectData) {
        setProjectList(projectData);
      }
      dispatch(setLoading(false));
    }
  };

  const handleUpdateButtonClick = async (item: ITaskModel) => {
    await getUserProjectList();

    setTaskUpdate(item);
  };
  return (
    <div>
      {role !== 0 && (
        <DialogDeleteTask
          task={taskDelete}
          setSelectedTask={setTaskDelete}
          getTask={resetTaskList}
        />
      )}

      <DialogUpdateTask
        taskUpdate={taskUpdate}
        setTaskUpdate={setTaskUpdate}
        userList={userList}
        projectList={projectList}
        getTaskData={resetTaskList}
      />

      <DataTable
        value={listTask}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={10}
        rowHover
        emptyMessage="No tasks found"
      >
        <Column field="user_mail" header="Email" sortable={true} ></Column>
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
          sortable={true} 
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
          sortable={true} 
        ></Column>
        <Column
          field="note"
          header="Note"
          style={{ minWidth: "15rem" }}
        ></Column>
        <Column
          field="status"
          header="Status"
          align="center"
          body={(item: ITaskModel) => {
            return item.status === 1
              ? "Not Start"
              : item.status === 2
              ? "In Progress"
              : item.status === 3
              ? "Done"
              : "Undefined";
          }}
          sortable={true} 
        ></Column>
        <Column
          body={(item: ITaskModel) => {
            return (
              <div className="flex gap-3">
                <Button
                  icon="pi pi pi-file-edit"
                  onClick={() => {
                    handleUpdateButtonClick(item);
                  }}
                ></Button>
                {role !== 0 && (
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    onClick={() => {
                      setTaskDelete(item);
                    }}
                  ></Button>
                )}
              </div>
            );
          }}
        />
      </DataTable>
    </div>
  );
};

export default TableTask;
