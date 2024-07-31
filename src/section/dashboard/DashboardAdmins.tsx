import { useEffect, useState } from "react";
import { IProjectModel } from "../../models/ProjectModel";
import { ITaskModel } from "../../models/TaskModel";
import { IUserModel } from "../../models/UserModel";
import { CardItem, ICardProps } from "./CardItem";
import { ProjectChart } from "./ProjectChart";
import { TaskChart } from "./TaskChart";
import { getProject } from "../../services/projectService";
import { getTask } from "../../services/taskService";
import { getUser } from "../../services/userService";
import { setLoading } from "../../store/reducer/reducer";
import { useAppDispatch } from "../../store/store";
import { UserChart } from "./UserChart";

const DashboardAdmin = () => {
  const [tasksData, setTasksData] = useState<ITaskModel[]>([]);
  const [usersData, setUsersData] = useState<IUserModel[]>([]);
  const [projectsData, setProjectsData] = useState<IProjectModel[]>([]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = async () => {
    dispatch(setLoading(true));
    try {
      const tasks = await getTask();
      const users = await getUser();
      const projects = await getProject();
      if (tasks && users && projects) {
        setTasksData(tasks);
        setUsersData(users);
        setProjectsData(projects);
      }
      dispatch(setLoading(false));
    } catch {
      dispatch(setLoading(false));
    }
  };

  const getTaskData = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getTask();
      if (data) setTasksData(data);
      dispatch(setLoading(false));
    } catch {
      dispatch(setLoading(false));
    }
  };

  const getProjectData = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getProject();
      if (data) setProjectsData(data);
      dispatch(setLoading(false));
    } catch {
      dispatch(setLoading(false));
    }
  };

  const data: ICardProps[] = [
    {
      label: "Users",
      value: usersData.length,
      icon: "pi pi-user",
      url: "/users",
    },
    {
      label: "Projects",
      value: projectsData.length,
      icon: "pi pi-file",
      url: "/projects",
    },
    {
      label: "Tasks",
      value: tasksData.length,
      icon: "pi pi-book",
      url: "/tasks",
    },
  ];

  return (
    <div>
      <div className="flex justify-content-between mb-4">
        <CardItem cardProps={data} />
      </div>
      <div>
        <div className="card flex flex-column gap-7">
          <div className="w-full">
            <TaskChart tasksData={tasksData} getTaskData={getTaskData} />
          </div>
          <div>
            <ProjectChart
              projectDataProps={projectsData}
              getProjectData={getProjectData}
            />
          </div>
          <div className="card w-full">
            <UserChart usersData={usersData} tasksData={tasksData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
