import { Chart } from "primereact/chart";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ITaskInfo, ITaskModel } from "../../models/TaskModel";
import { DiaglogTaskDashboard } from "./DiaglogTaskDashboard";

interface ITaskChartProps {
  tasksData: ITaskModel[];
  getTaskData: () => Promise<void>;
}

export const TaskChart = ({ tasksData, getTaskData }: ITaskChartProps) => {
  const [taskData, setTaskData] = useState<ITaskInfo>({
    label: "",
    taskList: [],
  });
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef(null);

  const lateTasks = useMemo(
    () =>
      tasksData.filter(
        (task: ITaskModel) =>
          Number(new Date(task.time_end)) < new Date().getTime()
      ),
    [tasksData]
  );

  const processingTasks = useMemo(
    () =>
      tasksData.filter(
        (task: ITaskModel) =>
          Number(new Date(task.time_start)) < new Date().getTime() &&
          Number(new Date(task.time_end)) > new Date().getTime()
      ),
    [tasksData]
  );

  const waitingTasks = useMemo(
    () =>
      tasksData.filter(
        (task: ITaskModel) =>
          Number(new Date(task.time_start)) > new Date().getTime()
      ),
    [tasksData]
  );

  const urgentTasks = useMemo(
    () =>
      tasksData.filter(
        (task: ITaskModel) =>
          Number(new Date(task.time_start)) < new Date().getTime() &&
          Number(new Date(task.time_end)) >=
            Number(new Date().setDate(new Date().getDate() + 3))
      ),
    [tasksData]
  );

  const chartDataTask = useMemo(
    () => ({
      labels: ["Task Status"],
      datasets: [
        {
          label: "Late Task",
          data: [lateTasks.length], // Example data
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
        {
          label: "Processing Task",
          data: [processingTasks.length], // Example data
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
        {
          label: "Waiting Task",
          data: [waitingTasks.length], // Example data
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
        {
          label: "Urgent Task",
          data: [urgentTasks.length], // Example data
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
      ],
    }),
    [
      lateTasks.length,
      processingTasks.length,
      waitingTasks.length,
      urgentTasks.length,
    ]
  );

  const handleChartClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event: any, elements: any) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const { datasetIndex } = chartElement;
        const label = chartDataTask.datasets[datasetIndex].label;

        setSelectedLabel(label);

        setVisible(true);
      }
    },
    [chartDataTask?.datasets]
  );

  const chartOptionsTask = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onClick: (event: any, elements: any) => {
        handleChartClick(event, elements);
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
      boxWidth: 100,
    }),
    [handleChartClick]
  );
  useEffect(() => {
    switch (selectedLabel) {
      case "Late Task":
        setTaskData({ label: "Late Task", taskList: lateTasks });
        break;
      case "Waiting Task":
        setTaskData({ label: "Waiting Task", taskList: waitingTasks });
        break;
      case "Processing Task":
        setTaskData({ label: "Processing Task", taskList: processingTasks });
        break;
      case "Urgent Task":
        setTaskData({ label: "Urgent Task", taskList: urgentTasks });
        break;
      default:
    }
  }, [selectedLabel, lateTasks, waitingTasks, processingTasks, urgentTasks]);

  return (
    <div className="card h-full w-full relative">
      {lateTasks.length === 0 &&
      waitingTasks.length === 0 &&
      processingTasks.length === 0 &&
      urgentTasks.length === 0 ? (
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
      <header className="text-6xl font-bold text-center">Tasks Chart</header>
      <Chart
        type="bar"
        data={chartDataTask}
        options={chartOptionsTask}
        className="w-full"
        ref={chartRef}
      />

      <DiaglogTaskDashboard
        visible={visible}
        tasksData={taskData}
        setVisible={setVisible}
        getTaskData={getTaskData}
      />
    </div>
  );
};
