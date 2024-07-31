/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import { IprojectInfo, IProjectModel } from "../../models/ProjectModel";
import { Chart } from "primereact/chart";
import { ITaskInfo, ITaskModel } from "../../models/TaskModel";
import { DialogProjectDashboard } from "../projects/DialogProjectDashboard";
import { DiaglogTaskDashboard } from "./DiaglogTaskDashboard";

interface IUserRoleChartProps {
  projectUserEmail: IProjectModel[];
  taskUserEmail: ITaskModel[];
  getProjectData: () => Promise<void>;
  getTaskData: () => Promise<void>;
}

export const UserRoleDashboardChart = ({
  projectUserEmail,
  taskUserEmail,
  getProjectData,
  getTaskData,
}: IUserRoleChartProps) => {
  const [visibleTask, setVisibleTask] = useState(false);
  const [visibleProject, setVisibleProject] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<IprojectInfo>({
    label: "",
    IProjectModel: [],
  });
  const [taskData, setTaskData] = useState<ITaskInfo>({
    label: "",
    taskList: [],
  });
  const projectsDueSoon = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );
    return projectUserEmail.filter(
      (project) => new Date(project.time_end) <= nextWeek
    );
  }, [projectUserEmail]);

  const tasksDueSoon = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );
    return taskUserEmail.filter(
      (task) => new Date(task.time_end) <= nextWeek && task.status !== 3
    );
  }, [taskUserEmail]);

  const documentStyle = getComputedStyle(document.documentElement);
  const data = useMemo(
    () => ({
      labels: ["Your Status"],
      datasets: [
        {
          label: "Projects With 7 due days",
          data: [projectsDueSoon.length],
          backgroundColor: [documentStyle.getPropertyValue("--blue-500")],
          hoverBackgroundColor: [documentStyle.getPropertyValue("--blue-400")],
          barPercentage: 0.5,
        },
        {
          label: "Tasks With 7 due days",
          data: [tasksDueSoon.length],
          backgroundColor: [documentStyle.getPropertyValue("--green-500")],
          hoverBackgroundColor: [documentStyle.getPropertyValue("--green-400")],
          barPercentage: 0.5,
        },
      ],
    }),
    [projectsDueSoon.length, tasksDueSoon.length]
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartClick = useCallback(
    (_event: any, elements: any) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const { datasetIndex } = chartElement;
        const label = data.datasets[datasetIndex].label;
        setSelectedLabel(label);
        if (label === "Projects With 7 due days") {
          setVisibleProject(true);
        } else {
          setVisibleTask(true);
        }
      }
    },
    [data?.labels]
  );
  const options = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick: (_event: MouseEvent, elements: any) => {
        handleChartClick(_event, elements);
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    }),
    [handleChartClick]
  );

  useEffect(() => {
    switch (selectedLabel) {
      case "Projects With 7 due days":
        setProjectData({
          label: "Projects With 7 due days",
          IProjectModel: projectsDueSoon,
        });
        break;
      case "Tasks With 7 due days":
        setTaskData({
          label: "Tasks With 7 due days",
          taskList: tasksDueSoon,
        });
        break;
      default:
    }
  }, [selectedLabel, projectsDueSoon, tasksDueSoon]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  return (
    <div className="card flex justify-content-center relative">
      {projectsDueSoon.length === 0 && tasksDueSoon.length === 0 ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
            color: "#999",
            fontSize: "5em",
          }}
        >
          No data
        </div>
      ) : null}
      <Chart type="bar" data={data} options={options} className="w-full" />
      <DialogProjectDashboard
        projectData={projectData}
        getProjectData={getProjectData}
        visible={visibleProject}
        setVisible={setVisibleProject}
      />
      <DiaglogTaskDashboard
        getTaskData={getTaskData}
        tasksData={taskData}
        visible={visibleTask}
        setVisible={setVisibleTask}
      />
    </div>
  );
};
