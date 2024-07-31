import { Chart } from "primereact/chart";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IprojectInfo, IProjectModel } from "../../models/ProjectModel";
import { DialogProjectDashboard } from "../projects/DialogProjectDashboard";

interface IProjectChartProps {
  projectDataProps: IProjectModel[];
  getProjectData: () => Promise<void>;
}

export const ProjectChart = ({
  projectDataProps,
  getProjectData,
}: IProjectChartProps) => {
  const [visible, setVisible] = useState(false);
  const [projectData, setProjectData] = useState<IprojectInfo>({
    label: "",
    IProjectModel: [],
  });
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const runningProject = useMemo(
    () =>
      projectDataProps.filter(
        (p) =>
          new Date(p.time_start) <= new Date() &&
          new Date() < new Date(p.time_end)
      ),
    [projectDataProps]
  );
  const projectsToBeReleased = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );

    return projectDataProps.filter((p: IProjectModel) => {
      const projectEndTime = new Date(p.time_end);
      return projectEndTime >= today && projectEndTime <= nextWeek;
    });
  }, [projectDataProps]);

  const priorityProjects = useMemo(() => {
    return projectDataProps.filter((p: IProjectModel) => p.priority === 1);
  }, [projectDataProps]);

  const chartData = useMemo(
    () => ({
      labels: ["Project Status"],
      datasets: [
        {
          label: "Projects to be released in next 7 days",
          data: [projectsToBeReleased.length], // Example data
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
        {
          label: "Priority Projects",
          data: [priorityProjects.length], // Example data
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
        {
          label: "Running Projects",
          data: [runningProject.length], // Example data
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
      ],
    }),
    [
      priorityProjects.length,
      projectsToBeReleased.length,
      runningProject.length,
    ]
  );

  const handleChartClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event: any, elements: any) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const { datasetIndex } = chartElement;
        const label = chartData.datasets[datasetIndex].label;

        setSelectedLabel(label);

        setVisible(true);
      }
    },
    [chartData?.datasets]
  );

  const chartOptions = useMemo(
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
    }),
    [handleChartClick]
  );

  useEffect(() => {
    switch (selectedLabel) {
      case "Running Projects":
        setProjectData({
          label: "Running Projects",
          IProjectModel: runningProject,
        });
        break;
      case "Projects to be released in next 7 days":
        setProjectData({
          label: "Projects to be released in next 7 days",
          IProjectModel: projectsToBeReleased,
        });
        break;
      case "Priority Projects":
        setProjectData({
          label: "Priority Projects",
          IProjectModel: priorityProjects,
        });
        break;
      default:
    }
  }, [priorityProjects, projectsToBeReleased, runningProject, selectedLabel]);

  return (
    <div className="card  w-full relative">
      {priorityProjects.length === 0 &&
      projectsToBeReleased.length === 0 &&
      runningProject.length === 0 ? (
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
      <header className="text-6xl font-bold text-center">Projects Chart</header>
      <Chart
        type="bar"
        data={chartData}
        options={chartOptions}
        className="w-full h-full"
      />
      <DialogProjectDashboard
        visible={visible}
        projectData={projectData}
        setVisible={setVisible}
        getProjectData={getProjectData}
      />
    </div>
  );
};
