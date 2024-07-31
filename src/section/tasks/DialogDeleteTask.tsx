import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ITaskModel } from "../../models/TaskModel";
import { deleteTask } from "../../services/taskService";
import { setLoading } from "../../store/reducer/reducer";
import { useAppDispatch } from "../../store/store";

interface IDialogDeleteTask {
  getTask: () => Promise<void>;
  task: ITaskModel | null;
  setSelectedTask: (value: React.SetStateAction<ITaskModel | null>) => void;
}

const DialogDeleteTask = ({
  getTask,
  task,
  setSelectedTask,
}: IDialogDeleteTask) => {
  const dispatch = useAppDispatch();

  const hancleClickDelete = async () => {
    if (task) {
      setSelectedTask(null);
      dispatch(setLoading(true));

      const data = await deleteTask(task);

      dispatch(setLoading(false));
      if (data) {
        await getTask();
      }
    }
  };

  return (
    <Dialog
      visible={task !== null && task.id !== null}
      draggable={false}
      resizable={false}
      onHide={() => setSelectedTask(null)}
      header="Delete"
      footer={
        <div className="flex justify-content-end gap-3">
          <Button label="Yes" size="small" onClick={hancleClickDelete} />
          <Button
            label="Close"
            size="small"
            severity="secondary"
            onClick={() => setSelectedTask(null)}
          />
        </div>
      }
    >
      <div>
        <p>Do you want to delete this item?</p>
      </div>
    </Dialog>
  );
};

export default DialogDeleteTask;
