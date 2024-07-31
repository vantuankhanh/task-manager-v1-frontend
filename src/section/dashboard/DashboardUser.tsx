import { useEffect, useState } from "react";
import { useUser } from "../../hooks/use-users";
import { IProjectModel } from "../../models/ProjectModel";
import { ITaskModel } from "../../models/TaskModel";
import { getProject } from "../../services/projectService";
import { getTask } from "../../services/taskService";
import { setLoading } from "../../store/reducer/reducer";
import { useAppDispatch } from "../../store/store";
import { UserRoleDashboardChart } from "./UserRoleDashboardChart";

const DashboardUser = () => {
  const [projectsData, setProjectsData] = useState<IProjectModel[]>([]);
  const [taskData, setTaskData] = useState<ITaskModel[]>([]);
  const userEmail = useUser().email;
  const dispatch = useAppDispatch();
  useEffect(() => {
    getProjectDataWithUserEmail();
    getTaskDataWithUserEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProjectDataWithUserEmail = async () => {
    dispatch(setLoading(true));
    const data = await getProject(userEmail);
    if (data) setProjectsData(data);
    dispatch(setLoading(false));
  };
  const getTaskDataWithUserEmail = async () => {
    dispatch(setLoading(true));
    const data = await getTask(userEmail);
    if (data.message === "No task found") setTaskData([]);
    else setTaskData(data);
    dispatch(setLoading(false));
  };

  return (
    <>
      <UserRoleDashboardChart
        projectUserEmail={projectsData}
        taskUserEmail={taskData}
        getProjectData={getProjectDataWithUserEmail}
        getTaskData={getTaskDataWithUserEmail}
      ></UserRoleDashboardChart>
    </>
  );
};
export default DashboardUser;
