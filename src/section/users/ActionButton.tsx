import { Button } from "primereact/button";

interface IActionButton {
  onEditClick: React.MouseEventHandler<HTMLButtonElement>;
  onDeleteClick: React.MouseEventHandler<HTMLButtonElement>;
  role: number;
  onChangeRole: React.MouseEventHandler<HTMLButtonElement>;
}

const ActionButton = ({
  onEditClick,
  onDeleteClick,
  role,
  onChangeRole,
}: IActionButton) => {
  return (
    <>
      <Button
        icon={role === 1 ? "pi pi-star-fill" : "pi pi-star"}
        severity="success"
        size="small"
        tooltip="Change role"
        tooltipOptions={{ position: "bottom" }}
        onClick={onChangeRole}
      />
      <Button
        icon="pi pi-user-edit"
        size="small"
        tooltip="Edit"
        tooltipOptions={{ position: "bottom" }}
        onClick={onEditClick}
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        tooltip="Delete"
        tooltipOptions={{ position: "bottom" }}
        onClick={onDeleteClick}
      />
    </>
  );
};

export default ActionButton;
