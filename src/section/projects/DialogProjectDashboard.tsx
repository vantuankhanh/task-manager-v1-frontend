import { Dialog } from "primereact/dialog";
import TableProject from "./TableProject";
import { IprojectInfo } from "../../models/ProjectModel";
interface IDiaglogProjectDashboard {
  visible: boolean;
  projectData: IprojectInfo;
  getProjectData: () => Promise<void>;
  setVisible: (value: React.SetStateAction<boolean>) => void;
}

export const DialogProjectDashboard = ({
  visible,
  setVisible,
  projectData,
  getProjectData,
}: IDiaglogProjectDashboard) => {
  return (
    <>
      <Dialog
        header={
          <div className="flex justify-content-between align-items-center pr-4">
            <div>{projectData.label}</div>
          </div>
        }
        visible={visible}
        style={{ width: "75vw", fontSize: "1rem" }}
        onHide={() => setVisible(false)}
        draggable={false}
        resizable={false}
      >
        <TableProject
          listProject={projectData.IProjectModel}
          hasCreate
          resetProjectList={getProjectData}
        />
      </Dialog>
    </>
  );
};
