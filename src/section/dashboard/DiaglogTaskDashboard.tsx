import { Dialog } from "primereact/dialog";
import { ITaskInfo } from "../../models/TaskModel";
import TableTask from "../tasks/TableTask";
interface IDiaglogTaskDashboard {
  visible: boolean;
  tasksData: ITaskInfo;
  getTaskData: () => Promise<void>;
  setVisible: (value: React.SetStateAction<boolean>) => void;
}

export const DiaglogTaskDashboard = ({
  visible,
  tasksData,
  setVisible,
  getTaskData,
}: IDiaglogTaskDashboard) => {
  return (
    <div>
      <Dialog
        header={
          <div className="flex justify-content-between align-items-center pr-4">
            <div>{tasksData.label}</div>
          </div>
        }
        visible={visible}
        style={{ width: "75vw", fontSize: "1rem" }}
        onHide={() => setVisible(false)}
        draggable={false}
        resizable={false}
      >
        <TableTask listTask={tasksData.taskList} resetTaskList={getTaskData} />
      </Dialog>
    </div>
  );
};
