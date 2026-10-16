import { Button } from "primereact/button";

interface IActionButton {
  onEditClick: React.MouseEventHandler<HTMLButtonElement>;
}

// Only renaming is done here: accounts, roles and access are managed in the
// VTK IAM console.
const ActionButton = ({ onEditClick }: IActionButton) => {
  return (
    <Button
      icon="pi pi-user-edit"
      size="small"
      tooltip="Edit"
      tooltipOptions={{ position: "bottom" }}
      onClick={onEditClick}
    />
  );
};

export default ActionButton;
