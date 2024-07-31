/* eslint-disable react-hooks/exhaustive-deps */
import { Chart } from "primereact/chart";
import { useCallback, useMemo, useState } from "react";
import { ITaskModel } from "../../models/TaskModel";
import { IUserInfo, IUserModel } from "../../models/UserModel";
import { DialogUserDataDashboard } from "../users/DialogUserDataDashboard";

interface IUserChartProps {
  usersData: IUserModel[];
  tasksData: ITaskModel[];
}

export const UserChart = ({ usersData, tasksData }: IUserChartProps) => {
  const [userInfo, setUserInfo] = useState<IUserInfo>({
    label: "",
    IUserData: [],
  });

  const usersWithoutTasks = useMemo(() => {
    return usersData.filter(
      (user) => !tasksData.find((task) => task.user_mail === user.email)
    );
  }, [usersData, tasksData]);

  const usersWithTasksDueSoon = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );
    return usersData.filter((user) =>
      tasksData.some(
        (task) =>
          task.user_mail === user.email &&
          new Date(task.time_end) <= nextWeek &&
          task.status !== 3
      )
    );
  }, [usersData, tasksData]);
  const chartData = useMemo(
    () => ({
      labels: ["Users Status"],
      datasets: [
        {
          label: "Users Without Tasks",
          data: [usersWithoutTasks.length],
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
        {
          label: "Users With Tasks Due In the next 7 days",
          data: [usersWithTasksDueSoon.length],
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
          barPercentage: 0.5,
        },
      ],
    }),
    [usersWithoutTasks.length, usersWithTasksDueSoon.length]
  );
  const handleChartClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_event: any, elements: any) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const { datasetIndex } = chartElement;
        const label = chartData.datasets[datasetIndex].label;

        switch (label) {
          case "Users Without Tasks":
            setUserInfo({
              label: "Users Without Tasks",
              IUserData: usersWithoutTasks,
            });
            break;
          case "Users With Tasks Due In the next 7 days":
            setUserInfo({
              label: "Users With Tasks Due In the next 7 days",
              IUserData: usersWithTasksDueSoon,
            });
            break;
          default:
        }
      }
    },
    [chartData?.labels]
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  return (
    <div className="card flex flex-column align-items-center relative">
      {usersWithTasksDueSoon.length === 0 &&
      usersWithTasksDueSoon.length === 0 ? (
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
      <header className="text-6xl font-bold">User Chart</header>
      <Chart
        type="bar"
        data={chartData}
        options={chartOptions}
        className="w-full"
      />
      <DialogUserDataDashboard userInfo={userInfo} setUserData={setUserInfo} />
    </div>
  );
};
