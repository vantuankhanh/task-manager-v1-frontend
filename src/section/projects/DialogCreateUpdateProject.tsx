import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useRef, useState } from "react";
import { IProjectModel } from "../../models/ProjectModel";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../store/store";
import { setLoading } from "../../store/reducer/reducer";
import { createProject, updateProject } from "../../services/projectService";
import { InputTextarea } from "primereact/inputtextarea";

interface IDialogUpdateProjectProps {
  visible: boolean;
  setVisible: (value: React.SetStateAction<boolean>) => void;
  item: IProjectModel | null;
  getProject: () => Promise<void>;
}

const DialogCreateUpdateProject = ({
  visible,
  setVisible,
  item,
  getProject,
}: IDialogUpdateProjectProps) => {
  const dispatch = useAppDispatch();

  const nameRef = useRef<HTMLInputElement>(null);
  const payRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const [priorityChecked, setPriorityChecked] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const setValue = () => {
    if (nameRef.current && payRef.current && noteRef.current) {
      if (item) {
        nameRef.current.value = item.name;
        payRef.current.value = item.payment.toString();
        noteRef.current.value = item.note;
        setPriorityChecked(item.priority === 1 ? true : false);
        setDateFrom(new Date(item.time_start));
        setDateTo(new Date(item.time_end));
      } else {
        setDateFrom(new Date(Date.now()));
        setDateTo(new Date(Date.now()));
      }
    }
  };

  const handleUpdate = async () => {
    if (nameRef.current && nameRef.current.value === "") {
      toast.error("Input name of project");
      return;
    }
    if (payRef.current && payRef.current.value === "") {
      toast.error("Input payment of project");
      return;
    }
    if (payRef.current && !/^\d{1,7}(\.\d)?$/.test(payRef.current.value)) {
      toast.error("Payment must be a number and maximum is 999,999.9");
      return;
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      toast.error("Please select time start before time end");
      return;
    }

    setVisible(false);
    dispatch(setLoading(true));

    let data;
    if (item) {
      data = await updateProject({
        name: nameRef.current!.value!,
        payment: Number(payRef.current!.value!),
        note: noteRef.current!.value!,
        priority: priorityChecked ? 1 : 0,
        time_start: dateFrom!.toDateString(),
        time_end: dateTo!.toDateString(),
        id: item.id,
      });
    } else {
      data = await createProject({
        name: nameRef.current?.value || "",
        payment: Number(payRef.current!.value) || 0,
        note: noteRef.current?.value || "",
        priority: priorityChecked ? 1 : 0,
        time_start: dateFrom!.toDateString(),
        time_end: dateTo!.toDateString(),
      });
    }

    dispatch(setLoading(false));

    if (data) {
      await getProject();
    }
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "50vw", fontSize: "1rem", minWidth: "20rem" }}
      onHide={() => setVisible(false)}
      onShow={setValue}
      draggable={false}
      resizable={false}
      header={item ? "Update Project" : "Create Project"}
      footer={
        <div className="pt-3">
          <Button
            label={item ? "Update" : "Create"}
            className="border-none"
            onClick={handleUpdate}
          />
        </div>
      }
    >
      <div className="flex flex-column gap-3">
        <div className="flex gap-4 w-full flex-column lg:flex-row">
          <div className="w-full lg:w-6 flex flex-column gap-3">
            <div>
              <p className="font-bold mb-2">Name</p>
              <InputText ref={nameRef} placeholder="Name" className="w-full" />
            </div>

            <div>
              <p className="font-bold mb-2">Payment</p>
              <InputText
                ref={payRef}
                placeholder="Payment"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-column gap-3">
            <div>
              <p className="font-bold mb-2">Time Start</p>
              <Calendar
                className="w-full"
                dateFormat="dd/mm/yy"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.value!)}
                showIcon
              />
            </div>

            <div>
              <p className="font-bold mb-2">Time End</p>
              <Calendar
                className="w-full"
                dateFormat="dd/mm/yy"
                minDate={dateFrom ?? new Date(Date.now())}
                value={dateTo}
                onChange={(e) => setDateTo(e.value!)}
                showIcon
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-2">
          <p className="font-bold mb-2">Priority</p>
          <Checkbox
            className=""
            onChange={(e) => setPriorityChecked(e.target.checked!)}
            checked={priorityChecked}
          ></Checkbox>
        </div>

        <div>
          <p className="font-bold mb-2">Note</p>
          <InputTextarea ref={noteRef} placeholder="Note" className="w-full" />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogCreateUpdateProject;
