import { useEffect, useState } from "react";
import { IProjectModel } from "../models/ProjectModel";
import { getProject } from "../services/projectService";
import { setLoading } from "../store/reducer/reducer";
import { useAppDispatch } from "../store/store";
import TableProject from "../section/projects/TableProject";
import { useRole } from "../hooks/use-role";
import { useUser } from "../hooks/use-users";

const Projects = () => {
  const dispatch = useAppDispatch();
  const [projectLs, setProjestLs] = useState<IProjectModel[]>([]);
  const role = useRole();
  const email = useUser().email;
  const setProject = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getProject(role === 0 ? email : "");
      if (data) setProjestLs(data);
      dispatch(setLoading(false));
    } catch {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    setProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TableProject
      listProject={projectLs}
      resetProjectList={setProject}
      hasCreate
    />
  );
};
export default Projects;
