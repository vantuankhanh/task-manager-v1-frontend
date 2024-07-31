import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { deleteProject } from "../../services/projectService";
import { useAppDispatch } from "../../store/store";
import { setLoading } from "../../store/reducer/reducer";

interface IDialogDeleteProject {
  getProject: () => Promise<void>;
  idDelete: string | null;
  setIdDelete: (value: React.SetStateAction<string | null>) => void;
}

const DialogDeleteProject = ({
  getProject,
  idDelete,
  setIdDelete,
}: IDialogDeleteProject) => {
  const dispatch = useAppDispatch();

  const hancleClickDelete = async () => {
    if (idDelete) {
      const id = idDelete;

      setIdDelete(null);
      dispatch(setLoading(true));

      const data = await deleteProject(id);

      dispatch(setLoading(false));

      if (data) {
        await getProject();
      }
    }
  };

  return (
    <Dialog
      visible={idDelete !== null}
      draggable={false}
      resizable={false}
      onHide={() => setIdDelete(null)}
      header="Delete"
      footer={
        <div className="flex justify-content-end gap-3">
          <Button label="Yes" size="small" onClick={hancleClickDelete} />
          <Button
            label="Close"
            size="small"
            severity="secondary"
            onClick={() => setIdDelete(null)}
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

export default DialogDeleteProject;
