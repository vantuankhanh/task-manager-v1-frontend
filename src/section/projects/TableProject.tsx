import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { memo, useState } from "react";
import { useRole } from "../../hooks/use-role";
import { IProjectModel } from "../../models/ProjectModel";
import DialogCreateUpdateProject from "./DialogCreateUpdateProject";
import DialogDeleteProject from "./DialogDeleteProject";
import DialogTaskOfProject from "./DialogTaskOfProject";

interface ITableProject {
  listProject: IProjectModel[];
  hasCreate?: boolean;
  resetProjectList: () => Promise<void>;
}

const TableProject = memo(
  ({
    listProject,
    resetProjectList: getProject,
    hasCreate = false,
  }: ITableProject) => {
    const role = useRole();
    const [visibleCreateUpdateProject, setVisibleCreateUpdateProject] =
      useState(false);
    const [itemUpdate, setItemUpdate] = useState<IProjectModel | null>(null);
    const [idDelete, setIdDelete] = useState<string | null>(null);

    const [idProjectShowingTask, setIdProjectShowingTask] = useState<
      string | null
    >(null);

    const getIDUpdate = (project: IProjectModel) => {
      setVisibleCreateUpdateProject(true);
      setItemUpdate(project);
    };

    const handleClickCreateProject = () => {
      setVisibleCreateUpdateProject(true);
      setItemUpdate(null);
    };

    const handleClickShowTask = (task: IProjectModel) => {
      setIdProjectShowingTask(task.id!);
    };
    return (
      <div>
        <DialogCreateUpdateProject
          item={itemUpdate}
          visible={visibleCreateUpdateProject}
          setVisible={setVisibleCreateUpdateProject}
          getProject={getProject}
        />

        <DialogDeleteProject
          idDelete={idDelete}
          setIdDelete={setIdDelete}
          getProject={getProject}
        />

        <DialogTaskOfProject
          idProject={idProjectShowingTask}
          setIdProject={setIdProjectShowingTask}
        />

        {hasCreate && role !== 0 && (
          <Button
            className="cursor-pointer mb-3"
            label="Create"
            icon="pi pi-external-link"
            onClick={handleClickCreateProject}
          />
        )}

        <DataTable
          value={listProject}
          paginator
          rows={10}
          rowHover
          emptyMessage="No projects found"
        >
          <Column field="name" header="Name" sortable={true} />
          <Column
            field="time_start"
            align="center"
            body={(item: IProjectModel) =>
              new Date(item.time_start).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }
            header="Time Start"
            sortable={true}
          />
          <Column
            field="time_end"
            align="center"
            body={(item: IProjectModel) =>
              new Date(item.time_end).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }
            header="Time End"
            sortable={true}
          />
          <Column
            field="payment"
            header="Payment"
            sortable={true}
            headerClassName="flex justify-content-center"
            className="text-center"
          />
          <Column
            field="note"
            header="Note"
            headerStyle={{ textAlign: "center" }}
            style={{ minWidth: "15rem" }}
          />
          <Column
            field="priority"
            header="Priority"
            sortable={true}
            align="center"
            body={(item: IProjectModel) => {
              return <Checkbox checked={item.priority === 1} />;
            }}
          />
          {role !== 0 && (
            <Column
              body={(item: IProjectModel) => {
                return (
                  <div className="flex gap-3">
                    <Button
                      className="border-none"
                      icon="pi pi-file-edit"
                      tooltip="Edit"
                      onClick={() => getIDUpdate(item)}
                    />
                    <Button
                      icon="pi pi-folder-open"
                      className="bg-green-500 border-none"
                      tooltip="Tasks"
                      onClick={() => handleClickShowTask(item)}
                    />{" "}
                    <Button
                      icon="pi pi-trash"
                      className="bg-red-500 border-none"
                      tooltip="Delete"
                      onClick={() => setIdDelete(item.id!)}
                    />
                  </div>
                );
              }}
            />
          )}
        </DataTable>
      </div>
    );
  }
);

export default TableProject;
