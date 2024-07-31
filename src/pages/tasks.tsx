import { useEffect, useState } from "react";
import { ITaskModel } from "../models/TaskModel";
import { getTask } from "../services/taskService";
import { setLoading } from "../store/reducer/reducer";
import { useAppDispatch } from "../store/store";
import TableTask from "../section/tasks/TableTask";
import { useRole } from "../hooks/use-role";
import { useUser } from "../hooks/use-users";

const Tasks = () => {
  const dispatch = useAppDispatch();
  const role = useRole();
  const email = useUser().email;

  const [tasks, setTasks] = useState<ITaskModel[]>([]);

  const getTaskData = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getTask(role === 0 ? email : "");
      if (data) setTasks(data);
      dispatch(setLoading(false));
    } catch {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getTaskData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <TableTask listTask={tasks} resetTaskList={getTaskData} />;
};

export default Tasks;
